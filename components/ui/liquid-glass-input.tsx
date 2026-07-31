"use client";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import * as React from "react";
export type LiquidGlassInputProps = React.InputHTMLAttributes<HTMLInputElement> & { leftIcon?: React.ReactNode; rightIcon?: React.ReactNode; wrapperClassName?: string;
};
export const LiquidGlassInput = React.forwardRef<HTMLInputElement, LiquidGlassInputProps>( ({ className, wrapperClassName, leftIcon = <Search />, rightIcon, ...props }, ref) => { return ( <label className={cn( "liquid-glass-control liquid-glass-neutral liquid-glass-field flex items-center gap-3", wrapperClassName )} > <span className="liquid-glass-inner" aria-hidden="true" /> {leftIcon && ( <span className="liquid-glass-content text-cyan-100 [&>svg]:h-4 [&>svg]:w-4"> {leftIcon} </span> )} <input ref={ref} {...props} className={cn( "liquid-glass-content min-w-0 flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/62", className )} /> {rightIcon && ( <span className="liquid-glass-content text-cyan-100 [&>svg]:h-4 [&>svg]:w-4"> {rightIcon} </span> )} </label> ); }
); LiquidGlassInput.displayName = "LiquidGlassInput";
