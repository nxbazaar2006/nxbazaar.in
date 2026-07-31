"use client";
import { LiquidGlassIconButton } from "@/components/ui/liquid-glass-icon-button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link"; import React from "react"; import { useSelector } from "react-redux"; import type { RootState } from "@/redux/store";
export default function CartCount() { const cartItems = useSelector((store: RootState) => store.cart); return ( <LiquidGlassIconButton asChild variant="success" aria-label="View cart"> <Link href="/cart" className="relative"> <ShoppingCart className="h-4 w-4" /> <span className="sr-only">Cart</span> <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full -top-0 end-6"> {cartItems.length} </div> </Link> </LiquidGlassIconButton> );
}
