import { z } from "zod";
import { getAppEnv } from "@/lib/env";
import type { TranslationTargetLanguage } from "@/lib/queues/translation-job-types";
import { RetryableTranslationError } from "@/lib/translations/errors";

const libreTranslateResponseSchema = z.object({
  translatedText: z.string(),
});

const myMemoryResponseSchema = z.object({
  responseData: z.object({
    translatedText: z.string(),
  }),
});

const openAiResponseSchema = z.object({
  output_text: z.string().optional(),
  output: z
    .array(
      z.object({
        content: z
          .array(
            z.object({
              type: z.string(),
              text: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

export interface TranslationProvider {
  translateText(text: string, targetLanguage: TranslationTargetLanguage): Promise<string>;
}

function targetLanguageName(targetLanguage: TranslationTargetLanguage) {
  return targetLanguage === "hi" ? "Hindi" : "Marathi";
}

async function readJson(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch (error: unknown) {
    throw new RetryableTranslationError(error instanceof Error ? error.message : "Translation provider returned invalid JSON");
  }
}

export class LibreTranslateProvider implements TranslationProvider {
  constructor(private readonly endpoint: string) {}

  async translateText(text: string, targetLanguage: TranslationTargetLanguage) {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: targetLanguage,
        format: "text",
      }),
    });
    const payload = await readJson(response);
    const parsed = libreTranslateResponseSchema.safeParse(payload);
    if (!response.ok || !parsed.success) {
      throw new RetryableTranslationError(`LibreTranslate request failed with status ${response.status}`);
    }
    return parsed.data.translatedText.trim() || text;
  }
}

export class MyMemoryTranslationProvider implements TranslationProvider {
  async translateText(text: string, targetLanguage: TranslationTargetLanguage) {
    const params = new URLSearchParams({
      q: text,
      langpair: `en|${targetLanguage}`,
    });
    const response = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`, {
      cache: "no-store",
    });
    const payload = await readJson(response);
    const parsed = myMemoryResponseSchema.safeParse(payload);
    if (!response.ok || !parsed.success) {
      throw new RetryableTranslationError(`MyMemory request failed with status ${response.status}`);
    }
    return parsed.data.responseData.translatedText.trim() || text;
  }
}

export class OpenAiTranslationProvider implements TranslationProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async translateText(text: string, targetLanguage: TranslationTargetLanguage) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        input: [
          {
            role: "system",
            content: `Translate ecommerce/admin content from English to ${targetLanguageName(targetLanguage)}. Return only translated text.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.2,
      }),
    });
    const payload = await readJson(response);
    const parsed = openAiResponseSchema.safeParse(payload);
    if (!response.ok || !parsed.success) {
      throw new RetryableTranslationError(`OpenAI translation request failed with status ${response.status}`);
    }

    const fromOutputText = parsed.data.output_text?.trim();
    if (fromOutputText) return fromOutputText;

    const fromContent = parsed.data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text?.trim())
      .find((value): value is string => Boolean(value));

    return fromContent || text;
  }
}

export function createTranslationProvider(): TranslationProvider {
  const env = getAppEnv();
  if (env.TRANSLATION_PROVIDER === "libretranslate" && env.TRANSLATION_API_URL) {
    return new LibreTranslateProvider(env.TRANSLATION_API_URL);
  }
  if (env.TRANSLATION_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAiTranslationProvider(process.env.OPENAI_API_KEY, env.OPENAI_TRANSLATION_MODEL);
  }
  return new MyMemoryTranslationProvider();
}
