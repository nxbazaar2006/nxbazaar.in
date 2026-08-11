"use client";

import {
  BadgeCheck,
  BadgePercent,
  BookOpen,
  Headphones,
  LifeBuoy,
  LogIn,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  Store,
  Tags,
  UserPlus,
  Video,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import type { IconType } from "react-icons";

import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { LiquidGlassIconButton } from "@/components/ui/liquid-glass-icon-button";

type FooterLink = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type FooterGroup = {
  title: string;
  links: FooterLink[];
};

const footerGroups: FooterGroup[] = [
  {
    title: "Shop",
    links: [
      { label: "Search", href: "/search", icon: Search },
      { label: "Cart", href: "/cart", icon: ShoppingCart },
      { label: "Deals", href: "/search", icon: BadgePercent },
    ],
  },
  {
    title: "Marketplace",
    links: [
      { label: "Blogs", href: "/blogs", icon: BookOpen },
      { label: "Vlogs", href: "/vlogs", icon: Video },
      { label: "Become a Seller", href: "/register", icon: Store },
      { label: "Farmer Registration", href: "/register-farmer", icon: Sprout },
      { label: "Farmer Pricing", href: "/farmer-pricing", icon: Tags },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/support", icon: LifeBuoy },
      { label: "Login", href: "/login", icon: LogIn },
      { label: "Register", href: "/register", icon: UserPlus },
    ],
  },
];

const trustItems = [
  { label: "Secure Checkout", icon: ShieldCheck },
  { label: "Verified Sellers", icon: BadgeCheck },
  { label: "GST-ready Invoices", icon: ReceiptText },
  { label: "Fast Support", icon: Headphones },
];

const socialItems = [
  {
    label: "Facebook",
    icon: FaFacebookF,
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL,
  },
  {
    label: "Instagram",
    icon: FaInstagram,
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  },
  {
    label: "YouTube",
    icon: FaYoutube,
    href: process.env.NEXT_PUBLIC_YOUTUBE_URL,
  },
  {
    label: "LinkedIn",
    icon: FaLinkedinIn,
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL,
  },
  {
    label: "X",
    icon: FaXTwitter,
    href: process.env.NEXT_PUBLIC_X_URL,
  },
] satisfies Array<{ label: string; icon: IconType; href?: string }>;

const linkClass =
  "group flex min-h-11 items-center gap-3 rounded-2xl px-2.5 py-2 text-sm text-slate-200/80 transition-all duration-200 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto mt-3 w-[calc(100%_-_24px)] text-slate-100 sm:mt-4 lg:mt-6">
        <div
          className="relative overflow-hidden rounded-[24px] border border-white/15 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.38),inset_1px_0_0_rgba(255,255,255,0.18),inset_-1px_0_0_rgba(154,207,241,0.12),inset_0_-1px_0_rgba(37,72,99,0.14),0_18px_48px_rgba(0,0,0,0.12),0_0_24px_rgba(177,225,255,0.07)] sm:rounded-[26px] sm:p-6 lg:p-8 xl:p-10"
        style={{
          background:
            "linear-gradient(145deg, rgba(222,238,249,0.24) 0%, rgba(169,199,222,0.16) 48%, rgba(103,148,183,0.12) 100%)",
          WebkitBackdropFilter: "blur(30px) saturate(145%) brightness(1.05)",
          backdropFilter: "blur(30px) saturate(145%) brightness(1.05)",
        }}
      >
        <div className="pointer-events-none absolute inset-[1px] rounded-[inherit] bg-[linear-gradient(118deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.16)_8%,transparent_24%,transparent_67%,rgba(135,215,255,0.08)_84%,rgba(255,255,255,0.20)_100%)]" />
        <div className="pointer-events-none absolute inset-x-[12%] bottom-[-10%] h-[38%] bg-[radial-gradient(ellipse_at_center,rgba(80,199,255,0.22),transparent_68%)] blur-2xl" />
        <div className="pointer-events-none absolute inset-x-[10%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.88),rgba(184,230,255,0.55),transparent)] blur-[0.2px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-soft-light"
          style={{
            backgroundImage:
              'url("/textures/glass-noise.svg"), url("/textures/glass-reflection.svg")',
            backgroundSize: "180px 180px, 100% auto",
            backgroundPosition: "0 0, center top",
            backgroundRepeat: "repeat, no-repeat",
          }}
        />

        <div className="relative z-10">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr] xl:gap-10">
            <section aria-labelledby="footer-brand" className="min-w-0">
              <Link
                href="/"
                className="inline-flex rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                aria-label="NXBazaar home"
              >
                <Image
                  src="/limiLogo.webp"
                  alt="NXBazaar.in"
                  width={180}
                  height={64}
                  className="h-auto w-32 object-contain drop-shadow-[0_6px_18px_rgba(255,255,255,0.08)] sm:w-40"
                  sizes="(max-width: 640px) 128px, 160px"
                  priority={false}
                />
              </Link>

              <h2 id="footer-brand" className="mt-6 text-2xl font-semibold tracking-normal text-white drop-shadow-sm sm:text-3xl">
                NXBazaar.in
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-100/80 sm:text-base">
                A customer-first marketplace for trusted products, verified sellers,
                farmer-led commerce, and everyday shopping in one secure experience.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-cyan-100/78">
                Built for customers, sellers, and farmers who need reliable discovery,
                transparent pricing, and dependable support.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <LiquidGlassButton asChild variant="cyan" size="sm" leftIcon={<Search />}>
                  <Link href="/search">Start Shopping</Link>
                </LiquidGlassButton>
                <LiquidGlassButton asChild variant="secondary" size="sm" leftIcon={<Store />}>
                  <Link href="/register">Become a Seller</Link>
                </LiquidGlassButton>
                <LiquidGlassButton asChild variant="ghost" size="sm" leftIcon={<LifeBuoy />}>
                  <Link href="/support">Get Support</Link>
                </LiquidGlassButton>
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
                  Follow NXBazaar
                </h3>
                <div className="mt-3 flex flex-wrap gap-2" aria-label="Social profiles">
                  {socialItems.map(({ label, icon: Icon, href }) =>
                    href ? (
                      <LiquidGlassIconButton
                        key={label}
                        asChild
                        variant="ghost"
                        aria-label={`NXBazaar on ${label}`}
                        className="liquid-kit-icon-button text-slate-100/85"
                      >
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </LiquidGlassIconButton>
                    ) : (
                      <LiquidGlassIconButton
                        key={label}
                        variant="ghost"
                        disabled
                        aria-label={`NXBazaar on ${label} not configured`}
                        title={`${label} profile not configured`}
                        className="liquid-kit-icon-button text-slate-100/70"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </LiquidGlassIconButton>
                    ),
                  )}
                </div>
              </div>
            </section>

            <nav aria-label="Footer" className="contents">
              {footerGroups.map((group) => (
                <section key={group.title} aria-labelledby={`footer-${group.title.toLowerCase()}`}>
                  <h3
                    id={`footer-${group.title.toLowerCase()}`}
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70"
                  >
                    {group.title}
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-1">
                    {group.links.map(({ label, href, icon: Icon }) => (
                      <Link key={`${group.title}-${label}`} href={href} className={linkClass}>
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.12] bg-white/[0.035] text-cyan-100/80 transition duration-200 group-hover:border-white/20 group-hover:bg-white/[0.08] group-hover:text-white">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 leading-5">{label}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </nav>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl border border-white/20 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(30,75,100,0.10)] backdrop-blur-xl sm:gap-3 lg:grid-cols-4">
            {trustItems.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-slate-100"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.045] text-cyan-100">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-slate-300/70 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {year} NXBazaar.in</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
