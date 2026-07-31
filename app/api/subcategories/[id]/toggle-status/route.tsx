import { auth } from "@/auth";
import { toggleSubCategoryStatus } from "@/lib/actions/subcategories";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function PATCH( request: Request, context: { params: Promise<{ id: string }> }
) { const { id } = await context.params; const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const result = await toggleSubCategoryStatus(id); return NextResponse.json(result.data ?? result, { status: result.success ? 200 : 400, });
}
