import db from "@/lib/db";
import type { EntityTranslationHandler } from "@/workers/handlers/types";
import { sourceData, translatedSlug } from "@/workers/handlers/shared";

export const blogTranslationHandler: EntityTranslationHandler = {
  async getSource(entityId) {
    const training = await db.training.findUnique({
      where: { id: entityId },
      include: { translations: { where: { language: "en" }, take: 1 } },
    });
    if (!training) return null;
    const english = training.translations[0];
    return sourceData({
      title: english?.title ?? training.title,
      slug: english?.slug ?? training.slug,
      description: english?.description ?? training.description,
      content: english?.content ?? training.content,
    });
  },
  async getExistingTarget(entityId, language) {
    return db.trainingTranslation.findUnique({
      where: { trainingId_language: { trainingId: entityId, language } },
      select: { sourceHash: true, isAutoTranslated: true, isManuallyEdited: true },
    });
  },
  async saveTranslation(entityId, language, translatedFields, sourceHash) {
    await db.trainingTranslation.upsert({
      where: { trainingId_language: { trainingId: entityId, language } },
      update: {
        title: String(translatedFields.title ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        description: translatedFields.description ?? null,
        content: translatedFields.content ?? null,
        sourceHash,
        isAutoTranslated: true,
        isManuallyEdited: false,
        translatedAt: new Date(),
      },
      create: {
        trainingId: entityId,
        language,
        title: String(translatedFields.title ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        description: translatedFields.description ?? null,
        content: translatedFields.content ?? null,
        sourceHash,
        isAutoTranslated: true,
        translatedAt: new Date(),
      },
    });
  },
};
