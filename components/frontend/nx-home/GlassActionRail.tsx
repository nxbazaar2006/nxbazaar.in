"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  Grid2X2,
  Flame,
  Sparkles,
  Trophy,
  BadgePercent,
  ShoppingCart,
  PackageCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

type ActionItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  count?: number;
};

interface Props {
  categoryCount?: number;
  productCount?: number;
}

export default function GlassActionRail({ categoryCount, productCount }: Props) {
  const persistedCartCount = useSelector((state: RootState) => state.cart.length);
  const [hasMounted, setHasMounted] = useState(false);
  const cartCount = hasMounted ? persistedCartCount : 0;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const actions: ActionItem[] = [
  { label: "Categories", icon: Grid2X2, href: "/search", count: categoryCount },
  { label: "Products", icon: Sparkles, href: "/search", count: productCount },
  { label: "Trending", icon: Flame },
  { label: "New Arrivals", icon: Sparkles },
  { label: "Best Sellers", icon: Trophy },
  { label: "Deals", icon: BadgePercent },
  { label: "Your Cart", icon: ShoppingCart, href: "/cart", count: cartCount },
  { label: "Orders", icon: PackageCheck },
];

  return (
    <aside className="nx-action-rail" aria-label="Marketplace shortcuts">

      <div className="nx-action-heading">
        <span>Quick access</span>
        <strong>Marketplace</strong>
      </div>

      <div className="nx-action-list">
        {actions.map(({ label, icon: Icon, href, count }) => {
          const content = (
            <>
            <span className="nx-action-icon">
              <Icon />
            </span>

            <span className="nx-action-label">
              {label}
              {count != null && <small>{count}</small>}
            </span>

            <ChevronRight className="nx-action-chevron" />
            </>
          );

          return href ? (
            <Link key={label} href={href} className="nx-action-card">{content}</Link>
          ) : (
            <button key={label} type="button" className="nx-action-card" aria-disabled="true" disabled>{content}</button>
          );
        })}
      </div>

      <div className="nx-market-status">
        <span className="nx-market-status-dot" />
        <div>
          <strong>Marketplace online</strong>
          <span>Secure shopping enabled</span>
        </div>
      </div>

    </aside>
  );
}
