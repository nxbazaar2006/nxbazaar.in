import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; try { const farmer = await db.user.findUnique({ where: { id, }, include: { farmerProfile: true, }, }); return NextResponse.json(farmer); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Fetch Farmer", error, }, { status: 500 } ); }
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; try { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const existingUser = await db.user.findUnique({ where: { id, }, }); if (!existingUser) { return NextResponse.json( { data: null, message: "User Not Found", }, { status: 404 } ); } const deletedUser = await db.user.delete({ where: { id, }, }); return NextResponse.json(deletedUser); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Delete User", error, }, { status: 500 } ); }
}
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; try { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const { status, emailVerified } = await request.json(); const existingUser = await db.user.findUnique({ where: { id, }, }); if (!existingUser) { return NextResponse.json( { data: null, message: `Not Found`, }, { status: 404 } ); } const updatedUser = await db.user.update({ where: { id }, data: { status, emailVerified }, }); return NextResponse.json(updatedUser); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Update User", error, }, { status: 500 } ); }
}
