"use client";

import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { Checkbox } from "@/components/ui/checkbox";
import type { HsnTableRow } from "@/types/hsn";
import type { Column, ColumnDef } from "@tanstack/react-table";
import React from "react";

function pct(value: number | null | undefined) {
  return value === null || value === undefined ? "-" : `${value}%`;
}

function HeaderText({
  title,
  className = "text-slate-800",
}: {
  title: string;
  className?: string;
}) {
  return <span className={`text-base font-bold ${className}`}>{title}</span>;
}

function SortHeader({
  column,
  title,
  className,
}: {
  column: Column<HsnTableRow, unknown>;
  title: string;
  className: string;
}) {
  return (
    <div className={className}>
      <SortableColumn column={column} title={title} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "ACTIVE"
      ? "bg-green-100 text-green-700"
      : status === "INACTIVE"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-slate-100 text-slate-700";
  return <span className={`rounded-md px-2 py-1 text-xs font-medium ${className}`}>{status}</span>;
}

export function getHsnColumns({ canDelete }: { canDelete: boolean }): ColumnDef<HsnTableRow>[] {
  return [
    {
      id: "select",
      header: () => null,
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label={`Select HSN ${row.original.code}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <SortHeader column={column} title="HSN Code" className="text-indigo-700" />
      ),
      cell: ({ row }) => <span className="font-medium text-slate-900">{row.original.code}</span>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <SortHeader column={column} title="Description" className="text-emerald-700" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[320px] truncate text-slate-700">{row.original.description}</div>
      ),
    },
    {
      accessorKey: "chapter",
      header: ({ column }) => (
        <SortHeader column={column} title="Chapter" className="text-sky-700" />
      ),
      cell: ({ row }) => row.original.chapter ?? "-",
    },
    {
      accessorKey: "gstRate",
      header: ({ column }) => (
        <SortHeader column={column} title="GST Rate" className="text-lime-700" />
      ),
      cell: ({ row }) => pct(row.original.gstRate),
    },
    {
      accessorKey: "igstRate",
      header: () => <HeaderText title="IGST" className="text-violet-700" />,
      cell: ({ row }) => pct(row.original.igstRate),
    },
    {
      accessorKey: "cessRate",
      header: () => <HeaderText title="Cess" className="text-red-700" />,
      cell: ({ row }) => pct(row.original.cessRate),
    },
    {
      accessorKey: "uqc",
      header: () => <HeaderText title="UQC" className="text-cyan-700" />,
      cell: ({ row }) => row.original.uqc ?? "-",
    },
    {
      accessorKey: "taxType",
      header: () => <HeaderText title="Tax Type" className="text-teal-700" />,
    },
    {
      id: "status",
      accessorFn: (row) => row.status,
      header: () => <HeaderText title="Status" className="text-green-700" />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "updatedAt",
      header: () => <HeaderText title="Updated At" className="text-slate-700" />,
      cell: ({ row }) => <DateColumn row={row} accessorKey="updatedAt" />,
    },
    {
      id: "actions",
      header: () => <HeaderText title="Actions" className="text-fuchsia-700" />,
      cell: ({ row }) => (
        <ActionColumn
          row={row}
          title="HSN Code"
          editEndpoint={`hsn-codes/${row.original.id}/edit`}
          endpoint={`hsn-codes/${row.original.id}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export const columns = getHsnColumns({ canDelete: false });
