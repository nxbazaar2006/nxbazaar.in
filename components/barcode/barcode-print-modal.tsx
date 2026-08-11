"use client";

import React, { useState } from "react";
import { X, Printer, LayoutGrid, FileText, Check } from "lucide-react";
import { BarcodeSheetPrintable, PrintableBarcodeItem } from "./barcode-sheet-printable";

type BarcodePrintModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: PrintableBarcodeItem[];
  isReprint?: boolean;
};

export function BarcodePrintModal({
  isOpen,
  onClose,
  items,
  isReprint = false,
}: BarcodePrintModalProps) {
  const [layoutMode, setLayoutMode] = useState<"GRID_A4" | "SINGLE">("GRID_A4");

  if (!isOpen || items.length === 0) {
    return null;
  }

  const totalCopies = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-white/20 bg-slate-900 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Printer className="h-5 w-5 text-cyan-400" />
              {isReprint ? "Reprint Barcode Labels" : "Print Barcode Labels"}
            </h2>
            <p className="text-xs text-white/60">
              {items.length} variant(s) selected • {totalCopies} total label(s)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/50 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/70">Layout Sheet:</span>
            <button
              type="button"
              onClick={() => setLayoutMode("GRID_A4")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition ${
                layoutMode === "GRID_A4"
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> A4 Grid (3×8)
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("SINGLE")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition ${
                layoutMode === "SINGLE"
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Individual Sticker
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg transition"
            >
              <Printer className="h-4 w-4" /> Print {totalCopies} Label(s)
            </button>
          </div>
        </div>

        {/* Live Print Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/90">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-white p-4 text-slate-900 shadow-inner">
            <div className="mb-3 border-b border-slate-200 pb-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Print Preview ({layoutMode === "GRID_A4" ? "A4 3×8 Grid Sheet" : "Individual Labels"})
            </div>
            <BarcodeSheetPrintable items={items} mode={layoutMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
