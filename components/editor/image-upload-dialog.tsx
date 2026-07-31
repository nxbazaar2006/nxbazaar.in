"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Image as ImageIcon, Link as LinkIcon, Upload } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import { LiquidGlassButton } from "../ui/liquid-glass-button";

type ImageUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertImage: (url: string, alt?: string) => void;
};

export function ImageUploadDialog({
  open,
  onOpenChange,
  onInsertImage,
}: ImageUploadDialogProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");

  function handleUrlSubmit() {
    if (!imageUrl.trim()) return;
    onInsertImage(imageUrl.trim(), altText.trim() || undefined);
    onOpenChange(false);
    setImageUrl("");
    setAltText("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="liquid-card border-white/20 bg-slate-950/95 text-white max-w-lg p-6 rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
            <ImageIcon className="h-5 w-5 text-cyan-400" />
            <span>Insert Image into Description</span>
          </DialogTitle>
        </DialogHeader>

        {/* Tab switch */}
        <div className="flex gap-2 border-b border-white/10 pb-3 my-2">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              tab === "upload"
                ? "bg-white/20 text-white border border-white/30"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              tab === "url"
                ? "bg-white/20 text-white border border-white/30"
                : "text-white/60 hover:text-white"
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {tab === "upload" ? (
          <div className="my-3">
            <UploadDropzone
              endpoint="productImageUploader"
              onClientUploadComplete={(res) => {
                const url = res?.[0]?.url;
                if (url) {
                  onInsertImage(url);
                  onOpenChange(false);
                }
              }}
              onUploadError={(error) => {
                alert(`Upload failed: ${error.message}`);
              }}
              appearance={{
                container: "border-2 border-dashed border-white/20 rounded-2xl bg-white/5 p-4",
                button: "liquid-glass-control liquid-glass-primary rounded-full px-4 py-1.5 text-xs text-white font-semibold",
              }}
            />
          </div>
        ) : (
          <div className="my-3 space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">Alt Text (optional)</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Product preview image"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <LiquidGlassButton
                type="button"
                variant="primary"
                onClick={handleUrlSubmit}
                className="!text-white font-bold"
              >
                Insert Image
              </LiquidGlassButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
