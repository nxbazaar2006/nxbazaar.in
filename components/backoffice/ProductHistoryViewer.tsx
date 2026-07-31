"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type HistoryItem = {
  id: string;
  productId: string;
  productTitle: string;
  productCode?: string | null;
  variantId?: string | null;
  sku?: string | null;
  barcode?: string | null;
  action: string;
  field?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  changedByName?: string | null;
  changedByUserCode?: string | null;
  changedByRole?: string | null;
  sellerCode?: string | null;
  note?: string | null;
  createdAt: string;
};

type HistoryResponse = {
  items: HistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

const actionOptions = [
  ["", "All actions"],
  ["PRODUCT_UPDATED", "Product updates"],
  ["VARIANT_UPDATED", "Variant updates"],
  ["PRICE_CHANGED", "Price changes"],
  ["STOCK_CHANGED", "Stock changes"],
  ["AI_DRAFT_APPLIED", "AI Draft changes"],
];

function preview(value: unknown) {
  if (value === null || value === undefined) return "-";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 90 ? `${text.slice(0, 90)}...` : text;
}

function JsonCell({ label, value }: { label: string; value: unknown }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="max-w-[220px] truncate text-left text-xs text-slate-700 underline decoration-dotted">
          {preview(value)}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <pre className="max-h-[60vh] overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-50">
          {JSON.stringify(value, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductHistoryViewer({
  productId,
  productCode,
  initialVariantId = "",
  initialSearch = "",
  initialAction = "",
  initialFrom = "",
  initialTo = "",
  selectedVariant = null,
  canRestore = false,
}: {
  productId: string;
  productCode?: string;
  initialVariantId?: string;
  initialSearch?: string;
  initialAction?: string;
  initialFrom?: string;
  initialTo?: string;
  selectedVariant?: { id: string; title: string; sku: string; barcode: string } | null;
  canRestore?: boolean;
}) {
  const router = useRouter();
  const [action, setAction] = useState(initialAction);
  const [variantId, setVariantId] = useState(initialVariantId);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<HistoryResponse>({ items: [], total: 0, page: 1, pageSize: 20, pageCount: 1 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (action) params.set("action", action);
    if (variantId) params.set("variantId", variantId);
    if (search) params.set("search", search);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return params.toString();
  }, [action, from, page, search, to, variantId]);

  function pushFilters(next: { action?: string; variantId?: string; search?: string; from?: string; to?: string; page?: number }) {
    const params = new URLSearchParams();
    const nextAction = next.action ?? action;
    const nextVariantId = next.variantId ?? variantId;
    const nextSearch = next.search ?? search;
    const nextFrom = next.from ?? from;
    const nextTo = next.to ?? to;
    const nextPage = next.page ?? page;
    if (nextAction) params.set("action", nextAction);
    if (nextVariantId) params.set("variantId", nextVariantId);
    if (nextSearch) params.set("search", nextSearch);
    if (nextFrom) params.set("from", nextFrom);
    if (nextTo) params.set("to", nextTo);
    if (nextPage > 1) params.set("page", String(nextPage));
    router.replace(`/dashboard/products/${productId}/history${params.toString() ? `?${params.toString()}` : ""}`);
  }

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/history?${query}`);
      const payload = await response.json().catch(() => null);
      setLoading(false);
      if (!response.ok || !payload) {
        setMessage(payload?.message || payload?.error || "Failed to load history.");
        setData({ items: [], total: 0, page: 1, pageSize: 20, pageCount: 1 });
        return;
      }
      setMessage("");
      setData({
        items: Array.isArray(payload.items) ? payload.items : [],
        total: payload.total || 0,
        page: payload.page || 1,
        pageSize: payload.pageSize || 20,
        pageCount: payload.pageCount || 1,
      });
    } catch (err) {
      setLoading(false);
      setMessage("Failed to load product history.");
      setData({ items: [], total: 0, page: 1, pageSize: 20, pageCount: 1 });
    }
  }

  async function restore(historyId: string) {
    if (!window.confirm("Restore this field from ProductHistory?")) return;
    const response = await fetch(`/api/products/${productId}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ historyId }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(payload?.message || "Restore failed.");
      return;
    }
    await load();
  }

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = searchInput.trim();
    if (!value) {
      setSearch("");
      setPage(1);
      pushFilters({ search: "", page: 1 });
      return;
    }
    const response = await fetch(`/api/products/identifier?identifier=${encodeURIComponent(value)}`);
    if (response.ok) {
      const payload = await response.json();
      if (payload.historyUrl) {
        router.push(payload.historyUrl);
        return;
      }
    }
    setSearch(value);
    setPage(1);
    pushFilters({ search: value, page: 1 });
  }

  useEffect(() => {
    load();
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4 text-sm text-slate-800">
        <div className="font-medium">Product Code: {productCode || "-"}</div>
        {selectedVariant ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div>Selected Variant: {selectedVariant.title}</div>
            <div>SKU: {selectedVariant.sku}</div>
            <div>Barcode: {selectedVariant.barcode}</div>
          </div>
        ) : null}
      </div>

      <div className="liquid-card grid gap-3 rounded-2xl p-4 md:grid-cols-6">
        <select value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm text-slate-900">
          {actionOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input value={variantId} onChange={(event) => { setVariantId(event.target.value); setPage(1); }} placeholder="Variant ID" className="rounded-lg border px-3 py-2 text-sm text-slate-900" />
        <form onSubmit={handleSearchSubmit} className="flex gap-2 md:col-span-2">
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by Product Code, SKU, or Barcode" className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900" />
          <button type="submit" className="rounded-lg border px-3 py-2 text-sm">Search</button>
        </form>
        <input type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm text-slate-900" />
        <input type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm text-slate-900" />
      </div>

      {message ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              {["Date", "Action", "Field", "Old Value", "New Value", "Product Code", "Variant SKU", "Barcode", "Changed By", "Role", "Seller Code", "Note", ""].map((heading) => (
                <th key={heading} className="px-3 py-2">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2 text-xs">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2"><span className="rounded-full bg-slate-900 px-2 py-1 text-xs text-white">{item.action}</span></td>
                <td className="px-3 py-2">{item.field || "-"}</td>
                <td className="px-3 py-2"><JsonCell label="Old value" value={item.oldValue} /></td>
                <td className="px-3 py-2"><JsonCell label="New value" value={item.newValue} /></td>
                <td className="px-3 py-2">{item.productCode || "-"}</td>
                <td className="px-3 py-2">{item.sku || "-"}</td>
                <td className="px-3 py-2">{item.barcode || "-"}</td>
                <td className="px-3 py-2">{item.changedByName || item.changedByUserCode || "-"}</td>
                <td className="px-3 py-2">{item.changedByRole || "-"}</td>
                <td className="px-3 py-2">{item.sellerCode || "-"}</td>
                <td className="px-3 py-2">{item.note || "-"}</td>
                <td className="px-3 py-2">
                  {canRestore && item.field ? (
                    <button type="button" onClick={() => restore(item.id)} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
                      <RotateCcw className="h-3 w-3" /> Restore
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!data?.items?.length ? (
              <tr><td className="px-3 py-8 text-center text-slate-500" colSpan={13}>{loading ? "Loading..." : "No history found."}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span>{data.total} records</span>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-md border px-3 py-1 disabled:opacity-50">Previous</button>
          <span className="px-2 py-1">Page {data.page} of {data.pageCount || 1}</span>
          <button type="button" disabled={page >= data.pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-md border px-3 py-1 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
