import { Queue } from "bullmq";
import { QUEUE_NAMES } from "@/lib/queues/queue-names";
import { createRedisConnection } from "@/lib/redis/connection";

const redis = createRedisConnection("health");
const queueConnection = createRedisConnection("health");
const queue = new Queue(QUEUE_NAMES.TRANSLATIONS, { connection: queueConnection });

async function closeRedisConnection(connection: typeof redis) {
  try {
    await connection.quit();
  } catch {
    connection.disconnect();
  }
}

try {
  const pong = await redis.ping();
  const counts = await queue.getJobCounts("waiting", "active", "failed");
  console.log({
    redis: pong === "PONG" ? "connected" : "unhealthy",
    translationQueue: "healthy",
    counts: {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      failed: counts.failed ?? 0,
    },
  });
} catch (error: unknown) {
  console.error({
    redis: "unhealthy",
    message: error instanceof Error ? error.message : "Unknown Redis health check error",
  });
  process.exitCode = 1;
} finally {
  await queue.close().catch(() => undefined);
  await closeRedisConnection(queueConnection);
  await closeRedisConnection(redis);
}
