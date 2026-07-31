import { auth } from "@/auth";
import { bulkImportHsnCodes } from "@/actions/hsn-code";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function POST(request: Request) { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const result = await bulkImportHsnCodes(await request.json()); return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
