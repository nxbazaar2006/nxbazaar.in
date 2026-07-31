"use client";
import { LiquidGlassIconButton } from "@/components/ui/liquid-glass-icon-button";
import { Share2 } from "lucide-react";
import toast from "react-hot-toast";
export default function ProductShareButton({ urlToShare }) { async function handleShare() { const url = urlToShare || window.location.href; if (navigator.share) { try { await navigator.share({ title: document.title, url, }); return; } catch (error) { if (error?.name === "AbortError") { return; } } } await navigator.clipboard.writeText(window.location.href); toast.success("Page URL copied to clipboard"); } return ( <LiquidGlassIconButton type="button" onClick={handleShare} variant="secondary" aria-label="Share product"> <Share2 className="h-4 w-4" /> </LiquidGlassIconButton> );
}
