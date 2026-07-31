"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Check, CornerDownLeft, Sparkles, X } from "lucide-react";
import { LiquidGlassButton } from "../ui/liquid-glass-button";

type AiPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalContent: string;
  generatedContent: string;
  actionTitle?: string;
  onReplace: () => void;
  onInsertBelow: () => void;
};

export function AiPreviewDialog({
  open,
  onOpenChange,
  originalContent,
  generatedContent,
  actionTitle = "AI Generated Content",
  onReplace,
  onInsertBelow,
}: AiPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="liquid-card border-white/20 bg-slate-950/95 text-white max-w-4xl max-h-[90vh] flex flex-col p-6 sm:p-8 rounded-[28px] overflow-hidden">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
            <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
            <span>AI Assistant Preview: {actionTitle}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-white/70">
            Review the AI output before applying it to your description. Choose to replace current selection/content or insert below.
          </DialogDescription>
        </DialogHeader>

        {/* Diff Side-by-side / Staked View */}
        <div className="grid gap-4 md:grid-cols-2 flex-1 overflow-y-auto pr-1 my-2">
          {/* Original */}
          <div className="flex flex-col rounded-2xl border border-white/15 bg-white/5 p-4 overflow-hidden">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/60">
              Original Content
            </div>
            <div
              className="prose prose-invert prose-sm max-w-none flex-1 overflow-y-auto p-2 bg-slate-900/60 rounded-xl border border-white/10 text-white/80"
              dangerouslySetInnerHTML={{
                __html: originalContent || "<p class='italic text-white/40'>[Empty content]</p>",
              }}
            />
          </div>

          {/* Generated */}
          <div className="flex flex-col rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 overflow-hidden">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                AI Generated Output
              </span>
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-200 border border-purple-400/30">
                Ready
              </span>
            </div>
            <div
              className="prose prose-invert prose-sm max-w-none flex-1 overflow-y-auto p-2 bg-slate-900/80 rounded-xl border border-purple-400/30 text-white"
              dangerouslySetInnerHTML={{
                __html: generatedContent || "<p class='italic text-white/40'>[No output generated]</p>",
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/20 transition"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onInsertBelow();
              onOpenChange(false);
            }}
            className="flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/30 transition"
          >
            <CornerDownLeft className="h-4 w-4" />
            <span>Insert Below</span>
          </button>

          <LiquidGlassButton
            type="button"
            variant="primary"
            onClick={() => {
              onReplace();
              onOpenChange(false);
            }}
            leftIcon={<Check className="h-4 w-4" />}
            className="!text-white font-bold"
          >
            Replace Content
          </LiquidGlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
