import FormHeader from "@/components/backoffice/FormHeader";
import NewProductForm, { type ProductSubCategoryOption } from "@/components/backoffice/NewProductForm";
import { getActiveCategoriesForProduct } from "@/lib/actions/products";
import { getData } from "@/lib/getData";
import { asArray } from "@/lib/normalizeApiData";
import React from "react";

export default async function UpdateProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getData(`products/${id}`);
  const categoriesResult = await getActiveCategoriesForProduct();
  const subCategoriesData = (await getData("subcategories")) ?? [];
  const farmersData = await getData("farmers");

  const farmers = asArray(farmersData).map((farmer: any) => ({
    id: String(farmer.id ?? ""),
    title: String(farmer.name || farmer.email || farmer.id || ""),
  }));
  const categories = asArray(categoriesResult.data).map((category: any) => ({
    id: String(category.id ?? ""),
    title: String(category.title ?? ""),
  }));
  const subCategories: ProductSubCategoryOption[] = asArray(subCategoriesData).map((subCategory: any) => ({
    id: String(subCategory.id ?? ""),
    title: String(subCategory.title ?? ""),
    categoryId: String(subCategory.categoryId ?? ""),
    hsnCode: (subCategory.hsnCode ?? subCategory.category?.hsnCode ?? null) as any,
  }));

  return (
    <div>
      <FormHeader title="Update Product" />
      <NewProductForm updateData={product} categories={categories} subCategories={subCategories} farmers={farmers} />
    </div>
  );
}