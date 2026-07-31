import { auth } from "@/auth";
import db from "@/lib/db";
import { createChangedFieldHistory, createProductHistory, historyActorFromSession, historyBase } from "@/lib/product-history";
import { ProductHistoryAction } from "@prisma/client";
import { NextResponse } from "next/server";

const allowedFields = new Set(["title", "description", "tags", "aiMetadata"]);

function canManageProduct(session, product: { userId: string }) {
  return session?.user?.role === "ADMIN" || product.userId === session?.user?.id;
}

function applyField(data: Record<string, unknown>, field: string, value: unknown) {
  if (field === "title") data.title = String(value || "");
  if (field === "description") data.description = String(value || "");
  if (field === "tags") data.tags = Array.isArray(value) ? value.map(String) : [];
  if (field === "aiMetadata") {
    data.aiGenerated = true;
    data.aiMetadata = value || null;
    data.aiConfidence =
      typeof (value as { aiConfidence?: unknown })?.aiConfidence === "number"
        ? (value as { aiConfidence: number }).aiConfidence
        : null;
  }
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const product = await db.product.findUnique({
    where: { id },
    include: { translations: { where: { language: "en" }, take: 1 } },
  });
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
  if (!canManageProduct(session, product)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  if (body?.action === "restore") {
    if (session.user.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    const history = await db.productHistory.findFirst({
      where: { id: body.historyId, productId: id, action: ProductHistoryAction.AI_DRAFT_APPLIED, field: { in: [...allowedFields] } },
    });
    if (!history?.field) return NextResponse.json({ message: "History record not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    applyField(data, history.field, history.oldValue);

    const actor = await historyActorFromSession(session);
    await db.$transaction(async (prisma) => {
      const updated = await prisma.product.update({ where: { id }, data });
      await createProductHistory(prisma, {
        ...historyBase({ ...updated, actor }),
        action: ProductHistoryAction.PRODUCT_RESTORED,
        field: history.field,
        oldValue: history.newValue,
        newValue: history.oldValue,
        note: "Restored from ProductHistory.",
      });
    });

    return NextResponse.json({ message: "AI draft field restored.", field: history.field });
  }

  const fields = Array.isArray(body?.fields) ? body.fields.filter((field: string) => allowedFields.has(field)) : [];
  if (!fields.length) return NextResponse.json({ message: "No valid fields selected." }, { status: 400 });

  const values = body?.values ?? {};
  const oldValues: Record<string, unknown> = {
    title: product.title,
    description: product.description,
    tags: product.tags,
    aiMetadata: product.aiMetadata,
  };
  const data: Record<string, unknown> = {};
  for (const field of fields) applyField(data, field, values[field]);

  const actor = await historyActorFromSession(session);
  await db.$transaction(async (prisma) => {
    const updated = await prisma.product.update({ where: { id }, data });
    const base = historyBase({ ...updated, actor });
    for (const field of fields) {
      await createChangedFieldHistory(
        prisma,
        { ...base, note: "Applied from editable AI Draft preview." },
        field,
        oldValues[field],
        values[field],
        ProductHistoryAction.AI_DRAFT_APPLIED,
      );
    }
    if (fields.includes("title") || fields.includes("description")) {
      await prisma.productTranslation.upsert({
        where: { productId_language: { productId: id, language: "en" } },
        update: {
          title: fields.includes("title") ? updated.title : product.translations[0]?.title ?? updated.title,
          description: fields.includes("description") ? updated.description : product.translations[0]?.description ?? updated.description,
        },
        create: {
          productId: id,
          language: "en",
          title: updated.title,
          slug: product.slug,
          description: updated.description,
        },
      });
    }
  });

  return NextResponse.json({ message: "AI draft selected fields applied.", fields });
}
