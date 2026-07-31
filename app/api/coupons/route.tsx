import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { assertAuthenticated, isAdmin } from "@/lib/security";
export async function POST(request) { try { const session = await auth(); const denied = assertAuthenticated(session); if (denied) return denied; const { title, couponCode, expiryDate, isActive, vendorId } = await request.json(); const resolvedVendorId = isAdmin(session) ? vendorId : session.user.id; const newCoupon = await db.coupon.create({ data: { title, couponCode, expiryDate, isActive, vendorId: resolvedVendorId, }, }); return NextResponse.json(newCoupon); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to create Coupon", error, }, { status: 500 } ); }
}
export async function GET(request) { try { const session = await auth(); const denied = assertAuthenticated(session); if (denied) return denied; const coupons = await db.coupon.findMany({ where: isAdmin(session) ? {} : { vendorId: session.user.id }, orderBy: { createdAt: "desc", }, }); return NextResponse.json(coupons); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Fetch Coupon", error, }, { status: 500 } ); }
}
