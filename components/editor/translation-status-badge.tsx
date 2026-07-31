"use client";

import type { TranslationStatus } from "@/lib/ai/product-description-schema";

const STATUS_CONFIG: Record<
  TranslationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  DRAFT: {
    label: "Draft",
    bg: "bg-slate-500/20",
    text: "text-slate-200",
    border: "border-slate-400/30",
  },
  AI_GENERATED: {
    label: "AI Generated",
    bg: "bg-purple-500/20",
    text: "text-purple-200",
    border: "border-purple-400/30",
  },
  REVIEWED: {
    label: "Reviewed",
    bg: "bg-amber-500/20",
    text: "text-amber-200",
    border: "border-amber-400/30",
  },
  PUBLISHED: {
    label: "Published",
    bg: "bg-emerald-500/20",
    text: "text-emerald-200",
    border: "border-emerald-400/30",
  },
};

export function TranslationStatusBadge({
  status,
  onChange,
}: {
  status: TranslationStatus;
  onChange?: (status: TranslationStatus) => void;
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

  if (!onChange) {
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm ${config.bg} ${config.text} ${config.border}`}
      >
        {config.label}
      </span>
    );
  }

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as TranslationStatus)}
      className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-xs font-semibold outline-none backdrop-blur-sm transition-all ${config.bg} ${config.text} ${config.border}`}
    >
      <option value="DRAFT" className="bg-slate-900 text-white">
        Draft
      </option>
      <option value="AI_GENERATED" className="bg-slate-900 text-white">
        AI Generated
      </option>
      <option value="REVIEWED" className="bg-slate-900 text-white">
        Reviewed
      </option>
      <option value="PUBLISHED" className="bg-slate-900 text-white">
        Published
      </option>
    </select>
  );
}
