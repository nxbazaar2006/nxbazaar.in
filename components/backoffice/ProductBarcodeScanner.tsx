"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

type ScanResponse = {
  historyUrl?: string;
  dashboardHistoryUrl?: string;
};

export default function ProductBarcodeScanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSubmittedRef = useRef("");
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(value: string) {
    const scannedCode = value.trim();
    if (!scannedCode || loading) return;
    if (lastSubmittedRef.current === scannedCode) return;
    lastSubmittedRef.current = scannedCode;
    setLoading(true);
    setMessage("");

    const response = await fetch(`/api/products/scan?code=${encodeURIComponent(scannedCode)}`);
    const payload = (await response.json().catch(() => null)) as ScanResponse & { message?: string };
    setLoading(false);

    if (!response.ok || !payload?.historyUrl) {
      lastSubmittedRef.current = "";
      setCode("");
      setMessage(payload?.message || "Product not found");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    router.push(payload.historyUrl);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    lookup(code);
  }

  useEffect(() => {
    inputRef.current?.focus();
    const interval = window.setInterval(() => inputRef.current?.focus(), 1500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const initialCode = searchParams.get("code");
    if (initialCode) lookup(initialCode);
  }, [searchParams]);

  return (
    <div className="liquid-card mx-auto my-3 w-full max-w-3xl rounded-[30px] p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          autoFocus
          disabled={loading}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Scan or enter Product Code, SKU, or Barcode"
          className="liquid-card block w-full rounded-2xl border-0 px-4 py-3 text-white focus:ring-2 focus:ring-white/45 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          <Search className="h-4 w-4" /> {loading ? "Searching..." : "Open"}
        </button>
      </form>

      {message ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}
    </div>
  );
}
