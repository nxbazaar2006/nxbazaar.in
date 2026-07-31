"use client";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { LiquidGlassInput } from "@/components/ui/liquid-glass-input";
import { CreditCard, ShoppingBag, TicketPercent } from "lucide-react";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";
export default function CartSubTotalCard({ subTotal }) { const shipping = 10.0; const tax = 0.0; const totalPrice = ( Number(subTotal) + Number(shipping) + Number(tax) ).toFixed(2); return ( <div className="frontend-glass md:col-span-4 col-span-full overflow-hidden rounded-[30px] p-5 font-bold text-slate-800 sm:block"> <h2 className="border-b border-white/55 pb-3 text-2xl">Cart Summary</h2> <p className="border-b border-white/55 py-6 font-normal text-slate-500"> Add your Shipping address at checkout to see shipping charges </p> <div className="flex items-center justify-between py-4 font-bold"> <span>Total </span> <span>${totalPrice}</span> </div> <div className="mt-8 space-y-3"> <div className="flex flex-col gap-2 sm:flex-row"> <LiquidGlassInput placeholder="Coupon code" leftIcon={<TicketPercent />} wrapperClassName="flex-1" /> <LiquidGlassButton variant="secondary" leftIcon={<TicketPercent />} onClick={() => toast.success("Coupon code captured")} > Apply Coupon </LiquidGlassButton> </div> <div className="grid gap-2 sm:grid-cols-2"> <LiquidGlassButton asChild variant="neutral" leftIcon={<ShoppingBag />} fullWidth> <Link href="/">Continue Shopping</Link> </LiquidGlassButton> <LiquidGlassButton asChild variant="primary" rightIcon={<CreditCard />} fullWidth> <Link href="/checkout">Proceed to Checkout</Link> </LiquidGlassButton> </div> </div> </div> );
}
