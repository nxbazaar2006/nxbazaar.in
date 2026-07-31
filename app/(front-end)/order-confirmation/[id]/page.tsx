import { getData } from "@/lib/getData";
import { CheckCircle2, PackageX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type OrderConfirmationItem = {
  id: string;
  imageUrl?: string | null;
  title?: string | null;
  price: number;
  quantity: number;
};

type OrderConfirmation = {
  id?: string;
  orderItems?: OrderConfirmationItem[];
  orderNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  apartment?: string | null;
  streetAddress?: string | null;
  state?: string | null;
  city?: string | null;
  zip?: string | null;
  country?: string | null;
  paymentMethod?: string | null;
  shippingCost?: number | null;
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getData<OrderConfirmation>(`orders/${id}`);

  if (!order || !order.id) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="max-w-md mx-auto text-center px-4">
          <PackageX className="w-12 h-12 text-slate-400 mx-auto" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Order Confirmation Not Found
          </h1>
          <p className="mt-2 text-xs text-slate-600">
            We couldn't retrieve order details for #{id}. Please check your order history in the dashboard.
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-6 inline-block rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-cyan-700 transition"
          >
            Go to My Orders
          </Link>
        </div>
      </section>
    );
  }

  const orderItems = order.orderItems || [];
  const subTotal = orderItems
    .reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0), 0)
    .toFixed(2);

  const shippingCostNum = Number(order.shippingCost || 0);
  const grandTotal = (parseFloat(subTotal) + shippingCostNum).toFixed(2);

  return (
    <section className="py-12 bg-slate-50 sm:py-16 lg:py-20">
      <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-5xl">
        <div className="max-w-2xl mx-auto">
          <div className="relative mt-6 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xl md:mt-10">
            <div className="absolute top-4 right-4">
              <Link
                href={`/dashboard/orders/${id}/invoice`}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-slate-800 transition-all duration-200 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200"
              >
                View invoice
              </Link>
            </div>
            <div className="px-4 py-6 sm:px-8 sm:py-10">
              <div className="-my-8 divide-y divide-gray-200">
                <div className="pt-16 pb-8 text-center sm:py-8">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
                  <h1 className="mt-4 text-2xl font-black text-gray-900">
                    We received your order!
                  </h1>
                  <p className="mt-2 text-sm font-semibold text-gray-600">
                    Your order #{order.orderNumber || id} is completed and ready to ship.
                  </p>
                </div>

                <div className="py-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 sm:gap-x-20">
                    <div>
                      <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                        Shipping Address
                      </h2>
                      <p className="mt-3 text-sm font-bold text-gray-800">
                        {order.firstName} {order.lastName}
                      </p>
                      <p className="mt-1 text-xs font-medium text-gray-600">
                        {order.streetAddress ? `${order.streetAddress}, ` : ""}
                        {order.city ? `${order.city}, ` : ""}
                        {order.state ? `${order.state} ` : ""}
                        {order.zip ? `${order.zip}, ` : ""}
                        {order.country || "India"}
                      </p>
                    </div>
                    <div>
                      <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                        Payment Info
                      </h2>
                      <p className="mt-3 text-sm font-bold text-gray-800">
                        {order.paymentMethod || "Cash on Delivery"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-8">
                  <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Order Items
                  </h2>
                  <div className="flow-root mt-6">
                    <ul className="divide-y divide-gray-100 -my-4">
                      {orderItems.map((item, i) => {
                        const hasImg = typeof item.imageUrl === "string" && item.imageUrl.trim().length > 0;
                        return (
                          <li
                            key={item.id || i}
                            className="flex items-center justify-between space-x-5 py-4"
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0 relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                                {hasImg ? (
                                  <Image
                                    width={100}
                                    height={100}
                                    className="object-cover h-full w-full"
                                    src={item.imageUrl!}
                                    alt={item.title || "Item"}
                                  />
                                ) : (
                                  <div className="grid h-full w-full place-items-center text-[10px] font-bold text-slate-400">
                                    NA
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 w-44">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                  {item.title || "Product"}
                                </p>
                                <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                                  ₹{item.price} × {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="ml-auto">
                              <p className="text-xs font-bold text-right text-gray-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="py-8">
                  <ul className="space-y-3 text-xs">
                    <li className="flex items-center justify-between">
                      <span className="font-semibold text-gray-600">Subtotal</span>
                      <span className="font-bold text-gray-800">₹{subTotal}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-600">Shipping Cost</span>
                        <span className="ml-2 text-[11px] text-gray-400">
                          (Estimated delivery in {shippingCostNum === 50 ? "3" : shippingCostNum === 75 ? "2" : "1"} days)
                        </span>
                      </div>
                      <span className="font-bold text-gray-800">₹{shippingCostNum.toFixed(2)}</span>
                    </li>
                    <li className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-black text-emerald-600">₹{grandTotal}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}