"use client";

import Link from "next/link";
import {
  Home,
  Grid2X2,
  Package,
  BadgePercent,
  ShoppingBag,
  Heart,
  UserRound,
  Store,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

const items: NavItem[] = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Categories", icon: Grid2X2, href: "/search" },
  { label: "Products", icon: Package, href: "/search" },
  { label: "Deals", icon: BadgePercent },
  { label: "Orders", icon: ShoppingBag },
  { label: "Wishlist", icon: Heart },
  { label: "Profile", icon: UserRound },
];

export default function GlassNavigation() {
  const pathname = usePathname();

  return (
    <aside className="nx-glass-nav">
      <div className="nx-nav-brand">
        <span className="nx-nav-logo">
          <Store />
        </span>

        <div>
          <strong>NXBazaar</strong>
          <span>Marketplace</span>
        </div>
      </div>

      <nav className="nx-nav-menu">
        {items.map(({ label, icon: Icon, href }) => {
          const isActive = href === "/"
            ? pathname === "/"
            : Boolean(href && (pathname === href || pathname.startsWith(`${href}/`)));
          const className = `nx-nav-item ${isActive ? "is-active" : ""}`;
          
          if (href) {
            return (
              <Link
                key={label}
                href={href}
                className={className}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            );
          }

          return (
            <button
              key={label}
              type="button"
              className={className}
              aria-disabled="true"
              disabled
            >
              <Icon />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="nx-nav-account">
        <div className="nx-nav-avatar">NX</div>

        <div>
          <strong>Customer</strong>
          <span>Premium member</span>
        </div>
      </div>
    </aside>
  );
}
