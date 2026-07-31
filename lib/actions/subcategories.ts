"use server";

import db from "@/lib/db";
import { generateSlug } from "@/lib/generateSlug";
import { buildEnglishTranslationPayload, prismaUniqueMessage } from "@/lib/i18n/translationPayload";
import { safelyEnqueueTranslationJobs } from "@/lib/queues/safe-translation-enqueue";
import { createTranslationSourceHash } from "@/lib/translations/source-hash";
import type { ActionResponse } from "@/types/api";
import type { HsnCodeTaxRecord } from "@/types/hsn";

const hsnCodeSelect = {
  id: true,
  code: true,
  description: true,
  gstRate: true,
  cgstRate: true,
  sgstRate: true,
  igstRate: true,
  cessRate: true,
  taxType: true,
  chapter: true,
  effectiveTo: true,
  status: true,
} as const;

export type SubCategoryActionInput = {
  categoryId: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  hsnCodeId?: string | null;
  isActive?: boolean;
};

type SubCategoryWithHsn = {
  category: { hsnCode: HsnCodeTaxRecord | null };
  hsnCode: HsnCodeTaxRecord | null;
};

async function validateActiveHsn(hsnCodeId?: string | null) {
  if (!hsnCodeId) return true;
  const hsn = await db.hsnCode.findFirst({
    where: {
      id: hsnCodeId,
      status: "ACTIVE",
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
    },
    select: { id: true },
  });
  return Boolean(hsn);
}

export async function createSubCategory(input: SubCategoryActionInput): Promise<ActionResponse<SubCategoryWithHsn>> {
  try {
    if (!(await validateActiveHsn(input.hsnCodeId))) {
      return { success: false, message: "Selected HSN code is invalid, inactive, or expired." };
    }
    const englishTranslation = buildEnglishTranslationPayload({
      title: input.title,
      slug: input.slug || generateSlug(input.title),
      description: input.description,
    });
    const sourceHash = createTranslationSourceHash(englishTranslation);
    const created = await db.subCategory.create({
      data: {
        categoryId: input.categoryId,
        title: input.title,
        slug: input.slug || generateSlug(input.title),
        description: input.description || null,
        imageUrl: input.imageUrl || null,
        hsnCodeId: input.hsnCodeId || null,
        isActive: Boolean(input.isActive),
        translations: {
          create: {
            language: englishTranslation.language,
            title: englishTranslation.title,
            slug: englishTranslation.slug,
            description: englishTranslation.description,
            metaTitle: englishTranslation.metaTitle,
            metaDescription: englishTranslation.metaDescription,
          },
        },
      },
      include: { category: { include: { hsnCode: { select: hsnCodeSelect } } }, hsnCode: { select: hsnCodeSelect } },
    });
    await safelyEnqueueTranslationJobs({
      entityType: "SUBCATEGORY",
      entityId: created.id,
      sourceHash,
    });
    return { success: true, message: "Subcategory created.", data: created };
  } catch (error) {
    return { success: false, message: prismaUniqueMessage(error, error instanceof Error ? error.message : "Failed to create subcategory.") };
  }
}

export async function updateSubCategory(id: string, input: SubCategoryActionInput): Promise<ActionResponse<SubCategoryWithHsn>> {
  try {
    if (!(await validateActiveHsn(input.hsnCodeId))) {
      return { success: false, message: "Selected HSN code is invalid, inactive, or expired." };
    }
    const englishTranslation = buildEnglishTranslationPayload({
      title: input.title,
      slug: input.slug || generateSlug(input.title),
      description: input.description,
    });
    const sourceHash = createTranslationSourceHash(englishTranslation);
    const updated = await db.$transaction(async (prisma) => {
      const subCategory = await prisma.subCategory.update({
        where: { id },
        data: {
          categoryId: input.categoryId,
          title: input.title,
          slug: input.slug || generateSlug(input.title),
          description: input.description || null,
          imageUrl: input.imageUrl || null,
          hsnCodeId: input.hsnCodeId || null,
          isActive: Boolean(input.isActive),
        },
        include: { category: { include: { hsnCode: { select: hsnCodeSelect } } }, hsnCode: { select: hsnCodeSelect } },
      });
      await prisma.subCategoryTranslation.upsert({
        where: {
          subCategoryId_language: {
            subCategoryId: id,
            language: englishTranslation.language,
          },
        },
        update: {
          title: englishTranslation.title,
          slug: englishTranslation.slug,
          description: englishTranslation.description,
          metaTitle: englishTranslation.metaTitle,
          metaDescription: englishTranslation.metaDescription,
        },
        create: {
          subCategoryId: id,
          language: englishTranslation.language,
          title: englishTranslation.title,
          slug: englishTranslation.slug,
          description: englishTranslation.description,
          metaTitle: englishTranslation.metaTitle,
          metaDescription: englishTranslation.metaDescription,
        },
      });
      return subCategory;
    });
    await safelyEnqueueTranslationJobs({
      entityType: "SUBCATEGORY",
      entityId: id,
      sourceHash,
    });
    return { success: true, message: "Subcategory updated.", data: updated };
  } catch (error) {
    return { success: false, message: prismaUniqueMessage(error, error instanceof Error ? error.message : "Failed to update subcategory.") };
  }
}

export async function deleteSubCategory(id: string) {
  try {
    const existing = await db.subCategory.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
    if (!existing) return { success: false, message: "Subcategory not found." };
    if (existing._count.products > 0) return { success: false, message: "Subcategory has linked products." };
    const deleted = await db.subCategory.delete({ where: { id } });
    return { success: true, message: "Subcategory deleted.", data: deleted };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to delete subcategory." };
  }
}

export async function toggleSubCategoryStatus(id: string) {
  try {
    const existing = await db.subCategory.findUnique({ where: { id }, select: { isActive: true } });
    if (!existing) return { success: false, message: "Subcategory not found." };
    const updated = await db.subCategory.update({ where: { id }, data: { isActive: !existing.isActive } });
    return { success: true, message: "Subcategory status updated.", data: updated };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to update subcategory status." };
  }
}

export async function getSubCategoryById(id: string) {
  const data = await db.subCategory.findUnique({
    where: { id },
    include: { category: { include: { hsnCode: { select: hsnCodeSelect } } }, hsnCode: { select: hsnCodeSelect }, translations: true },
  });
  return data ? { success: true, message: "Subcategory fetched.", data } : { success: false, message: "Subcategory not found." };
}

export async function getSubCategories() {
  const data = await db.subCategory.findMany({
    include: { category: { include: { hsnCode: { select: hsnCodeSelect } } }, hsnCode: { select: hsnCodeSelect }, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });
  return { success: true, message: "Subcategories fetched.", data };
}

export async function getSubCategoriesByCategory(categoryId: string) {
  const data = await db.subCategory.findMany({
    where: { categoryId, isActive: true },
    include: { hsnCode: { select: hsnCodeSelect } },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return { success: true, message: "Subcategories fetched.", data };
}

export async function searchSubCategories(search: string) {
  const data = await db.subCategory.findMany({
    where: { title: { contains: search, mode: "insensitive" } },
    include: { category: { include: { hsnCode: { select: hsnCodeSelect } } }, hsnCode: { select: hsnCodeSelect } },
    take: 20,
  });
  return { success: true, message: "Subcategories fetched.", data };
}
