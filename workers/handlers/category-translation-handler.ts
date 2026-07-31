import db from "@/lib/db";
import type { EntityTranslationHandler } from "@/workers/handlers/types";
import { sourceData, translatedSlug } from "@/workers/handlers/shared";

export const categoryTranslationHandler: EntityTranslationHandler = {
  async getSource(entityId) {
    const category = await db.category.findUnique({
      where: { id: entityId },
      include: { translations: { where: { language: "en" }, take: 1 } },
    });
    if (!category) return null;
    const english = category.translations[0];
    return sourceData({
      title: english?.title ?? category.title,
      slug: english?.slug ?? category.slug,
      description: english?.description ?? category.description,
      metaTitle: english?.metaTitle ?? null,
      metaDescription: english?.metaDescription ?? null,
    });
  },
  async getExistingTarget(entityId, language) {
    return db.categoryTranslation.findUnique({
      where: { categoryId_language: { categoryId: entityId, language } },
      select: { sourceHash: true, isAutoTranslated: true, isManuallyEdited: true },
    });
  },
  async saveTranslation(entityId, language, translatedFields, sourceHash) {
    await db.categoryTranslation.upsert({
      where: { categoryId_language: { categoryId: entityId, language } },
      update: {
        title: String(translatedFields.title ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        description: translatedFields.description ?? null,
        metaTitle: translatedFields.metaTitle ?? null,
        metaDescription: translatedFields.metaDescription ?? null,
        sourceHash,
        isAutoTranslated: true,
        isManuallyEdited: false,
        translatedAt: new Date(),
      },
      create: {
        categoryId: entityId,
        language,
        title: String(translatedFields.title ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        description: translatedFields.description ?? null,
        metaTitle: translatedFields.metaTitle ?? null,
        metaDescription: translatedFields.metaDescription ?? null,
        sourceHash,
        isAutoTranslated: true,
        translatedAt: new Date(),
      },
    });
  },
};
