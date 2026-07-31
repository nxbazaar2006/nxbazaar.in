import { auth } from "@/auth";
import { NextResponse } from "next/server";
import db from "@/lib/db";
export async function GET() { const session = await auth(); if (session?.user?.role !== "ADMIN") { return NextResponse.json( { success: false, message: "Only admins can export HSN codes." }, { status: 403 } ); } const rows = await db.hsnCode.findMany({ orderBy: { code: "asc" }, include: { _count: { select: { categories: true, subCategories: true, }, }, }, }); const header = [ "code", "description", "chapter", "gstRate", "igstRate", "cessRate", "taxType", "uqc", "keywords", "status", "categories", "subCategories", ]; const escape = (value: unknown) => {
const text = Array.isArray(value) ? value.join("|") : value instanceof Date ? value.toISOString() : String(value ?? ""); return `"${text.replace(/"/g, '""')}"`; };
const csv = [ header.join(","), ...rows.map((row) => {
const exportRow: Record<string, unknown> = { code: row.code, description: row.description, chapter: row.chapter, gstRate: row.gstRate, igstRate: row.igstRate, cessRate: row.cessRate, taxType: row.taxType, uqc: row.uqc, keywords: row.keywords, status: row.status, categories: row._count.categories, subCategories: row._count.subCategories, }; return header.map((key) => escape(exportRow[key])).join(","); }), ].join("\n"); return new NextResponse(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=hsn-codes.csv", }, });
}
export async function POST(request: Request) { const session = await auth(); if (session?.user?.role !== "ADMIN") { return NextResponse.json( { success: false, message: "Only admins can check HSN codes." }, { status: 403 } ); } const body = (await request.json()) as { codes?: string[] };
const codes = [...new Set((body.codes ?? []).map((code) => code.trim()))] .filter(Boolean) .slice(0, 10000); const existing = await db.hsnCode.findMany({ where: { code: { in: codes } }, select: { code: true }, }); return NextResponse.json({ success: true, data: existing.map((item) => item.code), });
}
