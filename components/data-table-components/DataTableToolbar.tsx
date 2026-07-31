"use client";

import { GlassButton, GlassInput, GlassSelect } from "@/components/ui/glass-controls";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { DataTableViewOptions } from "./DataTableViewOptions";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  filterKeys?: string[];
  filterOptions?: Array<{
    columnId: string;
    label: string;
    options: Array<{ label: string; value: string }>;
  }>;
  toolbarActions?: (table: Table<TData>) => React.ReactNode;
};

export function DataTableToolbar<TData>({
  table,
  filterOptions = [],
  toolbarActions,
}: DataTableToolbarProps<TData>) {
  const globalFilter = table.getState().globalFilter ?? "";
  const columnFilters = table.getState().columnFilters;
  const isFiltered = globalFilter !== "" || columnFilters.length > 0;

  const handleResetClick = () => {
    table.setGlobalFilter("");
    table.resetColumnFilters();
  };

  return (
    <div className="data-table-toolbar flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <GlassInput
          placeholder="Search"
          value={globalFilter}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="w-full sm:w-[320px]"
        />
        {isFiltered && (
          <GlassButton
            variant="ghost"
            onClick={handleResetClick}
            className="px-5"
          >
            Reset <Cross2Icon className="ml-2 h-4 w-4" />
          </GlassButton>
        )}
        {filterOptions.map((filter) => {
          const column = table.getColumn(filter.columnId);

          if (!column) return null;

          return (
            <GlassSelect
              key={filter.columnId}
              value={String(column.getFilterValue() ?? "")}
              onChange={(event) =>
                column.setFilterValue(event.target.value || undefined)
              }
              className="w-full sm:w-[180px]"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </GlassSelect>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {toolbarActions ? toolbarActions(table) : null}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
