import FormHeader from "@/components/backoffice/FormHeader";
import NewTrainingForm, {
  type TrainingCategoryOption,
} from "@/components/backoffice/NewTrainingForm";
import { getData } from "@/lib/getData";
import { asArray } from "@/lib/normalizeApiData";
import React from "react";

export default async function NewBlogPage() {
  const categoriesData = await getData<TrainingCategoryOption[]>("categories");
  const categories = asArray(categoriesData).map((category) => {
    return {
      id: category.id,
      title: category.title,
    };
  });

  return (
    <div>
      <FormHeader title="New Blog Post" />
      <NewTrainingForm categories={categories} />
    </div>
  );
}
