"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";

export type ProductCsvImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type ParsedProductRow = {
  id: string;
  title: string;
  productPrice: number;
  salePrice?: number;
  costPrice?: number;
  isWholesale?: boolean;
  wholesalePrice?: number;
  wholesaleQty?: number;
  productStock: number;
  unit?: string;
  hsnCode?: string;
  description?: string;
  imageUrl?: string;
  productImages?: string[];
  categoryTitle?: string;
  subCategoryTitle?: string;
  seoTitle?: string;
  metaDescription?: string;
  tags?: string[];
  isActive?: boolean;
  isValid: boolean;
  validationError?: string;
};

export type CategoryOption = {
  id: string;
  title: string;
  hsnCode?: { id: string; code: string };
  subCategories?: Array<{ id: string; title: string; hsnCode?: { id: string; code: string } }>;
};

type RawImportRow = Record<string, string | number | boolean | Date | null | undefined>;

type NormalizedImportRow = Record<string, string>;

type HsnSearchResult = {
  id: string;
  code: string;
};

type ProductImportHeader =
  | "title"
  | "categoryTitle"
  | "subCategoryTitle"
  | "hsnCode"
  | "productPrice"
  | "salePrice"
  | "costPrice"
  | "productStock"
  | "unit"
  | "isWholesale"
  | "wholesalePrice"
  | "wholesaleQty"
  | "description"
  | "imageUrl"
  | "productImages"
  | "seoTitle"
  | "metaDescription"
  | "tags"
  | "isActive"
  | "status";

const HEADER_ALIASES: Record<string, ProductImportHeader> = {
  title: "title",
  name: "title",
  category: "categoryTitle",
  categorytitle: "categoryTitle",
  subcategory: "subCategoryTitle",
  subcategorytitle: "subCategoryTitle",
  hsn: "hsnCode",
  hsncode: "hsnCode",
  price: "productPrice",
  productprice: "productPrice",
  saleprice: "salePrice",
  discountedprice: "salePrice",
  costprice: "costPrice",
  stock: "productStock",
  productstock: "productStock",
  unit: "unit",
  wholesale: "isWholesale",
  iswholesale: "isWholesale",
  wholesaleprice: "wholesalePrice",
  wholesaleqty: "wholesaleQty",
  description: "description",
  image: "imageUrl",
  imageurl: "imageUrl",
  productimages: "productImages",
  seotitle: "seoTitle",
  metatitle: "seoTitle",
  metadescription: "metaDescription",
  tags: "tags",
  keywords: "tags",
  isactive: "isActive",
  status: "status",
};

function normalizeHeader(header: unknown): string {
  return String(header ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function normalizeImportRow(row: RawImportRow): NormalizedImportRow {
  return Object.entries(row).reduce<NormalizedImportRow>((normalized, [header, value]) => {
    const mappedHeader = HEADER_ALIASES[normalizeHeader(header)];
    if (!mappedHeader) return normalized;
    normalized[mappedHeader] = value instanceof Date ? value.toISOString() : String(value ?? "").trim();
    return normalized;
  }, {});
}

function parseNumber(value: string | undefined, fallback = 0): number {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value.replace(/[₹,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasInvalidNumber(value: string | undefined): boolean {
  if (value === undefined || value.trim() === "") return false;
  return !Number.isFinite(Number(value.replace(/[₹,\s]/g, "")));
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const parsed = Number(value.replace(/[₹,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseInteger(value: string | undefined, fallback = 0): number {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number.parseInt(value.replace(/[,\s]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOptionalInteger(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const parsed = Number.parseInt(value.replace(/[,\s]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === "") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["true", "yes", "y", "1", "active", "enabled"].includes(normalized)) return true;
  if (["false", "no", "n", "0", "inactive", "disabled"].includes(normalized)) return false;
  return fallback;
}

function buildImportSlug(title: string, rowIndex: number): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseSlug || "imported-product"}-${rowIndex + 1}`;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default function ProductCsvImportModal({
  isOpen,
  onClose,
}: ProductCsvImportModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch categories and subcategories to resolve required categoryId & subCategoryId
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCategories(data);
          }
        }
      } catch (err) {
        console.error("Failed to load categories for import resolution:", err);
      }
    }
    loadCategories();
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const downloadSampleCsv = () => {
    const csvHeader =
      "Title,CategoryTitle,SubCategoryTitle,ProductCode,Sku,Barcode,HsnCode,ProductPrice,SalePrice,CostPrice,ProductStock,Unit,IsWholesale,WholesalePrice,WholesaleQty,Description,ImageUrl,ProductImages,SeoTitle,MetaDescription,Tags,IsActive\n";

    const csvRow1 =
      '"Organic Apples","Fruits","Fresh Fruits","V001-FRU-FRE-000001","V001-FRU-FRE-ORG-BLK-SML-001","BC100000000001","080810",120,100,80,50,"kg",true,90,10,"Fresh organic red apples directly from farm","https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6","https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6","Organic Red Apples - Buy Online","Fresh organic red apples on Nxbazaar.in","organic,apples,fruit,fresh",true\n';

    const csvRow2 =
      '"Fresh Carrots","Vegetables","Root Vegetables","V001-VEG-ROO-000002","V001-VEG-ROO-FRE-WHT-MED-001","BC100000000002","070610",60,50,35,100,"kg",false,,,"Crisp farm carrots rich in Vitamin A","https://images.unsplash.com/photo-1598170845058-12ef4a457939","https://images.unsplash.com/photo-1598170845058-12ef4a457939","Fresh Farm Carrots","Order fresh farm carrots at low prices","vegetables,carrots,fresh,organic",true\n';

    const csvContent = csvHeader + csvRow1 + csvRow2;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_products_with_hsn.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toParsedProductRows = (rawRows: RawImportRow[]): ParsedProductRow[] => {
    return rawRows.map((rawRow, idx) => {
      const rowObj = normalizeImportRow(rawRow);

      const title = rowObj.title || "";
      const productPriceRaw = rowObj.productPrice;
      const productPrice = parseNumber(productPriceRaw, 0);
      const salePrice = parseOptionalNumber(rowObj.salePrice);
      const costPrice = parseOptionalNumber(rowObj.costPrice);
      const productStock = parseInteger(rowObj.productStock, 0);
      const isWholesale = parseBoolean(rowObj.isWholesale, false);
      const wholesalePrice = parseOptionalNumber(rowObj.wholesalePrice);
      const wholesaleQty = parseOptionalInteger(rowObj.wholesaleQty);
      const isActive = parseBoolean(rowObj.isActive ?? rowObj.status, true);
      const productImages = rowObj.productImages
        ? rowObj.productImages.split(/[;,|]/).map((s) => s.trim()).filter(Boolean)
        : undefined;
      const tags = rowObj.tags ? rowObj.tags.split(/[;,]/).map((s) => s.trim()).filter(Boolean) : undefined;
      const hsnCode = rowObj.hsnCode || undefined;

      let isValid = true;
      let validationError = "";
      if (!title.trim()) {
        isValid = false;
        validationError = "Missing Title";
      } else if (hasInvalidNumber(productPriceRaw) || productPrice < 0) {
        isValid = false;
        validationError = "Invalid Price";
      }

      return {
        id: `row-${idx + 1}`,
        title,
        productPrice,
        salePrice,
        costPrice,
        isWholesale,
        wholesalePrice,
        wholesaleQty,
        productStock,
        unit: rowObj.unit || "kg",
        hsnCode,
        description: rowObj.description || undefined,
        imageUrl: rowObj.imageUrl || undefined,
        productImages,
        categoryTitle: rowObj.categoryTitle || undefined,
        subCategoryTitle: rowObj.subCategoryTitle || undefined,
        seoTitle: rowObj.seoTitle || undefined,
        metaDescription: rowObj.metaDescription || undefined,
        tags,
        isActive,
        isValid,
        validationError,
      };
    });
  };

  const parseCsvText = (text: string): ParsedProductRow[] => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const parseLine = (lineStr: string): string[] => {
      const row: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < lineStr.length; i++) {
        const char = lineStr[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          row.push(cur.trim().replace(/^"|"$/g, ""));
          cur = "";
        } else {
          cur += char;
        }
      }
      row.push(cur.trim().replace(/^"|"$/g, ""));
      return row;
    };

    const headers = parseLine(lines[0]);
    const rawRows = lines.slice(1).map((line) => {
      const vals = parseLine(line);
      const rowObj: RawImportRow = {};
      headers.forEach((hdr, i) => {
        rowObj[hdr] = vals[i] || "";
      });
      return rowObj;
    });

    return toParsedProductRows(rawRows);
  };

  const parseExcelBuffer = (buffer: ArrayBuffer): ParsedProductRow[] => {
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!worksheet) return [];
    const rawRows = XLSX.utils.sheet_to_json<RawImportRow>(worksheet, { defval: "" });
    return toParsedProductRows(rawRows);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const rows = extension === "xlsx" || extension === "xls"
        ? parseExcelBuffer(await file.arrayBuffer())
        : parseCsvText(await file.text());

      setParsedRows(rows);
      if (rows.length === 0) {
        toast.error("No valid rows found in the import file.");
      } else {
        toast.success(`Successfully parsed ${rows.length} rows!`);
      }
    } catch (error) {
      console.error("Failed to parse product import file:", error);
      setParsedRows([]);
      toast.error("Failed to parse the import file.");
    }
  };

  const resolveCategoryAndSubCategory = (
    rowCategoryTitle?: string,
    rowSubCategoryTitle?: string,
  ): { categoryId: string; subCategoryId: string } => {
    if (categories.length === 0) {
      return { categoryId: "", subCategoryId: "" };
    }

    // Try matching category by title (case insensitive)
    let matchedCategory = categories.find(
      (c) => c.title.toLowerCase() === (rowCategoryTitle || "").toLowerCase(),
    );
    if (!matchedCategory) {
      matchedCategory = categories[0];
    }

    const subCats = matchedCategory.subCategories || [];
    let matchedSubCategory = subCats.find(
      (s) => s.title.toLowerCase() === (rowSubCategoryTitle || "").toLowerCase(),
    );
    if (!matchedSubCategory && subCats.length > 0) {
      matchedSubCategory = subCats[0];
    }

    return {
      categoryId: matchedCategory.id,
      subCategoryId: matchedSubCategory?.id || "",
    };
  };

  const resolveHsnCodeIds = async (rows: ParsedProductRow[]): Promise<Map<string, string>> => {
    const hsnCodes = Array.from(new Set(rows.map((row) => row.hsnCode?.trim()).filter(Boolean) as string[]));
    const resolved = new Map<string, string>();

    await Promise.all(
      hsnCodes.map(async (code) => {
        if (isUuid(code)) {
          resolved.set(code, code);
          return;
        }

        try {
          const response = await fetch(`/api/hsn-codes/search?q=${encodeURIComponent(code)}`);
          if (!response.ok) return;
          const results = (await response.json()) as HsnSearchResult[];
          const exactMatch = results.find((result) => result.code.trim().toLowerCase() === code.toLowerCase());
          if (exactMatch) resolved.set(code, exactMatch.id);
        } catch (error) {
          console.warn("Failed to resolve HSN code during product import:", code, error);
        }
      }),
    );

    return resolved;
  };

  const handleImportSubmit = async () => {
    const validRows = parsedRows.filter((row) => row.isValid);
    if (validRows.length === 0) {
      toast.error("Please upload a file with valid product rows.");
      return;
    }

    setIsImporting(true);
    setImportProgress({ current: 0, total: validRows.length });

    let successCount = 0;
    let lastError = "";
    const activeUserId = session?.user?.id;
    const hsnCodeIdsByCode = await resolveHsnCodeIds(validRows);

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setImportProgress({ current: i + 1, total: validRows.length });

      const { categoryId, subCategoryId } = resolveCategoryAndSubCategory(
        row.categoryTitle,
        row.subCategoryTitle,
      );

      try {
        const payload = {
          title: row.title,
          slug: buildImportSlug(row.title, i),
          categoryId,
          subCategoryId,
          hsnCodeId: row.hsnCode ? hsnCodeIdsByCode.get(row.hsnCode.trim()) ?? null : null,
          hsnOverrideEnabled: Boolean(row.hsnCode && hsnCodeIdsByCode.has(row.hsnCode.trim())),
          userId: activeUserId,
          farmerId: activeUserId,
          productPrice: row.productPrice,
          salePrice: row.salePrice ?? row.productPrice,
          costPrice: row.costPrice ?? 0,
          isWholesale: row.isWholesale ?? false,
          wholesalePrice: row.wholesalePrice ?? null,
          wholesaleQty: row.wholesaleQty ?? null,
          productStock: row.productStock,
          stock: row.productStock,
          unit: row.unit || "kg",
          description: row.description || row.title,
          imageUrl: row.imageUrl || "",
          productImages: row.productImages || (row.imageUrl ? [row.imageUrl] : []),
          seoTitle: row.seoTitle || row.title,
          metaDescription: row.metaDescription || row.description || row.title,
          tags: row.tags || [row.categoryTitle || "Imported"].filter(Boolean),
          isActive: row.isActive ?? true,
          productType: "SIMPLE",
        };

        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          successCount++;
        } else {
          let errData: any = {};
          try {
            errData = await res.json();
          } catch {
            const rawText = await res.text().catch(() => "");
            errData = { message: rawText || `HTTP ${res.status}` };
          }
          lastError = errData?.message || `Failed with status ${res.status}`;
          console.warn("Product import error detail:", lastError, errData);
        }
      } catch (err) {
        console.warn("Failed to import product row:", row, err);
      }
    }

    setIsImporting(false);
    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} products!`);
      router.refresh();
      onClose();
    } else {
      toast.error(lastError || "Failed to import products.");
    }
  };

  const resetFile = () => {
    setFileName("");
    setParsedRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validImportRows = parsedRows.filter((row) => row.isValid);

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 md:p-8">
      {/* Top Slide Liquid Glass Container */}
      <div className="liquid-card relative mt-4 sm:mt-8 w-full max-w-4xl rounded-[36px] border border-cyan-400/40 bg-slate-950/90 p-6 sm:p-8 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_60px_rgba(6,182,212,0.35)] backdrop-blur-3xl transition-all duration-300">
        <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isImporting}
          className="liquid-glass-control liquid-glass-neutral absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/80 transition-all hover:bg-white/20 hover:text-white"
        >
          <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />
          <X className="liquid-glass-content h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="liquid-glass-control liquid-glass-cyan grid h-13 w-13 shrink-0 place-items-center rounded-2xl border border-cyan-300/50 bg-cyan-500/20 text-cyan-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_0_20px_rgba(6,182,212,0.4)]">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Import Products CSV / Excel
            </h2>
            <p className="text-xs text-white/70 sm:text-sm">
              Bulk import products with HSN Code, Category, Pricing & Inventory details.
            </p>
          </div>
        </div>

        {/* Action Bar: Download Sample Template */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/20 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full border border-cyan-400/40 bg-cyan-500/20 text-cyan-200">
              <FileText className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Product CSV Template (with HSN Code)</p>
              <p className="text-[11px] text-white/60">
                Includes HSN Code, Category, Pricing, Wholesale, Stock & Images.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="liquid-glass-control liquid-glass-neutral inline-flex items-center gap-2 rounded-full border border-white/20 py-2.5 px-4 text-xs font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
          >
            <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />
            <Download className="liquid-glass-content h-3.5 w-3.5 text-cyan-200" />
            <span className="liquid-glass-content">Download HSN Template</span>
          </button>
        </div>

        {/* Dropzone Container */}
        {!fileName ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group/dropzone relative flex cursor-pointer flex-col items-center justify-center rounded-full sm:rounded-[40px] border-2 border-dashed border-cyan-400/50 bg-cyan-500/10 p-8 text-center backdrop-blur-2xl transition-all duration-500 hover:border-cyan-400/90 hover:bg-cyan-500/15 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:scale-[1.01]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-full border border-cyan-300/60 bg-cyan-500/30 text-cyan-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_0_24px_rgba(6,182,212,0.5)] transition-transform duration-500 group-hover/dropzone:scale-110">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-white">
              Click or drag CSV / Excel file here to upload
            </p>
            <p className="mt-1 text-xs text-white/60">
              Supports .csv, .txt, .xlsx and .xls
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info Bar */}
            <div className="flex items-center justify-between rounded-3xl border border-cyan-400/40 bg-cyan-500/15 p-4 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-cyan-300" />
                <div>
                  <p className="text-xs font-semibold text-white">{fileName}</p>
                  <p className="text-[11px] text-cyan-200">
                    {parsedRows.length} rows parsed (
                    {validImportRows.length} valid)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetFile}
                disabled={isImporting}
                className="text-xs font-semibold text-red-400 hover:text-red-300 hover:underline"
              >
                Change File
              </button>
            </div>

            {/* Preview Table */}
            {parsedRows.length > 0 ? (
              <div className="max-h-64 overflow-x-auto overflow-y-auto rounded-3xl border border-white/15 bg-white/5 p-3">
                <table className="min-w-[750px] w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-white/60 uppercase">
                    <tr>
                      <th className="p-2">Title</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">HSN Code</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Sale Price</th>
                      <th className="p-2">Stock</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Wholesale</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {parsedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-white/5">
                        <td className="p-2 font-medium text-white max-w-[140px] truncate">
                          {row.title || "-"}
                        </td>
                        <td className="p-2 text-white/80 max-w-[120px] truncate">
                          {row.categoryTitle || "Default"}
                        </td>
                        <td className="p-2 font-mono text-cyan-300">
                          {row.hsnCode || "Auto/Inherit"}
                        </td>
                        <td className="p-2 text-cyan-200">₹{row.productPrice}</td>
                        <td className="p-2 text-emerald-300">
                          {row.salePrice !== undefined ? `₹${row.salePrice}` : "-"}
                        </td>
                        <td className="p-2 text-white/80">{row.productStock}</td>
                        <td className="p-2 text-white/60">{row.unit || "kg"}</td>
                        <td className="p-2 text-white/70">
                          {row.isWholesale ? `Yes (₹${row.wholesalePrice || row.productPrice})` : "No"}
                        </td>
                        <td className="p-2">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                              <AlertCircle className="h-3.5 w-3.5" /> {row.validationError}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        )}

        {/* Progress indicator */}
        {isImporting ? (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-200">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Importing products with HSN codes...
              </span>
              <span>
                {importProgress.current} / {importProgress.total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{
                  width: `${(importProgress.current / importProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            className="rounded-full border border-white/20 bg-white/5 py-2.5 px-6 text-xs font-semibold text-white/80 hover:bg-white/15 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={
              isImporting ||
              parsedRows.length === 0 ||
              validImportRows.length === 0
            }
            className="liquid-glass-control liquid-glass-primary flex min-h-12 min-w-[180px] items-center justify-between gap-3 rounded-full py-1 pl-6 pr-1 font-semibold text-white disabled:opacity-50"
          >
            <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />
            <span className="liquid-glass-content min-w-0 flex-1 text-center text-xs font-semibold text-white">
              {isImporting
                ? `Importing (${importProgress.current}/${importProgress.total})`
                : `Import ${validImportRows.length} Products`}
            </span>
            <span className="liquid-glass-content pointer-events-none grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_0_18px_rgba(99,102,241,0.36)]">
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Plus className="h-4 w-4 text-white" />
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
