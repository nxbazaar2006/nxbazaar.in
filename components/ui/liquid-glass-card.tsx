"use client";
import { cn } from "@/lib/utils";
import * as React from "react";
export type LiquidGlassCardProps = React.HTMLAttributes<HTMLDivElement> & { variant?: "primary" | "secondary" | "cyan" | "success" | "neutral" | "danger" | "ghost";
};
export const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>( ({ className, variant = "primary", children, ...props }, ref) => { return ( <div ref={ref} className={cn( "liquid-glass-control liquid-glass-card-shell p-5", `liquid-glass-${variant}`, className )} {...props} > <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" /> <div className="liquid-glass-content">{children}</div> </div> ); }
); LiquidGlassCard.displayName = "LiquidGlassCard";
