"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { SearchableMultiSelect } from "./searchable-multi-select";
import { generateSlug } from "@/lib/generateSlug";
import { generateSku, generateInternalBarcode } from "@/lib/sku-generator";

export type AttributeValueMaster = {
  id: string;
  value: string;
  slug: string;
  colorCode?: string | null;
  position: number;
};

export type AttributeMaster = {
  id: string;
  name: string;
  slug: string;
  inputType: "SELECT" | "MULTI_SELECT" | "TEXT" | "NUMBER" | "BOOLEAN";
  isVariant: boolean;
  isRequired: boolean;
  position?: number;
  values: AttributeValueMaster[];
};

export type FormAttributeSelection = {
  name: string;
  isVariant: boolean;
  values: Array<{
    value: string;
    colorCode?: string | null;
  }>;
};

export type GeneratedVariantDraft = {
  id?: string;
  title: string;
  sku: string;
  barcode: string;
  productCode: string;
  price: number;
  salePrice: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  isDefault: boolean;
  values: Array<{
    attribute: string;
    value: string;
  }>;
};

type CategoryAttributeSelectorProps = {
  categoryId?: string;
  categoryTitle?: string;
  subCategoryTitle?: string;
  productTitle?: string;
  productCode?: string;
  vendorCode?: string;
  initialAttributes?: FormAttributeSelection[];
  initialVariants?: GeneratedVariantDraft[];
  onAttributesChange: (attributes: FormAttributeSelection[]) => void;
  onVariantsChange: (variants: GeneratedVariantDraft[]) => void;
  disabled?: boolean;
};

export function CategoryAttributeSelector({
  categoryId,
  categoryTitle = "",
  subCategoryTitle = "",
  productTitle = "",
  productCode = "PRD",
  vendorCode = "VND",
  initialAttributes = [],
  initialVariants = [],
  onAttributesChange,
  onVariantsChange,
  disabled = false,
}: CategoryAttributeSelectorProps) {
  const [attributesMaster, setAttributesMaster] = useState<AttributeMaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected values map: attributeSlug -> string[] of selected values
  const [selectedMap, setSelectedMap] = useState<Record<string, string[]>>({});

  // 1. Fetch attributes from database whenever categoryId changes
  useEffect(() => {
    let isMounted = true;
    async function loadAttributes() {
      setLoading(true);
      setError(null);
      try {
        const url = categoryId
          ? `/api/attributes?categoryId=${encodeURIComponent(categoryId)}`
          : `/api/attributes`;
        const res = await fetch(url);
        const json = await res.json();

        if (isMounted) {
          if (json.success && Array.isArray(json.data)) {
            const fetchedMaster: AttributeMaster[] = json.data;
            const masterSlugs = new Set(fetchedMaster.map((a) => a.slug));
            const mergedMaster: AttributeMaster[] = [...fetchedMaster];

            if (initialAttributes && initialAttributes.length > 0) {
              initialAttributes.forEach((initAttr) => {
                const slug = generateSlug(initAttr.name);
                if (!masterSlugs.has(slug)) {
                  mergedMaster.push({
                    id: slug,
                    name: initAttr.name,
                    slug,
                    inputType: "MULTI_SELECT",
                    isVariant: initAttr.isVariant !== false,
                    isRequired: false,
                    position: mergedMaster.length,
                    values: initAttr.values.map((v, i) => ({
                      id: `${slug}-${i}`,
                      value: v.value,
                      slug: generateSlug(v.value),
                      colorCode: v.colorCode || null,
                      position: i,
                    })),
                  });
                  masterSlugs.add(slug);
                } else {
                  const existingAttr = mergedMaster.find((a) => a.slug === slug);
                  if (existingAttr) {
                    const valSlugs = new Set(existingAttr.values.map((v) => v.slug));
                    initAttr.values.forEach((v, i) => {
                      const vSlug = generateSlug(v.value);
                      if (!valSlugs.has(vSlug)) {
                        existingAttr.values.push({
                          id: `${slug}-${vSlug}`,
                          value: v.value,
                          slug: vSlug,
                          colorCode: v.colorCode || null,
                          position: existingAttr.values.length,
                        });
                        valSlugs.add(vSlug);
                      }
                    });
                  }
                }
              });
            }

            setAttributesMaster(mergedMaster);

            // Populate initial map if initialAttributes exist
            if (initialAttributes && initialAttributes.length > 0) {
              const initialMap: Record<string, string[]> = {};
              initialAttributes.forEach((attr) => {
                const slug = generateSlug(attr.name);
                initialMap[slug] = attr.values.map((v) => v.value);
              });
              setSelectedMap(initialMap);
            }
          } else {
            setError("Failed to load category attributes.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("ATTRIBUTES_LOAD_ERROR", err);
          setError("Network error while loading attributes.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAttributes();
    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  // 2. Handle selection change for a given attribute
  const handleSelectionChange = useCallback(
    (attributeSlug: string, values: string[]) => {
      setSelectedMap((prev) => ({
        ...prev,
        [attributeSlug]: values,
      }));
    },
    []
  );

  // Stable refs for callbacks so inline props don't cause infinite re-render loops
  const onAttributesChangeRef = useRef(onAttributesChange);
  const onVariantsChangeRef = useRef(onVariantsChange);
  useEffect(() => {
    onAttributesChangeRef.current = onAttributesChange;
    onVariantsChangeRef.current = onVariantsChange;
  });

  const prevAttributesJsonRef = useRef<string>("");
  const prevVariantsJsonRef = useRef<string>("");

  // 3. Notify parent component whenever selectedMap or attributesMaster changes
  useEffect(() => {
    // Sync with parent form attribute state
    const formAttributes: FormAttributeSelection[] = attributesMaster
      .filter((attr) => (selectedMap[attr.slug] || []).length > 0)
      .map((attr) => {
        const selectedValStrings = selectedMap[attr.slug] || [];
        return {
          name: attr.name,
          isVariant: attr.isVariant,
          values: selectedValStrings.map((valStr) => {
            const foundObj = attr.values.find((v) => v.value === valStr);
            return {
              value: valStr,
              colorCode: foundObj?.colorCode || null,
            };
          }),
        };
      });

    const attrJson = JSON.stringify(formAttributes);
    if (attrJson !== prevAttributesJsonRef.current) {
      prevAttributesJsonRef.current = attrJson;
      onAttributesChangeRef.current(formAttributes);
    }

    // Calculate variant combinations for attributes with isVariant = true
    const variantAttrs = attributesMaster.filter(
      (attr) => attr.isVariant && (selectedMap[attr.slug] || []).length > 0
    );

    if (variantAttrs.length === 0) {
      if (prevVariantsJsonRef.current !== "[]") {
        prevVariantsJsonRef.current = "[]";
        onVariantsChangeRef.current([]);
      }
      return;
    }

    // Cartesian product of variant attribute selections
    const variantGroupValues = variantAttrs.map((attr) => {
      const selectedVals = selectedMap[attr.slug] || [];
      return selectedVals.map((val) => ({
        attribute: attr.name,
        value: val,
      }));
    });

    const combinations = variantGroupValues.reduce(
      (acc, group) => acc.flatMap((items) => group.map((item) => [...items, item])),
      [[]] as Array<Array<{ attribute: string; value: string }>>
    );

    const generatedVariants: GeneratedVariantDraft[] = combinations.map(
      (combination, idx) => {
        const comboTitle = combination.map((c) => c.value).join(" / ");
        const colorVal = combination.find((c) => /color|colour/i.test(c.attribute))?.value || combination[0]?.value || "";
        const sizeVal = combination.find((c) => /size|ram|storage/i.test(c.attribute))?.value || combination[1]?.value || "";

        const generatedSku = generateSku({
          vendor: vendorCode || "V001",
          category: categoryTitle || "CAT",
          subCategory: subCategoryTitle || "SUB",
          product: productTitle || "PRD",
          color: colorVal,
          size: sizeVal,
          variantNo: idx + 1,
        });

        // Check if variant previously existed
        const existing = initialVariants.find(
          (v) =>
            v.title === comboTitle ||
            v.values.every((val) =>
              combination.some(
                (c) => c.attribute === val.attribute && c.value === val.value
              )
            )
        );

        return {
          id: existing?.id,
          title: comboTitle,
          sku: existing?.sku || generatedSku,
          barcode: existing?.barcode || generateInternalBarcode(generatedSku),
          productCode: existing?.productCode || "",
          price: existing?.price ?? 0,
          salePrice: existing?.salePrice ?? 0,
          stock: existing?.stock ?? 10,
          imageUrl: existing?.imageUrl || "",
          isActive: existing?.isActive !== false,
          isDefault: existing?.isDefault ?? idx === 0,
          values: combination,
        };
      }
    );

    const varJson = JSON.stringify(generatedVariants);
    if (varJson !== prevVariantsJsonRef.current) {
      prevVariantsJsonRef.current = varJson;
      onVariantsChangeRef.current(generatedVariants);
    }
  }, [
    selectedMap,
    attributesMaster,
    initialVariants,
    productCode,
    vendorCode,
  ]);

  if (loading) {
    return (
      <div className="liquid-card flex items-center justify-center p-8 rounded-2xl border border-white/15 bg-slate-950/70">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400 mr-2" />
        <span className="text-sm font-medium text-white/80">Loading database attributes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Product Attributes</span>
            <span className="rounded-full bg-purple-500/20 border border-purple-400/30 px-2 py-0.5 text-[10px] text-purple-300 font-bold">
              Database Master
            </span>
          </h3>
          <p className="text-xs text-white/60">
            Select predefined values from Admin Master. Variant attributes automatically generate variants.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {attributesMaster.map((attr) => {
          const selectedVals = selectedMap[attr.slug] || [];
          const options = attr.values.map((v) => ({
            id: v.id,
            label: v.value,
            value: v.value,
            colorCode: v.colorCode,
          }));

          if (attr.inputType === "MULTI_SELECT" || attr.isVariant) {
            return (
              <SearchableMultiSelect
                key={attr.id}
                label={attr.name}
                options={options}
                selectedValues={selectedVals}
                onChange={(vals) => handleSelectionChange(attr.slug, vals)}
                isVariant={attr.isVariant}
                disabled={disabled}
                placeholder={`Select ${attr.name}...`}
              />
            );
          }

          // Single Select (SELECT, TEXT, NUMBER, BOOLEAN)
          return (
            <div key={attr.id} className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90 block">
                {attr.name}
              </label>
              <select
                disabled={disabled}
                value={selectedVals[0] || ""}
                onChange={(e) =>
                  handleSelectionChange(
                    attr.slug,
                    e.target.value ? [e.target.value] : []
                  )
                }
                className="liquid-card w-full rounded-2xl border border-white/20 bg-slate-900/80 px-3 py-2.5 text-xs text-white backdrop-blur-xl outline-none focus:border-purple-400"
              >
                <option value="" className="bg-slate-950 text-white/60">
                  -- Select {attr.name} --
                </option>
                {options.map((opt) => (
                  <option key={opt.id} value={opt.value} className="bg-slate-950 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
