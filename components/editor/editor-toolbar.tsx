"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow as ParagraphIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Eraser,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  Palette,
  Highlighter,
} from "lucide-react";
import { AiAssistantMenu } from "./ai-assistant-menu";
import { TableMenu } from "./table-menu";
import type { ProductAiAction } from "@/lib/ai/product-description-schema";

type EditorToolbarProps = {
  editor: Editor | null;
  disabled?: boolean;
  isAiProcessing?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenLinkDialog: () => void;
  onOpenImageDialog: () => void;
  onAiAction: (action: ProductAiAction) => void;
};

export function EditorToolbar({
  editor,
  disabled = false,
  isAiProcessing = false,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenLinkDialog,
  onOpenImageDialog,
  onAiAction,
}: EditorToolbarProps) {
  if (!editor) return null;

  const btnClass = (active?: boolean, extra?: string) =>
    `flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-all ${
      active
        ? "border-cyan-400/40 bg-cyan-500/25 text-white shadow-sm"
        : "border-white/10 bg-white/5 text-white/75 hover:bg-white/15 hover:text-white"
    } ${disabled ? "cursor-not-allowed opacity-40" : ""} ${extra || ""}`;

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-white/15 bg-slate-950/80 p-2.5 backdrop-blur-xl rounded-t-2xl">
      {/* Group 1: AI Assistant & Language Tools */}
      <div className="flex flex-wrap items-center gap-1.5">
        <AiAssistantMenu
          disabled={disabled}
          isProcessing={isAiProcessing}
          onSelectAction={onAiAction}
        />
        <div className="mx-1 h-5 w-px bg-white/15" />

        {/* Headings */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={btnClass(editor.isActive("paragraph"))}
            title="Paragraph"
          >
            <ParagraphIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={btnClass(editor.isActive("heading", { level: 2 }))}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={btnClass(editor.isActive("heading", { level: 3 }))}
            title="Heading 3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={btnClass(editor.isActive("heading", { level: 4 }))}
            title="Heading 4"
          >
            <Heading4 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mx-1 h-5 w-px bg-white/15" />

        {/* Text Marks: Bold, Italic, Underline, Strike */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btnClass(editor.isActive("bold"))}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btnClass(editor.isActive("italic"))}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={btnClass(editor.isActive("underline"))}
            title="Underline"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={btnClass(editor.isActive("strike"))}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mx-1 h-5 w-px bg-white/15" />

        {/* Color & Highlight */}
        <div className="flex items-center gap-1">
          <label
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/15"
            title="Text Color"
          >
            <Palette className="h-3.5 w-3.5 text-cyan-300" />
            <input
              type="color"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="sr-only"
            />
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={btnClass(editor.isActive("highlight"))}
            title="Highlight Text"
          >
            <Highlighter className="h-3.5 w-3.5 text-yellow-300" />
          </button>
        </div>

        <div className="mx-1 h-5 w-px bg-white/15" />

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={btnClass(editor.isActive({ textAlign: "left" }))}
            title="Align Left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={btnClass(editor.isActive({ textAlign: "center" }))}
            title="Align Center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={btnClass(editor.isActive({ textAlign: "right" }))}
            title="Align Right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={btnClass(editor.isActive({ textAlign: "justify" }))}
            title="Justify"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mx-1 h-5 w-px bg-white/15" />

        {/* Lists & Task List */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btnClass(editor.isActive("bulletList"))}
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={btnClass(editor.isActive("orderedList"))}
            title="Numbered List"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={btnClass(editor.isActive("taskList"))}
            title="Task List"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mx-1 h-5 w-px bg-white/15" />

        {/* Media & Tables */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={onOpenLinkDialog}
            className={btnClass(editor.isActive("link"))}
            title="Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onOpenImageDialog}
            className={btnClass(false)}
            title="Insert Image"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
          <TableMenu editor={editor} />
        </div>
      </div>

      {/* Group 2: Actions & View Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className={btnClass(false)}
          title="Clear Formatting"
        >
          <Eraser className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
          className={btnClass(false)}
          title="Undo"
        >
          <Undo className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={disabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
          className={btnClass(false)}
          title="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </button>

        {onToggleFullscreen ? (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={btnClass(isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
