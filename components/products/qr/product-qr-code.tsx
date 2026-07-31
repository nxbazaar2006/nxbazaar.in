"use client";

import { useProductQrData } from "@/hooks/use-product-qr";
import { downloadQrDataUrl, downloadQrSvg } from "@/lib/qr/download-qr";
import type { ProductQrCodeProps } from "@/types/qr";
import { Check, Copy, Download, Printer, QrCode } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export function ProductQrCode({
  productCode,
  sku,
  productTitle = "Product",
  size = 220,
  showDownload = true,
  showPrint = true,
  showValue = true,
  className = "",
}: ProductQrCodeProps) {
  const [copied, setCopied] = useState(false);

  // React Query hook for fetching and caching QR code data
  const { data, isLoading, isError, error } = useProductQrData(productCode, sku, size);

  const dataUrl = data?.dataUrl || "";
  const svgString = data?.svgString || "";
  const qrTargetUrl = data?.qrTargetUrl || "";

  function handleCopyLink() {
    if (!qrTargetUrl) return;
    navigator.clipboard.writeText(qrTargetUrl);
    setCopied(true);
    toast.success("QR Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadPng() {
    if (!dataUrl) return;
    const name = sku ? `${sku}-qr.png` : `${productCode}-qr.png`;
    downloadQrDataUrl(dataUrl, name);
    toast.success(`Downloaded ${name}`);
  }

  function handleDownloadSvg() {
    if (!svgString) return;
    const name = sku ? `${sku}-qr.svg` : `${productCode}-qr.svg`;
    downloadQrSvg(svgString, name);
    toast.success(`Downloaded ${name}`);
  }

  function handlePrint() {
    if (!svgString) return;
    const printWindow = window.open("", "_blank", "width=500,height=500");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${sku || productCode}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px; background: #ffffff; max-width: 320px; }
            h2 { font-size: 16px; margin: 0 0 8px 0; color: #0f172a; }
            p { font-size: 12px; margin: 4px 0; color: #475569; font-family: monospace; }
            .qr { margin: 16px 0; }
          </style>
        </head>
        <body>
          <div className="card">
            <h2>${productTitle}</h2>
            <p>Code: ${productCode}</p>
            ${sku ? `<p>SKU: ${sku}</p>` : ""}
            <div className="qr">${svgString}</div>
            <p style="font-size:10px; color:#94a3b8;">${qrTargetUrl}</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* QR Image Frame */}
      <div className="relative flex items-center justify-center rounded-2xl border border-white/40 bg-white p-3.5 shadow-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex h-48 w-48 items-center justify-center text-slate-400">
            <QrCode className="h-8 w-8 animate-pulse text-cyan-500" />
          </div>
        ) : isError ? (
          <div className="flex h-48 w-48 flex-col items-center justify-center gap-2 text-center text-xs text-rose-500">
            <p>Failed to load QR code</p>
            <span className="text-[10px] text-slate-400">{error?.message}</span>
          </div>
        ) : (
          <img
            src={dataUrl}
            alt={`QR Code for ${productTitle}`}
            width={size}
            height={size}
            className="h-auto max-w-full rounded-lg object-contain"
          />
        )}
      </div>

      {/* Info Values */}
      {showValue && (
        <div className="w-full text-center space-y-1">
          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{productTitle}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">Code: {productCode}</span>
            {sku && <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-semibold text-cyan-700 dark:text-cyan-300">SKU: {sku}</span>}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <button
          type="button"
          disabled={isLoading || isError}
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
          title="Copy Product QR Link"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          <span>Copy Link</span>
        </button>

        {showDownload && (
          <>
            <button
              type="button"
              disabled={isLoading || isError}
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 shadow-sm transition disabled:opacity-50"
              title="Download PNG"
            >
              <Download className="h-3.5 w-3.5" /> PNG
            </button>
            <button
              type="button"
              disabled={isLoading || isError}
              onClick={handleDownloadSvg}
              className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-500/20 dark:text-cyan-300 transition disabled:opacity-50"
              title="Download SVG"
            >
              <Download className="h-3.5 w-3.5" /> SVG
            </button>
          </>
        )}

        {showPrint && (
          <button
            type="button"
            disabled={isLoading || isError}
            onClick={handlePrint}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition disabled:opacity-50"
            title="Print QR Label"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        )}
      </div>
    </div>
  );
}
