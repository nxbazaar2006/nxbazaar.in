import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { assertAdmin, canAccessUserResource, forbidden, sanitizeUser, unauthorized,
} from "@/lib/security";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; try { const session = await auth(); if (!session?.user?.id) return unauthorized(); if (!canAccessUserResource(session, id)) return forbidden(); const user = await db.user.findUnique({ where: { id, }, select: { email: true, name: true, id: true, role: true, createdAt: true, profile: true, }, }); return NextResponse.json(user); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Fetch User", error, }, { status: 500 } ); }
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; try { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const existingUser = await db.user.findUnique({ where: { id, }, }); if (!existingUser) { return NextResponse.json( { data: null, message: "User Not Found", }, { status: 404 } ); } const deletedUser = await db.user.delete({ where: { id, }, }); return NextResponse.json(sanitizeUser(deletedUser)); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Delete User", error, }, { status: 500 } ); }
}
