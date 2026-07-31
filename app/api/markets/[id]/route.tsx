import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; try { const market = await db.market.findUnique({ where: { id, }, }); return NextResponse.json(market); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Fetch Market", error, }, { status: 500 } ); }
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; try { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const existingMarket = await db.market.findUnique({ where: { id, }, }); if (!existingMarket) { return NextResponse.json( { data: null, message: "Market Not Found", }, { status: 404 } ); } const deletedMarket = await db.market.delete({ where: { id, }, }); return NextResponse.json(deletedMarket); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Delete Market", error, }, { status: 500 } ); }
}
