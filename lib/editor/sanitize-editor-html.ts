import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "span",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "a",
  "blockquote",
  "hr",
  "br",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "div",
  "mark",
  "code",
  "pre",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "width",
  "height",
  "style",
  "class",
  "colspan",
  "rowspan",
  "align",
  "data-type",
  "data-checked",
];

export function sanitizeEditorHtml(html: string | null | undefined): string {
  if (!html) return "";

  const withoutFences = html
    .replace(/```(?:html|json)?/gi, "")
    .replace(/```/g, "")
    .trim();

  return DOMPurify.sanitize(withoutFences, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
  }).trim();
}
