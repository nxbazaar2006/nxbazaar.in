import { auth } from "@/auth";
import { feedbackSchema } from "@/lib/ai/validators";
import db from "@/lib/db";
import { forbidden, unauthorized } from "@/lib/security";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
export async function POST(request: Request) { const parsed = feedbackSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) { return NextResponse.json({ message: "Invalid feedback request" }, { status: 400 }); } const session = await auth(); if (parsed.data.conversationId || parsed.data.messageId) { if (!session?.user?.id) return unauthorized(); if (parsed.data.conversationId) { const conversation = await db.aiConversation.findUnique({ where: { id: parsed.data.conversationId }, select: { userId: true }, }); if (!conversation || conversation.userId !== session.user.id) return forbidden(); } if (parsed.data.messageId) { const message = await db.aiMessage.findUnique({ where: { id: parsed.data.messageId }, select: { conversation: { select: { userId: true } } }, }); if (!message || message.conversation.userId !== session.user.id) return forbidden(); } } await db.$executeRaw` INSERT INTO "AiFeedback" ("id", "conversationId", "messageId", "userId", "rating", "reason", "createdAt") VALUES (${randomUUID()}, ${parsed.data.conversationId ?? null}, ${parsed.data.messageId ?? null}, ${session?.user?.id ?? null}, ${parsed.data.rating}, ${parsed.data.reason ?? null}, CURRENT_TIMESTAMP) `.catch(() => undefined); return NextResponse.json({ ok: true });
}
