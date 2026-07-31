"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react"; type AiMessageBubbleProps = { role: "user" | "assistant"; children: ReactNode;
};
export default function AiMessageBubble({ role, children }: AiMessageBubbleProps) { return ( <div className={cn(role === "user" ? "ml-8" : "mr-6")}> <div className={cn( "rounded-2xl px-3 py-2 text-sm", role === "user" ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-white" )} > {children} </div> </div> );
}
