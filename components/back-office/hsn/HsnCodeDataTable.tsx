"use client";

import { getHsnColumns } from "@/app/(back-office)/dashboard/hsn-codes/columns";
import BulkCatalogueActions from "@/components/backoffice/BulkCatalogueActions";
import { HsnBulkDeleteButton } from "@/components/back-office/hsn/HsnBulkDeleteButton";
import DataTable from "@/components/data-table-components/DataTable";
import type { HsnTableRow } from "@/types/hsn";
import type { ReactNode } from "react";

type HsnCodeDataTableProps = {
  rows: HsnTableRow[];
  canDelete: boolean;
  headerSlot?: ReactNode;
};

export function HsnCodeDataTable({
  rows,
  canDelete,
  headerSlot,
}: HsnCodeDataTableProps) {
  const columns = getHsnColumns({ canDelete });
  const statusOptions = Array.from(new Set(rows.map((row) => row.status))).map(
    (item) => ({ label: item, value: item }),
  );
  const taxTypeOptions = Array.from(new Set(rows.map((row) => row.taxType))).map(
    (item) => ({ label: item, value: item }),
  );
  const chapterOptions = Array.from(
    new Set(rows.map((row) => row.chapter).filter(Boolean)),
  ).map((item) => ({ label: String(item), value: String(item) }));

  return (
    <div className="space-y-3">
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        initialPageSize={100}
        filterKeys={["code", "description", "chapter", "taxType", "status"]}
        filterOptions={[
          { columnId: "status", label: "All Status", options: statusOptions },
          { columnId: "taxType", label: "All Tax Type", options: taxTypeOptions },
          { columnId: "chapter", label: "All Chapters", options: chapterOptions },
        ]}
        headerSlot={headerSlot}
        toolbarActions={(table) => (
          <div className="flex items-center gap-4">
            {table.getFilteredSelectedRowModel().rows.length > 0 ? (
              <span className="text-sm text-white/80">
                {table.getFilteredSelectedRowModel().rows.length} selected
              </span>
            ) : null}
            {canDelete ? <HsnBulkDeleteButton table={table} /> : null}
            {canDelete ? (
              <BulkCatalogueActions
                table={table}
                entityLabel="HSN Codes"
                endpoint="hsn-codes"
                statusKind="hsn"
                allowDelete={false}
              />
            ) : null}
          </div>
        )}
      />
    </div>
  );
}
