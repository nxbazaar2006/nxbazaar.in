import { cleanSlug, generateLocalizedSlug } from "@/lib/utils/generateLocalizedSlug";
import type { LanguageCode } from "@/lib/i18n/languages";
import { createTranslationSourceHash, type SourceTranslationFields } from "@/lib/translations/source-hash";

export function sourceData(fields: SourceTranslationFields) {
  return {
    fields,
    sourceHash: createTranslationSourceHash(fields),
  };
}

export function translatedSlug(fields: { slug?: string | null; title?: string | null; name?: string | null; value?: string | null }, language: LanguageCode) {
  const source = fields.title ?? fields.name ?? fields.value ?? fields.slug ?? "";
  return cleanSlug(generateLocalizedSlug(source, language));
}
