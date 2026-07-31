"use client";

import ImageInput from "@/components/FormInputs/ImageInput";
import SelectInput from "@/components/FormInputs/SelectInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextInput from "@/components/FormInputs/TextInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import TipTapAIEditor from "@/components/editor/TipTapAIEditor";
import { makePostRequest, makePutRequest } from "@/lib/apiRequest";
import { generateSlug } from "@/lib/generateSlug";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export type TrainingFormData = {
  id?: string;
  title?: string;
  slug?: string;
  categoryId?: string;
  description?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
};

export type TrainingCategoryOption = {
  id: string;
  title: string;
};

const emptyTrainingData: TrainingFormData = {};

export default function NewTrainingForm({
  categories,
  updateData = emptyTrainingData,
}: {
  categories: TrainingCategoryOption[];
  updateData?: TrainingFormData;
}) {
  const id = updateData?.id ?? "";
  const [imageUrl, setImageUrl] = useState(updateData?.imageUrl ?? "");
  const [description, setDescription] = useState(updateData?.description ?? "");
  const [content, setContent] = useState(updateData?.content ?? "");
  const [loading, setLoading] = useState(false);

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<TrainingFormData>({
    defaultValues: { isActive: true, ...updateData },
  });

  const router = useRouter();
  const redirect = () => router.push("/dashboard/community");

  async function onSubmit(data: TrainingFormData) {
    data.slug = generateSlug(data.title ?? "");
    data.imageUrl = imageUrl;
    data.description = description;
    data.content = content;

    if (id) {
      data.id = id;
      makePutRequest(setLoading, `api/trainings/${id}`, data, "Training", redirect);
    } else {
      makePostRequest(setLoading, "api/trainings", data, "Training", reset, redirect);
      setImageUrl("");
      setDescription("");
      setContent("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="liquid-card mx-auto my-3 w-full max-w-4xl rounded-[30px] p-4 sm:p-6 md:p-8 shadow-2xl"
    >
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <TextInput
          label="Training Title"
          name="title"
          register={register}
          errors={errors}
          className="w-full"
        />

        <SelectInput
          label="Select Category"
          name="categoryId"
          register={register}
          errors={errors}
          className="w-full"
          options={categories}
        />

        <ImageInput
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          endpoint="trainingImageUploader"
          label="Training Image"
        />

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-medium leading-6 text-white font-semibold">
            Training Short Description
          </label>
          <TipTapAIEditor
            value={description}
            onChange={setDescription}
            productTitle={watch("title")}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-medium leading-6 text-white font-semibold">
            Training Content
          </label>
          <TipTapAIEditor
            value={content}
            onChange={setContent}
            productTitle={watch("title")}
          />
        </div>

        <ToggleInput
          label="Publish your Training"
          name="isActive"
          trueTitle="Active"
          falseTitle="Draft"
          register={register}
        />
      </div>

      <SubmitButton
        isLoading={loading}
        buttonTitle={id ? "Update Training" : "Create Training"}
        loadingButtonTitle={`${id ? "Updating" : "Creating"} Training please wait...`}
      />
    </form>
  );
}
