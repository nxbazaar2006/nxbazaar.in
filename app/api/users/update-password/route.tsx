import db from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { badRequest, checkRateLimit, getRequestClientKey, rateLimited, sanitizeUser,
} from "@/lib/security"; const updatePasswordSchema = z.object({ id: z.string().uuid(), token: z.string().min(16), password: z.string().min(8),
});
export async function PUT(request) { try { const rateLimit = checkRateLimit(getRequestClientKey(request, "update-password"), { limit: 5, windowMs: 60_000, }); if (!rateLimit.ok) return rateLimited(rateLimit.retryAfterMs); const parsed = updatePasswordSchema.safeParse(await request.json()); if (!parsed.success) return badRequest("Invalid password reset payload"); const { password, id, token } = parsed.data; // Encrypt the Password =>bcrypt
const hashedPassword = await bcrypt.hash(password, 10); const updatedUser = await db.user.updateMany({ where: { id, verificationToken: token, }, data: { password: hashedPassword, verificationToken: null, }, }); if (updatedUser.count !== 1) { return NextResponse.json({ data: null, message: "Invalid password reset token" }, { status: 400 }); } const user = await db.user.findUnique({ where: { id } }); return NextResponse.json(user ? sanitizeUser(user) : null); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Update User", error, }, { status: 500 } ); } } 