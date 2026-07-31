"use client";

import { INDIA_COUNTRY } from "@/lib/india/states";
import { Lock } from "lucide-react";
import React from "react";

export function CountryField() {
  return (
    <div className="space-y-1.5">
      <label htmlFor="country-display-field" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        Country <span className="text-rose-500">*</span>
      </label>
      <div
        id="country-display-field"
        className="flex items-center justify-between rounded-xl border border-white/40 bg-white/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl leading-none" role="img" aria-label="Indian Flag">
            {INDIA_COUNTRY.flag}
          </span>
          <span className="font-semibold">{INDIA_COUNTRY.name}</span>
          <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-300">
            {INDIA_COUNTRY.code}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Lock className="h-3.5 w-3.5" />
          <span className="text-[11px]">Fixed</span>
        </div>
      </div>
    </div>
  );
}
