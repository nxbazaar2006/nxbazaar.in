import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  createProductHistory,
  ProductHistoryActions,
  resolveProductHistoryActor,
} from "@/lib/product-history";
import { NextResponse } from "next/server";

const RESTORABLE_FIELDS = new Set(["title", "description", "tags", "aiMetadata"]);

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; historyId: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const actorUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (actorUser?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only admins can restore product history" },
        { status: 403 }
      );
    }

    const { id, historyId } = await params;
    const history = await db.productHistory.findUnique({
      where: { id: historyId },
    });

    if (!history || history.productId !== id || !history.field) {
      return NextResponse.json(
        { success: false, error: "History entry not found" },
        { status: 404 }
      );
    }

    if (!RESTORABLE_FIELDS.has(history.field)) {
      return NextResponse.json(
        { success: false, error: "This field cannot be restored" },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const restoredValue = history.oldValue;
    const englishTranslation =
      product.translations.find((translation) => translation.language?.toUpperCase() === "EN") ??
      product.translations[0] ??
      null;
    const currentValue =
      history.field === "description"
        ? englishTranslation?.description ?? null
        : history.field === "aiMetadata"
          ? {
              metaTitle: englishTranslation?.metaTitle ?? null,
              metaDescription: englishTranslation?.metaDescription ?? null,
            }
          : product[history.field as "title" | "tags"];

    await db.$transaction(async (tx) => {
      const actor = await resolveProductHistoryActor(tx, userId);

      if (history.field === "description" && englishTranslation) {
        await tx.productTranslation.update({
          where: { id: englishTranslation.id },
          data: { description: restoredValue as string | null },
        });
      } else if (history.field === "aiMetadata" && englishTranslation) {
        const metadata =
          restoredValue && typeof restoredValue === "object"
            ? (restoredValue as {
                metaTitle?: unknown;
                metaDescription?: unknown;
              })
            : {};

        await tx.productTranslation.update({
          where: { id: englishTranslation.id },
          data: {
            metaTitle:
              typeof metadata.metaTitle === "string" ? metadata.metaTitle : null,
            metaDescription:
              typeof metadata.metaDescription === "string"
                ? metadata.metaDescription
                : null,
          },
        });
      } else {
        await tx.product.update({
          where: { id: product.id },
          data: { [history.field]: restoredValue },
        });
      }

      await createProductHistory(tx, {
        productId: product.id,
        productCode: product.productCode,
        productTitle: product.title,
        action: ProductHistoryActions.PRODUCT_RESTORED,
        field: history.field,
        oldValue: currentValue,
        newValue: restoredValue,
        ...actor,
        sellerId: product.userId,
        sellerCode: history.sellerCode,
        note: `Restored from history record ${history.id}`,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AI_DRAFT_RESTORE_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Failed to restore product history" },
      { status: 500 }
    );
  }
}
