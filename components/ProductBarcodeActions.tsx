"use client";

import { generateCode128Svg } from "@/lib/barcode-generator";
import { Copy, Download, Printer, RefreshCw, Check } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

type ProductBarcodeActionsProps = {
  barcode?: string | null;
  barcodeType?: string | null;
  title?: string | null;
  productCode?: string | null;
  sku?: string | null;
  variantId?: string;
  productId?: string;
  isAdmin?: boolean;
  onRegenerated?: (newBarcode: string) => void;
};

export default function ProductBarcodeActions({
  barcode: initialBarcode,
  barcodeType = "CODE128",
  title = "Product",
  productCode = "",
  sku = "",
  variantId,
  productId,
  isAdmin = false,
  onRegenerated,
}: ProductBarcodeActionsProps) {
  const [currentBarcode, setCurrentBarcode] = useState(initialBarcode || "");
  const [isPending, startTransition] = useTransition();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!currentBarcode) {
    return <span className="text-xs text-slate-500 italic">No Barcode assigned</span>;
  }

  const svgString = generateCode128Svg({
    barcode: currentBarcode,
    title: title || "Product",
    productCode: productCode || "",
    sku: sku || "",
  });

  function copyToClipboard(text: string, label: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=600,height=400");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${currentBarcode}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; font-family: sans-serif; }
            .barcode-container { text-align: center; }
          </style>
        </head>
        <body>
          <div className="barcode-container">
            ${svgString}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  function handleDownloadPng() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = typeof window !== "undefined" ? URL.createObjectURL(svgBlob) : "";

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      if (ctx) {
        ctx.scale(2, 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
      }
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `Barcode-${currentBarcode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (url) URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function handleRegenerate() {
    if (!isAdmin) return;
    if (!window.confirm(`Are you sure you want to regenerate barcode for "${currentBarcode}"?`)) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/barcode/regenerate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId, productId }),
        });
        const result = await res.json();
        if (!res.ok || result.success === false) {
          throw new Error(result.message || "Failed to regenerate barcode.");
        }
        const newCode = result.data.barcode;
        setCurrentBarcode(newCode);
        onRegenerated?.(newCode);
        toast.success(`Barcode regenerated: ${newCode}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Regeneration failed.");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-white/20 bg-slate-900/90 p-4 text-white shadow-xl backdrop-blur-md">
      {/* Header Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs border-b border-white/10 pb-3">
        <div>
          <span className="text-white/60 block text-[10px] uppercase font-semibold">Product Code</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="font-mono font-medium truncate">{productCode || "—"}</span>
            {productCode && (
              <button
                type="button"
                onClick={() => copyToClipboard(productCode, "Product Code")}
                className="text-cyan-400 hover:text-cyan-300 p-0.5"
                title="Copy Product Code"
              >
                {copiedField === "Product Code" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>

        <div>
          <span className="text-white/60 block text-[10px] uppercase font-semibold">SKU</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="font-mono font-medium truncate">{sku || "—"}</span>
            {sku && (
              <button
                type="button"
                onClick={() => copyToClipboard(sku, "SKU")}
                className="text-cyan-400 hover:text-cyan-300 p-0.5"
                title="Copy SKU"
              >
                {copiedField === "SKU" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>

        <div>
          <span className="text-white/60 block text-[10px] uppercase font-semibold">Barcode ({barcodeType})</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="font-mono font-bold text-cyan-300 truncate">{currentBarcode}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(currentBarcode, "Barcode")}
              className="text-cyan-400 hover:text-cyan-300 p-0.5"
              title="Copy Barcode"
            >
              {copiedField === "Barcode" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Code 128 Live Preview */}
      <div className="flex justify-center p-2 rounded-lg bg-white overflow-x-auto shadow-inner">
        <div dangerouslySetInnerHTML={{ __html: svgString }} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
          >
            <Download className="h-3.5 w-3.5" /> Download PNG
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/20 transition"
          >
            <Printer className="h-3.5 w-3.5" /> Print Barcode
          </button>
        </div>

        {isAdmin && (variantId || productId) && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleRegenerate}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium border border-rose-500/30 transition disabled:opacity-50"
            title="Admin: Regenerate Barcode"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} /> Regenerate (Admin)
          </button>
        )}
      </div>
    </div>
  );
}
