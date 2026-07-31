export class RetryableTranslationError extends Error {
  constructor(message: string, public readonly code = "RETRYABLE_TRANSLATION_ERROR") {
    super(message);
    this.name = "RetryableTranslationError";
  }
}

export class PermanentTranslationError extends Error {
  constructor(message: string, public readonly code = "PERMANENT_TRANSLATION_ERROR") {
    super(message);
    this.name = "PermanentTranslationError";
  }
}

export function getSafeErrorMessage(error: unknown, fallback = "Unknown error") {
  const message = error instanceof Error ? error.message : fallback;
  return message.slice(0, 1000);
}
