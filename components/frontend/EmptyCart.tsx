import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";
export default function EmptyCart() { return ( <div className=" flex items-center justify-center min-h-screen"> <div className="space-y-4 text-center"> <p className="md:text-2xl">Your Cart is empty</p> <LiquidGlassButton asChild leftIcon={<ShoppingBag />} variant="cyan"> <Link href="/">Start Shopping</Link> </LiquidGlassButton> </div> </div> );
}
