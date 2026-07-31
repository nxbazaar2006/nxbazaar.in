"use client";
import { decrementQty, incrementQty, removeFromCart, } from "@/redux/slices/cartSlice"; import { Minus, Plus, Trash2 } from "lucide-react"; import Image from "next/image"; import React from "react"; import toast from "react-hot-toast"; import { useDispatch } from "react-redux";
import { getSingleImageUrl } from "@/lib/image-utils";
import { useState } from "react";

export default function CartProduct({ cartItem }) {
  const dispatch = useDispatch();
  function handleCartItemDelete(cartId) {
    dispatch(removeFromCart(cartId));
    toast.success("Item removed Successfully");
  }
  function handleQtyIncrement(cartId) {
    dispatch(incrementQty(cartId));
  }
  function handleQtyDecrement(cartId) {
    dispatch(decrementQty(cartId));
  }
  const cartKey = cartItem.cartKey || cartItem.id;
  const initialImageUrl = getSingleImageUrl(cartItem.imageUrl);
  const [imgSrc, setImgSrc] = useState(initialImageUrl);
  const [hasError, setHasError] = useState(false);
  const hasImage = Boolean(cartItem.imageUrl) && !hasError;

  return (
    <div className="flex items-center justify-between border-b border-slate-400 pb-3 font-semibold text-sm mb-4">
      <div className="flex items-center gap-3">
        {hasImage ? (
          <Image
            src={imgSrc}
            width={249}
            height={249}
            alt={cartItem.title || "Cart Item"}
            className="rounded-xl w-20 h-20"
            onError={() => {
              setImgSrc("/vegetables.png");
              setHasError(true);
            }}
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-200 text-xs font-semibold text-slate-600">
            NA
          </div>
        )}
        <div className="flex flex-col">
          <h2>{cartItem.title}</h2>
          {cartItem.selectedAttributes?.length > 0 && (
            <p className="text-xs font-normal text-gray-300">
              {cartItem.selectedAttributes
                .map((attribute) => `${attribute.attribute}: ${attribute.value}`)
                .join(", ")}
            </p>
          )}
        </div>
      </div>
      <div className=" rounded-xl border border-gray-400 flex gap-3 items-center ">
        <button onClick={() => handleQtyDecrement(cartKey)} className="border-r border-gray-400 py-2 px-4">
          <Minus />
        </button>
        <p className="flex-grow py-2 px-4">{cartItem.qty}</p>
        <button onClick={() => handleQtyIncrement(cartKey)} className="border-l border-gray-400 py-2 px-4">
          <Plus />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col justify-center">
          <h4>${(cartItem.salePrice * cartItem.qty).toFixed(2)}</h4>
          <p className="text-[10px] text-gray-300">
            (${cartItem.salePrice}x {cartItem.qty})
          </p>
        </div>
        <button onClick={() => handleCartItemDelete(cartKey)}>
          <Trash2 className="text-red-600 w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 