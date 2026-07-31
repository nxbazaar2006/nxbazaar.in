import { createHash } from "node:crypto";

const sensitivePatterns: Array<[RegExp, string]> = [
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]"],
  [/\b(?:\+?91[-\s]?)?[6-9]\d{9}\b/g, "[phone]"],
  [/\b(?:\d[ -]*?){12,19}\b/g, "[number]"],
  [/\b(?:api[_-]?key|token|secret|password)\s*[:=]\s*\S+/gi, "[secret]"],
];

const injectionPatterns = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s+prompt/i,
  /developer\s+message/i,
  /reveal\s+(the\s+)?(prompt|instructions|api key|secret)/i,
  /act\s+as\s+(an?\s+)?(admin|database|sql)/i,
  /run\s+(raw\s+)?sql/i,
];

export function redactSensitiveText(value: string) {
  return sensitivePatterns.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    value
  );
}

export function hashAiInput(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function containsPromptInjection(value: string) {
  return injectionPatterns.some((pattern) => pattern.test(value));
}

export function assertSafeUserPrompt(value: string) {
  if (containsPromptInjection(value)) {
    return {
      ok: false as const,
      message: "Request blocked because it attempts to override AI safety instructions.",
    };
  }

  return { ok: true as const };
}

export function maskOrderNumber(value: string | null | undefined) {
  if (!value) return value;
  if (value.length <= 4) return "****";
  return `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

export function sanitizeAiLogMetadata(metadata: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => {
      if (typeof value === "string") return [key, redactSensitiveText(value)];
      return [key, value];
    })
  );
}
