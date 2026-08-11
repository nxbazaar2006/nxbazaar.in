"use client";

import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { ShoppingCart } from "lucide-react";
import { LiquidGlassIconButton } from "@/components/ui/liquid-glass-icon-button";
import type { RootState } from "@/redux/store";

interface CartCountProps {
  showLink?: boolean;
}

export default function CartCount({ showLink = true }: CartCountProps) {
  const cartItems = useSelector((store: RootState) => store.cart);

  if (!showLink) {
    return (
      <span className="relative inline-flex items-center justify-center">
        <ShoppingCart className="h-4 w-4 text-cyan-300" />
        <span className="sr-only">Cart</span>
        <span className="absolute -top-2 -end-2.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
          {cartItems.length}
        </span>
      </span>
    );
  }

  return (
    <LiquidGlassIconButton asChild variant="success" aria-label="View cart">
      <Link href="/cart" className="relative">
        <ShoppingCart className="h-4 w-4" />
        <span className="sr-only">Cart</span>
        <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full -top-0 end-6">
          {cartItems.length}
        </div>
      </Link>
    </LiquidGlassIconButton>
  );
}

