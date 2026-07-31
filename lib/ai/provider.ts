import type { AiConfig, AiRequest, AiResponse } from "./types";
import { aiRequestSchema } from "./validators";

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value.toLowerCase() !== "false";
}

export function getAiConfig(): AiConfig {
  return {
    enabled: parseBoolean(process.env.AI_ENABLED, true),
    provider: "openai",
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    apiKey: process.env.OPENAI_API_KEY,
  };
}

export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly status: "disabled" | "configuration_error" | "provider_error"
  ) {
    super(message);
  }
}

export async function generateAiResponse(input: AiRequest): Promise<AiResponse> {
  const parsed = aiRequestSchema.parse(input);
  const config = getAiConfig();

  if (!config.enabled) {
    throw new AiProviderError("AI is disabled.", "disabled");
  }

  if (!config.apiKey) {
    throw new AiProviderError("AI provider API key is not configured.", "configuration_error");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: parsed.messages,
      temperature: parsed.temperature ?? 0.2,
      max_tokens: parsed.maxTokens ?? 1_000,
      response_format:
        parsed.responseFormat === "json" ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    throw new AiProviderError(`AI provider request failed with ${response.status}.`, "provider_error");
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    model?: string;
  };

  return {
    content: payload.choices?.[0]?.message?.content ?? "",
    provider: config.provider,
    model: payload.model ?? config.model,
    usage: {
      promptTokens: payload.usage?.prompt_tokens,
      outputTokens: payload.usage?.completion_tokens,
      totalTokens: payload.usage?.total_tokens,
    },
  };
}
