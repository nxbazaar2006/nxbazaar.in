"use client";

import { createHsnCode, updateHsnCode } from "@/actions/hsn-code";
import FormHeader from "@/components/backoffice/FormHeader";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import { defaultAllowedGstRates } from "@/lib/validations/hsn-code";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import toast from "react-hot-toast";
import type { HsnCodeRow, HsnTableRow } from "@/types/hsn";

type HsnFormState = {
  code: string;
  description: string;
  chapter: string;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cessRate: number;
  taxType: "TAXABLE" | "NIL_RATED" | "EXEMPT" | "NON_GST";
  uqc: string;
  keywords: string;
  effectiveTo: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  changeReason: string;
};

type HsnCodeFormInitialData = Partial<HsnCodeRow | HsnTableRow> & { id?: string };

const empty: HsnFormState = {
  code: "",
  description: "",
  chapter: "",
  gstRate: 5,
  cgstRate: 2.5,
  sgstRate: 2.5,
  igstRate: 5,
  cessRate: 0,
  taxType: "TAXABLE",
  uqc: "",
  keywords: "",
  effectiveTo: "",
  status: "ACTIVE",
  changeReason: "",
};

const inputClass =
  "w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all";

const labelClass = "block text-sm font-medium text-white/80 mb-1.5";

export default function HsnCodeForm({ initialData }: { initialData?: HsnCodeFormInitialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState<HsnFormState>(() => ({
    ...empty,
    ...initialData,
    gstRate: initialData?.gstRate ?? empty.gstRate,
    cgstRate: initialData?.cgstRate ?? empty.cgstRate,
    sgstRate: initialData?.sgstRate ?? empty.sgstRate,
    igstRate: initialData?.igstRate ?? empty.igstRate,
    cessRate: initialData?.cessRate ?? 0,
    keywords: Array.isArray(initialData?.keywords)
      ? initialData.keywords.join(", ")
      : "",
    effectiveTo: initialData?.effectiveTo
      ? new Date(initialData.effectiveTo).toISOString().slice(0, 10)
      : "",
  }));

  useEffect(() => {
    const gstRate = Number(form.gstRate);
    if (!Number.isFinite(gstRate)) return;
    setForm((current) => ({
      ...current,
      cgstRate: Number((gstRate / 2).toFixed(2)),
      sgstRate: Number((gstRate / 2).toFixed(2)),
      igstRate: gstRate,
    }));
  }, [form.gstRate]);

  function update(name: string, value: string | number) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    startTransition(async () => {
      const action = initialData?.id
        ? updateHsnCode(initialData.id, form)
        : createHsnCode(form);
      const result = await action;
      if (!result.success) {
        setFieldErrors("fieldErrors" in result ? result.fieldErrors ?? {} : {});
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/dashboard/hsn-codes");
      router.refresh();
    });
  }

  const textFields: [string, string, string?][] = [
    ["code", "HSN Code"],
    ["description", "Official Description"],
    ["chapter", "Chapter"],
    ["uqc", "UQC"],
    ["keywords", "Keywords"],
    ["changeReason", "Change Reason"],
  ];

  const isEditing = Boolean(initialData?.id);

  return (
    <div className="mx-auto w-full max-w-5xl my-3">
      <FormHeader title={isEditing ? "Edit HSN Code" : "New HSN Code"} />

      <form
        onSubmit={submit}
        className="liquid-card w-full rounded-[30px] p-4 sm:p-6 md:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">

          {/* Text fields */}
          {textFields.map(([name, label, type]) => (
            <div key={name}>
              <label className={labelClass}>{label}</label>
              <input
                className={inputClass}
                type={type ?? "text"}
                value={form[name as keyof HsnFormState] ?? ""}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  update(name, event.target.value)
                }
              />
              {fieldErrors[name] ? (
                <span className="mt-1 text-xs text-red-400">
                  {fieldErrors[name][0]}
                </span>
              ) : null}
            </div>
          ))}

          {/* GST Rate */}
          <div>
            <label className={labelClass}>GST Rate</label>
            <select
              className={inputClass}
              value={form.gstRate}
              onChange={(event) => update("gstRate", Number(event.target.value))}
            >
              {defaultAllowedGstRates.map((rate) => (
                <option key={rate} value={rate} className="bg-slate-900">
                  {rate}%
                </option>
              ))}
            </select>
          </div>

          {/* CGST Rate (read-only, auto-calculated) */}
          <div>
            <label className={labelClass}>CGST Rate (auto)</label>
            <input
              className={`${inputClass} opacity-60 cursor-not-allowed`}
              type="number"
              readOnly
              value={form.cgstRate}
            />
          </div>

          {/* SGST Rate (read-only, auto-calculated) */}
          <div>
            <label className={labelClass}>SGST Rate (auto)</label>
            <input
              className={`${inputClass} opacity-60 cursor-not-allowed`}
              type="number"
              readOnly
              value={form.sgstRate}
            />
          </div>

          {/* IGST Rate */}
          <div>
            <label className={labelClass}>IGST Rate</label>
            <input
              className={inputClass}
              type="number"
              step="0.01"
              value={form.igstRate}
              onChange={(event) => update("igstRate", Number(event.target.value))}
            />
            {fieldErrors["igstRate"] ? (
              <span className="mt-1 text-xs text-red-400">
                {fieldErrors["igstRate"][0]}
              </span>
            ) : null}
          </div>

          {/* Cess Rate */}
          <div>
            <label className={labelClass}>Cess Rate</label>
            <input
              className={inputClass}
              type="number"
              step="0.01"
              value={form.cessRate}
              onChange={(event) => update("cessRate", Number(event.target.value))}
            />
            {fieldErrors["cessRate"] ? (
              <span className="mt-1 text-xs text-red-400">
                {fieldErrors["cessRate"][0]}
              </span>
            ) : null}
          </div>

          {/* Tax Type */}
          <div>
            <label className={labelClass}>Tax Type</label>
            <select
              className={inputClass}
              value={form.taxType}
              onChange={(event) => update("taxType", event.target.value)}
            >
              {["TAXABLE", "NIL_RATED", "EXEMPT", "NON_GST"].map((item) => (
                <option key={item} className="bg-slate-900">
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(event) => update("status", event.target.value)}
            >
              {["ACTIVE", "INACTIVE", "ARCHIVED"].map((item) => (
                <option key={item} className="bg-slate-900">
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Effective To */}
          <div>
            <label className={labelClass}>Effective To (optional)</label>
            <input
              className={inputClass}
              type="date"
              value={form.effectiveTo}
              onChange={(event) => update("effectiveTo", event.target.value)}
            />
          </div>

        </div>

        <div className="mt-6 flex justify-center">
          <SubmitButton
            isLoading={isPending}
            buttonTitle={isEditing ? "Update HSN Code" : "Create HSN Code"}
            loadingButtonTitle={`${isEditing ? "Updating" : "Creating"} HSN Code please wait...`}
          />
        </div>
      </form>
    </div>
  );
}
