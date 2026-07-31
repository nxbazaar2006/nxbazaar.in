"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { LiquidGlassInput } from "@/components/ui/liquid-glass-input";
import { LiquidGlassSelect } from "@/components/ui/liquid-glass-select";
import { LiquidGlassSwitch } from "@/components/ui/liquid-glass-switch";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import type { Table } from "@tanstack/react-table";
import { Edit3, Layers, Tag, DollarSign, Package, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import type { BulkUpdateProductPayload } from "@/app/api/products/bulk-update/route";

type OptionItem = { id: string; title: string };
type SubCategoryOption = { id: string; title: string; categoryId: string };
type HsnOption = { id: string; code: string; description?: string | null };

type ProductBulkEditModalProps<TData> = {
  table: Table<TData>;
  hsnOptions?: HsnOption[];
  categories?: OptionItem[];
  subCategories?: SubCategoryOption[];
  brands?: OptionItem[];
};

function getSelectedIds<TData>(table: Table<TData>) {
  return table.getFilteredSelectedRowModel().rows.map((row) => (row.original as { id: string }).id);
}

export default function ProductBulkEditModal<TData>({
  table,
  hsnOptions = [],
  categories = [],
  subCategories = [],
  brands = [],
}: ProductBulkEditModalProps<TData>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [activeTab, setActiveTab] = useState<"general" | "catalog" | "tax" | "pricing">("general");

  // Status & Visibility
  const [isActiveStatus, setIsActiveStatus] = useState<string>("unchanged");
  const [productStatus, setProductStatus] = useState<string>("unchanged");
  const [wholesaleStatus, setWholesaleStatus] = useState<string>("unchanged");

  // Categorization & Brand
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [subCategoryMode, setSubCategoryMode] = useState<"unchanged" | "set" | "clear">("unchanged");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");
  const [brandMode, setBrandMode] = useState<"unchanged" | "set" | "clear">("unchanged");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");

  // Tax
  const [hsnMode, setHsnMode] = useState<"unchanged" | "set" | "clear">("unchanged");
  const [hsnCodeId, setHsnCodeId] = useState<string>("");

  // Price
  const [priceMode, setPriceMode] = useState<"unchanged" | "set" | "percent_change" | "amount_change">("unchanged");
  const [priceValue, setPriceValue] = useState<string>("");

  // Stock
  const [stockMode, setStockMode] = useState<"unchanged" | "set" | "add" | "subtract">("unchanged");
  const [stockValue, setStockValue] = useState<string>("");

  const selectedIds = getSelectedIds(table);
  const selectedCount = selectedIds.length;

  if (selectedCount === 0) return null;

  const filteredSubCategories = selectedCategoryId
    ? subCategories.filter((sc) => sc.categoryId === selectedCategoryId)
    : subCategories;

  function resetForm() {
    setIsActiveStatus("unchanged");
    setProductStatus("unchanged");
    setWholesaleStatus("unchanged");
    setSelectedCategoryId("");
    setSubCategoryMode("unchanged");
    setSelectedSubCategoryId("");
    setBrandMode("unchanged");
    setSelectedBrandId("");
    setHsnMode("unchanged");
    setHsnCodeId("");
    setPriceMode("unchanged");
    setPriceValue("");
    setStockMode("unchanged");
    setStockValue("");
    setActiveTab("general");
  }

  function handleApply() {
    startTransition(async () => {
      try {
        const payload: BulkUpdateProductPayload = {
          ids: selectedIds,
        };

        let hasChange = false;

        // Status & Visibility
        if (isActiveStatus !== "unchanged") {
          payload.isActive = isActiveStatus === "active";
          hasChange = true;
        }
        if (productStatus !== "unchanged") {
          payload.status = productStatus as any;
          hasChange = true;
        }
        if (wholesaleStatus !== "unchanged") {
          payload.isWholesale = wholesaleStatus === "enabled";
          hasChange = true;
        }

        // Categorization & Brand
        if (selectedCategoryId) {
          payload.categoryId = selectedCategoryId;
          hasChange = true;
        }
        if (subCategoryMode !== "unchanged") {
          payload.subCategoryMode = subCategoryMode;
          if (subCategoryMode === "set") payload.subCategoryId = selectedSubCategoryId || null;
          hasChange = true;
        }
        if (brandMode !== "unchanged") {
          payload.brandMode = brandMode;
          if (brandMode === "set") payload.brandId = selectedBrandId || null;
          hasChange = true;
        }

        // Tax
        if (hsnMode !== "unchanged") {
          payload.hsnMode = hsnMode;
          if (hsnMode === "set") payload.hsnCodeId = hsnCodeId || null;
          hasChange = true;
        }

        // Pricing
        if (priceMode !== "unchanged" && priceValue.trim() !== "") {
          const val = parseFloat(priceValue);
          if (!isNaN(val)) {
            payload.priceAdjustment = { mode: priceMode, value: val };
            hasChange = true;
          }
        }

        // Stock
        if (stockMode !== "unchanged" && stockValue.trim() !== "") {
          const val = parseInt(stockValue, 10);
          if (!isNaN(val)) {
            payload.stockAdjustment = { mode: stockMode, value: val };
            hasChange = true;
          }
        }

        if (!hasChange) {
          toast.error("Please select at least one field to update.");
          return;
        }

        const response = await fetch("/api/products/bulk-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok || result.success === false) {
          throw new Error(result.message || "Bulk update failed.");
        }

        toast.success(result.message || `${selectedCount} products updated.`);
        setOpen(false);
        resetForm();
        table.resetRowSelection();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Bulk update failed.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
      <DialogTrigger asChild>
        <LiquidGlassButton variant="neutral" size="sm" leftIcon={<Edit3 className="h-4 w-4" />}>
          Bulk Field Edit ({selectedCount})
        </LiquidGlassButton>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/95 text-white backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-cyan-300">
            <Edit3 className="h-5 w-5 text-cyan-400" />
            Bulk Edit Fields ({selectedCount} Selected)
          </DialogTitle>
          <DialogDescription className="text-white/70 text-xs">
            Apply uniform changes across selected products using Liquid Glass cards. Unchanged fields remain untouched.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 mt-2">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === "general"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <ShieldAlert className="h-4 w-4" /> General & Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === "catalog"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" /> Category & Brand
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === "pricing"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <DollarSign className="h-4 w-4" /> Price & Stock
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tax")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === "tax"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <Tag className="h-4 w-4" /> HSN & Tax
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-4 space-y-4">
          {/* General & Status Tab */}
          {activeTab === "general" && (
            <LiquidGlassCard variant="primary" className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Active Visibility
                </label>
                <LiquidGlassSelect
                  value={isActiveStatus}
                  onChange={(e) => setIsActiveStatus(e.target.value)}
                  options={[
                    { label: "-- Do Not Change --", value: "unchanged" },
                    { label: "Active (Visible)", value: "active" },
                    { label: "Inactive (Hidden)", value: "inactive" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Product Lifecycle Status
                </label>
                <LiquidGlassSelect
                  value={productStatus}
                  onChange={(e) => setProductStatus(e.target.value)}
                  options={[
                    { label: "-- Do Not Change --", value: "unchanged" },
                    { label: "DRAFT", value: "DRAFT" },
                    { label: "ACTIVE", value: "ACTIVE" },
                    { label: "ARCHIVED", value: "ARCHIVED" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Wholesale Availability
                </label>
                <LiquidGlassSelect
                  value={wholesaleStatus}
                  onChange={(e) => setWholesaleStatus(e.target.value)}
                  options={[
                    { label: "-- Do Not Change --", value: "unchanged" },
                    { label: "Enable Wholesale", value: "enabled" },
                    { label: "Disable Wholesale", value: "disabled" },
                  ]}
                />
              </div>
            </LiquidGlassCard>
          )}

          {/* Category & Brand Tab */}
          {activeTab === "catalog" && (
            <LiquidGlassCard variant="primary" className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Assign Category
                </label>
                <LiquidGlassSelect
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedSubCategoryId("");
                  }}
                  options={[
                    { label: "-- Do Not Change Category --", value: "" },
                    ...categories.map((cat) => ({ label: cat.title, value: cat.id })),
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  SubCategory Action
                </label>
                <LiquidGlassSelect
                  value={subCategoryMode}
                  onChange={(e) => setSubCategoryMode(e.target.value as any)}
                  options={[
                    { label: "-- Do Not Change --", value: "unchanged" },
                    { label: "Assign SubCategory", value: "set" },
                    { label: "Clear SubCategory", value: "clear" },
                  ]}
                />
              </div>

              {subCategoryMode === "set" && (
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Select SubCategory
                  </label>
                  <LiquidGlassSelect
                    value={selectedSubCategoryId}
                    onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                    options={[
                      { label: "Select SubCategory", value: "" },
                      ...filteredSubCategories.map((sc) => ({ label: sc.title, value: sc.id })),
                    ]}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Brand Action
                </label>
                <LiquidGlassSelect
                  value={brandMode}
                  onChange={(e) => setBrandMode(e.target.value as any)}
                  options={[
                    { label: "-- Do Not Change --", value: "unchanged" },
                    { label: "Assign Brand", value: "set" },
                    { label: "Clear Brand", value: "clear" },
                  ]}
                />
              </div>

              {brandMode === "set" && (
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Select Brand
                  </label>
                  <LiquidGlassSelect
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                    options={[
                      { label: "Select Brand", value: "" },
                      ...brands.map((b) => ({ label: b.title, value: b.id })),
                    ]}
                  />
                </div>
              )}
            </LiquidGlassCard>
          )}

          {/* Pricing & Stock Tab */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <LiquidGlassCard variant="cyan" className="space-y-3">
                <h4 className="text-sm font-semibold text-cyan-300 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-cyan-400" /> Price Adjustment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LiquidGlassSelect
                    value={priceMode}
                    onChange={(e) => setPriceMode(e.target.value as any)}
                    options={[
                      { label: "-- Do Not Change Price --", value: "unchanged" },
                      { label: "Set Fixed Price ($)", value: "set" },
                      { label: "Percentage Adjustment (%)", value: "percent_change" },
                      { label: "Flat Amount Adjustment ($)", value: "amount_change" },
                    ]}
                  />
                  {priceMode !== "unchanged" && (
                    <LiquidGlassInput
                      type="number"
                      step="any"
                      placeholder={
                        priceMode === "set"
                          ? "e.g. 29.99"
                          : priceMode === "percent_change"
                          ? "e.g. 10 (+10%), -5 (-5%)"
                          : "e.g. 5 (+$5), -2 (-$2)"
                      }
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      leftIcon={<DollarSign className="h-4 w-4" />}
                    />
                  )}
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard variant="success" className="space-y-3">
                <h4 className="text-sm font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-emerald-400" /> Stock Adjustment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LiquidGlassSelect
                    value={stockMode}
                    onChange={(e) => setStockMode(e.target.value as any)}
                    options={[
                      { label: "-- Do Not Change Stock --", value: "unchanged" },
                      { label: "Set Fixed Stock Qty", value: "set" },
                      { label: "Add Stock Qty (+)", value: "add" },
                      { label: "Subtract Stock Qty (-)", value: "subtract" },
                    ]}
                  />
                  {stockMode !== "unchanged" && (
                    <LiquidGlassInput
                      type="number"
                      step="1"
                      placeholder={
                        stockMode === "set"
                          ? "e.g. 100"
                          : stockMode === "add"
                          ? "e.g. 20"
                          : "e.g. 5"
                      }
                      value={stockValue}
                      onChange={(e) => setStockValue(e.target.value)}
                      leftIcon={<Layers className="h-4 w-4" />}
                    />
                  )}
                </div>
              </LiquidGlassCard>
            </div>
          )}

          {/* HSN & Tax Tab */}
          {activeTab === "tax" && (
            <LiquidGlassCard variant="primary" className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  HSN Tax Code Action
                </label>
                <LiquidGlassSelect
                  value={hsnMode}
                  onChange={(e) => setHsnMode(e.target.value as any)}
                  options={[
                    { label: "-- Do Not Change --", value: "unchanged" },
                    { label: "Assign HSN Code", value: "set" },
                    { label: "Clear HSN Code", value: "clear" },
                  ]}
                />
              </div>

              {hsnMode === "set" && (
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Select Active HSN Code
                  </label>
                  <LiquidGlassSelect
                    value={hsnCodeId}
                    onChange={(e) => setHsnCodeId(e.target.value)}
                    options={[
                      { label: "Select HSN Code", value: "" },
                      ...hsnOptions.map((opt) => ({
                        label: `${opt.code} ${opt.description ? `- ${opt.description}` : ""}`,
                        value: opt.id,
                      })),
                    ]}
                  />
                </div>
              )}
            </LiquidGlassCard>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <LiquidGlassButton type="button" variant="neutral" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </LiquidGlassButton>
          <LiquidGlassButton
            type="button"
            variant="cyan"
            onClick={handleApply}
            disabled={isPending}
            leftIcon={isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          >
            {isPending ? "Applying..." : "Apply Bulk Changes"}
          </LiquidGlassButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
