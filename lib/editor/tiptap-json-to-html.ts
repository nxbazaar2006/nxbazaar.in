import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { sanitizeEditorHtml } from "./sanitize-editor-html";

export const editorExtensions = [
  StarterKit,
  Underline,
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Link.configure({
    autolink: true,
    openOnClick: false,
    protocols: ["http", "https", "mailto", "tel"],
  }),
  Image,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  TaskList,
  TaskItem.configure({ nested: true }),
];

export function tiptapJsonToHtml(json: Record<string, unknown> | null | undefined): string {
  if (!json || typeof json !== "object") return "";
  try {
    const rawHtml = generateHTML(json as never, editorExtensions);
    return sanitizeEditorHtml(rawHtml);
  } catch (error) {
    console.error("Failed to generate HTML from TipTap JSON:", error);
    return "";
  }
}
