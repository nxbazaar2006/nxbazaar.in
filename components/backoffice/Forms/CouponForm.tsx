"use client";

import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextInput from "@/components/FormInputs/TextInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import { makePostRequest, makePutRequest } from "@/lib/apiRequest";
import { convertIsoDateToNormal } from "@/lib/convertIsoDatetoNormal";
import { generateCouponCode } from "@/lib/generateCouponCode";
import { generateIsoFormattedDate } from "@/lib/generateIsoFormattedDate";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

export type CouponFormData = {
  id?: string;
  title?: string;
  expiryDate?: string | Date;
  couponCode?: string;
  vendorId?: string;
  isActive?: boolean;
};

const emptyCouponData: CouponFormData = {};

export default function CouponForm({ updateData = emptyCouponData }: { updateData?: CouponFormData }) {
  const { data: session } = useSession();
  const vendorId = session?.user?.id;
  const id = updateData?.id ?? "";
  const [loading, setLoading] = useState(false);
  const { register, reset, handleSubmit, formState: { errors } } = useForm<CouponFormData>({
    defaultValues: { isActive: true, ...updateData, expiryDate: convertIsoDateToNormal(updateData.expiryDate) },
  });
  const router = useRouter();
  const redirect = () => router.push("/dashboard/coupons");

  async function onSubmit(data: CouponFormData) {
    data.vendorId = vendorId;
    data.couponCode = generateCouponCode(data.title ?? "", String(data.expiryDate ?? ""));
    data.expiryDate = generateIsoFormattedDate(String(data.expiryDate ?? ""));
    if (id) {
      makePutRequest(setLoading, `api/coupons/${id}`, data, "Coupon", redirect);
    } else {
      makePostRequest(setLoading, "api/coupons", data, "Coupon", reset, redirect);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="liquid-card mx-auto my-3 w-full max-w-4xl rounded-[30px] p-4 sm:p-6 md:p-8 shadow-2xl">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <TextInput label="Coupon Title" name="title" register={register} errors={errors} className="w-full" />
        <TextInput label="Coupon Expiry Date" name="expiryDate" type="date" register={register} errors={errors} className="w-full" />
        <ToggleInput label="Publish your Coupon" name="isActive" trueTitle="Active" falseTitle="Draft" register={register} />
      </div>
      <SubmitButton isLoading={loading} buttonTitle={id ? "Update Coupon" : "Create Coupon"} loadingButtonTitle={`${id ? "Updating" : "Creating"} Coupon please wait...`} />
    </form>
  );
}
