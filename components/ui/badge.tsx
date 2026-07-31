import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-purple-500/20 text-purple-200 border-purple-400/30",
    secondary: "bg-slate-800 text-slate-200 border-slate-700",
    destructive: "bg-red-500/20 text-red-300 border-red-500/30",
    outline: "bg-transparent text-white/80 border-white/20",
  }[variant];

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-xl transition-colors ${variantStyles} ${className}`}
      {...props}
    />
  );
}
