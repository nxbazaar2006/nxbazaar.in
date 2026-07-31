import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; try { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const { title, couponCode, expiryDate, isActive } = await request.json(); const existingUser = await db.coupon.findUnique({ where: { id, }, }); if (!existingUser) { return NextResponse.json( { data: null, message: `Not Found`, }, { status: 404 } ); } const updatedCoupon = await db.coupon.update({ where: { id }, data: { title, couponCode, expiryDate, isActive, }, }); return NextResponse.json(updatedCoupon); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Update Coupon", error, }, { status: 500 } ); }
}
