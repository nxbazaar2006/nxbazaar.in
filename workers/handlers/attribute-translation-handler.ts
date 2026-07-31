import db from "@/lib/db";
import type { EntityTranslationHandler } from "@/workers/handlers/types";
import { sourceData, translatedSlug } from "@/workers/handlers/shared";

export const attributeTranslationHandler: EntityTranslationHandler = {
  async getSource(entityId) {
    const attribute = await db.attribute.findUnique({
      where: { id: entityId },
      include: { translations: { where: { language: "en" }, take: 1 } },
    });
    if (!attribute) return null;
    const english = attribute.translations[0];
    return sourceData({
      name: english?.name ?? attribute.name,
      slug: english?.slug ?? attribute.slug,
    });
  },
  async getExistingTarget(entityId, language) {
    return db.attributeTranslation.findUnique({
      where: { attributeId_language: { attributeId: entityId, language } },
      select: { sourceHash: true, isAutoTranslated: true, isManuallyEdited: true },
    });
  },
  async saveTranslation(entityId, language, translatedFields, sourceHash) {
    await db.attributeTranslation.upsert({
      where: { attributeId_language: { attributeId: entityId, language } },
      update: {
        name: String(translatedFields.name ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        sourceHash,
        isAutoTranslated: true,
        isManuallyEdited: false,
        translatedAt: new Date(),
      },
      create: {
        attributeId: entityId,
        language,
        name: String(translatedFields.name ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        sourceHash,
        isAutoTranslated: true,
        translatedAt: new Date(),
      },
    });
  },
};
