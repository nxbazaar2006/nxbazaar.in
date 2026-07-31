"use client";

import { LiquidGlassCard } from "@/components/location/liquid-glass-card";
import { LocationForm } from "@/components/location/location-form";
import type { LocationSelectorProps } from "@/types/location";
import { MapPin } from "lucide-react";
import React from "react";

export function LocationSelector({
  defaultValue,
  onSubmit,
  onCancel,
  showCurrentLocation = true,
  className,
}: LocationSelectorProps) {
  return (
    <LiquidGlassCard className={className}>
      <div className="mb-4 flex items-center justify-between border-b border-white/20 pb-3 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-600 dark:bg-cyan-400/20 dark:text-cyan-300">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Choose Delivery Location
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select your Indian state, city, and 6-digit PIN code
            </p>
          </div>
        </div>
      </div>

      <LocationForm
        defaultValue={defaultValue}
        onSubmit={onSubmit}
        onCancel={onCancel}
        showCurrentLocation={showCurrentLocation}
      />
    </LiquidGlassCard>
  );
}

export default LocationSelector;
