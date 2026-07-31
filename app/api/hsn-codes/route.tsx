import { auth } from "@/auth";
import { createHsnCode, getHsnCodes } from "@/actions/hsn-code";
import type { HsnCodeListParams } from "@/actions/hsn-code";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export const dynamic = "force-dynamic";
export async function POST(request: Request) { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const result = await createHsnCode(await request.json()); return NextResponse.json(result, { status: result.success ? 201 : 400 });
} const hsnStatuses = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;
const hsnTaxTypes = ["TAXABLE", "NIL_RATED", "EXEMPT", "NON_GST"] as const;
const hsnSortKeys = ["code", "description", "chapter", "gstRate", "status", "updatedAt"] as const; function isOneOf<T extends readonly string[]>(values: T, value: string | undefined): value is T[number] { return Boolean(value && (values as readonly string[]).includes(value));
}
function parseSortBy(value: string | null): HsnCodeListParams["sortBy"] { switch (value) { case "code": case "description": case "chapter": case "gstRate": case "status": case "updatedAt": return value; default: return "updatedAt"; }
}
export async function GET(request: Request) { const { searchParams } = new URL(request.url); const statusParam = searchParams.get("status")?.toUpperCase(); const taxTypeParam = searchParams.get("taxType")?.toUpperCase(); const sortByParam = searchParams.get("sortBy"); const sortOrderParam = searchParams.get("sortOrder"); const pageSizeParam = searchParams.get("pageSize"); const sortBy = parseSortBy(sortByParam); const listParams: HsnCodeListParams = { page: Number(searchParams.get("page") ?? 1), pageSize: pageSizeParam ? Number(pageSizeParam) : undefined, search: searchParams.get("search") ?? undefined, status: isOneOf(hsnStatuses, statusParam) ? statusParam : "all", gstRate: searchParams.get("gstRate") ? Number(searchParams.get("gstRate")) : undefined, chapter: searchParams.get("chapter") ?? undefined, taxType: isOneOf(hsnTaxTypes, taxTypeParam) ? taxTypeParam : "all", effectiveOn: searchParams.get("effectiveOn") ?? undefined, sortBy, sortOrder: sortOrderParam === "asc" || sortOrderParam === "desc" ? sortOrderParam : "desc", };
const result = await getHsnCodes(listParams); return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
