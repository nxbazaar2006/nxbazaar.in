"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalized = query.trim();
    if (!normalized) return;

    router.push(`/search?search=${encodeURIComponent(normalized)}`);
  }

  return (
    <form
      className="nx-home-search"
      onSubmit={handleSubmit}
      role="search"
    >
      <Search className="nx-home-search-icon" />

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("navbar.searchPlaceholder")}
        aria-label="Search NXBazaar"
      />

      <button
        type="button"
        className="nx-search-filter"
        aria-label="Search filters"
        aria-disabled="true"
        disabled
      >
        <SlidersHorizontal />
      </button>
    </form>
  );
}
