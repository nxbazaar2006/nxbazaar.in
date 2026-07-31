import { generateLocalizedSlug, cleanSlug } from "@/lib/utils/generateLocalizedSlug";
import type { TranslationTargetLanguage } from "@/lib/queues/translation-job-types";
import { createTranslationProvider } from "@/lib/translations/translation-provider";

export type TranslatedFields = Record<string, string | null | undefined>;

const provider = createTranslationProvider();

async function translateNullableText(value: string | null | undefined, targetLanguage: TranslationTargetLanguage) {
  const source = value?.trim() ?? "";
  if (!source) return null;
  return provider.translateText(source, targetLanguage);
}

export async function translateFields(fields: TranslatedFields, targetLanguage: TranslationTargetLanguage) {
  const entries = await Promise.all(
    Object.entries(fields).map(async ([key, value]) => {
      if (key === "slug") return [key, value] as const;
      return [key, await translateNullableText(value, targetLanguage)] as const;
    })
  );
  const translated = Object.fromEntries(entries) as TranslatedFields;
  const slugSource = translated.title ?? fields.title ?? fields.slug ?? "";
  translated.slug = cleanSlug(generateLocalizedSlug(String(slugSource), targetLanguage));
  return translated;
}
