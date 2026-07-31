import type { Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

type SortableColumnProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
};

export default function SortableColumn<TData, TValue>({
  column,
  title,
}: SortableColumnProps<TData, TValue>) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          column.toggleSorting(column.getIsSorted() === "asc");
        }
      }}
      className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-md text-base font-semibold capitalize text-inherit outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-cyan-300/70"
    >
      {title}
      <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
    </span>
  );
}
