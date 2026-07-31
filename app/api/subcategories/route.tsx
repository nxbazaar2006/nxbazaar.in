import { auth } from "@/auth";
import { createSubCategory, getSubCategories, getSubCategoriesByCategory, searchSubCategories,
} from "@/lib/actions/subcategories";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function POST(request: Request) { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const result = await createSubCategory(await request.json()); return NextResponse.json(result.success ? result.data : result, { status: result.success ? 201 : 400, });
}
export async function GET(request: Request) { const { searchParams } = new URL(request.url); const categoryId = searchParams.get("categoryId"); const search = searchParams.get("search"); const result = search ? await searchSubCategories(search) : categoryId ? await getSubCategoriesByCategory(categoryId) : await getSubCategories(); return NextResponse.json(result.data ?? result, { status: result.success ? 200 : 500, });
}
