"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { DOMSerializer } from "@tiptap/pm/model";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { EditorToolbar } from "./editor-toolbar";
import { EditorBubbleMenu } from "./editor-bubble-menu";
import { EditorFloatingMenu } from "./editor-floating-menu";
import { AiPreviewDialog } from "./ai-preview-dialog";
import { LinkDialog } from "./link-dialog";
import { ImageUploadDialog } from "./image-upload-dialog";
import { TranslationStatusBadge } from "./translation-status-badge";

import { useProductEditor, type MultiLanguageData } from "@/hooks/use-product-editor";
import { useAiDescription } from "@/hooks/use-ai-description";
import { useTranslationAutosave } from "@/hooks/use-translation-autosave";
import type { LanguageCode, ProductAiAction, ProductAiResponse } from "@/lib/ai/product-description-schema";
import { sanitizeEditorHtml } from "@/lib/editor/sanitize-editor-html";

type ProductDescriptionEditorProps = {
  productId?: string;
  initialTranslations?: Partial<Record<LanguageCode, Partial<Record<string, unknown>>>>;
  productContext?: {
    title?: string;
    category?: string;
    subCategory?: string;
    brand?: string;
    sku?: string;
  };
  onChange?: (translations: MultiLanguageData) => void;
  onAutosave?: (translations: MultiLanguageData) => Promise<void>;
  disabled?: boolean;
};

export function ProductDescriptionEditor({
  productId,
  initialTranslations,
  productContext,
  onChange,
  onAutosave,
  disabled = false,
}: ProductDescriptionEditorProps) {
  const {
    activeLanguage,
    setActiveLanguage,
    translations,
    setTranslations,
    activeData,
    statuses,
    updateActiveField,
    setLanguageStatus,
  } = useProductEditor(initialTranslations as never);

  const { saveState } = useTranslationAutosave({
    productId,
    translations,
    onSave: onAutosave,
  });

  // Notify parent on change
  useEffect(() => {
    onChange?.(translations);
  }, [translations, onChange]);

  // Dialog States
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // AI Handler Callback
  const handleApplyAiResult = useCallback(
    (action: ProductAiAction, result: ProductAiResponse) => {
      if (result.html && editor) {
        editor.commands.setContent(result.html, { emitUpdate: true });
        updateActiveField("descriptionHtml", result.html);
        updateActiveField("descriptionJson", editor.getJSON());
      }
      if (result.metaTitle) {
        updateActiveField("metaTitle", result.metaTitle);
      }
      if (result.metaDescription) {
        updateActiveField("metaDescription", result.metaDescription);
      }
      if (result.seoKeywords && result.seoKeywords.length > 0) {
        updateActiveField("seoKeywords", [
          ...new Set([...activeData.seoKeywords, ...result.seoKeywords]),
        ]);
      }
      if (result.keyFeatures && result.keyFeatures.length > 0) {
        updateActiveField("keyFeatures", [
          ...new Set([...activeData.keyFeatures, ...result.keyFeatures]),
        ]);
      }
      // Update status to AI_GENERATED if currently DRAFT
      if (activeData.status === "DRAFT") {
        setLanguageStatus(activeLanguage, "AI_GENERATED");
      }
    },
    [activeData, activeLanguage, setLanguageStatus, updateActiveField]
  );

  const {
    isProcessing,
    error: aiError,
    previewOpen,
    setPreviewOpen,
    originalContent,
    generatedContent,
    triggerAiAction,
    handleReplace,
    handleInsertBelow,
  } = useAiDescription({
    activeLanguage,
    productContext,
    onApplyAiResult: handleApplyAiResult,
  });

  // TipTap Extensions Setup
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      LinkExtension.configure({
        autolink: true,
        openOnClick: false,
        protocols: ["http", "https", "mailto", "tel"],
      }),
      ImageExtension,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Placeholder.configure({
        placeholder: "Write a clear, structured ecommerce product description...",
      }),
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: activeData.descriptionHtml || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      const html = sanitizeEditorHtml(currentEditor.getHTML());
      const json = currentEditor.getJSON();

      updateActiveField("descriptionHtml", html);
      updateActiveField("descriptionJson", json);
    },
    editorProps: {
      attributes: {
        class:
          "tiptap-content min-h-[220px] p-4 text-white outline-none prose prose-invert max-w-none focus:outline-none",
      },
    },
  });

  // Sync TipTap content when switching language tabs or when descriptionHtml changes
  useEffect(() => {
    if (!editor) return;

    const currentHtml = activeData.descriptionHtml || "";

    if (editor.getHTML() !== currentHtml) {
      editor.commands.setContent(currentHtml, { emitUpdate: false });
    }
  }, [activeLanguage, activeData.descriptionHtml, editor]);

  // Selected text extraction helper
  const getSelectedHtml = useCallback(() => {
    if (!editor || editor.state.selection.empty) {
      return editor?.getHTML() ?? "";
    }

    const { from, to } = editor.state.selection;
    const slice = editor.state.doc.cut(from, to);
    const serializer = DOMSerializer.fromSchema(editor.schema);
    const fragment = serializer.serializeFragment(slice.content);
    const container = document.createElement("div");

    container.appendChild(fragment);

    return container.innerHTML;
  }, [editor]);

  // AI Trigger handler
  const handleAiAction = (action: ProductAiAction) => {
    if (!editor) return;

    const selectedHtml = getSelectedHtml();
    const fullHtml = editor.getHTML();

    let targetLang: LanguageCode | undefined;
    if (action === "translate-en-hi") targetLang = "hi";
    if (action === "translate-en-mr") targetLang = "mr";

    triggerAiAction({
      action,
      selectedContent: selectedHtml,
      fullContent: fullHtml,
      targetLanguage: targetLang,
    });
  };

  // Word & Character count
  const characterCount = editor?.storage.characterCount?.characters() ?? 0;
  const wordCount = editor?.storage.characterCount?.words() ?? 0;

  return (
    <div
      className={`liquid-card w-full rounded-[30px] border border-white/20 bg-slate-950/80 backdrop-blur-xl shadow-2xl transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none overflow-y-auto p-4 sm:p-8 bg-slate-950"
          : "my-4"
      }`}
    >
      <div className="p-4 sm:p-6 space-y-6">
        {/* TipTap Editor Container */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-white">
              Product Description
            </label>

            <TranslationStatusBadge
              status={activeData.status}
              onChange={(s) => setLanguageStatus(activeLanguage, s)}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900/90 shadow-inner">
            {/* Sticky Rich Toolbar */}
            <EditorToolbar
              editor={editor}
              disabled={disabled}
              isAiProcessing={isProcessing}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              onOpenLinkDialog={() => setLinkDialogOpen(true)}
              onOpenImageDialog={() => setImageDialogOpen(true)}
              onAiAction={handleAiAction}
            />

            {/* Bubble & Floating Menus */}
            <EditorBubbleMenu
              editor={editor}
              onOpenLinkDialog={() => setLinkDialogOpen(true)}
              onAiAction={() => handleAiAction("improve")}
            />
            <EditorFloatingMenu
              editor={editor}
              onOpenImageDialog={() => setImageDialogOpen(true)}
            />

            {/* Editor Area */}
            <EditorContent editor={editor} />

            {/* Footer Stats */}
            <div className="flex flex-wrap items-center justify-between border-t border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
              <div className="flex items-center gap-4">
                <span>Words: {wordCount}</span>
                <span>Characters: {characterCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="capitalize">{activeLanguage} TipTap Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Error Display */}
        {aiError ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            AI Error: {aiError}
          </div>
        ) : null}

      </div>

      {/* Dialog Modals */}
      <AiPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        originalContent={originalContent}
        generatedContent={generatedContent}
        onReplace={handleReplace}
        onInsertBelow={handleInsertBelow}
      />

      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        initialUrl={editor?.getAttributes("link").href as string}
        onSetLink={(url) => {
          if (!url) {
            editor?.chain().focus().extendMarkRange("link").unsetLink().run();
          } else {
            editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }
        }}
        onUnsetLink={() => editor?.chain().focus().extendMarkRange("link").unsetLink().run()}
      />

      <ImageUploadDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsertImage={(url, alt) => {
          editor?.chain().focus().setImage({ src: url, alt }).run();
        }}
      />
    </div>
  );
}

export default ProductDescriptionEditor;
