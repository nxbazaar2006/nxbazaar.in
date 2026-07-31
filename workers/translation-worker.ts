import { Job, QueueEvents, UnrecoverableError, Worker } from "bullmq";
import db from "@/lib/db";
import { getAppEnv } from "@/lib/env";
import { QUEUE_NAMES } from "@/lib/queues/queue-names";
import { translationJobDataSchema, type TranslationJobData } from "@/lib/queues/translation-job-types";
import { createRedisConnection } from "@/lib/redis/connection";
import { getSafeErrorMessage, PermanentTranslationError } from "@/lib/translations/errors";
import { translateFields } from "@/lib/translations/translation-service";
import { entityTranslationHandlers } from "@/workers/handlers/registry";

const env = getAppEnv();
const workerConnection = createRedisConnection("worker");
const eventsConnection = createRedisConnection("events");
const queueEvents = new QueueEvents(QUEUE_NAMES.TRANSLATIONS, { connection: eventsConnection });

async function markJobSkipped(data: TranslationJobData, reason: string) {
  await db.translationJob.updateMany({
    where: {
      entityType: data.entityType,
      entityId: data.entityId,
      targetLanguage: data.targetLanguage,
      sourceHash: data.sourceHash,
    },
    data: {
      status: "SKIPPED",
      errorCode: "SKIPPED",
      errorMessage: reason,
      completedAt: new Date(),
      failedAt: null,
    },
  });
}

async function processTranslationJob(job: Job<TranslationJobData>) {
  const startedAt = Date.now();
  const parsed = translationJobDataSchema.safeParse(job.data);
  if (!parsed.success) {
    throw new UnrecoverableError(parsed.error.issues.map((issue) => issue.message).join("; "));
  }

  const data = parsed.data;
  const handler = entityTranslationHandlers[data.entityType];
  if (!handler) {
    throw new UnrecoverableError(`Unsupported entity type ${data.entityType}`);
  }

  await db.translationJob.updateMany({
    where: {
      queueJobId: job.id,
      entityType: data.entityType,
      entityId: data.entityId,
      targetLanguage: data.targetLanguage,
      sourceHash: data.sourceHash,
    },
    data: {
      status: "PROCESSING",
      attempts: job.attemptsMade + 1,
      startedAt: new Date(),
      errorCode: null,
      errorMessage: null,
    },
  });

  const source = await handler.getSource(data.entityId);
  if (!source) {
    throw new PermanentTranslationError("Entity or English source translation was not found.", "ENTITY_NOT_FOUND");
  }
  if (source.sourceHash !== data.sourceHash) {
    await markJobSkipped(data, "English source content changed before this job ran.");
    return;
  }

  const hasTranslatableContent = Object.values(source.fields).some((value) => typeof value === "string" && value.trim());
  if (!hasTranslatableContent) {
    throw new PermanentTranslationError("English source content is empty.", "EMPTY_SOURCE_CONTENT");
  }

  const existingTarget = await handler.getExistingTarget(data.entityId, data.targetLanguage);
  if (existingTarget?.isManuallyEdited && !data.forceRetranslate) {
    await markJobSkipped(data, "Manual translation is protected.");
    return;
  }

  const translatedFields = await translateFields(source.fields, data.targetLanguage);
  await handler.saveTranslation(data.entityId, data.targetLanguage, translatedFields, data.sourceHash);

  await db.translationJob.updateMany({
    where: {
      entityType: data.entityType,
      entityId: data.entityId,
      targetLanguage: data.targetLanguage,
      sourceHash: data.sourceHash,
    },
    data: {
      status: "COMPLETED",
      attempts: job.attemptsMade + 1,
      completedAt: new Date(),
      failedAt: null,
      errorCode: null,
      errorMessage: null,
    },
  });

  console.log({
    event: "translation_job_completed",
    jobId: job.id,
    entityType: data.entityType,
    entityId: data.entityId,
    targetLanguage: data.targetLanguage,
    durationMs: Date.now() - startedAt,
  });
}

const worker = new Worker<TranslationJobData>(
  QUEUE_NAMES.TRANSLATIONS,
  async (job) => {
    try {
      await processTranslationJob(job);
    } catch (error: unknown) {
      const parsed = translationJobDataSchema.safeParse(job.data);
      const message = getSafeErrorMessage(error, "Translation worker failed.");
      if (parsed.success) {
        await db.translationJob.updateMany({
          where: {
            entityType: parsed.data.entityType,
            entityId: parsed.data.entityId,
            targetLanguage: parsed.data.targetLanguage,
            sourceHash: parsed.data.sourceHash,
          },
          data: {
            status: "FAILED",
            attempts: job.attemptsMade + 1,
            failedAt: new Date(),
            errorCode: error instanceof PermanentTranslationError ? error.code : "TRANSLATION_WORKER_ERROR",
            errorMessage: message,
          },
        });
      }

      if (error instanceof PermanentTranslationError) {
        throw new UnrecoverableError(message);
      }
      throw error;
    }
  },
  {
    connection: workerConnection,
    concurrency: env.TRANSLATION_WORKER_CONCURRENCY,
  }
);

queueEvents.on("completed", ({ jobId }) => {
  console.log({ event: "translation_queue_completed", jobId });
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error({ event: "translation_queue_failed", jobId, message: failedReason });
});

queueEvents.on("stalled", ({ jobId }) => {
  console.warn({ event: "translation_queue_stalled", jobId });
});

worker.on("error", (error: Error) => {
  console.error({ event: "translation_worker_error", message: error.message });
});

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}. Closing translation worker.`);
  await worker.close();
  await queueEvents.close();
  await workerConnection.quit();
  await eventsConnection.quit();
  await db.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

console.log({
  event: "translation_worker_started",
  queueName: QUEUE_NAMES.TRANSLATIONS,
  concurrency: env.TRANSLATION_WORKER_CONCURRENCY,
});
