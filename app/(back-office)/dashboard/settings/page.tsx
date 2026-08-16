import FormHeader from "@/components/backoffice/FormHeader";
import ThemePaletteManager from "@/components/backoffice/ThemePaletteManager";
import {
  Bell,
  CreditCard,
  Globe2,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Store,
  UserRoundCog,
} from "lucide-react";

const settingSections = [
  {
    title: "Account Settings",
    description: "Manage profile details, contact information, and account preferences.",
    icon: UserRoundCog,
    items: ["Profile information", "Email and phone", "Language preference"],
  },
  {
    title: "Store Settings",
    description: "Configure storefront details, seller identity, and public business data.",
    icon: Store,
    items: ["Store name", "Business address", "Seller display code"],
  },
  {
    title: "Notifications",
    description: "Choose how order, inventory, payout, and support alerts are delivered.",
    icon: Bell,
    items: ["Order alerts", "Inventory alerts", "Payout updates"],
  },
  {
    title: "Security",
    description: "Review sign-in protection, password controls, and account access.",
    icon: LockKeyhole,
    items: ["Password", "Session activity", "Two-step verification"],
  },
  {
    title: "Payments",
    description: "Manage payout methods, settlement preferences, and billing details.",
    icon: CreditCard,
    items: ["Payout account", "Tax details", "Settlement cycle"],
  },
  {
    title: "Appearance",
    description: "Adjust dashboard display preferences for daily operations.",
    icon: Palette,
    items: ["84-color catalog theme", "Density", "Table view"],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-12">
      <FormHeader title="Settings" />

      <section className="liquid-card rounded-3xl border border-white/30 bg-white/40 p-6 shadow-xl backdrop-blur-2xl dark:border-white/15 dark:bg-slate-900/60">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                Workspace Control
              </p>
              <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                Manage NXBazaar settings
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Keep account, store, security, operational preferences, and catalog color identity organized from one dashboard.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/35 bg-white/45 px-4 py-3 text-sm font-semibold text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-white">
            <span className="inline-flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-emerald-500" />
              India workspace
            </span>
          </div>
        </div>
      </section>

      <ThemePaletteManager />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {settingSections.map((section) => {
          const Icon = section.icon;

          return (
            <article
              key={section.title}
              className="liquid-card group rounded-3xl border border-white/30 bg-white/35 p-5 shadow-lg backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/50 dark:border-white/15 dark:bg-slate-900/55 dark:hover:bg-slate-900/75"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/35 bg-white/45 text-cyan-700 shadow-sm backdrop-blur-xl transition-colors group-hover:text-cyan-600 dark:border-white/10 dark:bg-white/10 dark:text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-white/25 bg-white/30 px-3 py-2 text-sm font-semibold text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    <span>{item}</span>
                    <span className="rounded-full bg-slate-950/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-white/55">
                      {item === "84-color catalog theme" ? "Active" : "Soon"}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
