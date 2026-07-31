import { auth } from "@/auth";
import db from "@/lib/db";
import { assertAdmin } from "@/lib/security";
import { HsnStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const statuses = new Set<HsnStatus>([HsnStatus.ACTIVE, HsnStatus.INACTIVE, HsnStatus.ARCHIVED]);

export async function POST(request: Request) {
  const session = await auth();
  const denied = assertAdmin(session);
  if (denied) return denied;

  const body = (await request.json()) as { ids?: string[]; status?: HsnStatus };
  const ids = [...new Set((body.ids ?? []).filter(Boolean))];
  if (!ids.length) return NextResponse.json({ success: false, message: "No HSN codes selected." }, { status: 400 });
  if (!body.status || !statuses.has(body.status)) {
    return NextResponse.json({ success: false, message: "Select a valid status." }, { status: 400 });
  }

  const result = await db.hsnCode.updateMany({ where: { id: { in: ids } }, data: { status: body.status, updatedById: session?.user?.id } });
  return NextResponse.json({ success: true, message: `${result.count} HSN codes updated.`, data: { updated: result.count } });
}
