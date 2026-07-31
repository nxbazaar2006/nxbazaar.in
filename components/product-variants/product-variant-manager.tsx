"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table";
import {
  Archive,
  Boxes,
  Edit3,
  GripVertical,
  ImageIcon,
  Layers3,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Wand2,
} from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  bulkDelete,
  bulkUpdate,
  createAttribute,
  generateVariants,
  updateVariant,
} from "@/actions/product-variants";
import DataTable from "@/components/data-table-components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlassButton } from "@/components/ui/glass-controls";
import { cn } from "@/lib/utils";
import {
  attributeInputSchema,
  generateVariantsSchema,
  variantInputSchema,
  type AttributeInput,
  type GenerateVariantsInput,
  type ProductAttributeInput,
  type VariantInput,
} from "@/lib/validations/product-variants";

type ProductVariantManagerProps = {
  product: any;
  hsnCodes: Array<{ id: string; code: string; description?: string | null; gstRate?: number | null }>;
};

const inputClass =
  "w-full rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/15";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/65";

function money(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number.toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "-";
}

function percent(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return `${Number(value).toFixed(2)}%`;
}

function defaultAttribute(product: any): AttributeInput {
  return {
    name: "",
    inputType: "SELECT",
    isVariant: true,
    isFilterable: true,
    isRequired: false,
    isActive: true,
    position: product?.attributes?.length ?? 0,
    values: [{ value: "", position: 0, isActive: true }],
  };
}

function attributeToInput(attribute: any): ProductAttributeInput {
  return {
    id: attribute.id,
    name: attribute.name,
    slug: attribute.slug,
    position: attribute.position ?? 0,
    isVariant: attribute.isVariant !== false,
    values: (attribute.values ?? []).map((value: any, index: number) => ({
      id: value.id,
      value: value.value,
      slug: value.slug,
      colorCode: value.colorCode,
      imageUrl: value.imageUrl,
      position: value.position ?? index,
      isActive: value.isActive !== false,
    })),
  };
}

function variantToInput(productId: string, variant?: any): VariantInput {
  return {
    id: variant?.id,
    productId,
    title: variant?.title ?? "",
    sku: variant?.sku ?? "",
    barcode: variant?.barcode ?? "",
    productCode: variant?.productCode ?? "",
    price: variant?.price ?? 0,
    comparePrice: variant?.comparePrice ?? 0,
    costPrice: variant?.costPrice ?? 0,
    stock: variant?.stock ?? 0,
    reservedStock: variant?.reservedStock ?? 0,
    incomingStock: variant?.incomingStock ?? 0,
    lowStockAt: variant?.lowStockAt ?? 5,
    weight: variant?.weight ?? null,
    length: variant?.length ?? null,
    width: variant?.width ?? null,
    height: variant?.height ?? null,
    imageUrl: variant?.imageUrl ?? "",
    status: variant?.status ?? (variant?.isActive === false ? "INACTIVE" : "ACTIVE"),
    taxClass: variant?.taxClass ?? "TAXABLE",
    hsnCodeId: variant?.hsnCodeId ?? "",
    gstRate: variant?.gstRate ?? null,
    isDefault: Boolean(variant?.isDefault),
    isActive: variant?.isActive !== false,
    values: variant?.values ?? [],
    inventory: variant?.variantInventories ?? [],
    images: variant?.images ?? [],
  };
}

function AttributeBuilder({
  product,
  attributes,
  onAttributesChange,
}: {
  product: any;
  attributes: ProductAttributeInput[];
  onAttributesChange: (attributes: ProductAttributeInput[]) => void;
}) {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const form = useForm<AttributeInput>({
    resolver: zodResolver(attributeInputSchema) as any,
    defaultValues: defaultAttribute(product),
  });
  const values = useFieldArray({ control: form.control, name: "values" });

  function reorder(from: number, to: number) {
    const next = [...attributes];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onAttributesChange(next.map((attribute, index) => ({ ...attribute, position: index })));
  }

  async function submit(input: AttributeInput) {
    const result = await createAttribute({
      ...input,
      position: attributes.length,
      values: input.values.map((value, index) => ({ ...value, position: index })),
    });
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    onAttributesChange([...attributes, attributeToInput({ ...input, values: input.values, position: attributes.length })]);
    form.reset(defaultAttribute(product));
  }

  return (
    <section className="liquid-card rounded-[28px] p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Product Attributes</h2>
          <p className="text-sm text-white/60">Dynamic variant and descriptive attributes with unlimited values.</p>
        </div>
        <Badge className="bg-white/10 text-white">{attributes.length} attributes</Badge>
      </div>

      <div className="space-y-2">
        {attributes.map((attribute, index) => (
          <div
            key={`${attribute.slug}-${index}`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) reorder(dragIndex, index);
              setDragIndex(null);
            }}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2.5"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-white/45" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white">{attribute.name}</span>
                {attribute.isVariant ? <Badge className="bg-emerald-400/15 text-emerald-200">Variant</Badge> : null}
              </div>
              <div className="mt-1 text-xs text-white/55">
                {attribute.values.map((value) => value.value).join(", ")}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(submit as any)} className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-black/15 p-4">
        <div className="grid gap-3 md:grid-cols-[1.2fr_.8fr_.8fr]">
          <label>
            <span className={labelClass}>Attribute</span>
            <input className={inputClass} placeholder="Color, Size, RAM" {...form.register("name")} />
          </label>
          <label>
            <span className={labelClass}>Input Type</span>
            <select className={inputClass} {...form.register("inputType")}>
              {["SELECT", "MULTI_SELECT", "TEXT", "NUMBER", "BOOLEAN"].map((item) => (
                <option key={item} value={item} className="bg-slate-950">
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-3 gap-2 pt-6 text-xs text-white/70">
            <label className="flex items-center gap-2"><input type="checkbox" {...form.register("isVariant")} /> Variant</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...form.register("isRequired")} /> Required</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...form.register("isActive")} /> Active</label>
          </div>
        </div>

        <div className="space-y-2">
          {values.fields.map((field, index) => (
            <div key={field.id} className="grid gap-2 md:grid-cols-[1fr_140px_44px]">
              <input className={inputClass} placeholder="Value" {...form.register(`values.${index}.value`)} />
              <input className={inputClass} placeholder="#000000" {...form.register(`values.${index}.colorCode`)} />
              <Button type="button" variant="ghost" size="icon" onClick={() => values.remove(index)} className="text-white">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between gap-2">
          <GlassButton type="button" onClick={() => values.append({ value: "", position: values.fields.length, isActive: true })}>
            <Plus className="mr-2 h-4 w-4" /> Value
          </GlassButton>
          <GlassButton type="submit">
            <Save className="mr-2 h-4 w-4" /> Save Attribute
          </GlassButton>
        </div>
      </form>
    </section>
  );
}

function VariantGenerator({
  product,
  attributes,
  hsnCodes,
  onDrafts,
}: {
  product: any;
  attributes: ProductAttributeInput[];
  hsnCodes: ProductVariantManagerProps["hsnCodes"];
  onDrafts: (drafts: any[]) => void;
}) {
  const form = useForm<GenerateVariantsInput>({
    resolver: zodResolver(generateVariantsSchema) as any,
    defaultValues: {
      productId: product.id,
      vendorCode: product.vendorCode,
      productCode: product.productCode,
      basePrice: 0,
      baseComparePrice: 0,
      baseCostPrice: 0,
      defaultStock: 0,
      lowStockAt: 5,
      taxClass: "TAXABLE",
      hsnCodeId: product.hsnCodeId ?? "",
      gstRate: product.hsnCode?.gstRate ?? null,
      attributes,
      persist: false,
    },
  });

  React.useEffect(() => {
    form.setValue("attributes", attributes);
  }, [attributes, form]);

  async function submit(input: GenerateVariantsInput, persist: boolean) {
    const result = await generateVariants({ ...input, persist });
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    onDrafts(Array.isArray(result.data) ? result.data : []);
  }

  return (
    <section className="liquid-card rounded-[28px] p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Variant Generator</h2>
          <p className="text-sm text-white/60">Creates the cartesian product of active variant attributes and skips duplicates.</p>
        </div>
        <Wand2 className="h-5 w-5 text-white/70" />
      </div>
      <form className="grid gap-3 lg:grid-cols-4" onSubmit={form.handleSubmit(((input) => submit(input as GenerateVariantsInput, false)) as any)}>
        {[
          ["basePrice", "Price"],
          ["baseComparePrice", "Compare"],
          ["baseCostPrice", "Cost"],
          ["defaultStock", "Stock"],
          ["lowStockAt", "Low Stock"],
          ["gstRate", "GST %"],
        ].map(([name, label]) => (
          <label key={name}>
            <span className={labelClass}>{label}</span>
            <input type="number" step="0.01" className={inputClass} {...form.register(name as any)} />
          </label>
        ))}
        <label>
          <span className={labelClass}>Tax Class</span>
          <select className={inputClass} {...form.register("taxClass")}>
            {["TAXABLE", "NIL_RATED", "EXEMPT", "NON_GST"].map((item) => <option key={item} className="bg-slate-950">{item}</option>)}
          </select>
        </label>
        <label>
          <span className={labelClass}>HSN</span>
          <select className={inputClass} {...form.register("hsnCodeId")}>
            <option value="" className="bg-slate-950">None</option>
            {hsnCodes.map((hsn) => <option key={hsn.id} value={hsn.id} className="bg-slate-950">{hsn.code}</option>)}
          </select>
        </label>
        <div className="flex items-end gap-2 lg:col-span-4">
          <GlassButton type="submit"><Wand2 className="mr-2 h-4 w-4" /> Preview</GlassButton>
          <GlassButton type="button" onClick={form.handleSubmit(((input) => submit(input as GenerateVariantsInput, true)) as any)}>
            <Save className="mr-2 h-4 w-4" /> Bulk Create
          </GlassButton>
        </div>
      </form>
    </section>
  );
}

function VariantEditorDialog({
  productId,
  hsnCodes,
  variant,
  open,
  onOpenChange,
}: {
  productId: string;
  hsnCodes: ProductVariantManagerProps["hsnCodes"];
  variant?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<VariantInput>({
    resolver: zodResolver(variantInputSchema) as any,
    values: variantToInput(productId, variant),
  });
  const images = useFieldArray({ control: form.control, name: "images" });
  const inventory = useFieldArray({ control: form.control, name: "inventory" });

  async function submit(input: VariantInput) {
    const result = await updateVariant(input);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-white/15 bg-slate-950/95 text-white">
        <DialogHeader><DialogTitle>{variant?.id ? "Edit Variant" : "Manual Variant"}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(submit as any)} className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["title", "Title", "text"],
              ["sku", "SKU", "text"],
              ["barcode", "Barcode", "text"],
              ["productCode", "Product Code", "text"],
              ["price", "Price", "number"],
              ["comparePrice", "Compare Price", "number"],
              ["costPrice", "Cost Price", "number"],
              ["stock", "Stock", "number"],
              ["reservedStock", "Reserved", "number"],
              ["incomingStock", "Incoming", "number"],
              ["lowStockAt", "Low Stock Alert", "number"],
              ["weight", "Weight", "number"],
              ["length", "Length", "number"],
              ["width", "Width", "number"],
              ["height", "Height", "number"],
              ["imageUrl", "Primary Image", "text"],
              ["gstRate", "GST Rate", "number"],
            ].map(([name, label, type]) => (
              <label key={name}>
                <span className={labelClass}>{label}</span>
                <input className={inputClass} type={type} step={type === "number" ? "0.01" : undefined} {...form.register(name as any)} />
              </label>
            ))}
            <label>
              <span className={labelClass}>Status</span>
              <select className={inputClass} {...form.register("status")}>
                {["ACTIVE", "INACTIVE", "ARCHIVED"].map((item) => <option key={item} className="bg-slate-950">{item}</option>)}
              </select>
            </label>
            <label>
              <span className={labelClass}>Tax Class</span>
              <select className={inputClass} {...form.register("taxClass")}>
                {["TAXABLE", "NIL_RATED", "EXEMPT", "NON_GST"].map((item) => <option key={item} className="bg-slate-950">{item}</option>)}
              </select>
            </label>
            <label>
              <span className={labelClass}>HSN Code</span>
              <select className={inputClass} {...form.register("hsnCodeId")}>
                <option value="" className="bg-slate-950">None</option>
                {hsnCodes.map((hsn) => <option key={hsn.id} value={hsn.id} className="bg-slate-950">{hsn.code} - {hsn.description}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Gallery</span>
                <Button type="button" size="sm" variant="ghost" className="text-white" onClick={() => images.append({ url: "", position: images.fields.length, isPrimary: images.fields.length === 0 })}>
                  <ImageIcon className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {images.fields.map((field, index) => (
                  <input key={field.id} className={inputClass} placeholder="Image URL" {...form.register(`images.${index}.url`)} />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Warehouses</span>
                <Button type="button" size="sm" variant="ghost" className="text-white" onClick={() => inventory.append({ warehouseCode: "", warehouseName: "", stock: 0, reservedStock: 0, incomingStock: 0, lowStockAt: 5 })}>
                  <Boxes className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {inventory.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 md:grid-cols-4">
                    <input className={inputClass} placeholder="Code" {...form.register(`inventory.${index}.warehouseCode`)} />
                    <input className={inputClass} placeholder="Name" {...form.register(`inventory.${index}.warehouseName`)} />
                    <input className={inputClass} type="number" placeholder="Stock" {...form.register(`inventory.${index}.stock`)} />
                    <input className={inputClass} type="number" placeholder="Reserved" {...form.register(`inventory.${index}.reservedStock`)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <GlassButton type="button" onClick={() => onOpenChange(false)}>Cancel</GlassButton>
            <GlassButton type="submit"><Save className="mr-2 h-4 w-4" /> Save Variant</GlassButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BulkVariantActions({ table, productId }: { table: TanStackTable<any>; productId: string }) {
  const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);

  async function setStatus(status: "ACTIVE" | "INACTIVE" | "ARCHIVED") {
    const result = await bulkUpdate({ productId, ids: selectedIds, data: { status } });
    result.success ? toast.success(result.message) : toast.error(result.message);
    table.resetRowSelection();
  }

  async function remove() {
    const result = await bulkDelete({ productId, ids: selectedIds });
    result.success ? toast.success(result.message) : toast.error(result.message);
    table.resetRowSelection();
  }

  return selectedIds.length ? (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-white/70">{selectedIds.length} selected</span>
      <GlassButton onClick={() => setStatus("ACTIVE")}><RotateCcw className="mr-2 h-4 w-4" /> Activate</GlassButton>
      <GlassButton onClick={() => setStatus("INACTIVE")}><Archive className="mr-2 h-4 w-4" /> Inactive</GlassButton>
      <GlassButton onClick={remove}><Trash2 className="mr-2 h-4 w-4" /> Delete</GlassButton>
    </div>
  ) : null;
}

function makeColumns(onEdit: (variant: any) => void): ColumnDef<any>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))} />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(Boolean(value))} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Variant",
      cell: ({ row }) => (
        <div className="min-w-[220px]">
          <div className="font-semibold text-white">{row.original.title}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {(row.original.values ?? []).map((value: any) => (
              <Badge key={`${value.attributeSlug}-${value.valueSlug}`} className="bg-white/10 text-white/75">
                {value.attribute}: {value.value}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "barcode", header: "Barcode" },
    { accessorKey: "productCode", header: "Product Code" },
    { accessorKey: "price", header: "Price", cell: ({ row }) => money(row.original.price) },
    { accessorKey: "comparePrice", header: "Compare", cell: ({ row }) => money(row.original.comparePrice) },
    { accessorKey: "costPrice", header: "Cost", cell: ({ row }) => money(row.original.costPrice) },
    { accessorKey: "stock", header: "Stock" },
    { accessorKey: "reservedStock", header: "Reserved" },
    { accessorKey: "availableStock", header: "Available" },
    { accessorKey: "incomingStock", header: "Incoming" },
    { accessorKey: "lowStockAt", header: "Low Alert" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={cn(row.original.status === "ACTIVE" ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-white/70")}>
          {row.original.status}
        </Badge>
      ),
    },
    { accessorKey: "taxClass", header: "Tax" },
    { accessorKey: "gstRate", header: "GST", cell: ({ row }) => percent(row.original.gstRate) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" className="text-white" onClick={() => onEdit(row.original)}>
          <Edit3 className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}

export default function ProductVariantManager({ product, hsnCodes }: ProductVariantManagerProps) {
  const [attributes, setAttributes] = React.useState<ProductAttributeInput[]>(() =>
    (product.attributes ?? []).map(attributeToInput),
  );
  const [drafts, setDrafts] = React.useState<any[]>([]);
  const [editingVariant, setEditingVariant] = React.useState<any | undefined>();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const rows = React.useMemo(() => [...drafts, ...(product.variants ?? [])], [drafts, product.variants]);
  const columns = React.useMemo(() => makeColumns((variant) => {
    setEditingVariant(variant);
    setDialogOpen(true);
  }), []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <AttributeBuilder product={product} attributes={attributes} onAttributesChange={setAttributes} />
        <VariantGenerator product={product} attributes={attributes} hsnCodes={hsnCodes} onDrafts={setDrafts} />
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Variants</h2>
            <p className="text-sm text-white/60">Search, filter, sort, select, bulk update, and manage warehouse stock.</p>
          </div>
          <GlassButton onClick={() => { setEditingVariant(undefined); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Manual Variant
          </GlassButton>
        </div>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id ?? row.sku}
          initialPageSize={50}
          filterKeys={["title", "sku", "barcode", "productCode", "status", "taxClass"]}
          filterOptions={[
            { columnId: "status", label: "All Status", options: ["ACTIVE", "INACTIVE", "ARCHIVED"].map((value) => ({ label: value, value })) },
            { columnId: "taxClass", label: "All Tax", options: ["TAXABLE", "NIL_RATED", "EXEMPT", "NON_GST"].map((value) => ({ label: value, value })) },
          ]}
          headerSlot={
            <div className="flex items-center gap-3">
              <Layers3 className="h-5 w-5 text-white/70" />
              <div>
                <div className="text-sm font-semibold text-white">Enterprise Variant Table</div>
                <div className="text-xs text-white/55">{rows.length} rows with sticky table shell, filters, sorting, pagination, and column visibility.</div>
              </div>
            </div>
          }
          toolbarActions={(table) => <BulkVariantActions table={table} productId={product.id} />}
        />
      </section>

      <VariantEditorDialog
        productId={product.id}
        hsnCodes={hsnCodes}
        variant={editingVariant}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
