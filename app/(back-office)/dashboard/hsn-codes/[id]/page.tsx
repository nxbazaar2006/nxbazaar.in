import { getHsnCodeById, getHsnRateHistory } from "@/actions/hsn-code";
import type { HsnRateHistoryRow } from "@/types/hsn";
import Link from "next/link";
import React from "react";

export default async function HsnCodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [result, historyResult] = await Promise.all([
    getHsnCodeById(id),
    getHsnRateHistory(id),
  ]);

  if (!result.success) {
    return <div className="p-6">{result.message}</div>;
  }

  const hsn = result.data;
  const history = historyResult.success ? historyResult.data : [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-950">{hsn.code}</h1>
        <Link
          href={`/dashboard/hsn-codes/${id}/edit`}
          className="rounded-md bg-lime-600 px-3 py-2 text-sm text-white"
        >
          Edit
        </Link>
      </div>

      <div className="grid gap-4 rounded-lg border bg-white p-6 md:grid-cols-3">
        {[
          ["Description", hsn.description],
          ["GST", `${hsn.gstRate}%`],
          ["CGST", `${hsn.cgstRate}%`],
          ["SGST", `${hsn.sgstRate}%`],
          ["IGST", `${hsn.igstRate}%`],
          ["Cess", `${hsn.cessRate}%`],
          ["Tax Type", hsn.taxType],
          ["Status", hsn.status],
          ["UQC", hsn.uqc ?? "-"],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="text-xs text-slate-500">{label}</div>
            <div className="font-medium text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Rate History</h2>
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              {[
                "GST",
                "CGST",
                "SGST",
                "IGST",
                "Cess",
                "Effective From",
                "Effective To",
                "Change Reason",
                "Created At",
              ].map((h) => (
                <th key={h} className="px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((item: HsnRateHistoryRow) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">{item.gstRate}%</td>
                <td className="px-3 py-2">{item.cgstRate}%</td>
                <td className="px-3 py-2">{item.sgstRate}%</td>
                <td className="px-3 py-2">{item.igstRate}%</td>
                <td className="px-3 py-2">{item.cessRate}%</td>
                <td className="px-3 py-2">
                  {new Date(item.effectiveFrom).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">
                  {item.effectiveTo
                    ? new Date(item.effectiveTo).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-3 py-2">{item.changeReason ?? "-"}</td>
                <td className="px-3 py-2">
                  {new Date(item.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
