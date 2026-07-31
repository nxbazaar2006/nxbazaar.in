"use client";
import { LiquidGlassIconButton } from "@/components/ui/liquid-glass-icon-button";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
export type LiquidGlassQuantitySelectorProps = { value: number; min?: number; max?: number; onChange?: (value: number) => void; className?: string;
};
export function LiquidGlassQuantitySelector({ value, min = 1, max = 99, onChange, className,
}: LiquidGlassQuantitySelectorProps) { return ( <div className={cn( "liquid-glass-control liquid-glass-cyan inline-flex min-h-12 items-center gap-3 rounded-full px-1.5", className )} > <span className="liquid-glass-inner" aria-hidden="true" /> <LiquidGlassIconButton aria-label="Decrease quantity" variant="ghost" disabled={value <= min} onClick={() => onChange?.(Math.max(min, value - 1))} > <Minus className="h-4 w-4" /> </LiquidGlassIconButton> <span className="liquid-glass-content min-w-8 text-center text-base font-semibold text-white"> {value} </span> <LiquidGlassIconButton aria-label="Increase quantity" variant="ghost" disabled={value >= max} onClick={() => onChange?.(Math.min(max, value + 1))} > <Plus className="h-4 w-4" /> </LiquidGlassIconButton> </div> );
}
