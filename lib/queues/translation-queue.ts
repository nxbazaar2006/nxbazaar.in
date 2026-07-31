import { Queue, QueueEvents, type JobsOptions } from "bullmq";
import { createRedisConnection } from "@/lib/redis/connection";
import { getAppEnv } from "@/lib/env";
import { QUEUE_NAMES } from "@/lib/queues/queue-names";
import type { TranslationJobData } from "@/lib/queues/translation-job-types";

const env = getAppEnv();

const defaultJobOptions: JobsOptions = {
  attempts: env.TRANSLATION_JOB_ATTEMPTS,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: {
    age: 86_400,
    count: 1000,
  },
  removeOnFail: {
    age: 604_800,
    count: 5000,
  },
};

declare global {
  var translationQueue: Queue<TranslationJobData> | undefined;
  var translationQueueEvents: QueueEvents | undefined;
}

export function getTranslationQueue() {
  if (!globalThis.translationQueue) {
    globalThis.translationQueue = new Queue<TranslationJobData>(QUEUE_NAMES.TRANSLATIONS, {
      connection: createRedisConnection("queue"),
      defaultJobOptions,
    });
  }
  return globalThis.translationQueue;
}

export function getTranslationQueueEvents() {
  if (!globalThis.translationQueueEvents) {
    globalThis.translationQueueEvents = new QueueEvents(QUEUE_NAMES.TRANSLATIONS, {
      connection: createRedisConnection("events"),
    });
  }
  return globalThis.translationQueueEvents;
}
