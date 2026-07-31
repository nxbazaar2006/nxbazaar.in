"use client";

import { useEffect, useRef, useState } from "react";
import type { MultiLanguageData } from "./use-product-editor";

type UseTranslationAutosaveOptions = {
  productId?: string;
  translations: MultiLanguageData;
  debounceMs?: number;
  onSave?: (translations: MultiLanguageData) => Promise<void>;
};

export function useTranslationAutosave({
  productId,
  translations,
  debounceMs = 1000,
  onSave,
}: UseTranslationAutosaveOptions) {
  const [saveState, setSaveState] = useState<"saving" | "saved" | "unsaved" | "error">("saved");
  const isFirstRender = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveState("unsaved");

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (!onSave) {
        setSaveState("saved");
        return;
      }

      setSaveState("saving");
      try {
        await onSave(translations);
        setSaveState("saved");
      } catch (err) {
        console.error("AUTOSAVE_ERROR:", err);
        setSaveState("error");
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [translations, debounceMs, onSave, productId]);

  return { saveState };
}
