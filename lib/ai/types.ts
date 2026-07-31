export type AiProviderName = "openai";

export type AiRole = "system" | "user" | "assistant";

export type AiMessageInput = {
  role: AiRole;
  content: string;
};

export type AiRequest = {
  feature: string;
  messages: AiMessageInput[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
};

export type AiUsageTokens = {
  promptTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type AiResponse = {
  content: string;
  model: string;
  provider: AiProviderName;
  usage?: AiUsageTokens;
};

export type AiConfig = {
  enabled: boolean;
  provider: AiProviderName;
  model: string;
  apiKey?: string;
};

export type AiFeature =
  | "shopping_assistant"
  | "semantic_product_search"
  | "product_generation"
  | "category_suggestions"
  | "review_summary"
  | "customer_support"
  | "admin_insights"
  | "seller_assistant";

export type AiSafeLogInput = {
  feature: string;
  status: "success" | "error" | "blocked" | "disabled";
  userId?: string | null;
  userRole?: string | null;
  requestHash?: string | null;
  promptTokens?: number | null;
  outputTokens?: number | null;
  latencyMs?: number | null;
  errorMessage?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ProductSearchFilters = {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  colour?: string;
  size?: string;
  brand?: string;
  tags?: string[];
  rating?: number;
  inStock?: boolean;
};
