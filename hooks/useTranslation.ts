"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  defaultLanguage,
  normalizeLanguage,
  type LanguageCode,
} from "@/lib/i18n/languages";
import { translations } from "@/lib/i18n/translations";
import { setLanguage } from "@/redux/slices/languageSlice";

const storageKey = "nxbazaar.in-language";

type RootState = {
  language?: {
    currentLanguage?: LanguageCode;
  };
};

function getNestedValue(source: unknown, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);

  return typeof value === "string" ? value : undefined;
}

export function useTranslation() {
  const dispatch = useDispatch();
  const language = useSelector(
    (state: RootState) => state.language?.currentLanguage ?? defaultLanguage
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const normalized = normalizeLanguage(stored);
    if (normalized !== language) {
      dispatch(setLanguage(normalized));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, language);
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: string) => {
      return (
        getNestedValue(translations[language], key) ??
        getNestedValue(translations.en, key) ??
        key
      );
    },
    [language]
  );

  return useMemo(
    () => ({
      t,
      language,
      setLanguage: (nextLanguage: LanguageCode | string) =>
        dispatch(setLanguage(normalizeLanguage(nextLanguage))),
    }),
    [dispatch, language, t]
  );
}
