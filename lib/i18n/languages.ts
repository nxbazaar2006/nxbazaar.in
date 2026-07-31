export const supportedLanguages = ["en", "hi", "mr"] as const;

export type LanguageCode = (typeof supportedLanguages)[number];

export const defaultLanguage: LanguageCode = "en";

export const languageOptions = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
  },
  {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिन्दी",
  },
  {
    code: "mr",
    label: "Marathi",
    nativeLabel: "मराठी",
  },
] satisfies Array<{
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}>;

export function isSupportedLanguage(value: string): value is LanguageCode {
  return supportedLanguages.includes(value as LanguageCode);
}

export function normalizeLanguage(value?: string | null): LanguageCode {
  return value && isSupportedLanguage(value) ? value : defaultLanguage;
}
