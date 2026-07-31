"use client";

import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import ImageColumn from "@/components/DataTableColumns/ImageColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { ProductQrActions } from "@/components/products/qr/product-qr-actions";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";

const formatCurrency = (value: any) =>
  value === null || value === undefined ? "—" : `₹${Number(value).toFixed(2)}`;

function effectiveHsn(row: any) {
  return row.hsnCode ?? row.subCategory?.hsnCode ?? row.category?.hsnCode ?? null;
}

export const columns: ColumnDef<any>[] = [
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
    accessorKey: "title",
    header: ({ column }) => <SortableColumn column={column} title="Product Title" />,
    cell: ({ row }) => (
      <span className="font-medium capitalize">{row.original.title}</span>
    ),
  },
  {
    accessorKey: "productCode",
    header: "Product Code",
    cell: ({ row }) => row.original.productCode || "—",
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => row.original.sku || "—",
  },
  {
    id: "category",
    accessorFn: (row) => row.category?.title ?? "",
    header: "Category",
    cell: ({ getValue }) => (getValue() as string) || "—",
  },
  {
    id: "subCategory",
    accessorFn: (row) => row.subCategory?.title ?? "",
    header: "Subcategory",
    cell: ({ getValue }) => (getValue() as string) || "—",
  },
  {
    id: "hsnCode",
    accessorFn: (row) => effectiveHsn(row)?.code ?? "",
    header: "HSN Code",
    cell: ({ row }) => effectiveHsn(row.original)?.code || "—",
  },
  {
    id: "hsnDescription",
    accessorFn: (row) => effectiveHsn(row)?.description ?? "",
    header: "HSN Description",
    cell: ({ row }) =>
      effectiveHsn(row.original)?.title ||
      effectiveHsn(row.original)?.description ||
      "—",
  },
  {
    id: "gstRate",
    accessorFn: (row) => effectiveHsn(row)?.gstRate ?? "",
    header: "GST Rate",
    cell: ({ row }) => {
      const rate = effectiveHsn(row.original)?.gstRate;
      return rate === null || rate === undefined ? "—" : `${rate}%`;
    },
  },

  {
    id: "totalStock",
    header: "Total Stock",
    cell: ({ row }) => row.original.totalStock ?? row.original.productStock ?? 0,
  },
  {
    id: "priceRange",
    header: "Price Range",
    cell: ({ row }) => {
      const product = row.original;
      if (product.productType !== "VARIABLE") return formatCurrency(product.salePrice);
      if (
        product.minVariantPrice === null ||
        product.minVariantPrice === undefined
      )
        return "—";
      if (product.minVariantPrice === product.maxVariantPrice)
        return formatCurrency(product.minVariantPrice);
      return `${formatCurrency(product.minVariantPrice)} – ${formatCurrency(
        product.maxVariantPrice
      )}`;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2 py-1 text-xs ${
          row.original.isActive
            ? "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {row.original.isActive ? "Active" : "Draft"}
      </span>
    ),
  },
  {
    id: "qrCode",
    header: "QR Code",
    cell: ({ row }) => <ProductQrActions product={row.original} buttonVariant="icon" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <ActionColumn
          row={row}
          title="Product"
          editEndpoint={`products/update/${product.id}`}
          endpoint={`products/${product.id}`}
          historyEndpoint={`products/${product.id}/history`}
        />
      );
    },
  },
];
