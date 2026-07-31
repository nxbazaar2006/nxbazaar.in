"use client";

import DeleteBtn from "@/components/Actions/DeleteBtn";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Package,
  PackageCheck,
  Search,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";

type OrderItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  paymentMethod: string;
  orderStatus: string;
  grandTotal?: number;
  subtotal?: number;
  shippingCost?: number;
  createdAt: string;
  orderItems: OrderItem[];
};

export default function OrdersViewer({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statusOptions = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "ALL" || order.orderStatus === activeTab;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.firstName?.toLowerCase().includes(searchLower) ||
      order.lastName?.toLowerCase().includes(searchLower) ||
      order.email?.toLowerCase().includes(searchLower) ||
      order.phone?.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.orderStatus === "PENDING").length;
  const processingCount = orders.filter((o) => o.orderStatus === "PROCESSING" || o.orderStatus === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "DELIVERED").length;
  const totalRevenue = orders.reduce((sum, o) => {
    const amount = o.grandTotal || o.orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    return sum + amount;
  }, 0);

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      } else {
        toast.error(data.message || "Failed to update order status");
      }
    } catch (err) {
      toast.error("Network error updating status");
    } finally {
      setUpdatingId(null);
    }
  }

  function formatCurrency(val: number = 0) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </span>
        );
      case "SHIPPED":
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-0.5 text-xs font-bold text-cyan-700 dark:text-cyan-300">
            <Truck className="h-3 w-3" /> {status}
          </span>
        );
      case "CANCELED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-300">
            <XCircle className="h-3 w-3" /> Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Glass Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="liquid-card rounded-3xl border border-white/30 bg-white/40 p-5 backdrop-blur-2xl dark:border-white/15 dark:bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Total Orders
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-400/30">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalCount}
          </div>
        </div>

        <div className="liquid-card rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Pending Orders
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/30">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-950 dark:text-amber-100">
            {pendingCount}
          </div>
        </div>

        <div className="liquid-card rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-5 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300">
              In Processing / Shipped
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-950 dark:text-cyan-100">
            {processingCount}
          </div>
        </div>

        <div className="liquid-card rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Total Revenue
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-400/30">
              <PackageCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-950 dark:text-emerald-100">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/30 bg-white/40 p-1.5 backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/60">
          {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"].map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setActiveTab(status)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  activeTab === status
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-600 hover:bg-white/40 dark:text-slate-300 dark:hover:bg-slate-800/40"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-white/30 bg-white/50 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 backdrop-blur-xl focus:border-cyan-500 focus:outline-none dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Orders List */}
      {!filteredOrders.length ? (
        <div className="liquid-card rounded-3xl border border-white/30 bg-white/40 p-12 text-center backdrop-blur-2xl dark:border-white/15 dark:bg-slate-900/60 shadow-xl">
          <Package className="mx-auto h-12 w-12 text-slate-400 opacity-60" />
          <h3 className="mt-3 text-base font-bold text-slate-700 dark:text-slate-200">
            No Orders Found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            There are no orders matching your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderTotal =
              order.grandTotal ||
              order.orderItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
              0;

            return (
              <div
                key={order.id}
                className="liquid-card rounded-3xl border border-white/30 bg-white/40 p-5 backdrop-blur-2xl dark:border-white/15 dark:bg-slate-900/60 shadow-xl space-y-4 transition-all hover:border-cyan-400/40"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        #{order.orderNumber}
                      </span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-cyan-600" />
                        {order.firstName} {order.lastName} ({order.phone || order.email})
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                        {order.paymentMethod || "COD"}
                      </span>
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        Grand Total
                      </div>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(orderTotal)}
                      </div>
                    </div>

                    {/* Status Update Select */}
                    <select
                      value={order.orderStatus}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="rounded-xl border border-white/30 bg-white/60 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-xl focus:border-cyan-500 focus:outline-none dark:border-white/15 dark:bg-slate-800/80 dark:text-slate-200 cursor-pointer"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          Status: {st}
                        </option>
                      ))}
                    </select>

                    <Link href={`/dashboard/orders/${order.id}/invoice`}>
                      <button
                        type="button"
                        className="p-2 rounded-xl border border-white/40 bg-white/40 text-slate-700 backdrop-blur-xl hover:bg-white/70 dark:border-white/15 dark:bg-slate-800/50 dark:text-slate-200 transition"
                        title="View Sales Invoice"
                      >
                        <FileText className="h-4 w-4 text-cyan-600" />
                      </button>
                    </Link>

                    <DeleteBtn title="Order" endpoint={`orders/${order.id}`} />
                  </div>
                </div>

                {/* Items List Preview */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {order.orderItems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/40 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/40"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title || "Item"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[10px] font-bold text-slate-500">
                            NO IMG
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.title}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Qty: <span className="font-bold">{item.quantity}</span> × {formatCurrency(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
