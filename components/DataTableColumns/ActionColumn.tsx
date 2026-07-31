import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

import DeleteBtn from "../Actions/DeleteBtn";
import EditBtn from "../Actions/EditBtn";

export default function ActionColumn({
  row,
  title,
  endpoint,
  editEndpoint,
  historyEndpoint,
}: {
  row: any;
  title: string;
  endpoint: string;
  editEndpoint: string;
  historyEndpoint?: string;
}) {
  const isActive = row.isActive;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 bg-white/40 text-slate-700 backdrop-blur-xl shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:border-cyan-400/60 hover:bg-white/80 hover:text-cyan-600 dark:border-white/15 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800/80 transition-all duration-200"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-h-40 w-50 rounded-3xl border border-white/30 bg-white/80 p-5 backdrop-blur-2xl shadow-2xl dark:border-white/15 dark:bg-slate-900/90"
      >
        <DropdownMenuLabel className="px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/20 dark:bg-white/10" />
        <div className="flex flex-col gap-3">
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
            <EditBtn title={title} editEndpoint={editEndpoint} />
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
            <DeleteBtn title={title} endpoint={endpoint} />
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
