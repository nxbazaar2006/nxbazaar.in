"use client";
import { cn } from "@/lib/utils";
import * as React from "react";
export type LiquidGlassTabsProps = { tabs: Array<{ label: string; value: string; content?: React.ReactNode }>; defaultValue?: string; value?: string; onValueChange?: (value: string) => void; className?: string;
};
export function LiquidGlassTabs({ tabs, defaultValue, value, onValueChange, className,
}: LiquidGlassTabsProps) { const [internalValue, setInternalValue] = React.useState(defaultValue ?? tabs[0]?.value); const activeValue = value ?? internalValue; const activeTab = tabs.find((tab) => tab.value === activeValue); function selectTab(next: string) { setInternalValue(next); onValueChange?.(next); } return ( <div className={cn("space-y-4", className)}> <div className="liquid-glass-control liquid-glass-neutral flex flex-wrap gap-2 rounded-[28px] p-2"> <span className="liquid-glass-inner" aria-hidden="true" /> {tabs.map((tab) => ( <button key={tab.value} type="button" onClick={() => selectTab(tab.value)} className={cn( "liquid-glass-content rounded-full px-4 py-2 text-sm font-semibold text-white/72 transition", activeValue === tab.value && "bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_18px_rgba(34,211,238,0.18)]" )} > {tab.label} </button> ))} </div> {activeTab?.content && ( <div className="liquid-glass-control liquid-glass-primary liquid-glass-card-shell p-5"> <span className="liquid-glass-inner" aria-hidden="true" /> <div className="liquid-glass-content">{activeTab.content}</div> </div> )} </div> );
}
