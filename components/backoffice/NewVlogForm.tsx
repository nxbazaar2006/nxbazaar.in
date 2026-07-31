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

export type VlogFormData = {
  id?: string;
  title?: string;
  slug?: string;
  videoUrl?: string;
  categoryId?: string;
  description?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
};

export type VlogCategoryOption = {
  id: string;
  title: string;
};

const emptyVlogData: VlogFormData = {};

export default function NewVlogForm({
  categories,
  updateData = emptyVlogData,
}: {
  categories: VlogCategoryOption[];
  updateData?: VlogFormData;
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
  } = useForm<VlogFormData>({
    defaultValues: { isActive: true, ...updateData },
  });

  const router = useRouter();
  const redirect = () => router.push("/dashboard/vlogs");

  async function onSubmit(data: VlogFormData) {
    data.slug = generateSlug(data.title ?? "");
    data.imageUrl = imageUrl;
    data.description = description;
    data.content = content || `<iframe width="560" height="315" src="${data.videoUrl}" frameborder="0" allowfullscreen></iframe>`;

    if (id) {
      data.id = id;
      makePutRequest(setLoading, `api/trainings/${id}`, data, "Vlog", redirect);
    } else {
      makePostRequest(setLoading, "api/trainings", data, "Vlog", reset, redirect);
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
          label="Vlog Title"
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

        <TextInput
          label="Video URL (YouTube / Embed Link)"
          name="videoUrl"
          register={register}
          errors={errors}
          className="w-full sm:col-span-2"
        />

        <ImageInput
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          endpoint="trainingImageUploader"
          label="Vlog Thumbnail Image"
        />

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-medium leading-6 text-white font-semibold">
            Vlog Description
          </label>
          <TipTapAIEditor
            value={description}
            onChange={setDescription}
            productTitle={watch("title")}
          />
        </div>

        <ToggleInput
          label="Publish Vlog"
          name="isActive"
          trueTitle="Active"
          falseTitle="Draft"
          register={register}
        />
      </div>

      <SubmitButton
        isLoading={loading}
        buttonTitle={id ? "Update Vlog" : "Create Vlog"}
        loadingButtonTitle={`${id ? "Updating" : "Creating"} Vlog please wait...`}
      />
    </form>
  );
}
