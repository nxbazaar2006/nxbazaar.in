"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link, Unlink } from "lucide-react";
import { LiquidGlassButton } from "../ui/liquid-glass-button";

type LinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  onSetLink: (url: string) => void;
  onUnsetLink: () => void;
};

export function LinkDialog({
  open,
  onOpenChange,
  initialUrl = "",
  onSetLink,
  onUnsetLink,
}: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="liquid-card border-white/20 bg-slate-950/95 text-white max-w-md p-6 rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
            <Link className="h-5 w-5 text-cyan-400" />
            <span>Hyperlink Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="my-4 space-y-3">
          <label className="block text-sm font-medium text-white/80">URL Address</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        <DialogFooter className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {initialUrl ? (
            <button
              type="button"
              onClick={() => {
                onUnsetLink();
                onOpenChange(false);
              }}
              className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30"
            >
              <Unlink className="h-3.5 w-3.5" />
              <span>Remove Link</span>
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10"
            >
              Cancel
            </button>
            <LiquidGlassButton
              type="button"
              variant="primary"
              onClick={() => {
                onSetLink(url);
                onOpenChange(false);
              }}
              className="!text-white font-bold"
            >
              Apply Link
            </LiquidGlassButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
