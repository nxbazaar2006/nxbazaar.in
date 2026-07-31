"use client";

import { useState } from "react";
import { GoDash, GoPlus } from "react-icons/go";

const faqData = [
  {
    id: 1,
    question: "How to place an order with Limi Commerce",
    answer: "Browse products, add items to cart, review your cart, proceed to checkout, enter delivery details, choose payment, and confirm your order.",
  },
  {
    id: 2,
    question: "What payment methods are accepted?",
    answer: "Limi Commerce supports pay on delivery, mobile money, cards, and vouchers where available.",
  },
  {
    id: 3,
    question: "How do I track my orders?",
    answer: "Log in to your account, open your orders page, and view the order details and status history.",
  },
  {
    id: 4,
    question: "What is the return and refund policy?",
    answer: "Eligible items can be returned within the stated return window. Approved refunds are processed to the original or selected payment method.",
  },
];

export default function Faq() {
  const [openId, setOpenId] = useState<number | null>(faqData[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {faqData.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="liquid-card px-4 py-3">
            <button type="button" className="flex w-full items-center justify-between gap-4 text-left font-semibold text-slate-900" onClick={() => setOpenId(open ? null : item.id)}>
              <span>{item.question}</span>
              {open ? <GoDash /> : <GoPlus />}
            </button>
            {open ? <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
