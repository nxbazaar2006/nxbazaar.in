import { checkRateLimit } from "@/lib/security";

export type AiRateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterMs: number };

export function checkAiRateLimit(key: string, feature: string): AiRateLimitResult {
  const limits: Record<string, { limit: number; windowMs: number }> = {
    shopping_assistant: { limit: 30, windowMs: 60_000 },
    semantic_product_search: { limit: 60, windowMs: 60_000 },
    product_generation: { limit: 10, windowMs: 60_000 },
    category_suggestions: { limit: 20, windowMs: 60_000 },
    review_summary: { limit: 20, windowMs: 60_000 },
    customer_support: { limit: 20, windowMs: 60_000 },
    admin_insights: { limit: 15, windowMs: 60_000 },
    seller_assistant: { limit: 20, windowMs: 60_000 },
  };

  const options = limits[feature] ?? { limit: 20, windowMs: 60_000 };
  return checkRateLimit(`ai:${feature}:${key}`, options);
}
