import React from "react";
import CartProduct from "./CartProduct";
import EmptyCart from "./EmptyCart";

export default function CartItems({ cartItems }) {
  return (
    <div className="md:col-span-8 col-span-full">
      {cartItems.length > 0 && (
        <>
          <h2 className="py-2 mb-6 text-2xl">Shopping Cart</h2>
          <div className="flex items-center justify-between border-b border-slate-400 text-slate-400 pb-3 font-semibold text-sm mb-4">
            <h2 className="uppercase">Product</h2>
            <h2 className="uppercase">Quantity</h2>
            <h2 className="uppercase">Price</h2>
          </div>
        </>
      )}
      <div className="">
        {cartItems.length > 0 ? (
          cartItems.map((item, i) => {
            return <CartProduct cartItem={item} key={i} />;
          })
        ) : (
          <EmptyCart />
        )}
      </div>
    </div>
  );
}
