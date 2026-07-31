import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function POST(request) { try { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const { title, slug, logoUrl, description, isActive, categoryIds } = await request.json(); const existingMarket = await db.market.findUnique({ where: { slug, }, }); if (existingMarket) { return NextResponse.json( { data: null, message: `Market ( ${title}) already exists in the Database`, }, { status: 409 } ); } const newMarket = await db.market.create({ data: { title, slug, logoUrl, description, isActive, categories: Array.isArray(categoryIds) ? { connect: categoryIds.map((id: string) => ({ id })) } : undefined, }, }); return NextResponse.json(newMarket); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to create Market", error, }, { status: 500 } ); }
}
export async function GET(request) { try { const markets = await db.market.findMany({ orderBy: { createdAt: "desc", }, }); return NextResponse.json(markets); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Fetch Markets", error, }, { status: 500 } ); }
}
