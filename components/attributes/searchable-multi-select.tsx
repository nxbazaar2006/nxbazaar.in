"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type MultiSelectOption = {
  id: string;
  label: string;
  value: string;
  colorCode?: string | null;
};

type SearchableMultiSelectProps = {
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  isVariant?: boolean;
};

export function SearchableMultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  disabled = false,
  isVariant = false,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  const toggleOption = (val: string) => {
    if (disabled) return;
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const removeValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedValues.filter((v) => v !== val));
  };

  return (
    <div className="relative w-full space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white/90">
          {label}
        </label>
        {isVariant ? (
          <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
            Variant Attribute
          </span>
        ) : null}
      </div>

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`liquid-card flex min-h-11 w-full cursor-pointer items-center justify-between rounded-2xl border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white backdrop-blur-xl transition-all ${
          isOpen ? "ring-2 ring-purple-500/50 border-purple-400" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 pr-2">
          {selectedValues.length === 0 ? (
            <span className="text-xs text-white/50">{placeholder}</span>
          ) : (
            selectedValues.map((val) => {
              const opt = options.find((o) => o.value === val);
              const displayLabel = opt?.label ?? val;
              return (
                <span
                  key={val}
                  className="flex items-center gap-1 rounded-full border border-purple-400/40 bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-200 shadow-sm"
                >
                  {opt?.colorCode ? (
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-white/40"
                      style={{ backgroundColor: opt.colorCode }}
                    />
                  ) : null}
                  <span>{displayLabel}</span>
                  <button
                    type="button"
                    onClick={(e) => removeValue(val, e)}
                    className="hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/60 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-hidden rounded-2xl border border-white/20 bg-slate-950/95 p-2 text-sm text-white shadow-2xl backdrop-blur-2xl">
          <div className="relative mb-2 flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search option..."
              className="w-full rounded-xl border border-white/15 bg-white/10 py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-white/40 outline-none focus:border-purple-400"
            />
          </div>

          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-center text-xs text-white/50">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                      isSelected
                        ? "bg-purple-500/25 text-purple-200"
                        : "hover:bg-white/10 text-white/90"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {opt.colorCode ? (
                        <span
                          className="h-3 w-3 rounded-full border border-white/40"
                          style={{ backgroundColor: opt.colorCode }}
                        />
                      ) : null}
                      <span>{opt.label}</span>
                    </div>

                    {isSelected ? (
                      <Check className="h-4 w-4 text-purple-400" />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
