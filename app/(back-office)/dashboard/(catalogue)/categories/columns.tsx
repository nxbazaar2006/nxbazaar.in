"use client";

import { Checkbox } from "@/components/ui/checkbox";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import ImageColumn from "@/components/DataTableColumns/ImageColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import type { ColumnDef } from "@tanstack/react-table";

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
    header: "Category Image",
    cell: ({ row }) => <ImageColumn row={row} accessorKey="imageUrl" />,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <SortableColumn column={column} title="Category Title" />,
  },
  {
    accessorKey: "slug",
    header: ({ column }) => <SortableColumn column={column} title="Slug" />,
  },
  {
    id: "status",
    accessorFn: (row) => (row.isActive ? "Active" : "Inactive"),
    header: "Status",
    cell: ({ row }) => <span>{row.original.isActive ? "Active" : "Inactive"}</span>,
  },
  {
    id: "hsnCode",
    accessorFn: (row) => row.hsnCode?.code ?? "",
    header: "HSN Code",
    cell: ({ row }) => <span>{row.original.hsnCode?.code ?? "Not Assigned"}</span>,
  },
  {
    id: "gstRate",
    accessorFn: (row) => row.hsnCode?.gstRate ?? "",
    header: "GST Rate",
    cell: ({ row }) =>
      row.original.hsnCode ? <span>{row.original.hsnCode.gstRate}%</span> : "-",
  },
  {
    id: "taxType",
    accessorFn: (row) => row.hsnCode?.taxType ?? "",
    header: "Tax Type",
    cell: ({ row }) => <span>{row.original.hsnCode?.taxType ?? "-"}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <ActionColumn
          row={row}
          title="Category"
          editEndpoint={`categories/update/${category.id}`}
          endpoint={`categories/${category.id}`}
        />
      );
    },
  },
];