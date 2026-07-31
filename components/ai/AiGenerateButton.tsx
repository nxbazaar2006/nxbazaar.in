"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { AlertTriangle, Sparkles, X } from "lucide-react";
import type React from "react";
import { useState } from "react";

export type GeneratedAttributeDraft = { name: string; values: string[] };
export type GeneratedProductDraft = {
  title: string;
  shortDescription?: string;
  detailedDescription?: string;
  features?: string[];
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  categoryId?: string;
  subCategoryId?: string;
  attributeSuggestions?: GeneratedAttributeDraft[];
  attributes?: GeneratedAttributeDraft[];
  translations?: { hi?: { title?: string; shortDescription?: string }; mr?: { title?: string; shortDescription?: string } };
  hsnReviewRequired?: boolean;
  aiConfidence?: number;
  aiMetadata?: Record<string, unknown>;
};

type AiDraftApplyPayload = {
  fields: Array<"title" | "description" | "tags" | "aiMetadata">;
  values: {
    title: string;
    description: string;
    tags: string[];
    aiMetadata: Record<string, unknown>;
  };
};

type AiGenerateButtonProps = {
  productName?: string;
  hasExistingContent?: boolean;
  existingValues?: {
    title?: string;
    description?: string;
    tags?: string[];
    aiMetadata?: unknown;
  };
  onApply: (payload: AiDraftApplyPayload) => void | Promise<void>;
};

const fieldLabels = {
  title: "Title",
  description: "Description",
  tags: "Tags",
  aiMetadata: "AI metadata",
} as const;

function parseList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyList(value?: string[]) {
  return (value ?? []).join("\n");
}

function stringifyMetadata(value: unknown) {
  if (!value) return "{}";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function buildMetadata(draft: GeneratedProductDraft) {
  return {
    source: "ai_product_generation",
    seoTitle: draft.seoTitle ?? "",
    metaDescription: draft.metaDescription ?? "",
    features: draft.features ?? [],
    translations: draft.translations ?? null,
    hsnReviewRequired: true,
    aiConfidence: draft.aiConfidence ?? null,
  };
}

export default function AiGenerateButton({
  productName,
  hasExistingContent = false,
  existingValues,
  onApply,
}: AiGenerateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<GeneratedProductDraft | null>(null);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    title: true,
    description: true,
    tags: true,
    aiMetadata: true,
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [metadataText, setMetadataText] = useState("{}");

  function loadDraft(nextDraft: GeneratedProductDraft) {
    setDraft(nextDraft);
    setTitle(nextDraft.title ?? "");
    setDescription(nextDraft.detailedDescription || nextDraft.shortDescription || "");
    setTagsText(stringifyList(nextDraft.keywords));
    setMetadataText(JSON.stringify(buildMetadata(nextDraft), null, 2));
    setPreviewOpen(false);
  }

  async function generate() {
    setError("");
    if (!productName || productName.trim().length < 2) {
      setError("Product title pehle enter karein.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/ai/product-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName }),
      });
      const payload = (await response.json().catch(() => null)) as { draft?: GeneratedProductDraft; message?: string } | null;
      if (!response.ok || !payload?.draft?.title) {
        setError(payload?.message ?? "AI draft generate nahi ho paya.");
        return;
      }
      loadDraft(payload.draft);
    } catch {
      setError("AI draft generate nahi ho paya.");
    } finally {
      setLoading(false);
    }
  }

  function selectedFieldNames() {
    return (Object.keys(selectedFields) as Array<keyof typeof selectedFields>).filter((field) => selectedFields[field]);
  }

  async function confirmApply() {
    let aiMetadata: Record<string, unknown>;
    try {
      aiMetadata = JSON.parse(metadataText || "{}");
    } catch {
      setError("AI metadata valid JSON hona chahiye.");
      setConfirmOpen(false);
      setPreviewOpen(true);
      return;
    }
    await onApply({
      fields: selectedFieldNames(),
      values: {
        title: title.trim(),
        description: description.trim(),
        tags: parseList(tagsText),
        aiMetadata,
      },
    });
    setConfirmOpen(false);
    setPreviewOpen(false);
  }

  function renderField(
    field: keyof typeof selectedFields,
    existingValue: string,
    editor: React.ReactNode,
  ) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-900">
        <div className="mb-3 flex items-center gap-2">
          <Checkbox
            checked={selectedFields[field]}
            onCheckedChange={(checked) => setSelectedFields((current) => ({ ...current, [field]: Boolean(checked) }))}
            aria-label={`Select ${fieldLabels[field]}`}
          />
          <span className="font-medium">{fieldLabels[field]}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-medium uppercase text-slate-500">Existing Value</div>
            <pre className="min-h-20 whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-xs text-slate-700">{existingValue || "-"}</pre>
          </div>
          <div>
            <div className="mb-1 text-xs font-medium uppercase text-slate-500">AI Generated Value</div>
            {editor}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">AI product draft</p>
          <p className="text-xs text-white/65">Generate karein, phir selected fields review karke apply karein.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LiquidGlassButton type="button" variant="cyan" size="sm" loading={loading} leftIcon={<Sparkles />} onClick={generate}>
            Generate with AI
          </LiquidGlassButton>
          {draft ? (
            <LiquidGlassButton type="button" variant="success" size="sm" onClick={() => setPreviewOpen(true)}>
              Apply Draft
            </LiquidGlassButton>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Review AI Draft</DialogTitle>
            <DialogDescription>Choose fields to replace. SKU, barcode, product code, price, stock, variants, category and subcategory are not changed.</DialogDescription>
          </DialogHeader>
          {hasExistingContent ? (
            <div className="flex gap-2 rounded-lg border border-amber-300/40 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>Selected existing product fields will be replaced by the AI draft.</p>
            </div>
          ) : null}
          <div className="space-y-3">
            {renderField("title", existingValues?.title ?? "", <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />)}
            {renderField("description", existingValues?.description ?? "", <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} className="w-full rounded-lg border px-3 py-2 text-sm" />)}
            {renderField("tags", stringifyList(existingValues?.tags), <textarea value={tagsText} onChange={(event) => setTagsText(event.target.value)} rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />)}
            {renderField("aiMetadata", stringifyMetadata(existingValues?.aiMetadata), <textarea value={metadataText} onChange={(event) => setMetadataText(event.target.value)} rows={6} className="w-full rounded-lg border px-3 py-2 font-mono text-xs" />)}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <LiquidGlassButton type="button" variant="secondary" size="sm" leftIcon={<X />} onClick={() => setPreviewOpen(false)}>
              Cancel
            </LiquidGlassButton>
            <LiquidGlassButton type="button" variant="cyan" size="sm" onClick={() => setConfirmOpen(true)}>
              Apply Selected Fields
            </LiquidGlassButton>
            <LiquidGlassButton
              type="button"
              variant="success"
              size="sm"
              onClick={() => {
                setSelectedFields({ title: true, description: true, tags: true, aiMetadata: true });
                setConfirmOpen(true);
              }}
            >
              Apply All
            </LiquidGlassButton>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply AI Draft?</DialogTitle>
            <DialogDescription>Selected existing product fields will be replaced by the AI draft.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <LiquidGlassButton type="button" variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancel
            </LiquidGlassButton>
            <LiquidGlassButton type="button" variant="success" size="sm" onClick={confirmApply}>
              Confirm Apply
            </LiquidGlassButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
