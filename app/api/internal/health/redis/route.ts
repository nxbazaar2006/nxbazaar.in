import { auth } from "@/auth";
import { Queue } from "bullmq";
import { getAppEnv } from "@/lib/env";
import { QUEUE_NAMES } from "@/lib/queues/queue-names";
import { createRedisConnection } from "@/lib/redis/connection";
import { NextResponse } from "next/server";
import type { Redis } from "ioredis"; async function closeRedisConnection(connection: Redis) { try { await connection.quit(); } catch { connection.disconnect(); }
}
export async function GET(request: Request) { const env = getAppEnv(); const authorization = request.headers.get("authorization"); const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null; const hasInternalToken = Boolean(env.INTERNAL_HEALTH_TOKEN && bearerToken === env.INTERNAL_HEALTH_TOKEN); if (!hasInternalToken) { const session = await auth(); if (session?.user?.role !== "ADMIN") { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); } } const redis = createRedisConnection("health"); const queueConnection = createRedisConnection("health"); const queue = new Queue(QUEUE_NAMES.TRANSLATIONS, { connection: queueConnection }); try { const pong = await redis.ping(); const counts = await queue.getJobCounts("waiting", "active", "failed"); return NextResponse.json({ redis: pong === "PONG" ? "connected" : "unhealthy", translationQueue: "healthy", counts: { waiting: counts.waiting ?? 0, active: counts.active ?? 0, failed: counts.failed ?? 0, }, }); } catch (error: unknown) { const message = error instanceof Error ? error.message : "Unknown Redis health check error"; return NextResponse.json( { redis: "unhealthy", translationQueue: "unhealthy", message, }, { status: 503 } ); } finally { await queue.close().catch(() => undefined); await closeRedisConnection(queueConnection); await closeRedisConnection(redis); }
}
