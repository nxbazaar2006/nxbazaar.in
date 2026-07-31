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
import {
  Sparkles,
  Save,
  RefreshCw,
  Package,
  DollarSign,
  Tag,
  Layers,
  Barcode,
  Layers3,
  Table as TableIcon,
  User,
  Sliders,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import toast from "react-hot-toast";

export type ProductBatchUpdateItem = {
  id: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  categoryId?: string;
  subCategoryId?: string | null;
  userId?: string;
  brandId?: string | null;
  productPrice?: number;
  salePrice?: number;
  wholesalePrice?: number | null;
  wholesaleQty?: number | null;
  isWholesale?: boolean;
  productStock?: number;
  unit?: string | null;
  weight?: number | null;
  tags?: string[];
  imageUrl?: string | null;
  productImages?: string[];
  attributes?: Record<string, string>;
};

type OptionItem = { id: string; title: string };
type SubCategoryOption = { id: string; title: string; categoryId: string };

export const unitOptions = [
  { label: "Kilograms (kg)", value: "Kilograms (kg)" },
  { label: "Grams (g)", value: "Grams (g)" },
  { label: "Liters (l)", value: "Liters (l)" },
  { label: "Milliliters (ml)", value: "Milliliters (ml)" },
  { label: "Pieces (pcs)", value: "Pieces (pcs)" },
  { label: "Pack (pk)", value: "Pack (pk)" },
  { label: "Box (box)", value: "Box (box)" },
  { label: "Dozen (dz)", value: "Dozen (dz)" },
  { label: "Meters (m)", value: "Meters (m)" },
  { label: "Centimeters (cm)", value: "Centimeters (cm)" },
  { label: "Pairs (pr)", value: "Pairs (pr)" },
  { label: "Sets (set)", value: "Sets (set)" },
  { label: "Bundles (bdl)", value: "Bundles (bdl)" },
  { label: "Rolls (roll)", value: "Rolls (roll)" },
  { label: "Cans (can)", value: "Cans (can)" },
  { label: "Bottles (btl)", value: "Bottles (btl)" },
];

export const specAttributeKeys = [
  "Age Group",
  "Color",
  "Fit",
  "Gender",
  "Material",
  "Neck Type",
  "Pack Size",
  "Pattern",
  "RAM",
  "Size",
  "Sleeve Type",
  "Storage",
  "Style",
  "Warranty",
];

type FullCardState = {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  categoryId: string;
  subCategoryId: string;
  userId: string;
  brandId: string;
  productPrice: number;
  salePrice: number;
  wholesalePrice: number;
  wholesaleQty: number;
  isWholesale: boolean;
  productStock: number;
  unit: string;
  weight: number;
  tagsString: string;
  imageUrl: string;
  attributes: Record<string, string>;
  isDirty?: boolean;
};

type ProductInlineBulkEditorModalProps<TData> = {
  table: Table<TData>;
  categories?: OptionItem[];
  subCategories?: SubCategoryOption[];
  brands?: OptionItem[];
  farmers?: OptionItem[];
};

export default function ProductInlineBulkEditorModal<TData>({
  table,
  categories = [],
  subCategories = [],
  brands = [],
  farmers = [],
}: ProductInlineBulkEditorModalProps<TData>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"cards" | "grid">("cards");
  const [cardTab, setCardTab] = useState<"general" | "pricing" | "specs">("general");

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const [cardStates, setCardStates] = useState<FullCardState[]>([]);

  useEffect(() => {
    if (open && selectedRows.length > 0) {
      const initialStates: FullCardState[] = selectedRows.map((row) => {
        const prod = row.original as any;

        // Parse existing attributes if present
        const attrMap: Record<string, string> = {};
        if (Array.isArray(prod.attributes)) {
          prod.attributes.forEach((attr: any) => {
            if (attr.name && Array.isArray(attr.values) && attr.values[0]?.value) {
              attrMap[attr.name] = attr.values[0].value;
            }
          });
        }

        return {
          id: prod.id,
          title: prod.title || "",
          description: prod.description || "",
          isActive: Boolean(prod.isActive),
          categoryId: prod.categoryId || "",
          subCategoryId: prod.subCategoryId || "",
          userId: prod.userId || "",
          brandId: prod.brandId || "",
          productPrice: typeof prod.productPrice === "number" ? prod.productPrice : 0,
          salePrice: typeof prod.salePrice === "number" ? prod.salePrice : 0,
          wholesalePrice: typeof prod.wholesalePrice === "number" ? prod.wholesalePrice : 0,
          wholesaleQty: typeof prod.wholesaleQty === "number" ? prod.wholesaleQty : 0,
          isWholesale: Boolean(prod.isWholesale),
          productStock: typeof prod.totalStock === "number" ? prod.totalStock : prod.productStock || 0,
          unit: prod.unit || "",
          weight: typeof prod.weight === "number" ? prod.weight : 0,
          tagsString: Array.isArray(prod.tags) ? prod.tags.join(", ") : "",
          imageUrl: prod.imageUrl || "",
          attributes: attrMap,
          isDirty: false,
        };
      });
      setCardStates(initialStates);
    }
  }, [open, selectedRows]);

  if (selectedCount === 0) return null;

  function updateField<K extends keyof FullCardState>(id: string, field: K, value: FullCardState[K]) {
    setCardStates((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: value,
            isDirty: true,
          };
        }
        return item;
      })
    );
  }

  function updateAttribute(id: string, attrName: string, value: string) {
    setCardStates((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            attributes: {
              ...item.attributes,
              [attrName]: value,
            },
            isDirty: true,
          };
        }
        return item;
      })
    );
  }

  function handleSaveAll() {
    const dirtyItems = cardStates.filter((c) => c.isDirty);
    if (dirtyItems.length === 0) {
      toast.error("No modifications detected to save.");
      return;
    }

    startTransition(async () => {
      try {
        const updates: ProductBatchUpdateItem[] = dirtyItems.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || null,
          isActive: item.isActive,
          categoryId: item.categoryId,
          subCategoryId: item.subCategoryId || null,
          userId: item.userId || undefined,
          brandId: item.brandId || null,
          productPrice: item.productPrice,
          salePrice: item.salePrice,
          wholesalePrice: item.wholesalePrice || null,
          wholesaleQty: item.wholesaleQty || null,
          isWholesale: item.isWholesale,
          productStock: item.productStock,
          unit: item.unit || null,
          weight: item.weight || null,
          tags: item.tagsString ? item.tagsString.split(",").map((t) => t.trim()).filter(Boolean) : [],
          imageUrl: item.imageUrl || null,
          attributes: item.attributes,
        }));

        const res = await fetch("/api/products/bulk-batch-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        });

        const result = await res.json();
        if (!res.ok || result.success === false) {
          throw new Error(result.message || "Failed to save product updates.");
        }

        toast.success(result.message || "Products updated successfully.");
        setOpen(false);
        table.resetRowSelection();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed.");
      }
    });
  }

  const dirtyCount = cardStates.filter((c) => c.isDirty).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <LiquidGlassButton variant="primary" size="sm" leftIcon={<Sparkles className="h-4 w-4" />}>
          Bulk Edit Selected ({selectedCount})
        </LiquidGlassButton>
      </DialogTrigger>
      <DialogContent className="max-w-[96vw] w-full max-h-[94vh] h-[94vh] flex flex-col p-6 bg-slate-900/95 text-white backdrop-blur-xl border border-white/20">
        <DialogHeader className="pb-3 border-b border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2.5 text-cyan-300">
                <Sparkles className="h-6 w-6 text-cyan-400" />
                Liquid Glass Full Product Bulk Editor ({selectedCount} Selected)
              </DialogTitle>
              <DialogDescription className="text-xs text-white/70 mt-1">
                Edit Title, Category, Farmer, Pricing, Stock, Brand, Images, Tags, and Specs (Color, Size, Material, RAM, Fit, Gender, etc.) for selected products.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl bg-white/10 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewMode === "cards" ? "bg-cyan-500 text-slate-950 shadow" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Layers3 className="h-3.5 w-3.5 inline mr-1" /> Glass Form Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewMode === "grid" ? "bg-cyan-500 text-slate-950 shadow" : "text-white/70 hover:text-white"
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5 inline mr-1" /> Sheet Table
                </button>
              </div>

              {viewMode === "cards" && (
                <div className="flex items-center rounded-xl bg-white/5 p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setCardTab("general")}
                    className={`px-2.5 py-1 rounded-md text-xs transition ${
                      cardTab === "general" ? "bg-white/20 text-white font-bold" : "text-white/60"
                    }`}
                  >
                    General & Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTab("pricing")}
                    className={`px-2.5 py-1 rounded-md text-xs transition ${
                      cardTab === "pricing" ? "bg-white/20 text-white font-bold" : "text-white/60"
                    }`}
                  >
                    Pricing & Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTab("specs")}
                    className={`px-2.5 py-1 rounded-md text-xs transition ${
                      cardTab === "specs" ? "bg-white/20 text-white font-bold" : "text-white/60"
                    }`}
                  >
                    Specs & Attributes
                  </button>
                </div>
              )}

              {dirtyCount > 0 && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {dirtyCount} modified pending save
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* View Content */}
        <div className="flex-1 overflow-auto my-4 pr-1">
          {viewMode === "cards" ? (
            /* Liquid Glass Form Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cardStates.map((item, index) => {
                const itemSubs = item.categoryId
                  ? subCategories.filter((sc) => sc.categoryId === item.categoryId)
                  : subCategories;

                return (
                  <LiquidGlassCard
                    key={item.id}
                    variant={item.isDirty ? "cyan" : "primary"}
                    className="relative flex flex-col justify-between space-y-4 border border-white/15 shadow-xl"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300 border border-cyan-400/30">
                          #{index + 1}
                        </span>
                        <h3 className="font-semibold text-white truncate max-w-[280px]">
                          {item.title || "Untitled Product"}
                        </h3>
                      </div>
                      {item.isDirty ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          Modified
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/50">Unchanged</span>
                      )}
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* GENERAL & DETAILS TAB */}
                      {cardTab === "general" && (
                        <>
                          {/* Product Title */}
                          <div>
                            <label className="block text-white/80 font-medium mb-1">Product Title</label>
                            <LiquidGlassInput
                              value={item.title}
                              onChange={(e) => updateField(item.id, "title", e.target.value)}
                              placeholder="Product Title"
                              wrapperClassName="w-full"
                              leftIcon={<Package className="h-4 w-4" />}
                            />
                          </div>

                          {/* Category, SubCategory & Brand */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-white/80 font-medium mb-1">Category</label>
                              <LiquidGlassSelect
                                value={item.categoryId}
                                onChange={(e) => {
                                  updateField(item.id, "categoryId", e.target.value);
                                  updateField(item.id, "subCategoryId", "");
                                }}
                                options={[
                                  { label: "Select Category", value: "" },
                                  ...categories.map((c) => ({ label: c.title, value: c.id })),
                                ]}
                              />
                            </div>

                            <div>
                              <label className="block text-white/80 font-medium mb-1">SubCategory</label>
                              <LiquidGlassSelect
                                value={item.subCategoryId}
                                onChange={(e) => updateField(item.id, "subCategoryId", e.target.value)}
                                options={[
                                  { label: "Select SubCategory", value: "" },
                                  ...itemSubs.map((sc) => ({ label: sc.title, value: sc.id })),
                                ]}
                              />
                            </div>

                            <div>
                              <label className="block text-white/80 font-medium mb-1">Brand</label>
                              <LiquidGlassSelect
                                value={item.brandId}
                                onChange={(e) => updateField(item.id, "brandId", e.target.value)}
                                options={[
                                  { label: "Select Brand", value: "" },
                                  ...brands.map((b) => ({ label: b.title, value: b.id })),
                                ]}
                              />
                            </div>
                          </div>

                          {/* Select Farmer & Unit */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-white/80 font-medium mb-1">Select Farmer</label>
                              <LiquidGlassSelect
                                value={item.userId}
                                onChange={(e) => updateField(item.id, "userId", e.target.value)}
                                options={[
                                  { label: "Select Farmer", value: "" },
                                  ...farmers.map((f) => ({ label: f.title, value: f.id })),
                                ]}
                              />
                            </div>

                            <div>
                              <label className="block text-white/80 font-medium mb-1">Unit of Measurement</label>
                              <LiquidGlassSelect
                                value={item.unit}
                                onChange={(e) => updateField(item.id, "unit", e.target.value)}
                                options={[{ label: "Select Unit", value: "" }, ...unitOptions]}
                              />
                            </div>
                          </div>

                          {/* Product Description */}
                          <div>
                            <label className="block text-white/80 font-medium mb-1">Product Description</label>
                            <textarea
                              value={item.description}
                              onChange={(e) => updateField(item.id, "description", e.target.value)}
                              placeholder="Product Description..."
                              rows={2}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/20 text-white text-xs outline-none focus:ring-1 focus:ring-cyan-400"
                            />
                          </div>

                          {/* Image URL & Tags */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-white/80 font-medium mb-1">Product Image URL</label>
                              <LiquidGlassInput
                                type="text"
                                value={item.imageUrl}
                                onChange={(e) => updateField(item.id, "imageUrl", e.target.value)}
                                placeholder="https://..."
                                leftIcon={<ImageIcon className="h-4 w-4" />}
                              />
                            </div>
                            <div>
                              <label className="block text-white/80 font-medium mb-1">Tags (comma separated)</label>
                              <LiquidGlassInput
                                type="text"
                                value={item.tagsString}
                                onChange={(e) => updateField(item.id, "tagsString", e.target.value)}
                                placeholder="fresh, organic, fruits"
                                leftIcon={<Tag className="h-4 w-4" />}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* PRICING & STOCK TAB */}
                      {cardTab === "pricing" && (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-white/80 font-medium mb-1">Product Price (Before Discount)</label>
                              <LiquidGlassInput
                                type="number"
                                step="0.01"
                                value={item.productPrice}
                                onChange={(e) => updateField(item.id, "productPrice", parseFloat(e.target.value) || 0)}
                                leftIcon={<DollarSign className="h-4 w-4" />}
                              />
                            </div>

                            <div>
                              <label className="block text-white/80 font-medium mb-1">Sale Price (Discounted)</label>
                              <LiquidGlassInput
                                type="number"
                                step="0.01"
                                value={item.salePrice}
                                onChange={(e) => updateField(item.id, "salePrice", parseFloat(e.target.value) || 0)}
                                leftIcon={<Tag className="h-4 w-4" />}
                              />
                            </div>

                            <div>
                              <label className="block text-white/80 font-medium mb-1">Wholesale Price</label>
                              <LiquidGlassInput
                                type="number"
                                step="0.01"
                                value={item.wholesalePrice}
                                onChange={(e) => updateField(item.id, "wholesalePrice", parseFloat(e.target.value) || 0)}
                                leftIcon={<DollarSign className="h-4 w-4" />}
                              />
                            </div>

                            <div>
                              <label className="block text-white/80 font-medium mb-1">Min Wholesale Qty</label>
                              <LiquidGlassInput
                                type="number"
                                step="1"
                                value={item.wholesaleQty}
                                onChange={(e) => updateField(item.id, "wholesaleQty", parseInt(e.target.value, 10) || 0)}
                                leftIcon={<Layers className="h-4 w-4" />}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-white/80 font-medium mb-1">Product Stock</label>
                              <LiquidGlassInput
                                type="number"
                                step="1"
                                value={item.productStock}
                                onChange={(e) => updateField(item.id, "productStock", parseInt(e.target.value, 10) || 0)}
                                leftIcon={<Layers className="h-4 w-4" />}
                              />
                            </div>

                            <div>
                              <label className="block text-white/80 font-medium mb-1">Weight (kg)</label>
                              <LiquidGlassInput
                                type="number"
                                step="0.01"
                                value={item.weight}
                                onChange={(e) => updateField(item.id, "weight", parseFloat(e.target.value) || 0)}
                                leftIcon={<Sliders className="h-4 w-4" />}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <LiquidGlassSwitch
                              checked={item.isActive}
                              onCheckedChange={(checked) => updateField(item.id, "isActive", checked)}
                              label="Publish your Product"
                              activeLabel="Published"
                              inactiveLabel="Draft"
                              variant="success"
                            />
                            <LiquidGlassSwitch
                              checked={item.isWholesale}
                              onCheckedChange={(checked) => updateField(item.id, "isWholesale", checked)}
                              label="Wholesale Product"
                              activeLabel="Enabled"
                              inactiveLabel="Disabled"
                              variant="blue"
                            />
                          </div>
                        </>
                      )}

                      {/* SPECS & ATTRIBUTES TAB */}
                      {cardTab === "specs" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {specAttributeKeys.map((key) => (
                            <div key={key}>
                              <label className="block text-white/80 font-medium mb-1">{key}</label>
                              <input
                                type="text"
                                value={item.attributes[key] || ""}
                                onChange={(e) => updateAttribute(item.id, key, e.target.value)}
                                placeholder={key}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-white/20 bg-slate-950/80 text-white text-xs focus:ring-1 focus:ring-cyan-400 outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </LiquidGlassCard>
                );
              })}
            </div>
          ) : (
            /* Grid Table View */
            <div className="w-full border border-white/10 rounded-2xl overflow-hidden bg-slate-950/60 backdrop-blur-md">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-white/10 text-white font-semibold sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="p-3 min-w-[180px]">Product Title</th>
                    <th className="p-3 min-w-[130px]">Category</th>
                    <th className="p-3 min-w-[130px]">Farmer</th>
                    <th className="p-3 w-[90px]">Price</th>
                    <th className="p-3 w-[90px]">Sale Price</th>
                    <th className="p-3 w-[90px]">Stock</th>
                    <th className="p-3 w-[100px]">Wholesale $</th>
                    <th className="p-3 w-[80px]">Min Qty</th>
                    <th className="p-3 w-[90px] text-center">Publish</th>
                    <th className="p-3 min-w-[100px]">Color</th>
                    <th className="p-3 min-w-[100px]">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {cardStates.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition ${
                        item.isDirty
                          ? "bg-cyan-500/15 border-l-4 border-l-cyan-400"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateField(item.id, "title", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-slate-800 text-white text-xs outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.categoryId}
                          onChange={(e) => updateField(item.id, "categoryId", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-slate-800 text-white text-xs outline-none"
                        >
                          <option value="">Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={item.userId}
                          onChange={(e) => updateField(item.id, "userId", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-slate-800 text-white text-xs outline-none"
                        >
                          <option value="">Farmer</option>
                          {farmers.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.title}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.productPrice}
                          onChange={(e) => updateField(item.id, "productPrice", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-slate-800 text-white text-xs text-right outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.salePrice}
                          onChange={(e) => updateField(item.id, "salePrice", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-slate-800 text-white text-xs text-right outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="1"
                          value={item.productStock}
                          onChange={(e) => updateField(item.id, "productStock", parseInt(e.target.value, 10) || 0)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-slate-800 text-white text-xs text-right outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.wholesalePrice}
                          onChange={(e) => updateField(item.id, "wholesalePrice", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-slate-800 text-white text-xs text-right outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="1"
                          value={item.wholesaleQty}
                          onChange={(e) => updateField(item.id, "wholesaleQty", parseInt(e.target.value, 10) || 0)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-slate-800 text-white text-xs text-right outline-none"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={item.isActive}
                          onChange={(e) => updateField(item.id, "isActive", e.target.checked)}
                          className="h-4 w-4 rounded border-white/30 bg-slate-800 text-cyan-400 cursor-pointer"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.attributes["Color"] || ""}
                          onChange={(e) => updateAttribute(item.id, "Color", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-slate-800 text-white text-xs outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.attributes["Size"] || ""}
                          onChange={(e) => updateAttribute(item.id, "Size", e.target.value)}
                          className="w-full px-2 py-1 rounded border border-white/20 bg-slate-800 text-white text-xs outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-white/60">
            Editing {selectedCount} product(s) with all 30 single-product fields
          </div>
          <div className="flex items-center gap-3">
            <LiquidGlassButton
              type="button"
              variant="neutral"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </LiquidGlassButton>
            <LiquidGlassButton
              type="button"
              variant="cyan"
              onClick={handleSaveAll}
              disabled={isPending || dirtyCount === 0}
              leftIcon={isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            >
              {isPending ? "Saving..." : `Save All Changes (${dirtyCount})`}
            </LiquidGlassButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
