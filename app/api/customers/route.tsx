import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { assertAdmin, sanitizeUser } from "@/lib/security";
export async function GET(request) { try { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const customers = await db.user.findMany({ orderBy: { createdAt: "desc", }, where: { role: "USER", }, include: { profile: true, }, }); return NextResponse.json(customers.map(sanitizeUser)); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Fetch Users", error, }, { status: 500 } ); }
}
