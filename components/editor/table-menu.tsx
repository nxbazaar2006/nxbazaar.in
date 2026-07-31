"use client";

import type { Editor } from "@tiptap/react";
import {
  Table as TableIcon,
  Plus,
  Trash2,
  ListPlus,
  SplitSquareVertical,
  SplitSquareHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TableMenu({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const isTableActive = editor.isActive("table");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition ${
            isTableActive
              ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/40"
              : "border border-white/20 bg-white/10 text-white/80 hover:bg-white/20"
          }`}
          title="Table Operations"
        >
          <TableIcon className="h-3.5 w-3.5" />
          <span>Table</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="liquid-card border-white/20 bg-slate-950/95 text-white min-w-[200px] p-2 rounded-xl backdrop-blur-xl z-50"
      >
        <DropdownMenuItem
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white hover:bg-white/10 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 text-emerald-400" />
          <span>Insert 3x3 Table</span>
        </DropdownMenuItem>

        {isTableActive ? (
          <>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white hover:bg-white/10 cursor-pointer"
            >
              <SplitSquareHorizontal className="h-3.5 w-3.5 text-cyan-300" />
              <span>Add Row Above</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white hover:bg-white/10 cursor-pointer"
            >
              <SplitSquareHorizontal className="h-3.5 w-3.5 text-cyan-300" />
              <span>Add Row Below</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white hover:bg-white/10 cursor-pointer"
            >
              <SplitSquareVertical className="h-3.5 w-3.5 text-purple-300" />
              <span>Add Column Left</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white hover:bg-white/10 cursor-pointer"
            >
              <SplitSquareVertical className="h-3.5 w-3.5 text-purple-300" />
              <span>Add Column Right</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/20 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
              <span>Delete Row</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/20 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
              <span>Delete Column</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 hover:bg-white/10 cursor-pointer"
            >
              <ListPlus className="h-3.5 w-3.5 text-amber-300" />
              <span>Toggle Header Row</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/30 cursor-pointer font-bold"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
              <span>Delete Table</span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
