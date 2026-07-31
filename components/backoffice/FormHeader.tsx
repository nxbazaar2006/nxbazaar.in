"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FormHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="liquid-card page-header-glass mb-5 flex w-full items-center justify-between rounded-[30px] px-5 py-5 sm:px-7 lg:px-8 lg:py-6">
      <h2 className="text-xl font-semibold sm:text-2xl lg:text-3xl text-white !text-white">{title}</h2>
      <button
        type="button"
        onClick={() => router.back()}
        className="dashboard-submit-action liquid-glass-control liquid-glass-primary flex min-h-10 shrink-0 items-center gap-2.5 rounded-full py-1 pl-4 pr-1 font-semibold !text-white [&_*]:!text-white [&_svg]:!stroke-white"
      >
        <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />
        <span className="liquid-glass-content text-sm font-semibold text-white">Back</span>
        <span className="liquid-glass-content grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10">
          <ArrowLeft className="h-4 w-4 text-white" />
        </span>
      </button>
    </div>
  );
}
