import { auth } from "@/auth";
import { bulkActivateHsnCodes, bulkDeactivateHsnCodes,
} from "@/actions/hsn-code";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function POST(request: Request) { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const body = (await request.json()) as { ids?: string[]; isActive?: boolean; };
const result = body.isActive === false ? await bulkDeactivateHsnCodes(body.ids ?? []) : await bulkActivateHsnCodes(body.ids ?? []); return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
