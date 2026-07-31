import { defaultLanguage, normalizeLanguage } from "@/lib/i18n/languages";

export function getLocalizedTranslation<T extends { language: string }>(
  translations: T[] | null | undefined,
  language: string
): T | undefined {
  const normalizedLanguage = normalizeLanguage(language);
  const items = translations ?? [];

  return (
    items.find((item) => item.language === normalizedLanguage) ??
    items.find((item) => item.language === defaultLanguage) ??
    items[0]
  );
}

export function getLocalizedField<
  TBase extends Record<string, unknown>,
  TTranslation extends { language: string } & Record<string, unknown>,
>(
  base: TBase,
  translations: TTranslation[] | null | undefined,
  language: string,
  field: keyof TTranslation & keyof TBase
) {
  const translation = getLocalizedTranslation(translations, language);
  return translation?.[field] ?? base[field];
}
