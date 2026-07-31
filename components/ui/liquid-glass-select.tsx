"use client";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
export type LiquidGlassSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { options?: Array<{ label: string; value: string }>; wrapperClassName?: string; };
export const LiquidGlassSelect = React.forwardRef< HTMLSelectElement, LiquidGlassSelectProps
>(({ className, wrapperClassName, options, children, ...props }, ref) => { return ( <label className={cn( "liquid-glass-control liquid-glass-success flex min-h-14 items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5", wrapperClassName )} > <span className="liquid-glass-inner" aria-hidden="true" /> <select ref={ref} {...props} className={cn( "liquid-glass-content min-w-0 flex-1 appearance-none bg-transparent py-2 pr-2 text-base font-semibold text-white outline-none", className )} > {options?.map((option) => ( <option key={option.value} value={option.value} className="bg-slate-950 text-white"> {option.label} </option> ))} {children} </select> <span className="liquid-glass-content pointer-events-none grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/25 bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(0,0,0,0.42),0_0_18px_rgba(74,222,128,0.36)]" aria-hidden="true" > <Check className="h-5 w-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.65)]" /> <ChevronDown className="absolute h-3 w-3 translate-y-3 text-white/65" /> </span> </label> );
}); LiquidGlassSelect.displayName = "LiquidGlassSelect";
