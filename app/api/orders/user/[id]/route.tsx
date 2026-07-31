import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { canAccessUserResource, unauthorized, forbidden } from "@/lib/security";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; try { const session = await auth(); if (!session?.user?.id) return unauthorized(); if (!canAccessUserResource(session, id)) return forbidden(); const order = await db.order.findMany({ where: { userId:id, }, include: { orderItems: true, }, }); return NextResponse.json(order); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Fetch an Order", error, }, { status: 500 } ); }
} 