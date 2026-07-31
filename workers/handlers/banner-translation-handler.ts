import db from "@/lib/db";
import type { EntityTranslationHandler } from "@/workers/handlers/types";
import { sourceData, translatedSlug } from "@/workers/handlers/shared";

export const bannerTranslationHandler: EntityTranslationHandler = {
  async getSource(entityId) {
    const banner = await db.banner.findUnique({
      where: { id: entityId },
      include: { translations: { where: { language: "en" }, take: 1 } },
    });
    if (!banner) return null;
    const english = banner.translations[0];
    return sourceData({
      title: english?.title ?? banner.title,
      slug: english?.slug ?? banner.title,
      description: english?.description ?? null,
      link: english?.link ?? banner.link,
    });
  },
  async getExistingTarget(entityId, language) {
    return db.bannerTranslation.findUnique({
      where: { bannerId_language: { bannerId: entityId, language } },
      select: { sourceHash: true, isAutoTranslated: true, isManuallyEdited: true },
    });
  },
  async saveTranslation(entityId, language, translatedFields, sourceHash) {
    await db.bannerTranslation.upsert({
      where: { bannerId_language: { bannerId: entityId, language } },
      update: {
        title: String(translatedFields.title ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        description: translatedFields.description ?? null,
        link: translatedFields.link ?? null,
        sourceHash,
        isAutoTranslated: true,
        isManuallyEdited: false,
        translatedAt: new Date(),
      },
      create: {
        bannerId: entityId,
        language,
        title: String(translatedFields.title ?? ""),
        slug: String(translatedFields.slug ?? translatedSlug(translatedFields, language)),
        description: translatedFields.description ?? null,
        link: translatedFields.link ?? null,
        sourceHash,
        isAutoTranslated: true,
        translatedAt: new Date(),
      },
    });
  },
};
