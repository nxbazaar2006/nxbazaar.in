"use client";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { MessageCircle } from "lucide-react"; type AiChatButtonProps = { onClick: () => void; label?: string;
};
export default function AiChatButton({ onClick, label = "AI" }: AiChatButtonProps) { return ( <LiquidGlassButton type="button" size="lg" variant="cyan" leftIcon={<MessageCircle />} onClick={onClick} aria-label="Open AI assistant" > {label} </LiquidGlassButton> );
}
