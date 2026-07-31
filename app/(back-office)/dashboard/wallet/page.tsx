"use client";

import FormHeader from "@/components/backoffice/FormHeader";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  CreditCard,
  History,
  Plus,
  RefreshCw,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
};

type WalletData = {
  id: string;
  balance: number;
  pendingAmount: number;
  totalEarned: number;
  totalPaidOut: number;
  transactions: Transaction[];
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openModal, setOpenModal] = useState<"DEPOSIT" | "WITHDRAWAL" | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchWallet(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (res.ok && data.success) {
        setWallet(data.data);
      } else {
        toast.error(data.error || "Failed to load wallet data");
      }
    } catch (err) {
      toast.error("Network error fetching wallet");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchWallet();
  }, []);

  async function handleTransactionSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(amountInput);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: openModal,
          amount: amountNum,
          description: descriptionInput || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setOpenModal(null);
        setAmountInput("");
        setDescriptionInput("");
        await fetchWallet(true);
      } else {
        toast.error(data.error || "Transaction failed");
      }
    } catch (err) {
      toast.error("Network error processing transaction");
    } finally {
      setSubmitting(false);
    }
  }

  function formatCurrency(val: number = 0) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
  }

  return (
    <div className="space-y-6 pb-12">
      <FormHeader title="Wallet & Earnings" />

      {/* Main Stats Header */}
      <div className="liquid-card border border-white/30 bg-white/40 p-6 backdrop-blur-2xl dark:border-white/15 dark:bg-slate-900/60 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Total Available Balance
              </h2>
              <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {loading ? "..." : formatCurrency(wallet?.balance)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchWallet(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-white/40 bg-white/40 text-slate-700 backdrop-blur-xl hover:bg-white/70 dark:border-white/15 dark:bg-slate-800/50 dark:text-slate-200 transition"
              title="Refresh Wallet"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <LiquidGlassButton
              type="button"
              variant="cyan"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setOpenModal("DEPOSIT")}
              className="!text-white font-bold"
            >
              Add Money
            </LiquidGlassButton>

            <LiquidGlassButton
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<ArrowUpRight className="h-4 w-4" />}
              onClick={() => setOpenModal("WITHDRAWAL")}
              className="!text-white font-bold"
            >
              Withdraw / Payout
            </LiquidGlassButton>
          </div>
        </div>

        {/* 4 Stat Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 backdrop-blur-xl">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Available Balance
            </div>
            <div className="mt-1 text-xl font-bold text-emerald-950 dark:text-emerald-100">
              {loading ? "..." : formatCurrency(wallet?.balance)}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 backdrop-blur-xl">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Pending Release
            </div>
            <div className="mt-1 text-xl font-bold text-amber-950 dark:text-amber-100">
              {loading ? "..." : formatCurrency(wallet?.pendingAmount)}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 backdrop-blur-xl">
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Total Earned
            </div>
            <div className="mt-1 text-xl font-bold text-blue-950 dark:text-blue-100">
              {loading ? "..." : formatCurrency(wallet?.totalEarned)}
            </div>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 backdrop-blur-xl">
            <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              Total Paid Out
            </div>
            <div className="mt-1 text-xl font-bold text-purple-950 dark:text-purple-100">
              {loading ? "..." : formatCurrency(wallet?.totalPaidOut)}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="liquid-card border border-white/30 bg-white/40 p-6 backdrop-blur-2xl dark:border-white/15 dark:bg-slate-900/60 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/20 pb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Recent Transactions
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing last 50 activity logs
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/20 bg-white/50 dark:bg-slate-900/50">
          <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
            <thead className="bg-slate-100/70 text-xs uppercase font-bold text-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : !wallet?.transactions?.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                wallet.transactions.map((tx) => {
                  const isCredit = tx.type === "CREDIT";
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isCredit
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">
                        {tx.description || (isCredit ? "Wallet Deposit" : "Payout Request")}
                      </td>
                      <td
                        className={`px-4 py-3 text-right text-xs font-bold ${
                          isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isCredit ? "+" : "-"} {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrency(tx.balanceAfter)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal (Deposit / Withdrawal) */}
      {openModal && (
        <Dialog open={Boolean(openModal)} onOpenChange={() => setOpenModal(null)}>
          <DialogContent className="rounded-3xl border border-white/30 bg-white/90 p-6 backdrop-blur-2xl shadow-2xl dark:border-white/15 dark:bg-slate-900/95 max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                {openModal === "DEPOSIT" ? (
                  <>
                    <Plus className="h-5 w-5 text-cyan-600" />
                    <span>Add Money to Wallet</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-5 w-5 text-indigo-600" />
                    <span>Request Payout / Withdrawal</span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleTransactionSubmit} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 500.00"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder={
                    openModal === "DEPOSIT"
                      ? "Online topup / Deposit"
                      : "Bank transfer payout"
                  }
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <LiquidGlassButton
                  type="submit"
                  variant={openModal === "DEPOSIT" ? "cyan" : "primary"}
                  size="sm"
                  loading={submitting}
                  disabled={submitting}
                  className="!text-white font-bold"
                >
                  {submitting
                    ? "Processing..."
                    : openModal === "DEPOSIT"
                    ? "Confirm Deposit"
                    : "Confirm Payout"}
                </LiquidGlassButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}