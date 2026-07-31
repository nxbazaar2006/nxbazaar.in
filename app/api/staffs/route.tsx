import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/security"; const staffSchema = z.object({ name: z.string().trim().min(1), password: z.string().min(8), email: z.string().email(), phone: z.string().optional(), physicalAddress: z.string().optional(), nin: z.string().optional(), dob: z.string().optional(), notes: z.string().optional(), code: z.string().optional(), isActive: z.boolean().optional(),
});
export async function POST(request) { try { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const parsed = staffSchema.safeParse(await request.json()); if (!parsed.success) { return NextResponse.json({ message: "Invalid staff payload" }, { status: 400 }); } const { password: _password, ...newStaff } = parsed.data; return NextResponse.json(newStaff); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to create Staff", error, }, { status: 500 } ); }
}
