"use client";

import React, { useState, useTransition } from "react";
import { Upload, Plus, RefreshCw } from "lucide-react";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import ProductCsvImportModal from "./ProductCsvImportModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProductHeaderActions() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleBackfill() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/products/backfill-identifiers", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message || "Backfilled product identifiers.");
          router.refresh();
        } else {
          toast.error(data.message || "Failed to backfill identifiers.");
        }
      } catch (err) {
        toast.error("Failed to execute backfill.");
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <DashboardActionButton
          label={isPending ? "Generating..." : "Generate Missing SKUs/Barcodes"}
          icon={<RefreshCw className={`h-4 w-4 text-white ${isPending ? "animate-spin" : ""}`} />}
          variant="primary"
          onClick={handleBackfill}
          disabled={isPending}
        />
        <DashboardActionButton
          label="Import CSV/Excel"
          icon={<Upload className="h-4 w-4 text-white" />}
          variant="primary"
          onClick={() => setIsImportOpen(true)}
        />
        <DashboardActionButton
          label="Add Product"
          icon={<Plus className="h-4 w-4 text-white" />}
          variant="primary"
          href="/dashboard/products/new"
        />
      </div>

      <ProductCsvImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </>
  );
}

