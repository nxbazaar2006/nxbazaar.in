import { auth } from "@/auth";
import { toggleHsnCodeStatus } from "@/actions/hsn-code";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function PATCH( request: Request, context: { params: Promise<{ id: string }> }
) { const { id } = await context.params; const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const result = await toggleHsnCodeStatus(id); return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
