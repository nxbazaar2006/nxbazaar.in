"use client";

import { AntigravityBackground } from "@/components/location/antigravity-background";
import { NoiseOverlay } from "@/components/location/noise-overlay";
import { cn } from "@/lib/utils";
import React from "react";

type LiquidGlassCardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "compact" | "hero";
};

export function LiquidGlassCard({
  children,
  className,
  variant = "default",
}: LiquidGlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        // Liquid Glass Styling tokens
        "rounded-3xl sm:rounded-4xl border border-white/30 dark:border-white/15",
        "bg-white/40 dark:bg-slate-900/50 backdrop-blur-2xl backdrop-saturate-150",
        "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12),0_10px_25px_-5px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.6)]",
        "dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)]",
        // Top edge highlight
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent dark:before:via-white/30",
        variant === "compact" ? "p-4 sm:p-5" : variant === "hero" ? "p-6 sm:p-8 md:p-10" : "p-5 sm:p-7",
        className
      )}
    >
      {/* 1. Antigravity Animated SVG Background */}
      <AntigravityBackground />

      {/* 2. Soft Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/10"
      />

      {/* 3. Noise Overlay */}
      <NoiseOverlay />

      {/* 4. Interactive Form Content Layer */}
      <div className="relative z-10 text-slate-900 dark:text-slate-100">{children}</div>
    </div>
  );
}
