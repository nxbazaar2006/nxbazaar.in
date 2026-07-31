import db from "@/lib/db";
import type { EntityTranslationHandler } from "@/workers/handlers/types";
import { sourceData, translatedSlug } from "@/workers/handlers/shared";

export const brandTranslationHandler: EntityTranslationHandler = {
  async getSource(entityId) {
    const brand = await db.brand.findUnique({
      where: { id: entityId },
      include: { translations: { where: { language: "en" }, take: 1 } },
    });
    if (!brand) return null;
    const english = brand.translations[0];
    return sourceData({
      title: english?.title ?? brand.title,
      slug: english?.slug ?? brand.slug,
      description: english?.description ?? brand.description,
      metaTitle: english?.metaTitle ?? null,
      metaDescription: english?.metaDescription ?? null,
    });
  },
  async getExistingTarget(entityId, language) {
    return db.brandTranslation.findUnique({
      where: { brandId_language: { brandId: entityId, language } },
      select: { sourceHash: true, isAutoTranslated: true, isManuallyEdited: true },
    });
  },
  async saveTranslation(entityId, language, translatedFields, sourceHash) {
    await db.brandTranslation.upsert({
      where: { brandId_language: { brandId: entityId, language } },
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
        brandId: entityId,
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
