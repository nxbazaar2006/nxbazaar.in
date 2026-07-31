"use client";

import { FloatingMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { Heading2, Heading3, List, ListOrdered, Quote, Minus, Image, Table } from "lucide-react";

type EditorFloatingMenuProps = {
  editor: Editor | null;
  onOpenImageDialog: () => void;
};

export function EditorFloatingMenu({
  editor,
  onOpenImageDialog,
}: EditorFloatingMenuProps) {
  if (!editor) return null;

  return (
    <FloatingMenu
      editor={editor}
      className="liquid-card border-white/20 bg-slate-950/95 flex items-center gap-1 rounded-full p-1.5 shadow-2xl backdrop-blur-xl z-40"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className="rounded-full p-1.5 text-xs text-white/70 hover:bg-white/15 hover:text-white"
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className="rounded-full p-1.5 text-xs text-white/70 hover:bg-white/15 hover:text-white"
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="rounded-full p-1.5 text-xs text-white/70 hover:bg-white/15 hover:text-white"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className="rounded-full p-1.5 text-xs text-white/70 hover:bg-white/15 hover:text-white"
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className="rounded-full p-1.5 text-xs text-white/70 hover:bg-white/15 hover:text-white"
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="rounded-full p-1.5 text-xs text-white/70 hover:bg-white/15 hover:text-white"
        title="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onOpenImageDialog}
        className="rounded-full p-1.5 text-xs text-white/70 hover:bg-white/15 hover:text-white"
        title="Insert Image"
      >
        <Image className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        className="rounded-full p-1.5 text-xs text-white/70 hover:bg-white/15 hover:text-white"
        title="Insert Table"
      >
        <Table className="h-4 w-4" />
      </button>
    </FloatingMenu>
  );
}
