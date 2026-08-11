import { NextResponse } from "next/server";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import base64url from "base64url";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { z } from "zod";
import {
  badRequest,
  checkRateLimit,
  getRequestClientKey,
  rateLimited,
} from "@/lib/security";

const resend = new Resend(process.env.RESEND_API_KEY);

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function PUT(request: Request) {
  try {
    // ─── Rate Limiting ──────────────────────────────────────────────────────
    const rateLimit = checkRateLimit(
      getRequestClientKey(request, "forgot-password"),
      { limit: 5, windowMs: 60_000 }
    );
    if (!rateLimit.ok) return rateLimited(rateLimit.retryAfterMs);

    // ─── Validate Input ─────────────────────────────────────────────────────
    const parsed = forgotPasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest("Invalid password reset request");
    }
    const { email } = parsed.data;

    // ─── Find User ──────────────────────────────────────────────────────────
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      // Return success even when user not found to prevent email enumeration
      return NextResponse.json(
        { data: null, message: "If your email exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    // ─── Generate Token ─────────────────────────────────────────────────────
    const rawToken = uuidv4();
    const token = base64url.encode(rawToken);

    // ─── Save Token to DB ────────────────────────────────────────────────────
    await db.user.update({
      where: { id: existingUser.id },
      data: { verificationToken: token },
    });

    // ─── Send Email ──────────────────────────────────────────────────────────
    const userId = existingUser.id;
    const name = existingUser.name ?? "User";
    const redirectUrl = `reset-password?token=${token}&id=${userId}`;
    const subject = "Password Reset - Nxbazaar.in";
    const linkText = "Reset Password";
    const description =
      "Click on the following link in order to reset your password. The link will expire in 1 hour. Thank you.";

    const { error: sendError } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ?? "Nxbazaar.in <noreply@nxbazaar.in>",
      to: email,
      subject,
      react: EmailTemplate({
        name,
        redirectUrl,
        linkText,
        description,
        subject,
      }),
    });

    if (sendError) {
      console.error("[Resend] Failed to send password reset email:", sendError);
      return NextResponse.json(
        { data: null, message: "Failed to send reset email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: null, message: "Password reset link has been sent to your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[forgot-password] Server error:", error);
    return NextResponse.json(
      { message: "Server Error: Something went wrong" },
      { status: 500 }
    );
  }
}