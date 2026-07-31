import { auth } from "@/auth";
import { deleteSubCategory, getSubCategoryById, updateSubCategory,
} from "@/lib/actions/subcategories";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function GET( request: Request, context: { params: Promise<{ id: string }> }
) { const { id } = await context.params; const result = await getSubCategoryById(id); return NextResponse.json(result.data ?? result, { status: result.success ? 200 : 404, });
}
export async function PUT( request: Request, context: { params: Promise<{ id: string }> }
) { const { id } = await context.params; const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const result = await updateSubCategory(id, await request.json()); return NextResponse.json(result.success ? result.data : result, { status: result.success ? 200 : 400, });
}
export async function DELETE( request: Request, context: { params: Promise<{ id: string }> }
) { const { id } = await context.params; const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const result = await deleteSubCategory(id); return NextResponse.json(result.data ?? result, { status: result.success ? 200 : 400, });
}
