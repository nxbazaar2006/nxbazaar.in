"use server";

import db from "@/lib/db";
import { decimalToNumber } from "@/lib/hsn/validation";
import type { HsnCodeTaxRecord } from "@/types/hsn";

const hsnSelect = {
  id: true,
  code: true,
  description: true,
  gstRate: true,
  cgstRate: true,
  sgstRate: true,
  igstRate: true,
  cessRate: true,
  taxType: true,
  status: true,
  chapter: true,
  effectiveTo: true,
} as const;

function mapHsn(hsn: HsnCodeTaxRecord | null | undefined, source: "CATEGORY" | "SUBCATEGORY") {
  if (!hsn || hsn.status !== "ACTIVE") return null;
  if (hsn.effectiveTo && hsn.effectiveTo < new Date()) return null;
  return {
    id: hsn.id,
    hsnCodeId: hsn.id,
    hsnCode: hsn.code,
    code: hsn.code,
    title: hsn.description,
    description: hsn.description,
    gstRate: decimalToNumber(hsn.gstRate),
    cgstRate: decimalToNumber(hsn.cgstRate),
    sgstRate: decimalToNumber(hsn.sgstRate),
    igstRate: decimalToNumber(hsn.igstRate),
    cessRate: decimalToNumber(hsn.cessRate),
    taxType: hsn.taxType,
    taxTreatment: hsn.taxType,
    productType: "GOODS",
    source,
  };
}

export async function getSubCategoriesByCategory(categoryId: string) {
  try {
    const subCategories = await db.subCategory.findMany({
      where: { categoryId, isActive: true },
      include: { hsnCode: { select: hsnSelect } },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });
    return { success: true, message: "Subcategories fetched.", data: subCategories };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to fetch subcategories." };
  }
}

export async function getHsnCodesBySubCategory(subCategoryId: string) {
  try {
    const subCategory = await db.subCategory.findFirst({
      where: { id: subCategoryId, isActive: true },
      include: { hsnCode: { select: hsnSelect } },
    });

    if (!subCategory) {
      return { success: false, message: "Selected subcategory is invalid or inactive.", data: [] };
    }

    const mappedHsn = mapHsn(subCategory.hsnCode, "SUBCATEGORY");
    return {
      success: true,
      message: "HSN codes fetched.",
      data: mappedHsn ? [mappedHsn] : [],
    };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to fetch HSN codes.", data: [] };
  }
}

export async function getActiveCategoriesForProduct() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        hsnCode: { select: hsnSelect },
        subCategories: {
          where: { isActive: true },
          include: { hsnCode: { select: hsnSelect } },
          orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        },
      },
      orderBy: { title: "asc" },
    });
    return { success: true, message: "Categories fetched.", data: categories };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to fetch categories." };
  }
}

export async function getEffectiveTaxDetails(categoryId: string, subCategoryId?: string) {
  try {
    const [category, subCategory] = await Promise.all([
      db.category.findFirst({
        where: { id: categoryId, isActive: true },
        include: { hsnCode: { select: hsnSelect } },
      }),
      subCategoryId
        ? db.subCategory.findFirst({
            where: { id: subCategoryId, categoryId, isActive: true },
            include: { hsnCode: { select: hsnSelect } },
          })
        : Promise.resolve(null),
    ]);
    if (!category) return { success: false, message: "Selected category is invalid or inactive." };
    const resolved = mapHsn(subCategory?.hsnCode, "SUBCATEGORY") ?? mapHsn(category.hsnCode, "CATEGORY");
    if (!resolved) {
      return {
        success: true,
        message: "No HSN or GST mapping is configured for the selected subcategory or its parent category.",
        data: null,
      };
    }
    return { success: true, message: "Effective HSN resolved.", data: resolved };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to resolve HSN." };
  }
}
