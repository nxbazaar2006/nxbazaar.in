import { searchHsnCodes } from "@/actions/hsn-code";
import { NextResponse } from "next/server";
export async function GET(request: Request) { const { searchParams } = new URL(request.url); const query = searchParams.get("q") ?? searchParams.get("search") ?? ""; const result = await searchHsnCodes(query); const data = result.success ? result.data.map((item) => ({ id: item.id, code: item.code, description: item.description, chapter: item.chapter ?? null, gstRate: String(item.gstRate), cgstRate: String(item.cgstRate), sgstRate: String(item.sgstRate), igstRate: String(item.igstRate), cessRate: String(item.cessRate), })) : []; return NextResponse.json(data, { status: result.success ? 200 : 500, });
}
