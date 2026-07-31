"use client";

import { ProductQrDialog } from "@/components/products/qr/product-qr-dialog";
import { QrCode } from "lucide-react";
import React, { useState } from "react";

type ProductQrActionsProps = {
  product: {
    id: string;
    productCode: string;
    title: string;
    imageUrl?: string | null;
    salePrice?: number;
    user?: {
      sellerProfile?: {
        code?: string | null;
      } | null;
    } | null;
    variants?: Array<{
      id: string;
      sku: string;
      title: string;
      price: number;
    }>;
  };
  defaultSku?: string;
  buttonVariant?: "icon" | "button" | "menuItem";
};

export function ProductQrActions({
  product,
  defaultSku,
  buttonVariant = "icon",
}: ProductQrActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {buttonVariant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 bg-white/40 text-slate-800 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:border-cyan-400/60 hover:bg-white/80 hover:text-cyan-600 dark:border-white/15 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800/80 transition-all duration-200"
          title="View & Download Product QR Code"
        >
          <QrCode className="h-4 w-4" />
        </button>
      ) : buttonVariant === "menuItem" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 backdrop-blur-md hover:bg-cyan-500/10 hover:text-cyan-600 dark:text-slate-200 dark:hover:bg-cyan-400/20 dark:hover:text-cyan-300 transition-colors"
        >
          <QrCode className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Product QR Code</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-700 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:border-cyan-500/50 hover:bg-cyan-500/25 dark:border-cyan-400/30 dark:bg-cyan-400/20 dark:text-cyan-300 dark:hover:bg-cyan-400/30 transition-all duration-200"
        >
          <QrCode className="h-3.5 w-3.5" />
          <span>QR Code</span>
        </button>
      )}

      {open && (
        <ProductQrDialog
          open={open}
          onOpenChange={setOpen}
          product={product}
          defaultSku={defaultSku}
        />
      )}
    </>
  );
}
