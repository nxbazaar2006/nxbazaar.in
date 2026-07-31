import db from "@/lib/db";
import { defaultLanguage } from "@/lib/i18n/languages";
import { generateLocalizedSlug, withNumericSlugSuffix } from "@/lib/utils/generateLocalizedSlug";

async function migrateCategories() {
  const usedSlugs = new Set(
    (await db.categoryTranslation.findMany({
      where: { language: defaultLanguage },
      select: { slug: true },
    })).map((item) => item.slug)
  );
  const categories = await db.category.findMany({
    include: { translations: true },
  });

  for (const category of categories) {
    if (category.translations.some((item) => item.language === defaultLanguage)) continue;
    const baseSlug = category.slug || generateLocalizedSlug(category.title, defaultLanguage);
    const slug = withNumericSlugSuffix(baseSlug, usedSlugs);
    await db.categoryTranslation.create({
      data: {
        categoryId: category.id,
        language: defaultLanguage,
        title: category.title,
        slug,
        description: category.description,
      },
    });
  }
}

async function migrateSubCategories() {
  const usedSlugs = new Set(
    (await db.subCategoryTranslation.findMany({
      where: { language: defaultLanguage },
      select: { slug: true },
    })).map((item) => item.slug)
  );
  const subCategories = await db.subCategory.findMany({
    include: { translations: true },
  });

  for (const subCategory of subCategories) {
    if (subCategory.translations.some((item) => item.language === defaultLanguage)) continue;
    const baseSlug = subCategory.slug || generateLocalizedSlug(subCategory.title, defaultLanguage);
    const slug = withNumericSlugSuffix(baseSlug, usedSlugs);
    await db.subCategoryTranslation.create({
      data: {
        subCategoryId: subCategory.id,
        language: defaultLanguage,
        title: subCategory.title,
        slug,
        description: subCategory.description,
      },
    });
  }
}

async function migrateProducts() {
  const usedSlugs = new Set(
    (await db.productTranslation.findMany({
      where: { language: defaultLanguage },
      select: { slug: true },
    })).map((item) => item.slug)
  );
  const products = await db.product.findMany({
    include: { translations: true },
  });

  for (const product of products) {
    if (product.translations.some((item) => item.language === defaultLanguage)) continue;
    const baseSlug = product.slug || generateLocalizedSlug(product.title, defaultLanguage);
    const slug = withNumericSlugSuffix(baseSlug, usedSlugs);
    await db.productTranslation.create({
      data: {
        productId: product.id,
        language: defaultLanguage,
        title: product.title,
        slug,
        description: product.description,
      },
    });
  }
}

async function main() {
  await migrateCategories();
  await migrateSubCategories();
  await migrateProducts();
  console.log("Existing Product, Category and SubCategory English translations migrated.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
