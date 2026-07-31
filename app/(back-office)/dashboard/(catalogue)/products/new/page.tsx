import FormHeader from "@/components/backoffice/FormHeader";
import NewProductForm from "@/components/backoffice/NewProductForm";
import { getActiveCategoriesForProduct } from "@/lib/actions/products";
import { getData } from "@/lib/getData";
import { asArray } from "@/lib/normalizeApiData";
import React from "react";

export default async function NewProduct() {
  const categoriesResult = await getActiveCategoriesForProduct();
  const subCategoriesData = (await getData("subcategories")) ?? [];
  const farmersData = (await getData("farmers")) ?? [];

  if (!categoriesResult.success || !farmersData) {
    return <div>Loading...</div>;
  }

  const farmers = asArray(farmersData).map((farmer) => ({
    id: farmer.id,
    title: farmer.name || farmer.email || farmer.id,
  }));
  const categories = asArray(categoriesResult.data).map((category) => ({
    id: category.id,
    title: category.title,
  }));
  const subCategories = asArray(subCategoriesData).map((subCategory) => ({
    id: subCategory.id,
    title: subCategory.title,
    categoryId: subCategory.categoryId,
    hsnCode: subCategory.hsnCode ?? subCategory.category?.hsnCode ?? null,
  }));

  return (
    <div>
      <FormHeader title="New Product" />
      <NewProductForm categories={categories} subCategories={subCategories} farmers={farmers} />
    </div>
  );
}
