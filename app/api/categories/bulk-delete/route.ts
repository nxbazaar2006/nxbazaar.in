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
  if (!uniqueIds.length) return NextResponse.json({ success: false, message: "No categories selected." }, { status: 400 });

  const categories = await db.category.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, title: true, _count: { select: { products: true, subCategories: true } } },
  });
  const foundIds = new Set(categories.map((category) => category.id));
  const skippedRecords = [
    ...categories
      .filter((category) => category._count.products > 0 || category._count.subCategories > 0)
      .map((category) => ({ id: category.id, title: category.title, reason: "Linked products or subcategories exist" })),
    ...uniqueIds
      .filter((id) => !foundIds.has(id))
      .map((id) => ({ id, title: "-", reason: "Category not found" })),
  ];
  const deletableIds = categories
    .filter((category) => category._count.products === 0 && category._count.subCategories === 0)
    .map((category) => category.id);
  const result = deletableIds.length ? await db.category.deleteMany({ where: { id: { in: deletableIds } } }) : { count: 0 };

  return NextResponse.json({
    success: true,
    message: `${result.count} categories deleted. ${skippedRecords.length} skipped.`,
    data: { deleted: result.count, skipped: skippedRecords.length, skippedRecords },
  });
}
