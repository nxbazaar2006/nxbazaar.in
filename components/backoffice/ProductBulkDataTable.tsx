"use client";

import { columns } from "@/app/(back-office)/dashboard/(catalogue)/products/columns";
import ProductInlineBulkEditorModal from "@/components/backoffice/ProductInlineBulkEditorModal";
import DataTable from "@/components/data-table-components/DataTable";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";

type OptionItem = { id: string; title: string };
type SubCategoryOption = { id: string; title: string; categoryId: string };
type HsnOption = { id: string; code: string; description?: string | null };

export default function ProductBulkDataTable({
  products,
  hsnCodeOptions = [],
  categories = [],
  subCategories = [],
  brands = [],
  farmers = [],
}: {
  products: unknown[];
  hsnCodeOptions?: HsnOption[];
  categories?: OptionItem[];
  subCategories?: SubCategoryOption[];
  brands?: OptionItem[];
  farmers?: OptionItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <DataTable
      data={products}
      columns={columns}
      toolbarActions={(table) => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const selectedIds = selectedRows.map((row) => (row.original as { id: string }).id);
        const selectedCount = selectedIds.length;

        if (selectedCount === 0) return null;

        function handleDelete() {
          if (!window.confirm(`Delete ${selectedCount} selected product(s)?`)) return;
          startTransition(async () => {
            try {
              const res = await fetch("/api/products/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds }),
              });
              const result = await res.json();
              if (!res.ok || result.success === false) {
                throw new Error(result.message || "Bulk delete failed.");
              }
              toast.success(result.message || "Products deleted successfully.");
              table.resetRowSelection();
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Bulk delete failed.");
            }
          });
        }

        return (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedCount} selected
            </span>

            <ProductInlineBulkEditorModal
              table={table}
              categories={categories}
              subCategories={subCategories}
              brands={brands}
              farmers={farmers}
            />

            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Delete Selected
            </Button>
          </div>
        );
      }}
    />
  );
}
