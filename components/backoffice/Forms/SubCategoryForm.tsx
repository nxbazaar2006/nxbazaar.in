"use client";

import ImageInput from "@/components/FormInputs/ImageInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextInput from "@/components/FormInputs/TextInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import HsnCodeCombobox from "@/components/hsn/hsn-code-combobox";
import TipTapAIEditor from "@/components/editor/TipTapAIEditor";
import { makePostRequest, makePutRequest } from "@/lib/apiRequest";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { HsnCodeTaxRecord } from "@/types/hsn";

export type SubCategoryCategoryOption = {
  id: string;
  title: string;
  hsnCode?: HsnCodeTaxRecord | null;
};

export type SubCategoryOption = {
  id: string;
  title: string;
  categoryId: string;
};

export type SubCategoryFormData = {
  id?: string;
  categoryId?: string;
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  hsnCodeId?: string | null;
  hsnCode?: HsnCodeTaxRecord | null;
  isActive?: boolean;
};

const emptySubCategoryData: SubCategoryFormData = {};
const emptyCategories: SubCategoryCategoryOption[] = [];
const emptySubCategories: SubCategoryOption[] = [];

function formatRate(value: unknown) {
  return value === null || value === undefined ? "-" : `${value}%`;
}

export default function SubCategoryForm({
  categories = emptyCategories,
  subCategories = emptySubCategories,
  updateData = emptySubCategoryData,
}: {
  categories?: SubCategoryCategoryOption[];
  subCategories?: SubCategoryOption[];
  updateData?: SubCategoryFormData;
}) {
  const initialImageUrl = updateData?.imageUrl ?? "";
  const id = updateData?.id ?? "";
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [description, setDescription] = useState(updateData?.description ?? "");
  const [loading, setLoading] = useState(false);

  const initialCategory = categories.find(
    (category) => category.id === updateData?.categoryId
  );
  const [categorySearch, setCategorySearch] = useState(
    initialCategory?.title ?? ""
  );
  const [isCategoryListOpen, setIsCategoryListOpen] = useState(false);
  const [selectedHsnCodeId, setSelectedHsnCodeId] = useState(
    updateData?.hsnCodeId ?? ""
  );
  const [useCategoryHsn, setUseCategoryHsn] = useState(!updateData?.hsnCodeId);
  const router = useRouter();

  const {
    register,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<SubCategoryFormData>({
    defaultValues: {
      isActive: true,
      ...updateData,
    },
  });

  const categoryId = watch("categoryId");
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const inheritedHsn = selectedCategory?.hsnCode ?? null;
  const selectedHsnInitialOption =
    updateData?.hsnCode?.id === selectedHsnCodeId
      ? updateData.hsnCode
      : inheritedHsn?.id === selectedHsnCodeId
      ? inheritedHsn
      : null;

  const categorySubCategories = useMemo(
    () =>
      categoryId
        ? subCategories.filter(
            (subCategory) => subCategory.categoryId === categoryId
          )
        : [],
    [categoryId, subCategories]
  );

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      category.title?.toLowerCase().includes(query)
    );
  }, [categories, categorySearch]);

  useEffect(() => {
    reset({
      isActive: true,
      ...updateData,
    });
    setImageUrl(updateData?.imageUrl ?? "");
    setDescription(updateData?.description ?? "");
    setSelectedHsnCodeId(updateData?.hsnCodeId ?? "");
    setUseCategoryHsn(!updateData?.hsnCodeId);
    const nextCategory = categories.find(
      (category) => category.id === updateData?.categoryId
    );
    setCategorySearch(nextCategory?.title ?? "");
  }, [categories, reset, updateData]);

  function redirect() {
    router.push("/dashboard/subcategories");
    router.refresh();
  }

  async function onSubmit(data: SubCategoryFormData) {
    const payload = {
      categoryId: data.categoryId,
      title: data.title,
      description: description,
      imageUrl,
      hsnCodeId: useCategoryHsn ? null : selectedHsnCodeId || null,
      isActive: data.isActive,
    };

    if (id) {
      makePutRequest(
        setLoading,
        `api/subcategories/${id}`,
        { ...payload, id },
        "Subcategory",
        redirect
      );
    } else {
      makePostRequest(
        setLoading,
        "api/subcategories",
        payload,
        "Subcategory",
        reset,
        redirect
      );
      setImageUrl("");
      setDescription("");
      setCategorySearch("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="liquid-card w-full max-w-4xl rounded-[30px] p-4 sm:p-6 md:p-8 mx-auto my-3"
    >
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="relative w-full">
          <label
            htmlFor="categorySearch"
            className="block text-sm font-medium leading-6 text-white mb-2"
          >
            Select Category
          </label>
          <input type="hidden" {...register("categoryId")} />
          <input
            id="categorySearch"
            type="search"
            value={categorySearch}
            onFocus={() => setIsCategoryListOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsCategoryListOpen(false), 100);
            }}
            onChange={(event) => {
              const value = event.target.value;
              setCategorySearch(value);
              setIsCategoryListOpen(true);
              if (selectedCategory?.title !== value) {
                setValue("categoryId", "", { shouldValidate: true });
                setSelectedHsnCodeId("");
              }
            }}
            placeholder="Search and select category"
            className="liquid-card block w-full rounded-2xl border-0 py-3 px-4 text-white placeholder:text-white/55 focus:ring-2 focus:ring-inset focus:ring-white/45 sm:text-sm sm:leading-6"
            autoComplete="off"
          />
          {isCategoryListOpen && (
            <div className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-white/20 bg-slate-950/95 p-1 text-sm text-white shadow-xl">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className="block w-full rounded-xl px-3 py-2 text-left hover:bg-white/10"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setValue("categoryId", category.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("title", "", {
                        shouldDirty: true,
                        shouldValidate: false,
                      });
                      setCategorySearch(category.title);
                      if (useCategoryHsn) setSelectedHsnCodeId("");
                      setIsCategoryListOpen(false);
                    }}
                  >
                    {category.title}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-white/70">No categories found.</div>
              )}
            </div>
          )}
          {errors.categoryId && (
            <p className="mt-2 text-xs text-red-300">
              {String(errors.categoryId.message)}
            </p>
          )}
        </div>

        <TextInput
          label="Subcategory Title"
          name="title"
          register={register}
          errors={errors}
          className="w-full"
          list="subcategory-title-options"
        />
        <datalist id="subcategory-title-options">
          {categorySubCategories.map((subCategory) => (
            <option key={subCategory.id} value={subCategory.title} />
          ))}
        </datalist>

        <div className="w-full sm:col-span-2">
          {categoryId ? (
            <div className="liquid-card rounded-2xl p-4 text-white">
              <label className="mb-2 block text-sm font-medium leading-6 text-white">
                HSN Code Override
              </label>
              <label className="mb-3 flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={useCategoryHsn}
                  onChange={(event) => {
                    setUseCategoryHsn(event.target.checked);
                    if (event.target.checked) setSelectedHsnCodeId("");
                  }}
                />
                Use Category HSN
              </label>
              <HsnCodeCombobox
                value={selectedHsnCodeId}
                onChange={(value) => setSelectedHsnCodeId(value ?? "")}
                initialOption={selectedHsnInitialOption}
                disabled={useCategoryHsn}
                placeholder={
                  useCategoryHsn
                    ? "Using category HSN"
                    : inheritedHsn
                    ? "Inherited from category or search HSN"
                    : "Search HSN code"
                }
              />
              {inheritedHsn ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-white/10 p-3">
                    <div className="text-xs text-white/65">Category HSN Code</div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {inheritedHsn.code || "-"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <div className="text-xs text-white/65">HSN Description</div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {inheritedHsn.description || "-"}
                    </div>
                  </div>
                  {[
                    ["GST Rate", formatRate(inheritedHsn.gstRate)],
                    ["CGST Rate", formatRate(inheritedHsn.cgstRate)],
                    ["SGST Rate", formatRate(inheritedHsn.sgstRate)],
                    ["IGST Rate", formatRate(inheritedHsn.igstRate)],
                    ["Cess Rate", formatRate(inheritedHsn.cessRate)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-white/10 p-3">
                      <div className="text-xs text-white/65">{label}</div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {value || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <ImageInput
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          endpoint="categoryImageUploader"
          label="Subcategory Image"
        />

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-medium leading-6 text-white">
            Subcategory Description
          </label>
          <TipTapAIEditor
            value={description}
            onChange={setDescription}
            productTitle={watch("title")}
          />
        </div>

        <ToggleInput
          label="Active Status"
          name="isActive"
          trueTitle="Active"
          falseTitle="Inactive"
          register={register}
        />
      </div>

      <SubmitButton
        isLoading={loading}
        buttonTitle={id ? "Update Subcategory" : "Create Subcategory"}
        loadingButtonTitle={`${
          id ? "Updating" : "Creating"
        } Subcategory please wait...`}
      />
    </form>
  );
}
