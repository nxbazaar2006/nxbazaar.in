"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import React from "react";

export function DataTableViewOptions({ table }: { table: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="dashboard-submit-action liquid-glass-control liquid-glass-primary ml-auto hidden h-9 min-h-9 items-center gap-2 rounded-full py-1 pl-4 pr-3.5 text-xs font-semibold !text-white shadow-sm backdrop-blur-xl transition-all duration-300 hover:opacity-85 hover:scale-[1.01] lg:flex [&_*]:!text-white [&_svg]:!stroke-white"
        >
          <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />
          <MixerHorizontalIcon className="h-3.5 w-3.5 text-white" />
          <span className="liquid-glass-content text-xs font-semibold text-white">View</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-2xl border border-white/30 bg-white/85 p-2 backdrop-blur-2xl shadow-xl dark:border-white/15 dark:bg-slate-900/90"
      >
        <DropdownMenuLabel className="px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200">
          Toggle columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/20 dark:bg-white/10" />
        {table
          .getAllColumns()
          .filter(
            (column: any) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column: any) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="rounded-lg pl-8 pr-3 py-1.5 text-xs capitalize text-slate-700 hover:bg-cyan-500/8 hover:text-cyan-600 dark:text-slate-200 dark:hover:bg-cyan-400/10 cursor-pointer transition-colors duration-200"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              <span>{column.id}</span>
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
