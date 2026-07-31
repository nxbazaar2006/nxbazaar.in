import "dotenv/config";
import db from "../lib/db";

async function main() {
  const products = await db.product.findMany({
    where: {
      hsnCodeId: null,
      subCategoryId: { not: null },
    },
    select: {
      id: true,
      title: true,
      categoryId: true,
      subCategoryId: true,
    },
  });

  let updated = 0;
  const missing: Array<{ id: string; title: string; categoryId: string; subCategoryId: string | null }> = [];

  for (const product of products) {
    if (!product.subCategoryId) continue;

    const subCategory = await db.subCategory.findFirst({
      where: { id: product.subCategoryId, categoryId: product.categoryId },
      select: {
        hsnCodeId: true,
        category: { select: { hsnCodeId: true } },
      },
    });
    const hsnCodeId = subCategory?.hsnCodeId ?? subCategory?.category?.hsnCodeId ?? null;
    const hsnCode = hsnCodeId
      ? await db.hsnCode.findFirst({
          where: { id: hsnCodeId, status: "ACTIVE" },
          select: { id: true },
        })
      : null;

    if (!hsnCode) {
      missing.push({
        id: product.id,
        title: product.title,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
      });
      continue;
    }

    await db.product.update({
      where: { id: product.id },
      data: { hsnCodeId: hsnCode.id },
    });
    updated += 1;
  }

  console.log(`Products scanned: ${products.length}`);
  console.log(`Products backfilled: ${updated}`);
  console.log(`Products missing default HSN mapping: ${missing.length}`);
  if (missing.length > 0) {
    console.table(missing);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
