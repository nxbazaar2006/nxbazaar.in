import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  createProductHistory,
  ProductHistoryActions,
  resolveProductHistoryActor,
} from "@/lib/product-history";
import { NextResponse } from "next/server";
import { z } from "zod";

const APPLYABLE_FIELDS = ["title", "description", "tags", "aiMetadata"] as const;

const applyDraftSchema = z.object({
  fields: z.array(z.enum(APPLYABLE_FIELDS)).min(1),
  values: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    aiMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
  }),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = applyDraftSchema.parse(await request.json());
    const fields = [...new Set(body.fields)];

    const product = await db.product.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const englishTranslation =
      product.translations.find((translation) => translation.language?.toUpperCase() === "EN") ??
      product.translations[0] ??
      null;
    const productData: Record<string, unknown> = {};

    if (fields.includes("title")) productData.title = body.values.title;
    if (fields.includes("tags")) productData.tags = body.values.tags ?? [];

    await db.$transaction(async (tx) => {
      const actor = await resolveProductHistoryActor(tx, userId);

      if (Object.keys(productData).length > 0) {
        await tx.product.update({
          where: { id: product.id },
          data: productData,
        });
      }

      if (fields.includes("description") && englishTranslation) {
        await tx.productTranslation.update({
          where: { id: englishTranslation.id },
          data: { description: body.values.description ?? null },
        });
      }

      if (fields.includes("aiMetadata") && englishTranslation) {
        const metadata = body.values.aiMetadata ?? {};

        await tx.productTranslation.update({
          where: { id: englishTranslation.id },
          data: {
            metaTitle:
              typeof metadata.metaTitle === "string"
                ? metadata.metaTitle
                : englishTranslation.metaTitle,
            metaDescription:
              typeof metadata.metaDescription === "string"
                ? metadata.metaDescription
                : englishTranslation.metaDescription,
          },
        });
      }

      for (const field of fields) {
        const oldValue =
          field === "description"
            ? englishTranslation?.description ?? null
            : field === "aiMetadata"
              ? {
                  metaTitle: englishTranslation?.metaTitle ?? null,
                  metaDescription: englishTranslation?.metaDescription ?? null,
                }
              : product[field as "title" | "tags"];

        await createProductHistory(tx, {
          productId: product.id,
          productCode: product.productCode,
          productTitle: product.title,
          action: ProductHistoryActions.AI_DRAFT_APPLIED,
          field,
          oldValue,
          newValue: body.values[field],
          ...actor,
          sellerId: product.userId,
          sellerCode: actor.sellerCode,
          note: "Applied from editable AI Draft preview",
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid AI draft payload", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("AI_DRAFT_APPLY_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Failed to apply AI draft" },
      { status: 500 }
    );
  }
}
