import { auth } from "@/auth";
import { bulkDeleteHsnCodes } from "@/actions/hsn-code";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function POST(request: Request) { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const body = (await request.json()) as { ids?: string[] };
const result = await bulkDeleteHsnCodes(body.ids ?? []); const status = result.success ? 200 : 400; return NextResponse.json(result, { status });
}
