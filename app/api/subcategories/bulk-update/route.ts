import { auth } from "@/auth";
import db from "@/lib/db";
import { assertAdmin } from "@/lib/security";
import { NextResponse } from "next/server";

async function validateActiveHsn(hsnCodeId?: string | null) {
  if (!hsnCodeId) return true;
  const hsn = await db.hsnCode.findFirst({
    where: { id: hsnCodeId, status: "ACTIVE", OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }] },
    select: { id: true },
  });
  return Boolean(hsn);
}

export async function POST(request: Request) {
  const session = await auth();
  const denied = assertAdmin(session);
  if (denied) return denied;

  const body = (await request.json()) as { ids?: string[]; isActive?: boolean; hsnMode?: "unchanged" | "set" | "clear"; hsnCodeId?: string | null };
  const ids = [...new Set((body.ids ?? []).filter(Boolean))];
  if (!ids.length) return NextResponse.json({ success: false, message: "No subcategories selected." }, { status: 400 });
  if (body.hsnMode === "set" && !(await validateActiveHsn(body.hsnCodeId))) {
    return NextResponse.json({ success: false, message: "Selected HSN code is invalid, inactive, or expired." }, { status: 400 });
  }

  const data: { isActive?: boolean; hsnCodeId?: string | null } = {};
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (body.hsnMode === "set") data.hsnCodeId = body.hsnCodeId || null;
  if (body.hsnMode === "clear") data.hsnCodeId = null;
  if (Object.keys(data).length === 0) return NextResponse.json({ success: false, message: "No changes selected." }, { status: 400 });

  const result = await db.subCategory.updateMany({ where: { id: { in: ids } }, data });
  return NextResponse.json({ success: true, message: `${result.count} subcategories updated.`, data: { updated: result.count } });
}
