import db from "@/lib/db";
import { buildProductQrUrl, buildVariantQrUrl } from "@/lib/qr/build-qr-url";
import { generateQrDataUrl } from "@/lib/qr/generate-qr";
import { notFound } from "next/navigation";
import React from "react";

export default async function ProductQrLabelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sku?: string; labelSize?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const selectedSku = resolvedSearchParams.sku;
  const labelSize = resolvedSearchParams.labelSize || "60x40";

  const product = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      productCode: true,
      salePrice: true,
      imageUrl: true,
      user: {
        select: {
          sellerProfile: {
            select: { code: true, storeName: true },
          },
        },
      },
      variants: {
        select: { id: true, sku: true, price: true, title: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const matchedVariant = selectedSku
    ? product.variants.find((v) => v.sku.toUpperCase() === selectedSku.toUpperCase())
    : null;

  const displaySku = matchedVariant?.sku || selectedSku || null;
  const displayPrice = matchedVariant?.price || product.salePrice;
  const sellerCode = product.user?.sellerProfile?.code || "NXB";

  const targetUrl = displaySku
    ? buildVariantQrUrl(product.productCode, displaySku)
    : buildProductQrUrl(product.productCode);

  const qrDataUrl = await generateQrDataUrl(targetUrl, { width: 300, margin: 2 });

  return (
    <div className="min-h-screen bg-slate-100 p-6 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Screen Only Control Bar */}
      <div className="print:hidden max-w-xl mx-auto mb-6 rounded-2xl border border-white/40 bg-white/80 p-4 backdrop-blur-xl shadow-lg dark:border-white/10 dark:bg-slate-900/80 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold">Print Product QR Label</h1>
          <p className="text-xs text-slate-500">Preset: {labelSize} mm</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") window.print();
          }}
          className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 shadow-md transition"
        >
          Print Label Now
        </button>
      </div>

      {/* Printable Label Container */}
      <div className="flex items-center justify-center">
        <div
          className={`bg-white text-slate-900 border border-slate-300 rounded-xl p-3 shadow-md flex flex-col justify-between items-center text-center ${
            labelSize === "50x30"
              ? "w-[50mm] h-[30mm]"
              : labelSize === "100x50"
              ? "w-[100mm] h-[50mm]"
              : "w-[60mm] h-[40mm]"
          }`}
          style={{ boxSizing: "border-box" }}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="text-[10px] font-black tracking-wider uppercase text-cyan-700">
              NXBazaar
            </span>
            {sellerCode && (
              <span className="text-[9px] font-bold bg-slate-100 px-1 py-0.5 rounded text-slate-700">
                Seller: {sellerCode}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="w-full flex items-center justify-between gap-1 my-1">
            <div className="flex-1 text-left space-y-0.5 overflow-hidden">
              <h2 className="text-[11px] font-bold leading-tight line-clamp-2 text-slate-900">
                {product.title}
              </h2>
              <p className="text-[9px] font-mono text-slate-600">
                Code: {product.productCode}
              </p>
              {displaySku && (
                <p className="text-[9px] font-mono text-slate-800 font-semibold truncate">
                  SKU: {displaySku}
                </p>
              )}
              <p className="text-xs font-black text-emerald-700 pt-0.5">
                ₹{displayPrice}
              </p>
            </div>

            <div className="shrink-0">
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-[24mm] h-[24mm] object-contain border border-slate-200 rounded p-0.5"
              />
            </div>
          </div>

          {/* Footer Target Link */}
          <div className="w-full border-t border-slate-100 pt-0.5">
            <p className="text-[7px] font-mono text-slate-400 truncate">
              {targetUrl}
            </p>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
