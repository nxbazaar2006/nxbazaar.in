import Link from "next/link";
import React from "react";

export default function CartSubTotalCard({ subTotal }) {
  const shipping = 10.0;
  const tax = 0.0;
  const totalPrice = (
    Number(subTotal) +
    Number(shipping) +
    Number(tax)
  ).toFixed(2);
  return (
    <div className="md:col-span-4 col-span-full sm:block bg-white border border-gray-300 rounded-lg  dark:bg-gray-700 dark:border-gray-700 text-slate-800 overflow-hidden  p-5 dark:text-slate-100 font-bold ">
      <h2 className="text-2xl pb-3 border-b border-slate-500">Cart Summary</h2>
      <p className="border-b border-slate-500 py-6 text-slate-400 font-normal">
        Add your Shipping address at checkout to see shipping charges
      </p>
      <div className="flex items-center justify-between py-4 font-bold">
        <span>Total </span>
        <span>${totalPrice}</span>
      </div>
      <div className="mt-8">
        <Link
          href="/checkout"
          className=" text-slate-50 rounded-lg py-3 px-6 font-normal bg-slate-900 dark:bg-green-600"
        >
          Continue to Checkout
        </Link>
      </div>
    </div>
  );
}
