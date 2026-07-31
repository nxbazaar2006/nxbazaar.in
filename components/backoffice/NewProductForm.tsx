"use client";

import ProductDescriptionEditor from "@/components/editor/product-description-editor";
import type { MultiLanguageData } from "@/hooks/use-product-editor";
import Link from "next/link";
import ArrayItemsInput from "@/components/FormInputs/ArrayItemsInput";
import AiGenerateButton, { type GeneratedProductDraft } from "@/components/ai/AiGenerateButton";
import SelectInput from "@/components/FormInputs/SelectInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import TextInput from "@/components/FormInputs/TextInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LiquidGlassSwitch } from "@/components/ui/liquid-glass-switch";
import { makePostRequest, makePutRequest } from "@/lib/apiRequest";
import { getEffectiveTaxDetails, getSubCategoriesByCategory } from "@/lib/actions/products";
import { cartesianProduct, normalizeAttributePayload, variantCombinationKey } from "@/lib/product-variants";
import { generateSlug } from "@/lib/generateSlug";
import { AlertTriangle, History, Image, Layers, Package, Plus, Search, Sparkles, Tag, Wand2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import MultipleImageInput from "../FormInputs/MultipleImageInput";
import ProductBarcodeActions from "../ProductBarcodeActions";
import toast from "react-hot-toast";
import { CategoryAttributeSelector } from "@/components/attributes/category-attribute-selector";
import type { HsnCodeTaxRecord } from "@/types/hsn";

type ProductAttributeValueForm = {
  id?: string;
  value: string;
  colorCode?: string;
  imageUrl?: string;
  position?: number;
};

type ProductAttributeForm = {
  id?: string;
  name: string;
  slug?: string;
  isVariant: boolean;
  position?: number;
  values: ProductAttributeValueForm[];
};

type ProductVariantValueForm = {
  attribute?: string | { name?: string; slug?: string };
  attributeSlug?: string;
  value?: string;
  valueSlug?: string;
  attributeValue?: { value?: string; slug?: string };
};

type ProductVariantForm = {
  id?: string;
  title?: string;
  sku?: string;
  productCode?: string;
  barcode?: string;
  price?: string | number;
  salePrice?: string | number;
  comparePrice?: string | number;
  costPrice?: string | number;
  stock?: string | number;
  lowStockAt?: string | number;
  weight?: string | number;
  imageUrl?: string;
  isDefault?: boolean;
  isActive?: boolean;
  values?: ProductVariantValueForm[];
};

export type ProductFormData = {
  id?: string;
  title?: string;
  slug?: string;
  productType?: string;
  categoryId?: string;
  subCategoryId?: string;
  farmerId?: string;
  userId?: string;
  hsnCodeId?: string;
  gstRate?: number;
  cessRate?: number;
  taxType?: string;
  hsnOverrideEnabled?: boolean;
  imageUrl?: string;
  productImages?: string[];
  tags?: string[];
  qty?: number;
  sku?: string;
  productCode?: string;
  barcode?: string;
  productPrice?: number;
  salePrice?: number;
  wholesalePrice?: number;
  wholesaleQty?: number;
  productStock?: number;
  unit?: string;
  seoTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  isWholesale?: boolean;
  taxMappingStatus?: "MAPPED" | "PENDING_REVIEW";
  attributes?: ProductAttributeForm[];
  variants?: ProductVariantForm[];
  hsnCodeRelation?: HsnCodeTaxRecord | null;
  hsnCode?: (HsnCodeTaxRecord & { taxTreatment?: string; productType?: string }) | string;
  [key: string]: unknown;
};

export type ProductCategoryOption = { id: string; title: string };
export type ProductSubCategoryOption = {
  id: string;
  title: string;
  categoryId: string;
  hsnCode?: HsnCodeTaxRecord | null;
  category?: { hsnCode?: HsnCodeTaxRecord | null };
};
export type ProductFarmerOption = { id: string; title?: string; name?: string; role?: string };

type SelectedProductHsn = {
  id: string;
  hsnCodeId: string;
  hsnCode: string;
  code: string;
  title?: string | null;
  description?: string | null;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cessRate?: number;
  taxType?: string;
  taxTreatment?: string;
  productType?: string;
};

const emptyProductData: ProductFormData = {};
const emptySubCategories: ProductSubCategoryOption[] = [];
const tabs = ["General", "Pricing", "Inventory", "Variants & Attributes", "Images", "SEO"];

export const unitOfMeasurementOptions = [
  { id: "Kilograms (kg)", title: "Kilograms (kg)" },
  { id: "Grams (g)", title: "Grams (g)" },
  { id: "Liters (l)", title: "Liters (l)" },
  { id: "Milliliters (ml)", title: "Milliliters (ml)" },
  { id: "Pieces (pcs)", title: "Pieces (pcs)" },
  { id: "Pack (pk)", title: "Pack (pk)" },
  { id: "Box (box)", title: "Box (box)" },
  { id: "Dozen (dz)", title: "Dozen (dz)" },
  { id: "Meters (m)", title: "Meters (m)" },
  { id: "Centimeters (cm)", title: "Centimeters (cm)" },
  { id: "Pairs (pr)", title: "Pairs (pr)" },
  { id: "Sets (set)", title: "Sets (set)" },
  { id: "Bundles (bdl)", title: "Bundles (bdl)" },
  { id: "Rolls (roll)", title: "Rolls (roll)" },
  { id: "Cans (can)", title: "Cans (can)" },
  { id: "Bottles (btl)", title: "Bottles (btl)" },
];

const taxMappingWarningTitle = "HSN / GST Details";
const taxMappingWarningMessage = "No HSN or GST mapping is configured for the selected subcategory or its parent category.";
const taxMappingWarningDetail = "This product can be saved as a Draft, but it cannot be Published or used for Invoicing until a valid HSN/GST mapping is assigned.";
const taxMappingWarningAction = "Assign an HSN Code and GST Rate to the Category or Subcategory. The product will automatically use the mapping after it is updated.";
const aiTaxReviewWarning = "HSN/GST mapping needs manual review before publishing or invoicing.";

function mapProductHsn(hsn?: HsnCodeTaxRecord | null): SelectedProductHsn | null {
  if (!hsn) return null;
  if (hsn.status && hsn.status !== "ACTIVE") return null;
  if (hsn.effectiveTo && new Date(hsn.effectiveTo) < new Date()) return null;
  return {
    id: hsn.id,
    hsnCodeId: hsn.id,
    hsnCode: hsn.code,
    code: hsn.code,
    title: hsn.description,
    description: hsn.description,
    gstRate: Number(hsn.gstRate),
    cgstRate: Number(hsn.cgstRate),
    sgstRate: Number(hsn.sgstRate),
    igstRate: Number(hsn.igstRate),
    cessRate: Number(hsn.cessRate ?? 0),
    taxType: hsn.taxType,
    taxTreatment: hsn.taxType,
    productType: "GOODS",
  };
}

function mapSavedAttributes(updateData: ProductFormData): ProductAttributeForm[] {
  return (updateData?.attributes || []).map((attribute, index) => ({
    id: attribute.id,
    name: attribute.name,
    isVariant: attribute.isVariant !== false,
    position: attribute.position ?? index,
    values: (attribute.values || []).map((value, valueIndex) => ({
      id: value.id,
      value: value.value,
      colorCode: value.colorCode || "",
      imageUrl: value.imageUrl || "",
      position: value.position ?? valueIndex,
    })),
  }));
}

function mapSavedVariants(updateData: ProductFormData): ProductVariantForm[] {
  return ((updateData?.variants || []) as unknown as Record<string, unknown>[]).map((variant) => {
    const rawValues = (variant.values || []) as Record<string, unknown>[];
    return {
      id: String(variant.id || ""),
      title:
        String(variant.title || "") ||
        rawValues
          .map((entry) => {
            const attrVal = entry.attributeValue as { value?: string } | undefined;
            return attrVal?.value || (entry.value as string);
          })
          .filter(Boolean)
          .join(" / "),
      sku: String(variant.sku || ""),
      productCode: String(variant.productCode || ""),
      barcode: String(variant.barcode || ""),
      price: (variant.price as number) ?? updateData.salePrice ?? 0,
      salePrice: (variant.salePrice as number) ?? (variant.price as number) ?? updateData.salePrice ?? 0,
      comparePrice: (variant.comparePrice as number) ?? updateData.productPrice ?? "",
      costPrice: (variant.costPrice as number) ?? "",
      stock: (variant.stock as number) ?? 0,
      lowStockAt: (variant.lowStockAt as number) ?? 5,
      weight: (variant.weight as number) ?? "",
      imageUrl: String(variant.imageUrl || ""),
      isDefault: Boolean(variant.isDefault),
      isActive: variant.isActive !== false,
      values: rawValues.map((entry) => {
        const attrObj = entry.attribute as { name?: string; slug?: string } | string | undefined;
        const attrValObj = entry.attributeValue as { value?: string; slug?: string } | undefined;
        return {
          attribute: typeof attrObj === "object" ? attrObj?.name : String(attrObj || entry.attribute || ""),
          attributeSlug: typeof attrObj === "object" ? attrObj?.slug : String(entry.attributeSlug || ""),
          value: attrValObj?.value || String(entry.value || ""),
          valueSlug: attrValObj?.slug || String(entry.valueSlug || ""),
        };
      }),
    };
  });
}

function ProductVariantRows({
  variants,
  updateVariant,
  removeVariant,
}: {
  variants: ProductVariantForm[];
  updateVariant: (index: number, patch: Partial<ProductVariantForm>) => void;
  removeVariant: (index: number) => void;
}) {
  return (
    <>
      {variants.map((variant, index) => (
        <tr key={`${variant.id || "new"}-${index}`} className="border-t">
          <td className="px-3 py-2">{variant.title}</td>
          <td className="px-3 py-2 text-xs text-slate-600">
            <div>SKU: {variant.sku || "Generated on save"}</div>
            <div>Code: {variant.productCode || "Generated on save"}</div>
            <div>Barcode: {variant.barcode || "Generated on save"}</div>
            {variant.barcode ? (
              <div className="mt-2">
                <ProductBarcodeActions
                  barcode={variant.barcode}
                  title={variant.title || "Variant"}
                  productCode={variant.productCode}
                  sku={variant.sku}
                />
              </div>
            ) : null}
          </td>
          {(["price", "comparePrice", "costPrice", "stock", "lowStockAt", "weight", "imageUrl"] as const).map((field) => (
            <td key={field} className="px-3 py-2">
              <input
                value={(variant[field] as string | number) ?? ""}
                type={["price", "comparePrice", "costPrice", "stock", "lowStockAt", "weight"].includes(field) ? "number" : "text"}
                onChange={(event) => updateVariant(index, { [field]: event.target.value })}
                className="w-28 rounded-md border px-2 py-1 text-slate-900"
              />
            </td>
          ))}
          <td className="px-3 py-2">
            <LiquidGlassSwitch
              activeLabel="Default"
              inactiveLabel="No"
              variant="blue"
              checked={variant.isDefault}
              onCheckedChange={(checked) =>
                updateVariant(index, { isDefault: checked, isActive: checked ? true : variant.isActive })
              }
            />
          </td>
          <td className="px-3 py-2">
            <LiquidGlassSwitch
              activeLabel="Active"
              inactiveLabel="Off"
              variant="success"
              checked={variant.isActive !== false}
              onCheckedChange={(checked) =>
                updateVariant(index, { isActive: checked, isDefault: checked ? variant.isDefault : false })
              }
            />
          </td>
          <td className="px-3 py-2">
            <button type="button" onClick={() => removeVariant(index)} className="text-red-600">
              Remove
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}

const tabConfig: Record<string, { icon: React.ReactNode }> = {
  General: {
    icon: <Sparkles className="h-3.5 w-3.5 text-lime-400" />,
  },
  Pricing: {
    icon: <Tag className="h-3.5 w-3.5 text-blue-400" />,
  },
  Inventory: {
    icon: <Package className="h-3.5 w-3.5 text-emerald-400" />,
  },
  "Variants & Attributes": {
    icon: <Layers className="h-3.5 w-3.5 text-purple-400" />,
  },
  Images: {
    icon: <Image className="h-3.5 w-3.5 text-amber-400" />,
  },
  SEO: {
    icon: <Search className="h-3.5 w-3.5 text-cyan-400" />,
  },
};

export default function NewProductForm({
  categories,
  subCategories = emptySubCategories,
  farmers,
  updateData = emptyProductData,
}: {
  categories: ProductCategoryOption[];
  subCategories?: ProductSubCategoryOption[];
  farmers: ProductFarmerOption[];
  updateData?: ProductFormData;
}) {
  const initialImageUrl = updateData?.imageUrl ?? "";
  const initialTags = updateData?.tags ?? [];
  const id = updateData?.id ?? "";

  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("General");
  const [multiLangTranslations, setMultiLangTranslations] = useState<MultiLanguageData | null>(null);
  const [productImages, setProductImages] = useState<string[]>(updateData?.productImages ?? []);
  const [attributes, setAttributes] = useState<ProductAttributeForm[]>(mapSavedAttributes(updateData));
  const [variants, setVariants] = useState<ProductVariantForm[]>(mapSavedVariants(updateData));
  const [generationSummary, setGenerationSummary] = useState<string | null>(null);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [subCategoryOptions, setSubCategoryOptions] = useState<ProductSubCategoryOption[]>(() =>
    updateData?.categoryId ? subCategories.filter((subCategory) => subCategory.categoryId === updateData.categoryId) : []
  );
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);
  const [hsnLoading, setHsnLoading] = useState(false);
  const [hsnOptions, setHsnOptions] = useState<SelectedProductHsn[]>(() => {
    const selectedSubCategory = subCategories.find((subCategory) => subCategory.id === updateData?.subCategoryId);
    const mappedHsn = mapProductHsn(selectedSubCategory?.hsnCode ?? (typeof updateData?.hsnCode === "object" ? updateData.hsnCode : null));
    return mappedHsn ? [mappedHsn] : [];
  });
  const [selectedHsn, setSelectedHsn] = useState<SelectedProductHsn | null>(() =>
    mapProductHsn(typeof updateData?.hsnCode === "object" ? updateData.hsnCode : null)
  );
  const [hsnError, setHsnError] = useState("");
  const subCategoryRequestRef = useRef(0);
  const hsnRequestRef = useRef(0);

  const {
    register,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      isActive: true,
      isWholesale: false,
      productType: "SIMPLE",
      ...updateData,
      farmerId: updateData?.userId ?? updateData?.farmerId,
    },
  });

  const isActive = watch("isActive");
  const isWholesale = watch("isWholesale");
  const productType = watch("productType") || "SIMPLE";
  const selectedCategoryId = watch("categoryId");
  const selectedSubCategoryId = watch("subCategoryId");
  const router = useRouter();

  const taxMappingPending = Boolean(selectedSubCategoryId && !hsnLoading && !selectedHsn);

  useEffect(() => {
    if (taxMappingPending) {
      setValue("isActive", false, { shouldDirty: true, shouldValidate: false });
      setValue("taxMappingStatus", "PENDING_REVIEW", { shouldDirty: true, shouldValidate: false });
    } else if (selectedHsn) {
      setValue("taxMappingStatus", "MAPPED", { shouldDirty: true, shouldValidate: false });
    }
  }, [selectedHsn, setValue, taxMappingPending]);

  async function loadSubCategories(categoryId: string, keepSubCategoryId = "") {
    const requestId = subCategoryRequestRef.current + 1;
    subCategoryRequestRef.current = requestId;
    setSubCategoryLoading(true);
    try {
      const result = await getSubCategoriesByCategory(categoryId);
      if (requestId !== subCategoryRequestRef.current) return;
      if (!result.success || !result.data) {
        toast.error(result.message);
        setSubCategoryOptions([]);
        return;
      }
      setSubCategoryOptions(result.data);
      if (keepSubCategoryId && result.data.some((item) => item.id === keepSubCategoryId)) {
        setValue("subCategoryId", keepSubCategoryId, { shouldValidate: true });
        await loadHsnCodes(keepSubCategoryId, updateData?.hsnCodeId || "", categoryId);
      }
    } finally {
      if (requestId === subCategoryRequestRef.current) setSubCategoryLoading(false);
    }
  }

  async function loadHsnCodes(subCategoryId: string, keepHsnCodeId = "", categoryId = selectedCategoryId) {
    const requestId = hsnRequestRef.current + 1;
    hsnRequestRef.current = requestId;
    setHsnLoading(true);
    setHsnError("");
    try {
      if (!categoryId) {
        setHsnOptions([]);
        resetTaxFields();
        return;
      }
      const result = await getEffectiveTaxDetails(categoryId, subCategoryId);
      if (requestId !== hsnRequestRef.current) return;
      if (!result.success || !result.data) {
        setHsnOptions([]);
        resetTaxFields();
        setHsnError(taxMappingWarningMessage);
        return;
      }
      setHsnOptions([result.data]);
      applySelectedHsn(result.data);
    } finally {
      if (requestId === hsnRequestRef.current) setHsnLoading(false);
    }
  }

  function resetTaxFields() {
    setValue("hsnCodeId", "", { shouldValidate: true });
    setValue("hsnCode", "", { shouldValidate: false });
    setValue("gstRate", 0, { shouldValidate: false });
    setValue("cessRate", 0, { shouldValidate: false });
    setValue("taxType", "", { shouldValidate: false });
    setSelectedHsn(null);
  }

  function applySelectedHsn(hsn: SelectedProductHsn | null) {
    setSelectedHsn(hsn);
    setValue("hsnCodeId", hsn?.hsnCodeId ?? "", { shouldValidate: true });
    setValue("hsnCode", hsn?.hsnCode ?? "", { shouldValidate: false });
    setValue("gstRate", hsn?.gstRate ?? 0, { shouldValidate: false });
    setValue("cessRate", hsn?.cessRate ?? 0, { shouldValidate: false });
    setValue("taxType", hsn?.taxType ?? "", { shouldValidate: false });
  }

  useEffect(() => {
    if (!updateData?.categoryId) return;
    loadSubCategories(updateData.categoryId, updateData.subCategoryId || "");
  }, []);

  function handleCategoryChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const categoryId = event.target.value;
    setValue("categoryId", categoryId, { shouldDirty: true, shouldValidate: true });
    setValue("subCategoryId", "", { shouldDirty: true, shouldValidate: true });
    resetTaxFields();
    setHsnError("");
    setSubCategoryOptions([]);
    setHsnOptions([]);
    if (categoryId) {
      loadSubCategories(categoryId);
    }
  }

  function handleSubCategoryChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const subCategoryId = event.target.value;
    setValue("subCategoryId", subCategoryId, { shouldDirty: true, shouldValidate: true });
    resetTaxFields();
    setHsnError("");
    setHsnOptions([]);
    if (subCategoryId) {
      loadHsnCodes(subCategoryId, "", selectedCategoryId);
    }
  }

  function redirect() {
    router.push("/dashboard/products");
  }

  function updateVariant(index: number, patch: Partial<ProductVariantForm>) {
    setVariants((current) =>
      current.map((variant, variantIndex) => {
        if (variantIndex !== index) return patch.isDefault ? { ...variant, isDefault: false } : variant;
        return { ...variant, ...patch };
      })
    );
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index));
  }

  function applyBulkPrice() {
    if (bulkPrice === "") return;
    setVariants((current) => current.map((variant) => ({ ...variant, price: bulkPrice })));
  }

  function applyBulkStock() {
    if (bulkStock === "") return;
    setVariants((current) => current.map((variant) => ({ ...variant, stock: bulkStock })));
  }

  async function handleAiGenerateGeneral() {
    const productName = watch("title");
    if (!productName || productName.trim().length < 2) {
      toast.error("Please enter a Product Title first.");
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/product-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName }),
      });
      const result = await response.json().catch(() => null);
      if (result?.draft) {
        if (result.draft.title) setValue("title", result.draft.title, { shouldDirty: true, shouldValidate: true });
        if (result.draft.detailedDescription || result.draft.shortDescription) {
          const desc = result.draft.detailedDescription || result.draft.shortDescription || "";
          setValue("description", `<p>${desc}</p>`, { shouldDirty: true });
        }
        if (Array.isArray(result.draft.keywords)) setTags(result.draft.keywords);
        toast.success("AI General Information generated!");
      } else {
        toast.error(result?.message || "AI generation failed.");
      }
    } catch {
      toast.error("Failed to generate with AI.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleAiGeneratePricing() {
    const titleStr = (watch("title") || "").toLowerCase();
    let basePrice = 499;
    if (titleStr.includes("phone") || titleStr.includes("laptop") || titleStr.includes("tv")) basePrice = 14999;
    else if (titleStr.includes("shirt") || titleStr.includes("pant") || titleStr.includes("dress")) basePrice = 999;
    else if (titleStr.includes("oil") || titleStr.includes("ghee") || titleStr.includes("rice")) basePrice = 350;

    const salePrice = Math.round(basePrice * 0.8);
    const wholesalePrice = Math.round(basePrice * 0.65);

    setValue("productPrice", basePrice, { shouldDirty: true, shouldValidate: true });
    setValue("salePrice", salePrice, { shouldDirty: true, shouldValidate: true });
    if (isWholesale) {
      setValue("wholesalePrice", wholesalePrice, { shouldDirty: true });
      setValue("wholesaleQty", 10, { shouldDirty: true });
    }
    toast.success(`AI Suggested Pricing: MRP ₹${basePrice}, Sale Price ₹${salePrice}`);
  }

  function handleAiGenerateInventory() {
    const titleStr = (watch("title") || "").toLowerCase();
    let unit = "Pieces (pcs)";
    if (titleStr.includes("oil") || titleStr.includes("milk") || titleStr.includes("water") || titleStr.includes("juice")) {
      unit = "Liters (l)";
    } else if (titleStr.includes("rice") || titleStr.includes("flour") || titleStr.includes("apple") || titleStr.includes("sugar") || titleStr.includes("dal")) {
      unit = "Kilograms (kg)";
    } else if (titleStr.includes("pack") || titleStr.includes("set")) {
      unit = "Pack (pk)";
    }

    setValue("productStock", 50, { shouldDirty: true, shouldValidate: true });
    setValue("unit", unit, { shouldDirty: true });
    toast.success(`AI Suggested Inventory: Stock 50, Unit '${unit}'`);
  }

  function handleAiGenerateVariants() {
    const titleStr = (watch("title") || "").toLowerCase();
    let newAttrs: ProductAttributeForm[] = [];

    if (titleStr.includes("shirt") || titleStr.includes("t-shirt") || titleStr.includes("jacket") || titleStr.includes("pant") || titleStr.includes("shoes")) {
      newAttrs = [
        { name: "Size", isVariant: true, position: 0, values: [{ value: "S" }, { value: "M" }, { value: "L" }, { value: "XL" }] },
        { name: "Color", isVariant: true, position: 1, values: [{ value: "Black", colorCode: "#000000" }, { value: "Blue", colorCode: "#0000ff" }, { value: "White", colorCode: "#ffffff" }] },
      ];
    } else if (titleStr.includes("oil") || titleStr.includes("rice") || titleStr.includes("tea") || titleStr.includes("sugar") || titleStr.includes("powder")) {
      newAttrs = [
        { name: "Pack Weight", isVariant: true, position: 0, values: [{ value: "250g" }, { value: "500g" }, { value: "1kg" }, { value: "5kg" }] },
      ];
    } else {
      newAttrs = [
        { name: "Standard", isVariant: true, position: 0, values: [{ value: "Single Pack" }, { value: "Combo Pack (Set of 2)" }] },
      ];
    }

    setAttributes(newAttrs);
    toast.success(`AI Attributes & Variants suggested for '${watch("title") || "Product"}'!`);
  }

  function handleAiGenerateImages() {
    const title = watch("title") || "Product";
    toast.success(`AI Image Guidelines: Upload clean 1000x1000 white background photos for ${title}.`);
  }

  function handleAiGenerateSEO() {
    const title = watch("title") || "Product";
    const categoryName = categories.find((c) => c.id === selectedCategoryId)?.title || "Marketplace";
    const generatedSeoTitle = `Buy ${title} Online at Best Price | ${categoryName} on Nxbazaar.in`;
    const generatedMetaDesc = `Shop authentic ${title} on Nxbazaar.in. Premium quality, best market prices, GST ready invoice, and fast delivery guaranteed.`;
    const generatedTags = [
      title.toLowerCase().replace(/[^a-z0-9]/g, " "),
      categoryName.toLowerCase(),
      "nxbazaar",
      "buy online",
      "best price",
      "gst invoice",
    ].filter(Boolean);

    setValue("seoTitle", generatedSeoTitle, { shouldDirty: true });
    setValue("metaDescription", generatedMetaDesc, { shouldDirty: true });
    setTags((prev) => Array.from(new Set([...prev, ...generatedTags])));
    toast.success("AI SEO Metadata & Search Keywords generated!");
  }

  async function applyAIDraft(payload: { fields: string[]; values: { title: string; description: string; tags: string[]; aiMetadata: Record<string, unknown> } }) {
    const { fields, values } = payload;
    if (!fields.length) {
      toast.error("Select at least one AI draft field.");
      return;
    }
    if (id) {
      try {
        const response = await fetch(`/api/products/${id}/ai-draft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          toast.error(result?.message || "AI draft apply nahi ho paya.");
          return;
        }
        toast.success(result?.message || "AI draft applied.");
      } catch {
        toast.error("AI draft apply nahi ho paya.");
        return;
      }
    }
    if (fields.includes("title")) setValue("title", values.title, { shouldDirty: true, shouldValidate: true });
    if (fields.includes("description")) setValue("description", values.description, { shouldDirty: true, shouldValidate: true });
    if (fields.includes("tags")) setTags(values.tags ?? []);
    if (fields.includes("aiMetadata")) {
      setValue("aiGenerated", true, { shouldDirty: true });
      setValue("aiConfidence", typeof values.aiMetadata?.aiConfidence === "number" ? values.aiMetadata.aiConfidence : null, { shouldDirty: true });
      setValue("aiMetadata", values.aiMetadata ?? null, { shouldDirty: true });
    }
    toast.success("AI draft selected fields applied.");
  }

  async function onSubmit(data: ProductFormData) {
    const slug = id ? updateData.slug || generateSlug(data.title || "") : generateSlug(data.title || "");
    data.slug = slug;
    data.productImages = productImages;
    data.tags = tags;
    data.qty = 1;
    if (multiLangTranslations) {
      data.translations = multiLangTranslations;
      if (multiLangTranslations.en?.descriptionHtml) {
        data.description = multiLangTranslations.en.descriptionHtml;
      }
    }
    delete data.sku;
    delete data.productCode;
    delete data.barcode;
    if (!data.categoryId) {
      toast.error("Category is required.");
      return;
    }
    if (!data.subCategoryId) {
      toast.error("SubCategory is required.");
      return;
    }
    data.hsnOverrideEnabled = false;
    data.hsnCodeId = selectedHsn?.hsnCodeId ?? "";
    data.taxMappingStatus = selectedHsn ? "MAPPED" : "PENDING_REVIEW";
    if (!selectedHsn) data.isActive = false;
    data.attributes = productType === "VARIABLE" ? attributes : [];
    data.variants = productType === "VARIABLE" ? variants.map(({ sku, productCode, barcode, ...variant }) => variant) : [];
    data.productType = productType;
    if (id) {
      data.id = id;
      makePutRequest(setLoading, `api/products/${id}`, data, "Product", redirect);
    } else {
      makePostRequest(setLoading, "api/products", data, "Product", reset, redirect);
      setProductImages([]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="liquid-card w-full max-w-6xl rounded-[30px] p-4 sm:p-6 md:p-8 mx-auto my-3">
      <div className="mb-6 flex flex-wrap items-center gap-2.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const config = tabConfig[tab];
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`liquid-glass-control relative flex items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-xs font-semibold transition-all duration-300 active:scale-95 ${
                isActive
                  ? "liquid-glass-primary border border-cyan-300/50 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_18px_rgba(6,182,212,0.35)] backdrop-blur-xl scale-[1.02]"
                  : "liquid-glass-neutral border border-white/15 text-white/70 hover:border-white/30 hover:text-white"
              }`}
            >
              <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />
              <span
                className={`liquid-glass-content grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all ${
                  isActive
                    ? "border-cyan-300/60 bg-cyan-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_0_10px_rgba(6,182,212,0.4)] text-cyan-200"
                    : "border-white/20 bg-white/10 text-white/70 group-hover:border-white/35 group-hover:bg-white/20 group-hover:text-white"
                }`}
              >
                {config.icon}
              </span>
              <span className="liquid-glass-content text-xs font-semibold tracking-wide text-inherit">{tab}</span>
            </button>
          );
        })}
        {id ? (
          <Link
            href={`/dashboard/products/${id}/history`}
            className="liquid-glass-control liquid-glass-neutral ml-auto flex items-center gap-1.5 rounded-full border border-white/15 py-1.5 px-3 text-xs font-semibold text-white/80 transition-all hover:bg-white/20 hover:text-white shrink-0"
          >
            <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />
            <History className="liquid-glass-content h-3.5 w-3.5 text-white/70" />
            <span className="liquid-glass-content">History</span>
          </Link>
        ) : null}
      </div>

      <div className="mb-6">
        <AiGenerateButton
          productName={watch("title")}
          hasExistingContent={Boolean(watch("title") || watch("description") || tags.length || updateData?.aiMetadata)}
          existingValues={{
            title: watch("title") || "",
            description: String(watch("description") || ""),
            tags,
            aiMetadata: watch("aiMetadata") ?? updateData?.aiMetadata,
          }}
          onApply={applyAIDraft}
        />
      </div>

      {/* 1. General Section */}
      {activeTab === "General" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <TextInput label="Product Title" name="title" register={register} errors={errors} />
            <input type="hidden" {...register("hsnCodeId")} />
            <input type="hidden" {...register("hsnCode")} />
            <input type="hidden" {...register("gstRate")} />
            <input type="hidden" {...register("cessRate")} />
            <input type="hidden" {...register("taxType")} />
            <input type="hidden" {...register("categoryId", { required: "Category is required" })} />
            <input type="hidden" {...register("subCategoryId", { required: "SubCategory is required" })} />

            <div className="w-full">
              <label className="block text-sm font-medium leading-6 text-white mb-2">Category</label>
              <select
                value={selectedCategoryId || ""}
                onChange={handleCategoryChange}
                className="liquid-card block w-full rounded-2xl border-0 py-3 px-4 text-white focus:ring-2 focus:ring-inset focus:ring-white/45 sm:text-sm"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-2 text-xs text-red-300">{String(errors.categoryId.message)}</p>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium leading-6 text-white mb-2">Subcategory</label>
              <select
                value={selectedSubCategoryId || ""}
                onChange={handleSubCategoryChange}
                disabled={!selectedCategoryId || subCategoryLoading}
                className="liquid-card block w-full rounded-2xl border-0 py-3 px-4 text-white focus:ring-2 focus:ring-inset focus:ring-white/45 disabled:opacity-60 sm:text-sm"
              >
                <option value="">
                  {!selectedCategoryId
                    ? "Select category first"
                    : subCategoryLoading
                    ? "Loading subcategories..."
                    : subCategoryOptions.length
                    ? "Select subcategory"
                    : "No subcategories found"}
                </option>
                {subCategoryOptions.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.title}
                  </option>
                ))}
              </select>
              {errors.subCategoryId && <p className="mt-2 text-xs text-red-300">{String(errors.subCategoryId.message)}</p>}
              {hsnError ? <p className="mt-2 text-xs text-amber-200">{hsnError}</p> : null}
              {errors.hsnCodeId && <p className="mt-2 text-xs text-red-300">{String(errors.hsnCodeId.message)}</p>}
            </div>

            {selectedSubCategoryId ? (
              <div className="col-span-full space-y-3">
                {hsnLoading ? (
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-xs text-white/70">
                    Resolving HSN & GST tax details...
                  </div>
                ) : selectedHsn ? (
                  <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-white">
                    <div className="flex items-center justify-between text-xs text-cyan-200">
                      <span className="font-semibold uppercase tracking-wider">HSN & GST Tax Info</span>
                      <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px]">
                        {taxMappingPending ? "Draft Tax Mapping" : "Active Tax Mapping"}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-4 text-xs">
                      <div>
                        <span className="text-white/60 block">HSN Code</span>
                        <span className="font-bold text-white">{selectedHsn.code}</span>
                      </div>
                      <div>
                        <span className="text-white/60 block">GST Rate</span>
                        <span className="font-bold text-white">{selectedHsn.gstRate}%</span>
                      </div>
                      <div>
                        <span className="text-white/60 block">CGST / SGST</span>
                        <span className="font-bold text-white">
                          {selectedHsn.cgstRate}% / {selectedHsn.sgstRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60 block">Tax Treatment</span>
                        <span className="font-bold text-white">{selectedHsn.taxTreatment || selectedHsn.taxType || "TAXABLE"}</span>
                      </div>
                    </div>
                    {selectedHsn.description ? (
                      <p className="mt-2 text-xs text-white/70">{selectedHsn.description}</p>
                    ) : null}
                  </div>
                ) : (
                  <Alert className="border-yellow-300/50 bg-yellow-400/15 text-yellow-50">
                    <div className="flex gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-200" aria-hidden="true" />
                      <div>
                        <AlertTitle>{taxMappingWarningTitle}</AlertTitle>
                        <AlertDescription className="space-y-2 text-yellow-50/90">
                          <p>{taxMappingWarningMessage}</p>
                          <p>{taxMappingWarningDetail}</p>
                          <p>
                            <span className="font-semibold">Required Action:</span> {taxMappingWarningAction}
                          </p>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}
              </div>
            ) : null}

            <SelectInput
              label="Select Farmer"
              name="farmerId"
              register={register}
              errors={errors}
              className="sm:col-span-2"
              options={farmers.map((f) => ({ id: f.id, title: f.title || f.name || "Farmer" }))}
              placeholder="Select Farmer"
            />

            <div className="sm:col-span-2">
              <ProductDescriptionEditor
                productContext={{
                  title: watch("title"),
                  category: categories.find((c) => c.id === selectedCategoryId)?.title,
                  subCategory: subCategoryOptions.find((s) => s.id === selectedSubCategoryId)?.title,
                }}
                onChange={(translations) => {
                  setValue("description", translations.en?.descriptionHtml || "", { shouldDirty: true });
                  setMultiLangTranslations(translations);
                }}
              />
            </div>

            <ToggleInput
              label="Publish your Product"
              name="isActive"
              trueTitle="Active"
              falseTitle="Draft"
              register={register}
              disabled={taxMappingPending}
              description={taxMappingPending ? "Publishing is disabled until HSN/GST mapping is assigned." : undefined}
            />
          </div>
        </div>
      )}

      {/* 2. Pricing Section */}
      {activeTab === "Pricing" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <TextInput label="Product Price (Before Discount)" name="productPrice" type="number" register={register} errors={errors} className="w-full" />
            <TextInput label="Product Sale Price(Discounted)" name="salePrice" register={register} errors={errors} type="number" className="w-full" />
            <ToggleInput label="Supports Wholesale Selling" name="isWholesale" trueTitle="Supported" falseTitle="Not Supported" register={register} />
            {isWholesale && (
              <>
                <TextInput label="Wholesale Price" name="wholesalePrice" register={register} errors={errors} type="number" className="w-full" isRequired={false} />
                <TextInput label="Minimum Wholesale Qty" name="wholesaleQty" register={register} errors={errors} type="number" className="w-full" isRequired={false} />
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. Inventory Section */}
      {activeTab === "Inventory" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {id && (
              <>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white">
                  <div className="text-xs uppercase text-white/60">SKU</div>
                  <div className="mt-1 break-all font-semibold">{updateData?.sku || "Pending server generation"}</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white">
                  <div className="text-xs uppercase text-white/60">Product Code</div>
                  <div className="mt-1 break-all font-semibold">{updateData?.productCode || "Pending server generation"}</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white">
                  <div className="text-xs uppercase text-white/60">Barcode</div>
                  <div className="mt-1 break-all font-semibold">{updateData?.barcode || "Pending server generation"}</div>
                </div>
                <div className="sm:col-span-2">
                  <ProductBarcodeActions
                    barcode={updateData?.barcode as string}
                    title={updateData?.title as string}
                    productCode={updateData?.productCode as string}
                    sku={updateData?.sku as string}
                  />
                </div>
              </>
            )}
            <TextInput label="Product Stock" name="productStock" register={register} errors={errors} type="number" className="w-full" />
            <SelectInput label="Unit of Measurement" name="unit" register={register} errors={errors} className="w-full" options={unitOfMeasurementOptions} placeholder="Select Unit of Measurement" />
          </div>
        </div>
      )}

      {/* 4. Variants & Attributes Section */}
      {activeTab === "Variants & Attributes" && (
        <div className="space-y-6">
          <CategoryAttributeSelector
            categoryId={selectedCategoryId}
            categoryTitle={categories.find((c) => c.id === selectedCategoryId)?.title}
            subCategoryTitle={subCategoryOptions.find((s) => s.id === selectedSubCategoryId)?.title}
            productTitle={watch("title")}
            productCode={watch("productCode") || "PRD"}
            vendorCode="V001"
            initialAttributes={attributes}
            initialVariants={variants as unknown as import("@/components/attributes/category-attribute-selector").GeneratedVariantDraft[]}
            onAttributesChange={(newAttributes) => setAttributes(newAttributes as ProductAttributeForm[])}
            onVariantsChange={(newVariants) => setVariants(newVariants as unknown as ProductVariantForm[])}
          />

          {variants.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-3 rounded-2xl border border-white/15 bg-white/10 p-3">
                <input
                  value={bulkPrice}
                  onChange={(event) => setBulkPrice(event.target.value)}
                  placeholder="Bulk price"
                  type="number"
                  className="rounded-xl border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={applyBulkPrice}
                  className="rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25"
                >
                  Apply Price
                </button>
                <input
                  value={bulkStock}
                  onChange={(event) => setBulkStock(event.target.value)}
                  placeholder="Bulk stock"
                  type="number"
                  className="rounded-xl border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={applyBulkStock}
                  className="rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25"
                >
                  Apply Stock
                </button>
                <button
                  type="button"
                  onClick={() => setVariants((current) => current.map((variant) => ({ ...variant, isActive: true })))}
                  className="rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25"
                >
                  Activate All
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setVariants((current) =>
                      current.map((variant) => ({
                        ...variant,
                        isActive: false,
                        isDefault: false,
                      }))
                    )
                  }
                  className="rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25"
                >
                  Deactivate All
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/15 bg-slate-950/80 p-2">
                <table className="min-w-[960px] w-full text-sm text-white">
                  <thead className="bg-white/10 text-left text-xs uppercase tracking-wider text-white/80">
                    <tr>
                      {[
                        "Variant",
                        "Identifiers",
                        "Price",
                        "Compare",
                        "Cost",
                        "Stock",
                        "Low",
                        "Weight",
                        "Image",
                        "Default",
                        "Active",
                        "Actions",
                      ].map((heading) => (
                        <th key={heading} className="px-3 py-2">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <ProductVariantRows variants={variants} updateVariant={updateVariant} removeVariant={removeVariant} />
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* 5. Images Section */}
      {activeTab === "Images" && (
        <div className="space-y-6">
          <MultipleImageInput imageUrls={productImages} setImageUrls={setProductImages} endpoint="multipleProductsUploader" label="Product Images" />
        </div>
      )}

      {/* 6. SEO Section */}
      {activeTab === "SEO" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <TextInput label="Meta Title (SEO)" name="seoTitle" register={register} errors={errors} className="w-full" />
            <TextareaInput label="Meta Description (SEO)" name="metaDescription" register={register} errors={errors} className="w-full" placeholder="e.g. Shop fresh, organic apples directly from farmers on Nxbazaar.in with fast delivery." />
          </div>
          <ArrayItemsInput setItems={setTags} items={tags} itemTitle="Search Tag / Keyword" />
        </div>
      )}

      <SubmitButton
        isLoading={loading}
        disabled={hsnLoading || subCategoryLoading}
        buttonTitle={id ? "Update Product" : "Create Product"}
        loadingButtonTitle={`${id ? "Updating" : "Creating"} Product please wait...`}
      />
    </form>
  );
}
