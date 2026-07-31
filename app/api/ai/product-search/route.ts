import { auth } from "@/auth";
import { checkAiRateLimit } from "@/lib/ai/rate-limit";
import { searchProductsFromDatabase, writeProductSearchLog } from "@/lib/ai/product-search";
import { assertSafeUserPrompt } from "@/lib/ai/safety";
import { getRequestClientKey, rateLimited } from "@/lib/security";
import { NextResponse } from "next/server";
import { z } from "zod"; const searchSchema = z.object({ query: z.string().trim().min(1).max(500), limit: z.number().int().min(1).max(20).optional(),
});
export async function POST(request: Request) { const parsed = searchSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) { return NextResponse.json({ message: "Invalid AI search request" }, { status: 400 }); } const safety = assertSafeUserPrompt(parsed.data.query); if (!safety.ok) return NextResponse.json({ message: safety.message }, { status: 400 }); const session = await auth(); const key = session?.user?.id ?? getRequestClientKey(request, "ai-product-search"); const limit = checkAiRateLimit(key, "semantic_product_search"); if (limit.ok === false) return rateLimited(limit.retryAfterMs); const result = await searchProductsFromDatabase(parsed.data.query, parsed.data.limit); await writeProductSearchLog(result, session?.user?.id).catch(() => undefined); return NextResponse.json(result);
}
