"use client";

import React, { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Barcode, Check, Copy, Minus, Plus, Printer, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import DataTable from "@/components/data-table-components/DataTable";
import ImageColumn from "@/components/DataTableColumns/ImageColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { BarcodePrintModal } from "./barcode-print-modal";
import { PrintableBarcodeItem } from "./barcode-sheet-printable";

export type VariantSearchRecord = {
  id: string;
  productId: string;
  productTitle: string;
  variantTitle?: string;
  productCode: string;
  sku: string;
  barcode: string;
  price: number;
  stock: number;
  imageUrl?: string;
};

type BarcodeManagementViewProps = {
  initialVariants?: VariantSearchRecord[];
};

export function BarcodeManagementView({ initialVariants = [] }: BarcodeManagementViewProps) {
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean;
    items: PrintableBarcodeItem[];
    isReprint?: boolean;
  }>({
    isOpen: false,
    items: [],
    isReprint: false,
  });

  function updateQuantity(id: string, delta: number) {
    setQuantityMap((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  }

  function handleCopy(text: string, id: string) {
    if (!text || text === "—") return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Copied Barcode: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleSinglePrint(variant: VariantSearchRecord, isReprint = false) {
    const qty = quantityMap[variant.id] || 1;
    setPrintModalState({
      isOpen: true,
      items: [
        {
          id: variant.id,
          barcode: variant.barcode,
          sku: variant.sku,
          productCode: variant.productCode,
          productTitle: variant.productTitle,
          variantTitle: variant.variantTitle,
          quantity: qty,
        },
      ],
      isReprint,
    });
  }

  function handleBulkPrint(records: VariantSearchRecord[]) {
    if (records.length === 0) {
      toast.error("Please select at least one variant to print barcodes.");
      return;
    }

    const items: PrintableBarcodeItem[] = records.map((v) => ({
      id: v.id,
      barcode: v.barcode,
      sku: v.sku,
      productCode: v.productCode,
      productTitle: v.productTitle,
      variantTitle: v.variantTitle,
      quantity: quantityMap[v.id] || 1,
    }));

    setPrintModalState({
      isOpen: true,
      items,
      isReprint: false,
    });
  }

  const columns = useMemo<ColumnDef<VariantSearchRecord>[]>(
    () => [
      {
        id: "select",
        header: () => null,
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "imageUrl",
        header: "Product Image",
        cell: ({ row }) => (
          <ImageColumn row={row} accessorKey="imageUrl" imageUrl={row.original.imageUrl} />
        ),
      },
      {
        accessorKey: "productTitle",
        header: ({ column }) => <SortableColumn column={column} title="Product / Variant" />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium capitalize text-white">{row.original.productTitle}</span>
            {row.original.variantTitle ? (
              <span className="text-xs font-medium text-cyan-400">
                Variant: {row.original.variantTitle}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "productCode",
        header: "Product Code",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-300">
            {row.original.productCode || "—"}
          </span>
        ),
      },
      {
        accessorKey: "sku",
        header: ({ column }) => <SortableColumn column={column} title="SKU" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-200">
            {row.original.sku || "—"}
          </span>
        ),
      },
      {
        accessorKey: "barcode",
        header: ({ column }) => <SortableColumn column={column} title="12-Digit Barcode" />,
        cell: ({ row }) => {
          const barcode = row.original.barcode;
          const isCopied = copiedId === row.original.id;
          return (
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-300">
              <Barcode className="h-3.5 w-3.5 text-cyan-400" />
              <span>{barcode || "—"}</span>
              {barcode && barcode !== "—" ? (
                <button
                  type="button"
                  onClick={() => handleCopy(barcode, row.original.id)}
                  title="Copy Barcode"
                  className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white transition"
                >
                  {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "stock",
        header: ({ column }) => <SortableColumn column={column} title="Stock" />,
        cell: ({ row }) => {
          const stock = row.original.stock;
          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                stock > 0
                  ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                  : "border border-red-500/30 bg-red-500/15 text-red-300"
              }`}
            >
              {stock}
            </span>
          );
        },
      },
      {
        id: "quantity",
        header: "Print Qty",
        cell: ({ row }) => {
          const qty = quantityMap[row.original.id] || 1;
          return (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateQuantity(row.original.id, -1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-xs font-bold text-white">{qty}</span>
              <button
                type="button"
                onClick={() => updateQuantity(row.original.id, 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSinglePrint(row.original, false)}
              className="h-8 gap-1 border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 text-xs"
              title="Print Label"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSinglePrint(row.original, true)}
              className="h-8 gap-1 text-white/70 hover:bg-white/10 hover:text-white text-xs"
              title="Reprint Label"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reprint
            </Button>
          </div>
        ),
      },
    ],
    [quantityMap, copiedId],
  );

  return (
    <div className="overflow-hidden rounded-bl-[20px] rounded-br-[20px] md:rounded-bl-[28px] md:rounded-br-[28px] xl:rounded-bl-[32px] xl:rounded-br-[32px]">
      {/* Header */}
      <PageHeader heading="Barcode Management" />

      <div className="py-0">
        <DataTable
          data={initialVariants}
          columns={columns}
          filterKeys={["productTitle", "variantTitle", "barcode", "sku", "productCode"]}
          toolbarActions={(table) => {
            const selectedRows = table.getFilteredSelectedRowModel().rows;
            const selectedCount = selectedRows.length;
            if (selectedCount === 0) return null;

            const totalCopies = selectedRows.reduce((sum, r) => {
              const v = r.original;
              return sum + (quantityMap[v.id] || 1);
            }, 0);

            return (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-cyan-300">
                  {selectedCount} selected ({totalCopies} labels)
                </span>
                <Button
                  size="sm"
                  onClick={() => handleBulkPrint(selectedRows.map((r) => r.original))}
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-400 hover:to-blue-500"
                >
                  <Printer className="h-4 w-4" /> Print Selected ({totalCopies} Labels)
                </Button>
              </div>
            );
          }}
        />
      </div>

      <BarcodePrintModal
        isOpen={printModalState.isOpen}
        onClose={() => setPrintModalState({ isOpen: false, items: [] })}
        items={printModalState.items}
        isReprint={printModalState.isReprint}
      />
    </div>
  );
}
