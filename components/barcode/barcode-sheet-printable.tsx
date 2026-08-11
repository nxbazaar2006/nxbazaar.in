"use client";

import React from "react";
import { generateCode128Svg } from "@/lib/barcode-generator";

export type PrintableBarcodeItem = {
  id: string;
  barcode: string;
  sku: string;
  productCode: string;
  productTitle: string;
  variantTitle?: string;
  quantity: number;
};

type BarcodeSheetPrintableProps = {
  items: PrintableBarcodeItem[];
  mode?: "SINGLE" | "GRID_A4";
};

export function BarcodeSheetPrintable({ items, mode = "GRID_A4" }: BarcodeSheetPrintableProps) {
  // Expand items based on requested quantities
  const expandedLabels: Array<{
    id: string;
    barcode: string;
    sku: string;
    productCode: string;
    productTitle: string;
    variantTitle?: string;
  }> = [];

  for (const item of items) {
    const qty = Math.max(1, item.quantity || 1);
    for (let i = 0; i < qty; i += 1) {
      expandedLabels.push({
        id: `${item.id}-${i}`,
        barcode: item.barcode,
        sku: item.sku,
        productCode: item.productCode,
        productTitle: item.productTitle,
        variantTitle: item.variantTitle,
      });
    }
  }

  if (expandedLabels.length === 0) {
    return null;
  }

  return (
    <>
      <style key="barcode-print-css">{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide non-print UI */
          body > *:not(#printable-barcode-sheet-container),
          header, sidebar, nav, button, input, .no-print {
            display: none !important;
          }
          #printable-barcode-sheet-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
          .barcode-label-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div id="printable-barcode-sheet-container">
        {mode === "SINGLE" ? (
          <div className="flex flex-col items-center gap-6 p-4">
            {expandedLabels.map((label, idx) => {
              const svgHtml = generateCode128Svg({
                barcode: label.barcode,
                title: label.productTitle,
                sku: label.sku,
                productCode: label.productCode,
              });

              return (
                <div
                  key={`${label.id}-${idx}`}
                  className="barcode-label-card w-[70mm] rounded-lg border border-slate-300 bg-white p-3 text-center shadow-sm"
                >
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {label.productTitle}
                  </div>
                  {label.variantTitle && (
                    <div className="text-[11px] font-medium text-slate-600 truncate">
                      {label.variantTitle}
                    </div>
                  )}
                  <div className="my-1.5 flex justify-center" dangerouslySetInnerHTML={{ __html: svgHtml }} />
                </div>
              );
            })}
          </div>
        ) : (
          /* A4 3x8 Grid Layout (24 labels per sheet) */
          <div className="grid grid-cols-3 gap-3 p-2">
            {expandedLabels.map((label, idx) => {
              const svgHtml = generateCode128Svg({
                barcode: label.barcode,
                title: label.productTitle,
                sku: label.sku,
                productCode: label.productCode,
              });

              return (
                <div
                  key={`${label.id}-${idx}`}
                  className="barcode-label-card flex flex-col justify-between rounded border border-slate-200 bg-white p-2 text-center h-[34mm] box-border"
                >
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                      {label.productTitle}
                    </div>
                    {label.variantTitle && label.variantTitle !== "Default" && (
                      <div className="text-[10px] font-semibold text-slate-600 truncate">
                        {label.variantTitle}
                      </div>
                    )}
                  </div>

                  <div className="my-1 flex justify-center overflow-hidden scale-90" dangerouslySetInnerHTML={{ __html: svgHtml }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
