import DOMPurify from "isomorphic-dompurify";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";

const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "u",
  "s",
  "a",
  "blockquote",
];

const editorSchema = z.object({
  action: z.enum([
    "generate",
    "improve",
    "rewrite",
    "grammar",
    "expand",
    "shorten",
    "seo",
    "translate-hindi",
    "translate-marathi",
    "translate-english",
  ]),
  content: z.string().optional().default(""),
  productTitle: z.string().optional(),
  category: z.string().optional(),
  keywords: z.string().optional(),
});

type EditorAction = z.infer<typeof editorSchema>["action"];

const ACTION_INSTRUCTIONS: Record<EditorAction, string> = {
  generate:
    "Generate a complete ecommerce product description from only the supplied product context.",
  improve:
    "Improve clarity, structure, grammar, and conversion quality without changing facts.",
  rewrite: "Rewrite the content in a fresh ecommerce style without changing facts.",
  grammar: "Fix grammar, spelling, punctuation, and readability only.",
  expand: "Expand the content using only supplied facts.",
  shorten: "Shorten the content while preserving factual meaning.",
  seo: "Optimize the content for ecommerce SEO using supplied keywords only.",
  "translate-hindi": "Translate the content to Hindi.",
  "translate-marathi": "Translate the content to Marathi.",
  "translate-english": "Translate the content to English.",
};

function sanitizeEditorHtml(html: string) {
  const withoutMarkdown = html
    .replace(/```(?:html)?/gi, "")
    .replace(/```/g, "")
    .trim();

  return DOMPurify.sanitize(withoutMarkdown, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href"],
    ALLOW_DATA_ATTR: false,
  }).trim();
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = editorSchema.parse(await request.json());
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "developer",
          content: [
            "Return HTML only.",
            "Never return Markdown, explanations, or code fences.",
            `Use only these tags: ${ALLOWED_TAGS.join(", ")}.`,
            "Never invent product specifications.",
            "Never invent warranty, dimensions, certifications, pricing, materials, or performance claims.",
            "If facts are missing, keep the copy general, accurate, and suitable for ecommerce.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            task: ACTION_INSTRUCTIONS[body.action],
            content: body.content,
            productTitle: body.productTitle ?? null,
            category: body.category ?? null,
            keywords: body.keywords ?? "",
          }),
        },
      ],
    });
    const html = sanitizeEditorHtml(response.output_text ?? "");

    if (!html) {
      return NextResponse.json(
        { success: false, error: "AI returned empty content." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, html });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid AI editor request.",
          issues: error.flatten(),
        },
        { status: 400 }
      );
    }

    console.error("AI_EDITOR_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Unable to generate editor content." },
      { status: 500 }
    );
  }
}
