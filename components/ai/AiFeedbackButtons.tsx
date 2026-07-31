"use client";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react"; type AiFeedbackButtonsProps = { conversationId?: string; messageId?: string;
};
export default function AiFeedbackButtons({ conversationId, messageId }: AiFeedbackButtonsProps) { const [sent, setSent] = useState<"up" | "down" | null>(null); async function send(rating: "up" | "down") { setSent(rating); await fetch("/api/ai/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, messageId, rating }), }).catch(() => undefined); } return ( <div className="flex items-center gap-1"> <button type="button" onClick={() => send("up")} className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Good AI response" aria-pressed={sent === "up"} > <ThumbsUp className="h-4 w-4" /> </button> <button type="button" onClick={() => send("down")} className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Bad AI response" aria-pressed={sent === "down"} > <ThumbsDown className="h-4 w-4" /> </button> </div> );
}
