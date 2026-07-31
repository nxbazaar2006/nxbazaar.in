import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { assertAuthenticated, isAdmin } from "@/lib/security";
export async function GET(request) { try { const session = await auth(); const denied = assertAuthenticated(session); if (denied) return denied; const where: Prisma.SaleWhereInput = isAdmin(session) ? {} : { vendorId: session.user.id };
const sales = await db.sale.findMany({ where, orderBy: { createdAt: "desc", }, }); return NextResponse.json(sales); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Fetch Orders", error, }, { status: 500 } ); }
}
