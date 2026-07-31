"use client";

import { Input } from "@/components/ui/input";
import { sanitizePinCode } from "@/lib/location";
import { cn } from "@/lib/utils";
import { Hash } from "lucide-react";
import * as React from "react";

type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
};

export function PinInput({ value, onChange, onBlur, error }: PinInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800 dark:text-white" htmlFor="location-pin">
        PIN Code
      </label>
      <div className="relative">
        <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
        <Input
          id="location-pin"
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="[0-9]{6}"
          maxLength={6}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(sanitizePinCode(event.target.value))}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "location-pin-error" : undefined}
          placeholder="400001"
          className={cn(
            "h-12 rounded-2xl border-white/40 bg-white/55 pl-11 text-base font-semibold tracking-[0.2em] text-slate-900 shadow-sm backdrop-blur-xl transition-all placeholder:tracking-normal placeholder:text-slate-400 focus-visible:ring-sky-400 dark:border-white/10 dark:bg-white/10 dark:text-white",
            error && "border-red-400 focus-visible:ring-red-400"
          )}
        />
      </div>
      {error ? (
        <p id="location-pin-error" className="text-xs font-medium text-red-500">
          {error}
        </p>
      ) : (
        <p className="text-xs text-slate-500 dark:text-white/45">Enter exactly 6 digits.</p>
      )}
    </div>
  );
}

