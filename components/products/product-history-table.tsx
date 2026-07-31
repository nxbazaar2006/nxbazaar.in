"use client";

import { useState, useTransition } from "react";

type ProductHistoryRow = {
  id: string;
  productId: string;
  productTitle: string;
  productCode: string | null;
  variantId: string | null;
  sku: string | null;
  barcode: string | null;
  action: string;
  field: string | null;
  oldValue: unknown;
  newValue: unknown;
  changedByUserCode: string | null;
  changedByName: string | null;
  changedByRole: string | null;
  sellerCode: string | null;
  note: string | null;
  createdAt: Date | string;
};

type ProductHistoryTableProps = {
  rows: ProductHistoryRow[];
  canRestore: boolean;
};

const NON_RESTORABLE_FIELDS = new Set([
  "id",
  "productId",
  "productCode",
  "sku",
  "barcode",
  "sellerId",
  "userId",
]);

function valueText(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function preview(value: unknown) {
  const text = valueText(value);
  return text.length > 80 ? `${text.slice(0, 80)}...` : text;
}

export function ProductHistoryTable({
  rows,
  canRestore,
}: ProductHistoryTableProps) {
  const [details, setDetails] = useState<ProductHistoryRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function restore(row: ProductHistoryRow) {
    if (!row.field || NON_RESTORABLE_FIELDS.has(row.field)) return;

    const confirmed = window.confirm(
      "This will restore the selected field to its historical value and create a new history record."
    );

    if (!confirmed) return;

    startTransition(async () => {
      const response = await fetch(
        `/api/products/${row.productId}/history/${row.id}/restore`,
        { method: "POST" }
      );

      if (response.ok) {
        window.location.reload();
      }
    });
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Field</th>
              <th className="px-3 py-2">Old value</th>
              <th className="px-3 py-2">New value</th>
              <th className="px-3 py-2">Product code</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Barcode</th>
              <th className="px-3 py-2">Changed by</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Seller</th>
              <th className="px-3 py-2">Note</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2">
                  {new Date(row.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <span className="rounded-full border px-2 py-1 text-xs">
                    {row.action}
                  </span>
                </td>
                <td className="px-3 py-2">{row.field ?? "-"}</td>
                <td className="max-w-48 px-3 py-2">
                  <code className="whitespace-pre-wrap text-xs">
                    {preview(row.oldValue)}
                  </code>
                </td>
                <td className="max-w-48 px-3 py-2">
                  <code className="whitespace-pre-wrap text-xs">
                    {preview(row.newValue)}
                  </code>
                </td>
                <td className="px-3 py-2">{row.productCode ?? "-"}</td>
                <td className="px-3 py-2">{row.sku ?? "-"}</td>
                <td className="px-3 py-2">{row.barcode ?? "-"}</td>
                <td className="px-3 py-2">
                  {row.changedByName ?? row.changedByUserCode ?? "-"}
                </td>
                <td className="px-3 py-2">{row.changedByRole ?? "-"}</td>
                <td className="px-3 py-2">{row.sellerCode ?? "-"}</td>
                <td className="max-w-44 px-3 py-2">{row.note ?? "-"}</td>
                <td className="space-x-2 px-3 py-2">
                  <button
                    type="button"
                    className="rounded-md border px-2 py-1 text-xs"
                    onClick={() => setDetails(row)}
                  >
                    View Details
                  </button>
                  {canRestore &&
                  row.field &&
                  !NON_RESTORABLE_FIELDS.has(row.field) ? (
                    <button
                      type="button"
                      className="rounded-md border px-2 py-1 text-xs"
                      disabled={isPending}
                      onClick={() => restore(row)}
                    >
                      Restore
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {details ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg border bg-background p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">History Details</h2>
              <button type="button" onClick={() => setDetails(null)}>
                Close
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium">Previous value</h3>
                <pre className="min-h-40 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
                  {valueText(details.oldValue)}
                </pre>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium">New value</h3>
                <pre className="min-h-40 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
                  {valueText(details.newValue)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
