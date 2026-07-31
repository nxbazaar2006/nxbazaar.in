"use client";

import type { LanguageCode, TranslationStatus } from "@/lib/ai/product-description-schema";
import { TranslationStatusBadge } from "./translation-status-badge";
import { Check, Loader2 } from "lucide-react";

export type LanguageState = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  status: TranslationStatus;
};

const LANGUAGES: LanguageState[] = [
  { code: "en", label: "English", nativeLabel: "English", status: "DRAFT" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", status: "DRAFT" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", status: "DRAFT" },
];

type LanguageSwitcherProps = {
  activeLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  statuses: Record<LanguageCode, TranslationStatus>;
  saveState?: "saving" | "saved" | "unsaved" | "error";
};

export function LanguageSwitcher({
  activeLanguage,
  onLanguageChange,
  statuses,
  saveState,
}: LanguageSwitcherProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 bg-white/5 p-3 sm:px-5">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {LANGUAGES.map((lang) => {
          const isActive = activeLanguage === lang.code;
          const currentStatus = statuses[lang.code] || "DRAFT";

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange(lang.code)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "liquid-glass-control liquid-glass-primary border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-md"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{lang.nativeLabel}</span>
              <TranslationStatusBadge status={currentStatus} />
            </button>
          );
        })}
      </div>

      {/* Save indicator */}
      {saveState ? (
        <div className="flex items-center gap-2 text-xs text-white/75">
          {saveState === "saving" && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />
              <span>Autosaving...</span>
            </>
          )}
          {saveState === "saved" && (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300">Saved</span>
            </>
          )}
          {saveState === "unsaved" && (
            <span className="text-amber-300 font-medium">• Unsaved changes</span>
          )}
          {saveState === "error" && (
            <span className="text-red-400 font-medium">Save failed</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
