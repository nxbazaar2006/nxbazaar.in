"use client";

import ImageInput from "@/components/FormInputs/ImageInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextInput from "@/components/FormInputs/TextInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import { makePostRequest, makePutRequest } from "@/lib/apiRequest";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

export type BannerFormData = {
  id?: string;
  title?: string;
  link?: string;
  imageUrl?: string;
  isActive?: boolean;
};

const emptyBannerData: BannerFormData = {};

export default function BannerForm({ updateData = emptyBannerData }: { updateData?: BannerFormData }) {
  const id = updateData?.id ?? "";
  const [imageUrl, setImageUrl] = useState(updateData?.imageUrl ?? "");
  const [loading, setLoading] = useState(false);
  const { register, reset, handleSubmit, formState: { errors } } = useForm<BannerFormData>({
    defaultValues: { isActive: true, ...updateData },
  });
  const router = useRouter();
  const redirect = () => router.push("/dashboard/banners");

  async function onSubmit(data: BannerFormData) {
    data.imageUrl = imageUrl;
    if (id) {
      makePutRequest(setLoading, `api/banners/${id}`, data, "Banner", redirect);
    } else {
      makePostRequest(setLoading, "api/banners", data, "Banner", reset, redirect);
      setImageUrl("");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="liquid-card mx-auto my-3 w-full max-w-4xl rounded-[30px] p-4 sm:p-6 md:p-8 shadow-2xl">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <TextInput label="Banner Title" name="title" register={register} errors={errors} />
        <TextInput label="Banner Link" name="link" type="url" register={register} errors={errors} />
        <ImageInput imageUrl={imageUrl} setImageUrl={setImageUrl} endpoint="bannerImageUploader" label="Banner Image" />
        <ToggleInput label="Publish your Banner" name="isActive" trueTitle="Active" falseTitle="Draft" register={register} />
      </div>
      <SubmitButton isLoading={loading} buttonTitle={id ? "Update Banner" : "Create Banner"} loadingButtonTitle={`${id ? "Updating" : "Creating"} Banner please wait...`} />
    </form>
  );
}
