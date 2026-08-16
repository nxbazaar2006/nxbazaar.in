"use client";

import { NX_MAIN_THEME_FAMILIES, type NxThemeFamily } from "@/lib/theme/catalog-theme";
import { Check, Palette } from "lucide-react";
import { useMemo, useState } from "react";

const shadeNumbers = Array.from({ length: 12 }, (_, index) => index + 1);

const familyLabels: Record<NxThemeFamily, string> = {
  red: "Red",
  orange: "Orange",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  indigo: "Indigo",
  violet: "Violet",
};

export default function ThemePaletteManager() {
  const [activeFamily, setActiveFamily] = useState<NxThemeFamily>("blue");
  const [activeShade, setActiveShade] = useState(7);

  const activeClassName = useMemo(
    () => `nx-catalog-theme nx-theme-${activeFamily} nx-theme-shade-${activeShade}`,
    [activeFamily, activeShade],
  );

  return (
    <section className={`${activeClassName} liquid-card rounded-3xl border border-white/30 bg-white/40 p-6 shadow-xl backdrop-blur-2xl`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide nx-theme-accent">
            <Palette className="h-4 w-4" />
            Catalog Theme Manager
          </div>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Department color preview</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            7 main families with 12 mostly-medium shades. Department uses the main family, categories use stable shades, and subcategories inherit a nearby shade.
          </p>
        </div>

        <div className="nx-theme-surface rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-800">
          Active: {familyLabels[activeFamily]} / Shade {activeShade}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {NX_MAIN_THEME_FAMILIES.map((family) => {
          const selected = family === activeFamily;
          return (
            <button
              key={family}
              type="button"
              onClick={() => setActiveFamily(family)}
              className={`nx-catalog-theme nx-theme-${family} nx-theme-shade-7 nx-theme-surface relative rounded-2xl border px-4 py-4 text-left transition-transform hover:-translate-y-0.5 ${selected ? "ring-2 ring-slate-900/20" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-slate-900">{familyLabels[family]}</span>
                {selected ? <Check className="h-4 w-4 nx-theme-accent" /> : null}
              </div>
              <div className="mt-3 h-3 rounded-full nx-theme-accent-bg" />
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-950">12 category shades</h3>
            <p className="text-xs text-slate-500">Light support → medium priority → medium-deep. No dark shades.</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {shadeNumbers.map((shade) => {
            const selected = shade === activeShade;
            return (
              <button
                key={shade}
                type="button"
                onClick={() => setActiveShade(shade)}
                className={`nx-catalog-theme nx-theme-${activeFamily} nx-theme-shade-${shade} rounded-2xl border border-white/40 p-2 transition-transform hover:-translate-y-0.5 ${selected ? "ring-2 ring-slate-900/20" : ""}`}
                title={`${familyLabels[activeFamily]} shade ${shade}`}
              >
                <div className="h-10 rounded-xl nx-theme-accent-bg" />
                <div className="mt-1 text-center text-[11px] font-bold text-slate-700">{shade}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="nx-theme-surface rounded-2xl border p-4">
          <p className="text-xs font-bold uppercase tracking-wide nx-theme-accent">Department</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Main family: {familyLabels[activeFamily]}</p>
        </div>
        <div className="nx-theme-surface rounded-2xl border p-4">
          <p className="text-xs font-bold uppercase tracking-wide nx-theme-accent">Category</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Assigned shade: {activeShade}</p>
        </div>
        <div className="nx-theme-surface rounded-2xl border p-4">
          <p className="text-xs font-bold uppercase tracking-wide nx-theme-accent">Subcategory / Product</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Inherits nearby parent shade</p>
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        This dashboard control is currently a live preview. Database persistence should be connected only after the existing Department schema/API is audited, so duplicate theme fields are not introduced.
      </p>
    </section>
  );
}
