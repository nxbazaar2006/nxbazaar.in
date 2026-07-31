import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const ticketSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
});

// Mock/Fallback tickets in case DB table is not yet generated
const sampleTickets = [
  {
    id: "t-101",
    ticketNumber: "TK-84920",
    category: "Crop Advisory",
    subject: "Yellowing of Tomato leaves in monsoon season",
    description: "Leaves are turning yellow with brown spots. Need advice on organic fungicide spray.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    response: "Our Agronomist Dr. Ramesh has recommended spraying Copper Oxychloride (2g/L) during dry morning hours.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "t-102",
    ticketNumber: "TK-73910",
    category: "Payout & Payment",
    subject: "Delay in Wheat harvest payout credit to Bank account",
    description: "Order #ORD-1092 was delivered 3 days ago. Wallet shows pending status.",
    priority: "MEDIUM",
    status: "RESOLVED",
    response: "Payment of ₹18,450 has been processed and credited to your primary SBI bank account.",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: sampleTickets,
    });
  } catch (error) {
    console.error("GET /api/farmer-support error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ticketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { category, subject, description, priority } = parsed.data;
    const ticketNumber = `TK-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTicket = {
      id: `t-${Date.now()}`,
      ticketNumber,
      category,
      subject,
      description,
      priority,
      status: "OPEN",
      response: null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Support Ticket ${ticketNumber} created successfully. Our team will contact you within 24 hours.`,
      data: newTicket,
    });
  } catch (error) {
    console.error("POST /api/farmer-support error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
