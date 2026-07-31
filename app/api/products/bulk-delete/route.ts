import { auth } from "@/auth";
import db from "@/lib/db";
import { assertAuthenticated } from "@/lib/security";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  const denied = assertAuthenticated(session);
  if (denied) return denied;

  const { ids = [] } = (await request.json()) as { ids?: string[] };
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return NextResponse.json({ success: false, message: "No products selected." }, { status: 400 });

  const where = {
    id: { in: uniqueIds },
    ...(session?.user?.role === "ADMIN" ? {} : { userId: session?.user?.id }),
  };
  const result = await db.product.deleteMany({ where });
  const skipped = uniqueIds.length - result.count;
  return NextResponse.json({
    success: true,
    message: `${result.count} products deleted. ${skipped} skipped.`,
    data: { deleted: result.count, skipped },
  });
}
