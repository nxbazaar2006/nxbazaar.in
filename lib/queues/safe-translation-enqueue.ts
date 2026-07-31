import { enqueueTranslationJobs } from "@/lib/queues/translation-job-service";
import type { EnqueueTranslationJobsInput } from "@/lib/queues/translation-job-types";

export async function safelyEnqueueTranslationJobs(input: EnqueueTranslationJobsInput) {
  try {
    return await enqueueTranslationJobs(input);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error({
      event: "translation_enqueue_after_save_failed",
      entityType: input.entityType,
      entityId: input.entityId,
      message,
    });
    return null;
  }
}
