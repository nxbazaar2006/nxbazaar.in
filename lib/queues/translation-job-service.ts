import db from "@/lib/db";
import { getAppEnv } from "@/lib/env";
import { getTranslationQueue } from "@/lib/queues/translation-queue";
import {
  buildTranslationJobId,
  type EnqueueTranslationJobItem,
  type EnqueueTranslationJobsInput,
  type EnqueueTranslationJobsResult,
  type TranslationJobData,
  type TranslationTargetLanguage,
} from "@/lib/queues/translation-job-types";
import { getSafeErrorMessage } from "@/lib/translations/errors";
import { entityTranslationHandlers } from "@/workers/handlers/registry";

const defaultTargetLanguages: TranslationTargetLanguage[] = ["hi", "mr"];

export async function enqueueTranslationJobs(input: EnqueueTranslationJobsInput): Promise<EnqueueTranslationJobsResult> {
  const env = getAppEnv();
  const targetLanguages = input.targetLanguages ?? defaultTargetLanguages;
  const results: EnqueueTranslationJobItem[] = [];

  if (!env.AUTO_TRANSLATION_ENABLED) {
    return {
      en: "COMPLETED",
      jobs: targetLanguages.map((targetLanguage) => ({
        targetLanguage,
        status: "SKIPPED",
        reason: "Auto translation disabled.",
      })),
    };
  }

  const handler = entityTranslationHandlers[input.entityType];
  if (!handler) {
    return {
      en: "COMPLETED",
      jobs: targetLanguages.map((targetLanguage) => ({
        targetLanguage,
        status: "FAILED",
        reason: `Unsupported entity type ${input.entityType}.`,
      })),
    };
  }

  const source = await handler.getSource(input.entityId);
  if (!source) {
    return {
      en: "COMPLETED",
      jobs: targetLanguages.map((targetLanguage) => ({
        targetLanguage,
        status: "FAILED",
        reason: "English source translation was not found.",
      })),
    };
  }

  for (const targetLanguage of targetLanguages) {
    const existingTarget = await handler.getExistingTarget(input.entityId, targetLanguage);
    if (existingTarget?.isManuallyEdited && !input.forceRetranslate) {
      results.push({ targetLanguage, status: "SKIPPED", reason: "Manual translation is protected." });
      continue;
    }
    if (existingTarget?.isAutoTranslated && existingTarget.sourceHash === input.sourceHash && !input.forceRetranslate) {
      results.push({ targetLanguage, status: "SKIPPED", reason: "Automatic translation is already current." });
      continue;
    }

    const jobData: TranslationJobData = {
      entityType: input.entityType,
      entityId: input.entityId,
      sourceLanguage: "en",
      targetLanguage,
      forceRetranslate: input.forceRetranslate,
      requestedByUserId: input.requestedByUserId,
      sourceHash: input.sourceHash,
    };
    const queueJobId = buildTranslationJobId(jobData);

    const translationJob = await db.translationJob.upsert({
      where: {
        entityType_entityId_targetLanguage_sourceHash: {
          entityType: input.entityType,
          entityId: input.entityId,
          targetLanguage,
          sourceHash: input.sourceHash,
        },
      },
      update: {
        queueJobId,
        status: "PENDING",
        maxAttempts: env.TRANSLATION_JOB_ATTEMPTS,
        requestedById: input.requestedByUserId,
        errorCode: null,
        errorMessage: null,
        failedAt: null,
      },
      create: {
        queueJobId,
        entityType: input.entityType,
        entityId: input.entityId,
        targetLanguage,
        sourceHash: input.sourceHash,
        status: "PENDING",
        maxAttempts: env.TRANSLATION_JOB_ATTEMPTS,
        requestedById: input.requestedByUserId,
      },
    });

    try {
      await getTranslationQueue().add("translate", jobData, { jobId: queueJobId });
      await db.translationJob.update({
        where: { id: translationJob.id },
        data: {
          status: "QUEUED",
          queueJobId,
          errorCode: null,
          errorMessage: null,
          failedAt: null,
        },
      });
      results.push({ targetLanguage, status: "QUEUED", queueJobId });
    } catch (error: unknown) {
      const message = getSafeErrorMessage(error, "Failed to enqueue translation job.");
      console.error({
        event: "translation_job_enqueue_failed",
        entityType: input.entityType,
        entityId: input.entityId,
        targetLanguage,
        message,
      });
      await db.translationJob.update({
        where: { id: translationJob.id },
        data: {
          status: "FAILED",
          errorCode: "QUEUE_UNAVAILABLE",
          errorMessage: message,
          failedAt: new Date(),
        },
      });
      results.push({ targetLanguage, status: "FAILED", queueJobId, reason: message });
    }
  }

  return { en: "COMPLETED", jobs: results };
}
