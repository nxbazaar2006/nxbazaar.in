import db from "@/lib/db";
import type { EntityTranslationHandler } from "@/workers/handlers/types";
import { sourceData, translatedSlug } from "@/workers/handlers/shared";

export const subcategoryTranslationHandler: EntityTranslationHandler = {
  async getSource(entityId) {
    const subCategory = await db.subCategory.findUnique({
      where: { id: entityId },
      include: { translations: { where: { language: "en" }, take: 1 } },
    });
    if (!subCategory) return null;
    const english = subCategory.translations[0];
    return sourceData({
      title: english?.title ?? subCategory.title,
      slug: english?.slug ?? subCategory.slug,
      description: english?.description ?? subCategory.description,
      metaTitle: english?.metaTitle ?? null,
      metaDescription: english?.metaDescription ?? null,
    });
  },
  async getExistingTarget(entityId, language) {
    return db.subCategoryTranslation.findUnique({
      where: { subCategoryId_language: { subCategoryId: entityId, language } },
      select: { sourceHash: true, isAutoTranslated: true, isManuallyEdited: true },
    });
  },
  async saveTranslation(entityId, language, translatedFields, sourceHash) {
    await db.subCategoryTranslation.upsert({
      where: { subCategoryId_language: { subCategoryId: entityId, language } },
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
        subCategoryId: entityId,
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
