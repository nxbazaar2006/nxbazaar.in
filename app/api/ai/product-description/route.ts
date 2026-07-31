import { auth } from "@/auth";
import { sanitizeEditorHtml } from "@/lib/editor/sanitize-editor-html";
import {
  getActionInstruction,
  STRICT_TRANSLATION_RULES,
} from "@/lib/ai/product-description-prompts";
import {
  ProductAiRequestSchema,
  ProductAiResponse,
} from "@/lib/ai/product-description-schema";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not configured on server." },
        { status: 500 }
      );
    }

    const json = await request.json().catch(() => null);
    const parseResult = ProductAiRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload.",
          issues: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      action,
      sourceLanguage,
      targetLanguage,
      selectedContent,
      fullContent,
      productContext,
    } = parseResult.data;

    const contentToProcess = (selectedContent || fullContent || "").trim();
    const taskInstruction = getActionInstruction(
      action,
      sourceLanguage,
      targetLanguage
    );

    const developerPrompt = [
      "You are an expert ecommerce product copywriter and translator.",
      taskInstruction,
      ...STRICT_TRANSLATION_RULES,
    ].join("\n");

    const userPromptPayload = {
      action,
      sourceLanguage,
      targetLanguage: targetLanguage || sourceLanguage,
      contentToProcess,
      productContext,
    };

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: developerPrompt },
        { role: "user", content: JSON.stringify(userPromptPayload) },
      ],
    });

    const rawOutput = completion.choices[0]?.message?.content ?? "";
    const sanitizedHtml = sanitizeEditorHtml(rawOutput);

    const responseData: ProductAiResponse = {
      success: true,
      action,
      html: sanitizedHtml,
    };

    if (action === "meta-title") {
      responseData.metaTitle = rawOutput.replace(/<[^>]*>/g, "").trim().slice(0, 70);
    } else if (action === "meta-description") {
      responseData.metaDescription = rawOutput.replace(/<[^>]*>/g, "").trim().slice(0, 160);
    } else if (action === "keywords") {
      const cleanKeywords = rawOutput
        .replace(/<[^>]*>/g, "")
        .split(/[,;\n]/)
        .map((k) => k.trim())
        .filter(Boolean);
      responseData.seoKeywords = cleanKeywords;
    } else if (action === "features") {
      const extractedFeatures = rawOutput
        .replace(/<[^>]*>/g, "\n")
        .split("\n")
        .map((f) => f.replace(/^[-*•\d.]+\s*/, "").trim())
        .filter(Boolean);
      responseData.keyFeatures = extractedFeatures;
      responseData.html = sanitizedHtml;
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("PRODUCT_AI_ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate AI product description.",
      },
      { status: 500 }
    );
  }
}
