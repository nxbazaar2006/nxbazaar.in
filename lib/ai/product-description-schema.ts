import { z } from "zod";

export const LanguageCodeEnum = z.enum(["en", "hi", "mr"]);
export type LanguageCode = z.infer<typeof LanguageCodeEnum>;

export const TranslationStatusEnum = z.enum([
  "DRAFT",
  "AI_GENERATED",
  "REVIEWED",
  "PUBLISHED",
]);
export type TranslationStatus = z.infer<typeof TranslationStatusEnum>;

export const ProductAiActionEnum = z.enum([
  "generate",
  "translate",
  "translate-full",
  "translate-en-hi",
  "translate-en-mr",
  "improve",
  "grammar",
  "professional",
  "shorten",
  "expand",
  "features",
  "faq",
  "seo",
  "meta-title",
  "meta-description",
  "keywords",
]);
export type ProductAiAction = z.infer<typeof ProductAiActionEnum>;

export const ProductAiRequestSchema = z.object({
  action: ProductAiActionEnum,
  sourceLanguage: LanguageCodeEnum.default("en"),
  targetLanguage: LanguageCodeEnum.optional(),
  selectedContent: z.string().optional().default(""),
  fullContent: z.string().optional().default(""),
  productContext: z
    .object({
      title: z.string().optional(),
      category: z.string().optional(),
      subCategory: z.string().optional(),
      brand: z.string().optional(),
      sku: z.string().optional(),
      attributes: z.record(z.string(), z.string()).optional(),
      specifications: z.record(z.string(), z.string()).optional(),
    })
    .optional()
    .default({}),
});

export type ProductAiRequest = z.infer<typeof ProductAiRequestSchema>;

export const ProductAiResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  html: z.string().optional(),
  title: z.string().optional(),
  shortDescription: z.string().optional(),
  keyFeatures: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  action: ProductAiActionEnum.optional(),
});

export type ProductAiResponse = z.infer<typeof ProductAiResponseSchema>;
