"use client";

import { useState } from "react";
import type {
  LanguageCode,
  ProductAiAction,
  ProductAiResponse,
} from "@/lib/ai/product-description-schema";

type UseAiDescriptionOptions = {
  activeLanguage: LanguageCode;
  productContext?: {
    title?: string;
    category?: string;
    subCategory?: string;
    brand?: string;
    sku?: string;
  };
  onApplyAiResult: (action: ProductAiAction, result: ProductAiResponse) => void;
};

export function useAiDescription({
  activeLanguage,
  productContext,
  onApplyAiResult,
}: UseAiDescriptionOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<ProductAiAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [originalContent, setOriginalContent] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [latestResult, setLatestResult] = useState<ProductAiResponse | null>(null);

  async function triggerAiAction({
    action,
    selectedContent = "",
    fullContent = "",
    targetLanguage,
  }: {
    action: ProductAiAction;
    selectedContent?: string;
    fullContent?: string;
    targetLanguage?: LanguageCode;
  }) {
    setIsProcessing(true);
    setCurrentAction(action);
    setError(null);

    const sourceContent = selectedContent.trim() || fullContent.trim();
    setOriginalContent(sourceContent);

    try {
      const response = await fetch("/api/ai/product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          sourceLanguage: activeLanguage,
          targetLanguage: targetLanguage || activeLanguage,
          selectedContent,
          fullContent,
          productContext,
        }),
      });

      const data: ProductAiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "AI Generation failed.");
      }

      setLatestResult(data);

      if (data.html) {
        setGeneratedContent(data.html);
        setPreviewOpen(true);
      } else {
        // Direct metadata actions (meta title, keywords, etc.) apply immediately
        onApplyAiResult(action, data);
      }
    } catch (err) {
      console.error("AI_TRIGGER_ERROR:", err);
      setError(err instanceof Error ? err.message : "AI Action failed.");
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  }

  function handleReplace() {
    if (latestResult && currentAction) {
      onApplyAiResult(currentAction, { ...latestResult, html: generatedContent });
    } else if (latestResult) {
      onApplyAiResult(latestResult.action || "generate", {
        ...latestResult,
        html: generatedContent,
      });
    }
    setPreviewOpen(false);
  }

  function handleInsertBelow() {
    if (latestResult) {
      const combinedHtml = `${originalContent}<br/><br/>${generatedContent}`;
      onApplyAiResult("generate", { ...latestResult, html: combinedHtml });
    }
    setPreviewOpen(false);
  }

  return {
    isProcessing,
    currentAction,
    error,
    previewOpen,
    setPreviewOpen,
    originalContent,
    generatedContent,
    triggerAiAction,
    handleReplace,
    handleInsertBelow,
  };
}
