"use client";

import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  Sparkles,
  Highlighter,
} from "lucide-react";

type EditorBubbleMenuProps = {
  editor: Editor | null;
  onOpenLinkDialog: () => void;
  onAiAction: () => void;
};

export function EditorBubbleMenu({
  editor,
  onOpenLinkDialog,
  onAiAction,
}: EditorBubbleMenuProps) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor, state }) => {
        const { selection } = state;
        return !selection.empty && editor.isEditable;
      }}
      className="liquid-card border-white/20 bg-slate-950/95 flex items-center gap-1 rounded-full p-1.5 shadow-2xl backdrop-blur-xl z-40"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded-full p-1.5 text-xs transition ${
          editor.isActive("bold")
            ? "bg-white/25 text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
        title="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded-full p-1.5 text-xs transition ${
          editor.isActive("italic")
            ? "bg-white/25 text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
        title="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`rounded-full p-1.5 text-xs transition ${
          editor.isActive("underline")
            ? "bg-white/25 text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
        title="Underline"
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`rounded-full p-1.5 text-xs transition ${
          editor.isActive("strike")
            ? "bg-white/25 text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`rounded-full p-1.5 text-xs transition ${
          editor.isActive("highlight")
            ? "bg-yellow-400/30 text-yellow-200"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
        title="Highlight"
      >
        <Highlighter className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={onOpenLinkDialog}
        className={`rounded-full p-1.5 text-xs transition ${
          editor.isActive("link")
            ? "bg-cyan-500/30 text-cyan-200"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
        title="Link"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-4 w-px bg-white/20" />

      <button
        type="button"
        onClick={onAiAction}
        className="flex items-center gap-1 rounded-full bg-purple-500/30 border border-purple-400/40 px-2 py-1 text-xs font-semibold text-purple-200 hover:bg-purple-500/40 transition"
        title="Improve with AI"
      >
        <Sparkles className="h-3 w-3 text-purple-300 animate-pulse" />
        <span>Ask AI</span>
      </button>
    </BubbleMenu>
  );
}
