"use client";

import { ProductQrCode } from "@/components/products/qr/product-qr-code";
import { VariantQrSelector } from "@/components/products/qr/variant-qr-selector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { QrDialogProps } from "@/types/qr";
import { ExternalLink, QrCode, Tag, Store } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export function ProductQrDialog({
  open,
  onOpenChange,
  product,
  defaultSku,
}: QrDialogProps) {
  const [selectedSku, setSelectedSku] = useState<string | undefined>(defaultSku);

  if (!product) return null;

  const sellerCode = product.user?.sellerProfile?.code;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/30 bg-white/80 p-6 backdrop-blur-2xl shadow-2xl dark:border-white/15 dark:bg-slate-900/90 rounded-3xl overflow-hidden">
        <DialogHeader className="border-b border-white/20 pb-3 dark:border-white/10">
          <DialogTitle className="flex items-center gap-2.5 text-base font-bold text-slate-900 dark:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-600 dark:bg-cyan-400/20 dark:text-cyan-300">
              <QrCode className="h-4 w-4" />
            </div>
            <span>Product QR Code</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Header Product Info */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/40 p-3 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/40">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-12 w-12 rounded-xl object-cover border border-white/60 shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-500 dark:bg-slate-700">
                <Tag className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-0.5">
              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {product.title}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Code: <strong className="font-mono text-slate-700 dark:text-slate-200">{product.productCode}</strong></span>
                {sellerCode && (
                  <span className="flex items-center gap-0.5 rounded bg-amber-500/10 px-1 py-0.2 font-semibold text-amber-700 dark:text-amber-300">
                    <Store className="h-3 w-3" /> {sellerCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <VariantQrSelector
              variants={product.variants}
              selectedSku={selectedSku}
              onSelectSku={setSelectedSku}
            />
          )}

          {/* QR Code Container */}
          <ProductQrCode
            productCode={product.productCode}
            sku={selectedSku}
            productTitle={product.title}
            size={220}
            showDownload={true}
            showPrint={true}
            showValue={true}
          />

          {/* Direct Print Label Link */}
          <div className="pt-2 border-t border-white/20 dark:border-white/10 flex items-center justify-between text-xs">
            <Link
              href={`/back-office/products/${product.id}/qr-label${selectedSku ? `?sku=${selectedSku}` : ""}`}
              target="_blank"
              className="inline-flex items-center gap-1 font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
            >
              <span>Open Printable Label Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
