import * as React from "react";
import { cn } from "@/lib/utils";
export type GlassPanelProps = React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode;
};
export type GlassCardProps = GlassPanelProps;
export type GlassChipProps = React.HTMLAttributes<HTMLSpanElement> & { children: React.ReactNode;
};
const decorativeLayerClass = "pointer-events-none absolute rounded-[inherit] will-change-transform";
export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>( ({ children, className, ...props }, ref) => ( <div ref={ref} className={cn( "relative isolate overflow-hidden rounded-[32px] border border-white/35 bg-white/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(15,23,42,0.24),0_18px_48px_rgba(15,23,42,0.22)] backdrop-blur-3xl backdrop-saturate-200", "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:bg-[linear-gradient(145deg,rgba(255,255,255,0.52),rgba(255,255,255,0.12)_34%,rgba(255,255,255,0.04))]", "after:pointer-events-none after:absolute after:inset-[1px] after:z-10 after:rounded-[inherit] after:border after:border-white/18", "motion-safe:transition-[transform,box-shadow,border-color,background-color] motion-safe:duration-300 motion-safe:ease-out", className )} {...props} > <span aria-hidden="true" data-layer="refraction" className={cn( decorativeLayerClass, "inset-0 z-0 bg-[radial-gradient(ellipse_at_18%_8%,rgba(255,255,255,0.72),transparent_30%),radial-gradient(ellipse_at_84%_92%,rgba(125,211,252,0.2),transparent_42%)]" )} /> <span aria-hidden="true" data-layer="reflection" className={cn( decorativeLayerClass, "left-[12%] right-[14%] top-2 z-20 h-[22%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),rgba(255,255,255,0.18),transparent)] blur-[0.4px]" )} /> <span aria-hidden="true" data-layer="edge" className={cn( decorativeLayerClass, "inset-0 z-20 ring-1 ring-inset ring-white/28" )} /> <span aria-hidden="true" data-layer="glow" className={cn( decorativeLayerClass, "inset-x-8 bottom-0 z-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgba(56,189,248,0.28),transparent_68%)] blur-xl" )} /> <div className="relative z-30">{children}</div> </div> )
);
GlassPanel.displayName = "GlassPanel";
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>( ({ className, children, ...props }, ref) => ( <GlassPanel ref={ref} className={cn("p-5", className)} {...props}> {children} </GlassPanel> )
);
GlassCard.displayName = "GlassCard";
export const GlassChip = React.forwardRef<HTMLSpanElement, GlassChipProps>( ({ children, className, ...props }, ref) => ( <span ref={ref} className={cn( "relative isolate inline-flex items-center overflow-hidden rounded-full border border-white/32 bg-white/16 px-3 py-1 text-xs font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-2xl", className )} {...props} > <span aria-hidden="true" className="pointer-events-none absolute inset-x-2 top-0 z-0 h-1/2 rounded-full bg-white/34 blur-[0.5px]" /> <span className="relative z-10">{children}</span> </span> )
);
GlassChip.displayName = "GlassChip";
