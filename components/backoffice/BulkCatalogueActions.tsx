"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Table } from "@tanstack/react-table";
import { Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

type HsnOption = { id: string; code: string; description?: string | null };

type BulkCatalogueActionsProps<TData> = {
  table: Table<TData>;
  entityLabel: string;
  endpoint: string;
  hsnOptions?: HsnOption[];
  statusKind?: "boolean" | "hsn";
  allowHsnEdit?: boolean;
  allowDelete?: boolean;
};

function getSelectedIds<TData>(table: Table<TData>) {
  return table.getFilteredSelectedRowModel().rows.map((row) => (row.original as { id: string }).id);
}

export default function BulkCatalogueActions<TData>({
  table,
  entityLabel,
  endpoint,
  hsnOptions = [],
  statusKind = "boolean",
  allowHsnEdit = false,
  allowDelete = true,
}: BulkCatalogueActionsProps<TData>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState("unchanged");
  const [hsnMode, setHsnMode] = useState("unchanged");
  const [hsnCodeId, setHsnCodeId] = useState("");
  const selectedIds = getSelectedIds(table);
  const selectedCount = selectedIds.length;

  if (selectedCount === 0) return null;

  async function submit(path: string, payload: Record<string, unknown>) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok || result.success === false) throw new Error(result.message || "Bulk action failed.");
    return result;
  }

  function refreshSelection() {
    table.resetRowSelection();
    router.refresh();
  }

  function handleDelete() {
    if (!window.confirm(`Delete ${selectedCount} selected ${entityLabel}?`)) return;
    startTransition(async () => {
      try {
        const result = await submit(`/api/${endpoint}/bulk-delete`, { ids: selectedIds });
        toast.success(result.message || `${entityLabel} records deleted.`);
        refreshSelection();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Bulk delete failed.");
      }
    });
  }

  function handleUpdate() {
    startTransition(async () => {
      try {
        const payload: Record<string, unknown> = { ids: selectedIds };
        if (statusKind === "boolean" && status !== "unchanged") payload.isActive = status === "active";
        if (statusKind === "hsn" && status !== "unchanged") payload.status = status;
        if (allowHsnEdit) {
          payload.hsnMode = hsnMode;
          if (hsnMode === "set") payload.hsnCodeId = hsnCodeId;
        }
        const result = await submit(`/api/${endpoint}/bulk-update`, payload);
        toast.success(result.message || `${entityLabel} records updated.`);
        setOpen(false);
        refreshSelection();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Bulk update failed.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-white/80">{selectedCount} selected</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="secondary">
            <Edit3 className="h-4 w-4" /> Edit Selected
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {selectedCount} {entityLabel}</DialogTitle>
            <DialogDescription>Selected changes will be applied to all selected records.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 block w-full rounded-md border px-3 py-2">
                <option value="unchanged">Do not change</option>
                {statusKind === "boolean" ? (
                  <>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive / Draft</option>
                  </>
                ) : (
                  <>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </>
                )}
              </select>
            </label>

            {allowHsnEdit ? (
              <>
                <label className="block text-sm font-medium">
                  HSN Code
                  <select value={hsnMode} onChange={(event) => setHsnMode(event.target.value)} className="mt-2 block w-full rounded-md border px-3 py-2">
                    <option value="unchanged">Do not change</option>
                    <option value="set">Assign HSN</option>
                    <option value="clear">Clear HSN</option>
                  </select>
                </label>
                {hsnMode === "set" ? (
                  <select value={hsnCodeId} onChange={(event) => setHsnCodeId(event.target.value)} className="block w-full rounded-md border px-3 py-2">
                    <option value="">Select HSN code</option>
                    {hsnOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.code} {option.description ? `- ${option.description}` : ""}
                      </option>
                    ))}
                  </select>
                ) : null}
              </>
            ) : null}

            <Button disabled={isPending || (allowHsnEdit && hsnMode === "set" && !hsnCodeId)} onClick={handleUpdate}>
              {isPending ? "Updating..." : "Apply Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {allowDelete ? (
        <Button size="sm" variant="destructive" disabled={isPending} onClick={handleDelete}>
          <Trash2 className="h-4 w-4" /> Delete Selected
        </Button>
      ) : null}
    </div>
  );
}
