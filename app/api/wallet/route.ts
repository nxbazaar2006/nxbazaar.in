import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const transactionSchema = z.object({
  action: z.enum(["DEPOSIT", "WITHDRAWAL"]),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let wallet = await db.sellerWallet.findUnique({
      where: { sellerId: userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!wallet) {
      wallet = await db.sellerWallet.create({
        data: {
          sellerId: userId,
          balance: 0,
          pendingAmount: 0,
          totalEarned: 0,
          totalPaidOut: 0,
        },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: wallet.id,
        balance: wallet.balance,
        pendingAmount: wallet.pendingAmount,
        totalEarned: wallet.totalEarned,
        totalPaidOut: wallet.totalPaidOut,
        transactions: wallet.transactions,
      },
    });
  } catch (error) {
    console.error("GET /api/wallet error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { action, amount, description } = parsed.data;

    let wallet = await db.sellerWallet.findUnique({
      where: { sellerId: userId },
    });

    if (!wallet) {
      wallet = await db.sellerWallet.create({
        data: {
          sellerId: userId,
          balance: 0,
          pendingAmount: 0,
          totalEarned: 0,
          totalPaidOut: 0,
        },
      });
    }

    if (action === "WITHDRAWAL" && wallet.balance < amount) {
      return NextResponse.json(
        { success: false, error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    const newBalance =
      action === "DEPOSIT" ? wallet.balance + amount : wallet.balance - amount;
    const newTotalEarned =
      action === "DEPOSIT" ? wallet.totalEarned + amount : wallet.totalEarned;
    const newTotalPaidOut =
      action === "WITHDRAWAL" ? wallet.totalPaidOut + amount : wallet.totalPaidOut;

    const result = await db.$transaction(async (tx) => {
      const updatedWallet = await tx.sellerWallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          totalEarned: newTotalEarned,
          totalPaidOut: newTotalPaidOut,
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          actorId: userId,
          type: action === "DEPOSIT" ? "CREDIT" : "DEBIT",
          amount: amount,
          balanceAfter: newBalance,
          description:
            description ||
            (action === "DEPOSIT" ? "Wallet Topup / Credit" : "Payout Withdrawal Request"),
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return NextResponse.json({
      success: true,
      message: `${action === "DEPOSIT" ? "Added" : "Withdrawn"} ₹${amount.toFixed(2)} successfully`,
      data: result,
    });
  } catch (error) {
    console.error("POST /api/wallet error:", error);
    return NextResponse.json(
      { success: false, error: "Transaction processing failed" },
      { status: 500 }
    );
  }
}
