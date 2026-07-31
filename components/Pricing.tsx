import Link from "next/link";
import { Check, X } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      title: "Free",
      isRecommended: false,
      description: "+5% transaction fee. Its Good For Starters",
      price: "$0",
      features: ["All features", "Unlimited products", "Unlimited revenue"],
      nonFeatures: [],
      link: "/register-farmer?plan=free",
      buttonText: "Start for free",
    },
    {
      title: "Silver",
      isRecommended: true,
      description: "+2% transaction fee. Its Good if your revenue is above $500",
      price: "$20",
      features: ["All features", "Unlimited products", "Unlimited revenue"],
      nonFeatures: [],
      link: "/register-farmer?plan=silver",
      buttonText: "Get started",
    },
    {
      title: "Gold",
      isRecommended: false,
      description: "No transaction fee. Is Good if your earning more than $5000 in revenue",
      price: "$99",
      features: ["All features", "Unlimited products", "Unlimited revenue"],
      nonFeatures: [],
      link: "/register-farmer?plan=gold",
      buttonText: "Get Started",
    },
  ];

  return (
    <div className="p-2 md:p-10">
      <div className="flex flex-col items-center">
        <div className="flex items-center self-center rounded-lg bg-slate-200 p-0.5">
          <button type="button" className="w-full rounded-md border-slate-50 bg-slate-50 px-4 py-2 text-sm font-medium whitespace-nowrap text-slate-900 shadow-sm focus:outline-none sm:w-auto sm:px-8">
            Choose a plan which suits you!
          </button>
        </div>
        <span className="mt-4 max-w-2xl text-center">
          Discover simplicity in pricing with us. Our straightforward and competitive rates ensure you get the best value.
        </span>
      </div>
      <div className="mx-auto mt-12 grid gap-6 sm:mt-16 sm:grid-cols-3 md:max-w-5xl xl:grid-cols-3">
        {plans.map((plan, i) => (
          <div key={i} className="liquid-card divide-y divide-slate-200 p-6">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl leading-6 font-bold text-slate-900">{plan.title}</h2>
                {plan.isRecommended ? (
                  <span className="rounded-full border border-lime-500 bg-lime-500 px-3 py-1 text-xs text-white uppercase">recommended</span>
                ) : null}
              </div>
              <p className="mt-2 text-base leading-tight text-slate-700">{plan.description}</p>
              <p className="mt-8">
                <span className="text-4xl font-bold tracking-tighter text-slate-900">{plan.price}</span>
                <span className="text-base font-medium text-slate-500"> /mo</span>
              </p>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h3 className="text-sm font-bold tracking-wide text-slate-900 uppercase">What's included</h3>
              <ul role="list" className="mt-4 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <Check className="h-5 w-5 shrink-0 text-green-400" />
                    <span className="text-base text-slate-700">{feature}</span>
                  </li>
                ))}
                {plan.nonFeatures.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <X className="h-5 w-5 shrink-0 text-red-500" />
                    <span className="text-base text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.link} className="mt-8 block w-full rounded-full bg-slate-950 py-3 text-center text-sm font-semibold text-white">
                {plan.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
