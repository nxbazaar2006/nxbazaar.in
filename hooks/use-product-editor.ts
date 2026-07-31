"use client";

import { useState } from "react";
import type { LanguageCode, TranslationStatus } from "@/lib/ai/product-description-schema";

export type SingleTranslationData = {
  language: LanguageCode;
  title: string;
  shortDescription: string;
  descriptionJson: Record<string, unknown> | null;
  descriptionHtml: string;
  keyFeatures: string[];
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string[];
  status: TranslationStatus;
};

export type MultiLanguageData = Record<LanguageCode, SingleTranslationData>;

const createEmptyLanguageData = (lang: LanguageCode): SingleTranslationData => ({
  language: lang,
  title: "",
  shortDescription: "",
  descriptionJson: null,
  descriptionHtml: "",
  keyFeatures: [],
  metaTitle: "",
  metaDescription: "",
  seoKeywords: [],
  status: "DRAFT",
});

export function useProductEditor(initialData?: Partial<Record<LanguageCode, Partial<SingleTranslationData>>>) {
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("en");
  const [translations, setTranslations] = useState<MultiLanguageData>(() => ({
    en: { ...createEmptyLanguageData("en"), ...initialData?.en },
    hi: { ...createEmptyLanguageData("hi"), ...initialData?.hi },
    mr: { ...createEmptyLanguageData("mr"), ...initialData?.mr },
  }));

  function updateActiveField<K extends keyof SingleTranslationData>(
    field: K,
    value: SingleTranslationData[K]
  ) {
    setTranslations((prev) => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        [field]: value,
      },
    }));
  }

  function updateLanguageField<K extends keyof SingleTranslationData>(
    lang: LanguageCode,
    field: K,
    value: SingleTranslationData[K]
  ) {
    setTranslations((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));
  }

  function setLanguageStatus(lang: LanguageCode, status: TranslationStatus) {
    updateLanguageField(lang, "status", status);
  }

  const activeData = translations[activeLanguage];

  const statuses: Record<LanguageCode, TranslationStatus> = {
    en: translations.en.status,
    hi: translations.hi.status,
    mr: translations.mr.status,
  };

  return {
    activeLanguage,
    setActiveLanguage,
    translations,
    setTranslations,
    activeData,
    statuses,
    updateActiveField,
    updateLanguageField,
    setLanguageStatus,
  };
}
