"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";

type DataTableMeta = {
  className?: string;
};

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowId?: (row: TData) => string;
  initialPageSize?: number;
  filterKeys?: string[];
  filterOptions?: Array<{
    columnId: string;
    label: string;
    options: Array<{ label: string; value: string }>;
  }>;
  toolbarActions?: (table: TanStackTable<TData>) => React.ReactNode;
  headerSlot?: React.ReactNode;
};

export default function DataTable<TData, TValue>({
  columns,
  data,
  getRowId,
  initialPageSize,
  filterKeys = [],
  filterOptions = [],
  toolbarActions,
  headerSlot,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const multiColumnGlobalFilter = React.useMemo<FilterFn<TData>>(
    () => (row, _columnId, filterValue) => {
      const search = String(filterValue ?? "").trim().toLowerCase();

      if (!search) return true;

      const keys =
        filterKeys.length > 0
          ? filterKeys
          : row.getAllCells().map((cell) => cell.column.id);

      return keys.some((key) => {
        const value = row.getValue(key);
        return String(value ?? "").toLowerCase().includes(search);
      });
    },
    [filterKeys],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    getRowId,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: multiColumnGlobalFilter,
    initialState: {
      pagination: {
        pageSize: initialPageSize ?? 10,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="liquid-glass-data-table data-table-glass space-y-4">
      {headerSlot ? (
        <div className="dashboard-header-glass">
          {headerSlot}
          <div className="dashboard-search-row">
            <DataTableToolbar
              table={table}
              filterKeys={filterKeys}
              filterOptions={filterOptions}
              toolbarActions={toolbarActions}
            />
          </div>
        </div>
      ) : (
        <DataTableToolbar
          table={table}
          filterKeys={filterKeys}
          filterOptions={filterOptions}
          toolbarActions={toolbarActions}
        />
      )}

      <div className="liquid-card liquid-glass data-table-panel overflow-hidden rounded-[28px] rounded-bl-[20px] rounded-br-[20px] md:rounded-bl-[28px] md:rounded-br-[28px] xl:rounded-bl-[32px] xl:rounded-br-[32px]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-xl">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | DataTableMeta
                    | undefined;

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={meta?.className}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | DataTableMeta
                      | undefined;

                    return (
                      <TableCell key={cell.id} className={cn(meta?.className)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
