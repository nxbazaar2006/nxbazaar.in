"use client";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button"; type AiContentPreviewProps = { title?: string; description?: string; tags?: string[]; onApply: () => void;
};
export default function AiContentPreview({ title, description, tags = [], onApply }: AiContentPreviewProps) { return ( <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white"> <p className="text-sm font-semibold">AI content preview</p> {title ? <h3 className="mt-3 text-base font-bold">{title}</h3> : null} {description ? <p className="mt-2 text-sm text-white/80">{description}</p> : null} {tags.length ? <p className="mt-2 text-xs text-white/60">{tags.join(", ")}</p> : null} <LiquidGlassButton type="button" size="sm" variant="success" className="mt-4" onClick={onApply}> Apply </LiquidGlassButton> </div> );
}
