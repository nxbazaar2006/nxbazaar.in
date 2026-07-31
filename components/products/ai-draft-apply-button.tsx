"use client";

import { useState } from "react";
import { AiDraftReviewDialog } from "@/components/products/ai-draft-review-dialog";

type AiDraftValues = {
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  aiMetadata?: Record<string, unknown> | null;
};

type AiDraftApplyButtonProps = {
  productId: string;
  existing: AiDraftValues;
  draft: AiDraftValues;
  onApplied?: () => void;
  className?: string;
};

export function AiDraftApplyButton({
  productId,
  existing,
  draft,
  onApplied,
  className,
}: AiDraftApplyButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        Apply Draft
      </button>
      <AiDraftReviewDialog
        open={open}
        productId={productId}
        existing={existing}
        draft={draft}
        onClose={() => setOpen(false)}
        onApplied={onApplied}
      />
    </>
  );
}
