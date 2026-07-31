import { z } from "zod";

export const translationEntityTypeSchema = z.enum([
  "PRODUCT",
  "CATEGORY",
  "SUBCATEGORY",
  "BRAND",
  "ATTRIBUTE",
  "ATTRIBUTE_VALUE",
  "BLOG",
  "BANNER",
  "PAGE",
]);

export type TranslationEntityType = z.infer<typeof translationEntityTypeSchema>;

export const translationTargetLanguageSchema = z.enum(["hi", "mr"]);
export type TranslationTargetLanguage = z.infer<typeof translationTargetLanguageSchema>;

export const translationJobDataSchema = z.object({
  entityType: translationEntityTypeSchema,
  entityId: z.string().min(1),
  sourceLanguage: z.literal("en"),
  targetLanguage: translationTargetLanguageSchema,
  forceRetranslate: z.boolean().optional(),
  requestedByUserId: z.string().min(1).optional(),
  sourceHash: z.string().min(16),
});

export type TranslationJobData = z.infer<typeof translationJobDataSchema>;

export type EnqueueTranslationJobsInput = {
  entityType: TranslationEntityType;
  entityId: string;
  sourceHash: string;
  targetLanguages?: TranslationTargetLanguage[];
  forceRetranslate?: boolean;
  requestedByUserId?: string;
};

export type EnqueueTranslationJobItem = {
  targetLanguage: TranslationTargetLanguage;
  status: "QUEUED" | "SKIPPED" | "FAILED";
  queueJobId?: string;
  reason?: string;
};

export type EnqueueTranslationJobsResult = {
  en: "COMPLETED";
  jobs: EnqueueTranslationJobItem[];
};

export function buildTranslationJobId(data: Pick<TranslationJobData, "entityType" | "entityId" | "targetLanguage" | "sourceHash">) {
  return `${data.entityType}:${data.entityId}:${data.targetLanguage}:${data.sourceHash}`.replace(/[^a-zA-Z0-9:_-]/g, "_");
}
