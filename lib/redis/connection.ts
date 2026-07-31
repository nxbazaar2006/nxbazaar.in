import IORedis, { type RedisOptions } from "ioredis";
import { getAppEnv } from "@/lib/env";

export type RedisConnectionPurpose = "queue" | "worker" | "events" | "health";

export function getRedisUrl() {
  const redisUrl = getAppEnv().REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is not configured");
  }
  return redisUrl;
}

export function getRedisConnectionOptions(purpose: RedisConnectionPurpose = "queue"): RedisOptions {
  const redisUrl = getRedisUrl();
  return {
    maxRetriesPerRequest: purpose === "worker" ? null : purpose === "health" ? 1 : 3,
    enableReadyCheck: true,
    connectTimeout: purpose === "health" ? 3000 : 10000,
    retryStrategy: purpose === "health" ? () => null : undefined,
    tls: redisUrl.startsWith("rediss://") ? {} : undefined,
  };
}

export function createRedisConnection(purpose: RedisConnectionPurpose = "queue") {
  const redisUrl = getRedisUrl();
  const connection = new IORedis(redisUrl, getRedisConnectionOptions(purpose));
  connection.on("error", (error: Error) => {
    console.error({
      event: "redis_connection_error",
      purpose,
      message: error.message,
    });
  });
  return connection;
}
