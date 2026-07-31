import db from "@/lib/db";
import type { AiSafeLogInput } from "./types";
import { redactSensitiveText, sanitizeAiLogMetadata } from "./safety";

type AiRequestLogDelegate = {
  create(args: {
    data: {
      feature: string;
      status: string;
      userId?: string | null;
      userRole?: string | null;
      requestHash?: string | null;
      promptTokens?: number | null;
      outputTokens?: number | null;
      latencyMs?: number | null;
      errorMessage?: string | null;
      metadata?: Record<string, unknown> | null;
    };
  }): Promise<unknown>;
};

export async function writeAiAuditLog(input: AiSafeLogInput) {
  const client = db as unknown as { aIRequestLog?: AiRequestLogDelegate };
  if (!client.aIRequestLog) return;

  await client.aIRequestLog.create({
    data: {
      feature: input.feature,
      status: input.status,
      userId: input.userId ?? null,
      userRole: input.userRole ?? null,
      requestHash: input.requestHash ?? null,
      promptTokens: input.promptTokens ?? null,
      outputTokens: input.outputTokens ?? null,
      latencyMs: input.latencyMs ?? null,
      errorMessage: input.errorMessage ? redactSensitiveText(input.errorMessage) : null,
      metadata: input.metadata ? sanitizeAiLogMetadata(input.metadata) : null,
    },
  });
}
