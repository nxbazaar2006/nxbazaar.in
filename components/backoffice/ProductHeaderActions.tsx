"use client";

import React, { useState } from "react";
import { Upload, Plus } from "lucide-react";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import ProductCsvImportModal from "./ProductCsvImportModal";

export default function ProductHeaderActions() {
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
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
