import { auth } from "@/auth";
import db from "@/lib/db";
import { assertAdmin } from "@/lib/security";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  const denied = assertAdmin(session);
  if (denied) return denied;

  const { ids = [] } = (await request.json()) as { ids?: string[] };
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return NextResponse.json({ success: false, message: "No subcategories selected." }, { status: 400 });

  const subCategories = await db.subCategory.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, title: true, _count: { select: { products: true } } },
  });
  const foundIds = new Set(subCategories.map((subCategory) => subCategory.id));
  const skippedRecords = [
    ...subCategories
      .filter((subCategory) => subCategory._count.products > 0)
      .map((subCategory) => ({ id: subCategory.id, title: subCategory.title, reason: "Linked products exist" })),
    ...uniqueIds
      .filter((id) => !foundIds.has(id))
      .map((id) => ({ id, title: "-", reason: "Subcategory not found" })),
  ];
  const deletableIds = subCategories.filter((subCategory) => subCategory._count.products === 0).map((subCategory) => subCategory.id);
  const result = deletableIds.length ? await db.subCategory.deleteMany({ where: { id: { in: deletableIds } } }) : { count: 0 };

  return NextResponse.json({
    success: true,
    message: `${result.count} subcategories deleted. ${skippedRecords.length} skipped.`,
    data: { deleted: result.count, skipped: skippedRecords.length, skippedRecords },
  });
}
