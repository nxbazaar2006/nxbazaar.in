"use client";

import { columns } from "@/app/(back-office)/dashboard/(catalogue)/subcategories/columns";
import BulkCatalogueActions from "@/components/backoffice/BulkCatalogueActions";
import DataTable from "@/components/data-table-components/DataTable";

type HsnOption = { id: string; code: string; description?: string | null };

export default function SubCategoryBulkDataTable({
  subCategories,
  hsnCodeOptions,
  categoryOptions,
  hsnOptions,
}: {
  subCategories: unknown[];
  hsnCodeOptions: HsnOption[];
  categoryOptions: Array<{ label: string; value: string }>;
  hsnOptions: Array<{ label: string; value: string }>;
}) {
  return (
    <DataTable
      data={subCategories}
      columns={columns}
      filterKeys={["title", "categoryName", "hsnCode", "taxType", "status"]}
      filterOptions={[
        {
          columnId: "status",
          label: "All Status",
          options: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ],
        },
        { columnId: "categoryName", label: "All Categories", options: categoryOptions },
        { columnId: "hsnCode", label: "All HSN", options: hsnOptions },
      ]}
      toolbarActions={(table) => (
        <BulkCatalogueActions
          table={table}
          entityLabel="Subcategories"
          endpoint="subcategories"
          hsnOptions={hsnCodeOptions}
          allowHsnEdit
        />
      )}
    />
  );
}
