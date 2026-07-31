"use client";

import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

function effectiveHsn(row: any) {
  if (row.hsnCode) return { hsn: row.hsnCode, source: "SUBCATEGORY" };
  if (row.category?.hsnCode) return { hsn: row.category.hsnCode, source: "CATEGORY" };
  return { hsn: null, source: "NOT ASSIGNED" };
}

function SourceBadge({ source }: { source: string }) {
  const className =
    source === "SUBCATEGORY"
      ? "bg-lime-100 text-lime-700"
      : source === "CATEGORY"
      ? "bg-blue-100 text-blue-700"
      : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${className}`}>{source}</span>;
}

export const columns = [
  {
    id: "select",
    header: () => null,
    cell: ({ row }: any) => (
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
    accessorKey: "title",
    header: ({ column }: any) => <SortableColumn column={column} title="Subcategory Title" />,
  },
  {
    id: "categoryName",
    accessorFn: (row: any) => row.category?.title ?? "",
    header: "Parent Category",
    cell: ({ row }: any) => <span>{row.original.category?.title ?? "-"}</span>,
  },
  {
    id: "hsnCode",
    accessorFn: (row: any) => effectiveHsn(row).hsn?.code ?? "",
    header: "Effective HSN",
    cell: ({ row }: any) => <span>{effectiveHsn(row.original).hsn?.code ?? "-"}</span>,
  },
  {
    id: "hsnSource",
    accessorFn: (row: any) => effectiveHsn(row).source,
    header: "HSN Source",
    cell: ({ row }: any) => <SourceBadge source={effectiveHsn(row.original).source} />,
  },
  {
    id: "gstRate",
    accessorFn: (row: any) => effectiveHsn(row).hsn?.gstRate ?? "",
    header: "GST Rate",
    cell: ({ row }: any) => {
      const gstRate = effectiveHsn(row.original).hsn?.gstRate;
      return <span>{gstRate === null || gstRate === undefined ? "-" : `${gstRate}%`}</span>;
    },
  },
  {
    id: "taxType",
    accessorFn: (row: any) => effectiveHsn(row).hsn?.taxType ?? "",
    header: "Tax Type",
    cell: ({ row }: any) => <span>{effectiveHsn(row.original).hsn?.taxType ?? "-"}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }: any) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "status",
    accessorFn: (row: any) => (row.isActive ? "Active" : "Inactive"),
    header: "Status",
    cell: ({ row }: any) => (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${
          row.original.isActive
            ? "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const subCategory = row.original;
      return (
        <ActionColumn
          row={row}
          title="Subcategory"
          editEndpoint={`subcategories/update/${subCategory.id}`}
          endpoint={`subcategories/${subCategory.id}`}
        />
      );
    },
  },
];
