"use client";

import { Layers } from "lucide-react";
import React from "react";

type VariantQrSelectorProps = {
  variants?: Array<{
    id: string;
    sku: string;
    title: string;
    price: number;
  }>;
  selectedSku: string | undefined;
  onSelectSku: (sku: string | undefined) => void;
};

export function VariantQrSelector({
  variants = [],
  selectedSku,
  onSelectSku,
}: VariantQrSelectorProps) {
  if (variants.length === 0) return null;

  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        Select Variant / SKU
      </label>
      <div className="relative">
        <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <select
          value={selectedSku || ""}
          onChange={(e) => onSelectSku(e.target.value || undefined)}
          className="w-full rounded-xl border border-white/40 bg-white/60 pl-9 pr-8 py-2 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-md focus:border-cyan-500 focus:outline-none dark:border-white/10 dark:bg-slate-800/80 dark:text-white"
        >
          <option value="">Base Product QR (Main Product)</option>
          {variants.map((v) => (
            <option key={v.id} value={v.sku}>
              {v.title || v.sku} — ₹{v.price} ({v.sku})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
