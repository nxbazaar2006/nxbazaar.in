import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import base64url from "base64url";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
import { EmailTemplate } from "@/components/email-template";
import { z } from "zod";
import {
  assertAdmin,
  badRequest,
  checkRateLimit,
  getRequestClientKey,
  isPublicRegistrationRole,
  rateLimited,
  sanitizeUser,
} from "@/lib/security";

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email address is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().trim().default("USER"),
  plan: z.string().optional().nullable(),
});

export async function POST(request) {
  try {
    const rateLimit = checkRateLimit(getRequestClientKey(request, "user-register"), {
      limit: 10,
      windowMs: 60_000,
    });
    if (!rateLimit.ok) return rateLimited(rateLimit.retryAfterMs);

    const payload = await request.json();
    const parsed = createUserSchema.safeParse({
      ...payload,
      role: payload?.role || "USER",
    });
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((issue) => issue.message).join(". "));
    }

    const { name, password, role, plan } = parsed.data;
    const email = parsed.data.email.trim().toLowerCase();
    if (!isPublicRegistrationRole(role)) {
      return badRequest("Invalid registration role");
    }

    const existingUser = await db.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { data: null, message: `User with this email ( ${email}) already exists in the Database` },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = base64url.encode(uuidv4());
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        plan,
        status: role === "USER",
        emailVerified: role === "USER",
        verificationToken: token,
      },
    });

    // Send verification email for non-USER roles (vendors, farmers, etc.)
    if (role !== "USER") {
      const redirectUrl = `verify-email?token=${token}&id=${newUser.id}`;
      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "Nxbazaar.in <noreply@nxbazaar.in.in>",
        to: email,
        subject: "Verify Your Account - Nxbazaar.in",
        react: EmailTemplate({
          name,
          redirectUrl,
          linkText: "Verify Account",
          description:
            "Thank you for registering with Nxbazaar.in. Please click the button below to verify your email address and complete your account setup.",
          subject: "Verify Your Account - Nxbazaar.in",
        }),
      });
      if (sendError) {
        console.error("[Resend] Failed to send verification email:", sendError);
      }
    }

    return NextResponse.json(
      { data: sanitizeUser(newUser), message: "User Created Successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error: Something went wrong" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    const denied = assertAdmin(session);
    if (denied) return denied;

    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(users.map(sanitizeUser));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to Fetch Users" }, { status: 500 });
  }
}
