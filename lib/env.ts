import { z } from "zod";

const booleanStringSchema = z
  .string()
  .optional()
  .default("true")
  .transform((value) => value.toLowerCase() !== "false");

const positiveIntegerStringSchema = (fallback: number) =>
  z
    .string()
    .optional()
    .default(String(fallback))
    .transform((value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    });

const envSchema = z.object({
  REDIS_URL: z
    .string()
    .trim()
    .refine((value) => value.startsWith("redis://") || value.startsWith("rediss://"), {
      message: "REDIS_URL must start with redis:// or rediss://",
    })
    .optional(),
  TRANSLATION_QUEUE_NAME: z.string().trim().min(1).optional().default("translation-jobs"),
  TRANSLATION_WORKER_CONCURRENCY: positiveIntegerStringSchema(5),
  TRANSLATION_JOB_ATTEMPTS: positiveIntegerStringSchema(3),
  AUTO_TRANSLATION_ENABLED: booleanStringSchema,
  TRANSLATION_PROVIDER: z.enum(["openai", "libretranslate", "mymemory"]).optional().default("openai"),
  OPENAI_TRANSLATION_MODEL: z.string().trim().min(1).optional().default("gpt-4.1-mini"),
  TRANSLATION_API_URL: z.string().trim().url().optional().or(z.literal("")),
  INTERNAL_HEALTH_TOKEN: z.string().trim().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function getAppEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return parsed.data;
}
