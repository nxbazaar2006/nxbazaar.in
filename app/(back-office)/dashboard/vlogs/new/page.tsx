import FormHeader from "@/components/backoffice/FormHeader";
import NewVlogForm, {
  type VlogCategoryOption,
} from "@/components/backoffice/NewVlogForm";
import { getData } from "@/lib/getData";
import { asArray } from "@/lib/normalizeApiData";
import React from "react";

export default async function NewVlogPage() {
  const categoriesData = await getData<VlogCategoryOption[]>("categories");
  const categories = asArray(categoriesData).map((category) => {
    return {
      id: category.id,
      title: category.title,
    };
  });

  return (
    <div>
      <FormHeader title="New Vlog" />
      <NewVlogForm categories={categories} />
    </div>
  );
}
