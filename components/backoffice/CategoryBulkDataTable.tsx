"use client";

import { columns } from "@/app/(back-office)/dashboard/(catalogue)/categories/columns";
import BulkCatalogueActions from "@/components/backoffice/BulkCatalogueActions";
import DataTable from "@/components/data-table-components/DataTable";

type HsnOption = { id: string; code: string; description?: string | null };

export default function CategoryBulkDataTable({
  categories,
  hsnCodeOptions,
  hsnOptions,
}: {
  categories: unknown[];
  hsnCodeOptions: HsnOption[];
  hsnOptions: Array<{ label: string; value: string }>;
}) {
  return (
    <DataTable
      data={categories}
      columns={columns}
      filterKeys={["title", "slug", "hsnCode", "taxType", "status"]}
      filterOptions={[
        {
          columnId: "status",
          label: "All Status",
          options: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ],
        },
        {
          columnId: "hsnCode",
          label: "All HSN",
          options: hsnOptions,
        },
      ]}
      toolbarActions={(table) => (
        <BulkCatalogueActions
          table={table}
          entityLabel="Categories"
          endpoint="categories"
          hsnOptions={hsnCodeOptions}
          allowHsnEdit
        />
      )}
    />
  );
}
