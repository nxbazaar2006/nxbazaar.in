"use client";

import { getCitiesByState } from "@/lib/india/cities";
import { Check, ChevronDown, Navigation, Search } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

type CityComboboxProps = {
  state: string;
  value: string;
  onChange: (city: string) => void;
  error?: string;
  disabled?: boolean;
};

export function CityCombobox({
  state,
  value,
  onChange,
  error,
  disabled = false,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const availableCities = getCitiesByState(state);
  const isDisabled = disabled || !state;

  const filteredCities = availableCities.filter((city) =>
    city.toLowerCase().includes(search.trim().toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        City / District <span className="text-rose-500">*</span>
      </label>

      <div className="relative">
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => setOpen(!open)}
          className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
            error
              ? "border-rose-500 bg-rose-50/50 text-rose-900 dark:border-rose-500/80 dark:bg-rose-950/30 dark:text-rose-200"
              : open
              ? "border-cyan-500/80 bg-white/80 ring-2 ring-cyan-400/30 dark:border-cyan-400 dark:bg-slate-800/90"
              : "border-white/40 bg-white/50 hover:bg-white/70 dark:border-white/10 dark:bg-slate-800/60 dark:hover:bg-slate-800/80 text-slate-900 dark:text-white"
          } backdrop-blur-md shadow-sm disabled:cursor-not-allowed disabled:opacity-50`}
          aria-expanded={open}
        >
          <div className="flex items-center gap-2 truncate">
            <Navigation className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
            <span className="truncate">
              {value ? (
                value
              ) : (
                <span className="text-slate-400">
                  {state ? "Select City..." : "Select State First"}
                </span>
              )}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && !isDisabled && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-hidden rounded-2xl border border-white/40 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/95">
            {/* Search input */}
            <div className="relative mb-1 px-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city..."
                className="w-full rounded-lg border border-slate-200/80 bg-slate-100/70 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                autoFocus
              />
            </div>

            {/* City List */}
            <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
              {filteredCities.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  {search ? "No matching city found." : "No cities available."}
                </div>
              ) : (
                filteredCities.map((cityName) => {
                  const isSelected = cityName.toLowerCase() === value.toLowerCase();
                  return (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => {
                        onChange(cityName);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-cyan-500/15 font-semibold text-cyan-800 dark:bg-cyan-400/20 dark:text-cyan-300"
                          : "hover:bg-slate-100 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      <span>{cityName}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}
