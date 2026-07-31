import db from "@/lib/db";
import type { EntityTranslationHandler } from "@/workers/handlers/types";
import { sourceData, translatedSlug } from "@/workers/handlers/shared";

export const attributeValueTranslationHandler: EntityTranslationHandler = {
  async getSource(entityId) {
    const attributeValue = await db.attributeValue.findUnique({
      where: { id: entityId },
      include: { translations: { where: { language: "en" }, take: 1 } },
    });
    if (!attributeValue) return null;
    const english = attributeValue.translations[0];
    return sourceData({
      value: english?.value ?? attributeValue.value,
      slug: english?.slug ?? attributeValue.slug,
    });
  },
  async getExistingTarget(entityId, language) {
    return db.attributeValueTranslation.findUnique({
      where: { attributeValueId_language: { attributeValueId: entityId, language } },
      select: { sourceHash: true, isAutoTranslated: true, isManuallyEdited: true },
    });
  },
  async saveTranslation(entityId, language, translatedFields, sourceHash) {
    await db.attributeValueTranslation.upsert({
      where: { attributeValueId_language: { attributeValueId: entityId, language } },
      update: {
        value: String(translatedFields.value ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        sourceHash,
        isAutoTranslated: true,
        isManuallyEdited: false,
        translatedAt: new Date(),
      },
      create: {
        attributeValueId: entityId,
        language,
        value: String(translatedFields.value ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        sourceHash,
        isAutoTranslated: true,
        translatedAt: new Date(),
      },
    });
  },
};
