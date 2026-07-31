"use client";

import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import type { CartItem } from "@/redux/slices/cartSlice";
import { setCurrentStep } from "@/redux/slices/checkoutSlice";
import type { RootState } from "@/redux/store";
import { ChevronLeft, PackageCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { getSingleImageUrl } from "@/lib/image-utils";

type SelectedAttribute = {
  attribute: string;
  value: string;
};

function isSelectedAttribute(value: unknown): value is SelectedAttribute {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    "attribute" in value &&
    "value" in value &&
    typeof value.attribute === "string" &&
    typeof value.value === "string"
  );
}

export default function OrderSummary() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const checkoutFormData = useSelector(
    (store: RootState) => store.checkout.checkoutFormData
  );
  const currentStep = useSelector(
    (store: RootState) => store.checkout.currentStep
  );
  const dispatch = useDispatch();

  function handlePrevious() {
    dispatch(setCurrentStep(currentStep - 1));
  }

  const cartItems = useSelector((store: RootState) => store.cart);
  const subTotal =
    cartItems
      .reduce((acc, currentItem) => {
        return acc + currentItem.salePrice * currentItem.qty;
      }, 0)
      .toFixed(2) ?? 0;

  async function submitData() {
    const data = {
      orderItems: cartItems,
      checkoutFormData,
    };
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      const response = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (response.ok) {
        setLoading(false);
        toast.success("Order Created Successfully");
        router.push(`/order-confirmation/${responseData.id}`);
      } else {
        setLoading(false);
        toast.error("Something went wrong, please try again");
      }
    } catch (error) {
      setLoading(false);
    }
  }

  return (
    <div className="my-6">
      <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
      {cartItems.map((cartItem: CartItem, i: number) => {
        const itemImage = getSingleImageUrl(cartItem.imageUrl);
        const hasImage = Boolean(cartItem.imageUrl);
        return (
          <div
            key={cartItem.id || `cart-item-${i}`}
            className="mb-4 flex items-center justify-between border-b border-slate-400 pb-3 text-sm font-semibold"
          >
            <div className="flex items-center gap-3">
              {hasImage ? (
                <Image
                  src={itemImage}
                  width={249}
                  height={249}
                  alt={cartItem.title || "Cart Item"}
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-200 text-xs font-semibold text-slate-600">
                  NA
                </div>
              )}
              <div className="flex flex-col">
                <h2>{cartItem.title}</h2>
                {cartItem.selectedAttributes &&
                  cartItem.selectedAttributes.length > 0 && (
                    <p className="text-xs font-normal text-gray-300">
                      {cartItem.selectedAttributes
                        .filter(isSelectedAttribute)
                        .map(
                          (attribute) =>
                            `${attribute.attribute}: ${attribute.value}`
                        )
                        .join(", ")}
                    </p>
                  )}
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-400">
              <p className="flex-grow px-4 py-2">{cartItem.qty}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col justify-center">
                <h4>₹{(cartItem.salePrice * cartItem.qty).toFixed(2)}</h4>
                <p className="text-[10px] text-gray-300">
                  (₹{cartItem.salePrice} x {cartItem.qty})
                </p>
              </div>
            </div>
          </div>
        );
      })}
      {checkoutFormData.shippingCost && (
        <div className="mb-4 flex items-center justify-between border-b border-slate-400 pb-3 text-sm font-semibold">
          <span>Shipping Cost</span>
          <span className="text-[12px] text-gray-300">
            The Order will be delivered in{" "}
            {checkoutFormData.shippingCost == "50"
              ? "3"
              : checkoutFormData.shippingCost == "75"
              ? "2"
              : "1"}{" "}
            days{" "}
          </span>
          <span>₹{String(checkoutFormData.shippingCost)}</span>
        </div>
      )}
      <div className="mb-4 flex items-center justify-between border-b border-slate-400 pb-3 text-sm font-semibold">
        <span>Total</span>
        <span>
          ₹
          {(
            parseFloat(String(checkoutFormData.shippingCost || 0)) +
            parseFloat(String(subTotal || 0))
          ).toFixed(2)}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <LiquidGlassButton
          onClick={handlePrevious}
          type="button"
          variant="neutral"
          leftIcon={<ChevronLeft />}
          className="mt-4 sm:mt-6"
        >
          Previous
        </LiquidGlassButton>
        <LiquidGlassButton
          onClick={submitData}
          variant="success"
          loading={loading}
          disabled={loading}
          rightIcon={<PackageCheck />}
          className="mt-4 sm:mt-6"
        >
          {loading ? "Processing..." : "Place Order"}
        </LiquidGlassButton>
      </div>
    </div>
  );
}
