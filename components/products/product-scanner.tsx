"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ProductScanner() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSubmittedRef = useRef<string | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isPending) {
      inputRef.current?.focus();
    }
  }, [isPending]);

  async function submitScan(rawValue: string) {
    const identifier = rawValue.trim();

    if (!identifier || isPending || lastSubmittedRef.current === identifier) {
      return;
    }

    lastSubmittedRef.current = identifier;
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/products/identifier/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          lastSubmittedRef.current = null;
          setValue("");
          setError("Product not found");
          inputRef.current?.focus();
          return;
        }

        const destination =
          result.data.type === "PRODUCT_CODE"
            ? `/products/${result.data.productId}/history?source=scan`
            : `/products/${result.data.productId}/history?variantId=${result.data.variantId}&source=scan`;

        router.push(destination);
      } catch {
        lastSubmittedRef.current = null;
        setValue("");
        setError("Product not found");
        inputRef.current?.focus();
      }
    });
  }

  return (
    <section className="max-w-xl rounded-lg border p-5">
      <label className="mb-2 block text-sm font-medium" htmlFor="scanner-code">
        Barcode scanner input
      </label>
      <input
        ref={inputRef}
        id="scanner-code"
        className="w-full rounded-md border bg-background px-3 py-2"
        value={value}
        disabled={isPending}
        autoFocus
        placeholder="Scan Product Code, SKU, or Barcode"
        onBlur={() => {
          if (!isPending) {
            window.setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void submitScan(value);
          }
        }}
      />
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm"
          disabled={isPending}
          onClick={() => submitScan(value)}
        >
          Search
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm"
          disabled={isPending}
          onClick={() => {
            lastSubmittedRef.current = null;
            setValue("");
            setError(null);
            inputRef.current?.focus();
          }}
        >
          Clear
        </button>
      </div>
    </section>
  );
}
