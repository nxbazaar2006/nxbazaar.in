"use client";

import ImageInput from "@/components/FormInputs/ImageInput";
import SelectInput from "@/components/FormInputs/SelectInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextInput from "@/components/FormInputs/TextInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import FormHeader from "@/components/backoffice/FormHeader";
import TipTapAIEditor from "@/components/editor/TipTapAIEditor";
import { makePostRequest } from "@/lib/apiRequest";
import { generateSlug } from "@/lib/generateSlug";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

export default function NewMarketForm({ categories }: { categories: any[] }) {
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isActive: true,
    },
  });

  const router = useRouter();

  function redirect() {
    router.push("/dashboard/markets");
  }

  async function onSubmit(data: any) {
    const slug = generateSlug(data.title);
    data.slug = slug;
    data.logoUrl = imageUrl;
    data.description = description;

    makePostRequest(setLoading, "api/markets", data, "Market", reset, redirect);
    setImageUrl("");
    setDescription("");
  }

  return (
    <div>
      <FormHeader title="New Market" />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="liquid-card w-full max-w-4xl rounded-[30px] p-4 sm:p-6 md:p-8 mx-auto my-3"
      >
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <TextInput
            label="Market Title"
            name="title"
            register={register}
            errors={errors}
            className="w-full"
          />

          <SelectInput
            label="Select Categories"
            name="categoryIds"
            register={register}
            errors={errors}
            className="w-full"
            options={categories}
            multiple={true}
          />

          <ImageInput
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            endpoint="marketLogoUploader"
            label="Market Logo"
          />

          <div className="sm:col-span-2 space-y-2">
            <label className="block text-sm font-medium leading-6 text-white">
              Market Description
            </label>
            <TipTapAIEditor
              value={description}
              onChange={setDescription}
              productTitle={(watch as any)("title")}
            />
          </div>

          <ToggleInput
            label="Market Status"
            name="isActive"
            trueTitle="Active"
            falseTitle="Draft"
            register={register}
          />
        </div>

        <SubmitButton
          isLoading={loading}
          buttonTitle="Create Market"
          loadingButtonTitle="Creating Market please wait..."
        />
      </form>
    </div>
  );
}