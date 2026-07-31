"use client";

import { sanitizePinCodeInput } from "@/lib/india/pin-code";
import { Hash } from "lucide-react";
import React from "react";

type PinCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export function PinCodeInput({
  value,
  onChange,
  error,
  disabled = false,
}: PinCodeInputProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitizePinCodeInput(event.target.value);
    onChange(sanitized);
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor="pincode-input-field" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        PIN Code (6 Digits) <span className="text-rose-500">*</span>
      </label>

      <div className="relative">
        <Hash className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          id="pincode-input-field"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          placeholder="e.g. 400001"
          className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm font-semibold tracking-wider transition-all duration-200 ${
            error
              ? "border-rose-500 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/20 dark:border-rose-500/80 dark:bg-rose-950/30 dark:text-rose-200"
              : "border-white/40 bg-white/50 focus:border-cyan-500 focus:bg-white/80 focus:ring-2 focus:ring-cyan-400/30 dark:border-white/10 dark:bg-slate-800/60 dark:text-white dark:focus:border-cyan-400 dark:focus:bg-slate-800/90"
          } backdrop-blur-md shadow-sm disabled:cursor-not-allowed disabled:opacity-50 placeholder-slate-400`}
        />
      </div>

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}
