"use client";

import FormHeader from "@/components/backoffice/FormHeader";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileQuestion,
  HelpCircle,
  LifeBuoy,
  MessageSquare,
  PhoneCall,
  PlusCircle,
  ShieldAlert,
  Sprout,
  UserCheck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type SupportTicket = {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  response: string | null;
  createdAt: string;
};

export default function FarmerSupportPage() {
  const [activeTab, setActiveTab] = useState<"NEW" | "TICKETS" | "FAQ">("NEW");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Form State
  const [category, setCategory] = useState("Crop Advisory");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [submitting, setSubmitting] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  async function fetchTickets() {
    try {
      setLoadingTickets(true);
      const res = await fetch("/api/farmer-support");
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load support tickets");
    } finally {
      setLoadingTickets(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  async function handleSubmitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in all required ticket fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/farmer-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, description, priority }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setTickets((prev) => [data.data, ...prev]);
        setSubject("");
        setDescription("");
        setActiveTab("TICKETS");
      } else {
        toast.error(data.error || "Failed to submit ticket");
      }
    } catch (err) {
      toast.error("Network error submitting ticket");
    } finally {
      setSubmitting(false);
    }
  }

  const faqs = [
    {
      q: "How do I request a Krishi Doctor / Agronomist soil test?",
      a: "You can raise a support ticket under the 'Crop Advisory' category or call our toll-free Kisan Helpline 1800-180-1551. Our team will schedule an on-field soil sample collection within 48 hours.",
    },
    {
      q: "When will my crop sales payout be credited to my bank account?",
      a: "Sales payouts are automatically deposited into your registered NXBazaar Seller Wallet within 24 hours of successful order delivery to the buyer. You can withdraw funds instantly to your bank account via UPI or IMPS.",
    },
    {
      q: "What should I do if my crop transport shipment is delayed?",
      a: "Contact NXBazaar Logistics Helpline immediately or raise a ticket under 'Logistics & Transport'. Our cold-storage logistics team tracks temperature-controlled vans in real-time to avoid spoilage.",
    },
    {
      q: "How do I claim Govt Subsidies (PM Krishi Bima / Fertilizer subsidies)?",
      a: "Our Farmer Support Hub offers free documentation assistance for Kisan Credit Card (KCC) and PM Krishi Bima Yojana. Select 'Govt Subsidies' in the ticket category and attach your Aadhaar & Land Khata details.",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <FormHeader title="Farmer Support" />

      {/* Kisan Quick Assist Banner & Helpline Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Kisan Helpline */}
        <div className="liquid-card rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 backdrop-blur-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Kisan Helpline (Toll-Free)
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-400/30">
              <PhoneCall className="h-5 w-5" />
            </div>
          </div>
          <div className="text-lg font-black text-emerald-950 dark:text-emerald-100">
            1800-180-1551
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
            24x7 Free Agriculture & Crop Expert Assistance
          </p>
        </div>

        {/* Card 2: Krishi Doctor Advisory */}
        <div className="liquid-card rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-5 backdrop-blur-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300">
              Krishi Doctor Advisory
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30">
              <Sprout className="h-5 w-5" />
            </div>
          </div>
          <div className="text-sm font-bold text-cyan-950 dark:text-cyan-100">
            Soil & Pest Inspection
          </div>
          <p className="text-[11px] text-cyan-700 dark:text-cyan-300 font-medium">
            Free organic treatment & fertilizer guidance
          </p>
        </div>

        {/* Card 3: Payout Support */}
        <div className="liquid-card rounded-3xl border border-blue-500/30 bg-blue-500/10 p-5 backdrop-blur-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
              Fast Payout Helpdesk
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-400/30">
              <LifeBuoy className="h-5 w-5" />
            </div>
          </div>
          <div className="text-sm font-bold text-blue-950 dark:text-blue-100">
            Instant Wallet Credit
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
            Priority resolution for seller payment queries
          </p>
        </div>

        {/* Card 4: Govt Subsidies */}
        <div className="liquid-card rounded-3xl border border-purple-500/30 bg-purple-500/10 p-5 backdrop-blur-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
              PM Krishi Subsidies
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-400/30">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="text-sm font-bold text-purple-950 dark:text-purple-100">
            KCC & Insurance Help
          </div>
          <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
            Documentation support for Govt farming grants
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/20 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("NEW")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
            activeTab === "NEW"
              ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
              : "bg-white/40 text-slate-700 hover:bg-white/60 dark:bg-slate-800/40 dark:text-slate-200"
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          Raise Support Ticket
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("TICKETS")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
            activeTab === "TICKETS"
              ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
              : "bg-white/40 text-slate-700 hover:bg-white/60 dark:bg-slate-800/40 dark:text-slate-200"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          My Tickets ({tickets.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("FAQ")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
            activeTab === "FAQ"
              ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
              : "bg-white/40 text-slate-700 hover:bg-white/60 dark:bg-slate-800/40 dark:text-slate-200"
          }`}
        >
          <FileQuestion className="h-4 w-4" />
          Krishi FAQ & Knowledge Base
        </button>
      </div>

      {/* Tab 1: Raise Support Ticket Form */}
      {activeTab === "NEW" && (
        <div className="liquid-card rounded-3xl border border-white/30 bg-white/40 p-6 backdrop-blur-2xl dark:border-white/15 dark:bg-slate-900/60 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/20 pb-4">
            <LifeBuoy className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Submit a Farmer Support Inquiry
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Our agricultural experts and support team respond within 24 hours.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-4 max-w-3xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Inquiry Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Crop Advisory">Crop Advisory & Pest Control</option>
                  <option value="Payout & Payment">Payout & Wallet Payment</option>
                  <option value="Logistics & Transport">Logistics & Cold Storage Transport</option>
                  <option value="Equipment & Fertilizer">Equipment & Organic Fertilizers</option>
                  <option value="Govt Subsidies">Govt Subsidies & KCC Loan Help</option>
                  <option value="Account & Profile">Account Verification & KYC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Urgency Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="LOW">Low (General Query)</option>
                  <option value="MEDIUM">Medium (Normal Issue)</option>
                  <option value="HIGH">High (Urgent Crop/Payout Risk)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Need advice on Wheat pest infestation after heavy rain"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description & Crop Details
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe your issue in detail. Include crop type, acreage, symptoms, or order details if applicable..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="pt-2">
              <LiquidGlassButton
                type="submit"
                variant="cyan"
                size="md"
                loading={submitting}
                disabled={submitting}
                className="!text-white font-bold"
              >
                {submitting ? "Submitting Ticket..." : "Submit Support Ticket"}
              </LiquidGlassButton>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: My Support Tickets */}
      {activeTab === "TICKETS" && (
        <div className="liquid-card rounded-3xl border border-white/30 bg-white/40 p-6 backdrop-blur-2xl dark:border-white/15 dark:bg-slate-900/60 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-white/20 pb-4">
            My Raised Support Tickets
          </h2>

          {loadingTickets ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Loading support tickets...
            </div>
          ) : !tickets.length ? (
            <div className="py-8 text-center text-xs text-slate-500">
              You have no active support tickets.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-white/30 bg-white/50 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/20 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        #{t.ticketNumber}
                      </span>
                      <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                        {t.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          t.status === "RESOLVED"
                            ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                            : t.status === "IN_PROGRESS"
                            ? "bg-cyan-500/15 text-cyan-700 border border-cyan-500/30"
                            : "bg-amber-500/15 text-amber-700 border border-amber-500/30"
                        }`}
                      >
                        Status: {t.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {t.subject}
                    </h4>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      {t.description}
                    </p>
                  </div>

                  {t.response && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-950 dark:text-emerald-100 font-medium flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <span className="font-bold">Agronomist Response:</span> {t.response}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Krishi FAQ & Knowledge Base */}
      {activeTab === "FAQ" && (
        <div className="liquid-card rounded-3xl border border-white/30 bg-white/40 p-6 backdrop-blur-2xl dark:border-white/15 dark:bg-slate-900/60 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/20 pb-4">
            <BookOpen className="h-5 w-5 text-cyan-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Farmer Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-white/30 bg-white/50 overflow-hidden backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/40"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-white/40 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 font-medium border-t border-white/10 bg-white/20 dark:bg-slate-900/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
