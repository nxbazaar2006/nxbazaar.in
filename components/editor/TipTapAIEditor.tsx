"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { DOMSerializer } from "@tiptap/pm/model";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type AiAction =
  | "generate"
  | "improve"
  | "rewrite"
  | "grammar"
  | "expand"
  | "shorten"
  | "seo"
  | "translate-hindi"
  | "translate-marathi"
  | "translate-english";

type TipTapAIEditorProps = {
  value: string;
  onChange: (value: string) => void;
  productTitle?: string;
  category?: string;
  keywords?: string;
  disabled?: boolean;
};

const aiActions: Array<{ action: AiAction; label: string }> = [
  { action: "generate", label: "Generate Description" },
  { action: "improve", label: "Improve" },
  { action: "rewrite", label: "Rewrite" },
  { action: "grammar", label: "Fix Grammar" },
  { action: "expand", label: "Expand" },
  { action: "shorten", label: "Shorten" },
  { action: "seo", label: "SEO Optimize" },
  { action: "translate-hindi", label: "Translate Hindi" },
  { action: "translate-marathi", label: "Translate Marathi" },
  { action: "translate-english", label: "Translate English" },
];

function ToolButton({
  active,
  disabled,
  children,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        "rounded-xl border px-3 py-1.5 text-xs font-semibold transition backdrop-blur-sm",
        active
          ? "border-purple-400 bg-purple-500/35 text-white shadow-sm"
          : "border-white/15 bg-white/10 text-white/90 hover:bg-white/20 hover:text-white",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function TipTapAIEditor({
  value,
  onChange,
  productTitle,
  category,
  keywords,
  disabled = false,
}: TipTapAIEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<AiAction | null>(null);
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        autolink: true,
        openOnClick: false,
        protocols: ["http", "https", "mailto", "tel"],
      }),
      Placeholder.configure({
        placeholder: "Write a polished description...",
      }),
    ],
    []
  );
  const editor = useEditor({
    extensions,
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();

      if (html !== value) {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class:
          "tiptap-content min-h-[180px] p-4 text-white outline-none prose prose-invert max-w-none focus:outline-none bg-slate-950/60 rounded-b-xl",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;

    const nextValue = value || "";

    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false });
    }
  }, [editor, value]);

  const updateLink = useCallback(() => {
    if (!editor || disabled) return;

    const currentHref = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link URL", currentHref ?? "");

    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: href.trim() })
      .run();
  }, [disabled, editor]);

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

  async function runAi(action: AiAction) {
    if (!editor || disabled || loadingAction) return;

    const hasSelection = !editor.state.selection.empty;

    setError(null);
    setLoadingAction(action);

    try {
      const response = await fetch("/api/ai/editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          content: action === "generate" ? editor.getHTML() : getSelectedHtml(),
          productTitle,
          category,
          keywords,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "AI editor request failed.");
      }

      if (action === "generate" || !hasSelection) {
        editor.chain().focus().setContent(result.html).run();
      } else {
        editor.chain().focus().insertContent(result.html).run();
      }

      onChange(editor.getHTML());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI editor request failed."
      );
    } finally {
      setLoadingAction(null);
    }
  }

  const controlsDisabled = disabled || !editor || Boolean(loadingAction);

  return (
    <div className="liquid-card overflow-hidden rounded-2xl border border-white/20 bg-slate-950/90 shadow-2xl backdrop-blur-xl">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1.5 border-b border-white/15 bg-slate-900/90 p-3 backdrop-blur-xl">
        <ToolButton active={editor?.isActive("bold")} disabled={controlsDisabled} onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </ToolButton>
        <ToolButton active={editor?.isActive("italic")} disabled={controlsDisabled} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Italic
        </ToolButton>
        <ToolButton active={editor?.isActive("underline")} disabled={controlsDisabled} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          Underline
        </ToolButton>
        <ToolButton active={editor?.isActive("strike")} disabled={controlsDisabled} onClick={() => editor?.chain().focus().toggleStrike().run()}>
          Strike
        </ToolButton>
        <ToolButton active={editor?.isActive("heading", { level: 2 })} disabled={controlsDisabled} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolButton>
        <ToolButton active={editor?.isActive("heading", { level: 3 })} disabled={controlsDisabled} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolButton>
        <ToolButton active={editor?.isActive("bulletList")} disabled={controlsDisabled} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          Bullet List
        </ToolButton>
        <ToolButton active={editor?.isActive("orderedList")} disabled={controlsDisabled} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          Number List
        </ToolButton>
        <ToolButton active={editor?.isActive("blockquote")} disabled={controlsDisabled} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          Block Quote
        </ToolButton>
        <ToolButton active={editor?.isActive("codeBlock")} disabled={controlsDisabled} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
          Code Block
        </ToolButton>
        <ToolButton active={editor?.isActive("link")} disabled={controlsDisabled} onClick={updateLink}>
          Link
        </ToolButton>
        <ToolButton disabled={controlsDisabled} onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>
          Clear formatting
        </ToolButton>
        <ToolButton disabled={controlsDisabled || !editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
          Undo
        </ToolButton>
        <ToolButton disabled={controlsDisabled || !editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
          Redo
        </ToolButton>
      </div>

      <EditorContent editor={editor} />

      <div className="flex flex-wrap items-center gap-2 border-t border-white/15 bg-slate-900/90 p-3">
        {aiActions.map(({ action, label }) => (
          <button
            key={action}
            type="button"
            disabled={controlsDisabled}
            className="rounded-xl border border-purple-400/30 bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-200 transition hover:border-purple-300 hover:bg-purple-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => runAi(action)}
          >
            {loadingAction === action ? "Working..." : label}
          </button>
        ))}
      </div>

      {error ? <div className="border-t border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</div> : null}
    </div>
  );
}

export default TipTapAIEditor;
