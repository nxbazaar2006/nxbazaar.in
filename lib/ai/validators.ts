import { z } from "zod";

export const aiFeatureSchema = z.enum([
  "shopping_assistant",
  "semantic_product_search",
  "product_generation",
  "category_suggestions",
  "review_summary",
  "customer_support",
  "admin_insights",
  "seller_assistant",
]);

export const aiMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().trim().min(1).max(8_000),
});

export const aiRequestSchema = z.object({
  feature: aiFeatureSchema,
  messages: z.array(aiMessageSchema).min(1).max(20),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().int().min(1).max(4_000).optional(),
  responseFormat: z.enum(["text", "json"]).optional(),
});

export const productSearchFiltersSchema = z.object({
  category: z.string().trim().min(1).max(120).optional(),
  subcategory: z.string().trim().min(1).max(120).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  colour: z.string().trim().min(1).max(80).optional(),
  size: z.string().trim().min(1).max(80).optional(),
  brand: z.string().trim().min(1).max(120).optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  rating: z.number().min(1).max(5).optional(),
  inStock: z.boolean().optional(),
});

export const productGenerationSchema = z.object({
  productName: z.string().trim().min(2).max(200),
  categoryId: z.string().uuid().optional(),
  subCategoryId: z.string().uuid().optional(),
  brand: z.string().trim().max(120).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  language: z.enum(["en", "hi", "mr"]).optional().default("en"),
});

export const aiProductAttributeDraftSchema = z.object({
  name: z.string().trim().min(1).max(80),
  values: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
});

export const aiProductGeneratedDraftSchema = z.object({
  title: z.string().trim().min(1).max(200),
  shortDescription: z.string().trim().max(500).optional().default(""),
  detailedDescription: z.string().trim().max(4_000).optional().default(""),
  features: z.array(z.string().trim().min(1).max(200)).max(12).default([]),
  seoTitle: z.string().trim().max(200).optional().default(""),
  metaDescription: z.string().trim().max(300).optional().default(""),
  keywords: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  translations: z
    .object({
      hi: z.object({ title: z.string().max(200).optional(), shortDescription: z.string().max(500).optional() }).optional(),
      mr: z.object({ title: z.string().max(200).optional(), shortDescription: z.string().max(500).optional() }).optional(),
    })
    .optional(),
  categoryId: z.string().uuid().optional(),
  subCategoryId: z.string().uuid().optional(),
  attributeSuggestions: z.array(aiProductAttributeDraftSchema).max(12).default([]),
  attributes: z.array(aiProductAttributeDraftSchema).max(12).optional(),
  hsnReviewRequired: z.boolean().default(true),
  aiConfidence: z.number().min(0).max(1).optional(),
});

export const feedbackSchema = z.object({
  messageId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  rating: z.enum(["up", "down"]),
  reason: z.string().trim().max(1_000).optional(),
});
