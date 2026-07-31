import { auth } from "@/auth";
import { deleteHsnCode, getHsnCodeById, updateHsnCode,
} from "@/actions/hsn-code";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function GET( request: Request, context: { params: Promise<{ id: string }> }
) { const { id } = await context.params; const result = await getHsnCodeById(id); return NextResponse.json(result, { status: result.success ? 200 : 404 });
}
export async function PUT( request: Request, context: { params: Promise<{ id: string }> }
) { const { id } = await context.params; const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const result = await updateHsnCode(id, await request.json()); return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
export async function DELETE( request: Request, context: { params: Promise<{ id: string }> }
) { const { id } = await context.params; const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const result = await deleteHsnCode(id); return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
