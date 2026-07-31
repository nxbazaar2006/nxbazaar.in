import db from "@/lib/db";
import type { LanguageCode } from "@/lib/i18n/languages";
import type { TranslatedFields } from "@/lib/translations/translation-service";
import type { EntityTranslationHandler } from "@/workers/handlers/types";
import { sourceData, translatedSlug } from "@/workers/handlers/shared";

export const productTranslationHandler: EntityTranslationHandler = {
  async getSource(entityId) {
    const product = await db.product.findUnique({
      where: { id: entityId },
      include: { translations: { where: { language: "en" }, take: 1 } },
    });
    if (!product) return null;
    const english = product.translations[0];
    return sourceData({
      title: english?.title ?? product.title,
      slug: english?.slug ?? product.slug,
      description: english?.description ?? product.description,
      shortDescription: english?.shortDescription ?? null,
      metaTitle: english?.metaTitle ?? null,
      metaDescription: english?.metaDescription ?? null,
    });
  },
  async getExistingTarget(entityId, language) {
    return db.productTranslation.findUnique({
      where: { productId_language: { productId: entityId, language } },
      select: { sourceHash: true, isAutoTranslated: true, isManuallyEdited: true },
    });
  },
  async saveTranslation(entityId, language, translatedFields, sourceHash) {
    await db.productTranslation.upsert({
      where: { productId_language: { productId: entityId, language } },
      update: {
        title: String(translatedFields.title ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        description: translatedFields.description ?? null,
        shortDescription: translatedFields.shortDescription ?? null,
        metaTitle: translatedFields.metaTitle ?? null,
        metaDescription: translatedFields.metaDescription ?? null,
        sourceHash,
        isAutoTranslated: true,
        isManuallyEdited: false,
        translatedAt: new Date(),
      },
      create: {
        productId: entityId,
        language,
        title: String(translatedFields.title ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        description: translatedFields.description ?? null,
        shortDescription: translatedFields.shortDescription ?? null,
        metaTitle: translatedFields.metaTitle ?? null,
        metaDescription: translatedFields.metaDescription ?? null,
        sourceHash,
        isAutoTranslated: true,
        translatedAt: new Date(),
      },
    });
  },
};
