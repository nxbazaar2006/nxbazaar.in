"use client";
import { addToCart } from "@/redux/slices/cartSlice";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { BaggageClaim } from "lucide-react";
import React from "react";
import toast from "react-hot-toast"; import { useDispatch } from "react-redux";
export default function AddToCartButton({ product }) { const dispatch = useDispatch(); function handleAddToCart() { if (product.productType === "VARIABLE") { toast.error("Please select a variant."); return; } // Dispatch the reducer
dispatch(addToCart(product)); toast.success("Item added Successfully"); } return ( <LiquidGlassButton onClick={handleAddToCart} variant="success" leftIcon={<BaggageClaim />} className="!text-white [&_*]:!text-white [&_svg]:!text-white [&_svg]:!stroke-white" > Add to Cart </LiquidGlassButton> );
}
