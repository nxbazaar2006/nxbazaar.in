"use client";

import ImageInput from "@/components/FormInputs/ImageInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextInput from "@/components/FormInputs/TextInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import HsnCodeCombobox from "@/components/hsn/hsn-code-combobox";
import TipTapAIEditor from "@/components/editor/TipTapAIEditor";
import { makePostRequest, makePutRequest } from "@/lib/apiRequest";
import { generateSlug } from "@/lib/generateSlug";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { HsnCodeTaxRecord } from "@/types/hsn";

export type CategoryFormData = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  hsnCodeId?: string | null;
  hsnCode?: HsnCodeTaxRecord | null;
  isActive?: boolean;
};

const emptyCategoryData: CategoryFormData = {};

export default function NewCategoryForm({ updateData = emptyCategoryData }: { updateData?: CategoryFormData }) {
  const id = updateData?.id ?? "";
  const [imageUrl, setImageUrl] = useState(updateData?.imageUrl ?? "");
  const [description, setDescription] = useState(updateData?.description ?? "");
  const [hsnCodeId, setHsnCodeId] = useState(updateData?.hsnCodeId ?? "");
  const [loading, setLoading] = useState(false);
  const { register, reset, watch, handleSubmit, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: { isActive: true, ...updateData },
  });
  const router = useRouter();
  const redirect = () => router.push("/dashboard/categories");

  useEffect(() => {
    reset({ isActive: true, ...updateData });
    setImageUrl(updateData?.imageUrl ?? "");
    setDescription(updateData?.description ?? "");
    setHsnCodeId(updateData?.hsnCodeId ?? "");
  }, [reset, updateData]);

  async function onSubmit(data: CategoryFormData) {
    data.slug = generateSlug(data.title ?? "");
    data.description = description;
    data.imageUrl = imageUrl;
    data.hsnCodeId = hsnCodeId || null;
    if (id) {
      data.id = id;
      makePutRequest(setLoading, `api/categories/${id}`, data, "Category", redirect);
    } else {
      makePostRequest(setLoading, "api/categories", data, "Category", reset, redirect);
      setImageUrl("");
      setDescription("");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="liquid-card mx-auto my-3 w-full max-w-4xl rounded-[30px] p-4 sm:p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <TextInput label="Category Title" name="title" register={register} errors={errors} />
        <div>
          <label className="mb-2 block text-sm font-medium leading-6 text-white">HSN Code</label>
          <HsnCodeCombobox value={hsnCodeId} onChange={setHsnCodeId} />
        </div>
        <ImageInput imageUrl={imageUrl} setImageUrl={setImageUrl} endpoint="categoryImageUploader" label="Category Image" />
        <ToggleInput label="Publish your Category" name="isActive" trueTitle="Active" falseTitle="Draft" register={register} />
        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-medium leading-6 text-white">Category Description</label>
          <TipTapAIEditor value={description} onChange={setDescription} productTitle={watch("title")} />
        </div>
      </div>
      <SubmitButton isLoading={loading} buttonTitle={id ? "Update Category" : "Create Category"} loadingButtonTitle={`${id ? "Updating" : "Creating"} Category please wait...`} />
    </form>
  );
}
