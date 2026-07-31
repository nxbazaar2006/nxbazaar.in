import { auth } from "@/auth";
import FormHeader from "@/components/backoffice/FormHeader";
import OrdersViewer from "@/components/backoffice/OrdersViewer";
import db from "@/lib/db";
import React from "react";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="p-6 text-center text-slate-500">
        Please sign in to view orders.
      </div>
    );
  }

  const userId = session.user.id;
  const role = String(session.user.role || "");

  let whereClause = {};
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    whereClause = {};
  } else if (role === "FARMER" || role === "SELLER") {
    whereClause = {
      orderItems: {
        some: {
          vendorId: userId,
        },
      },
    };
  } else {
    whereClause = {
      userId: userId,
    };
  }

  const ordersData = await db.order.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        select: {
          id: true,
          title: true,
          price: true,
          quantity: true,
          imageUrl: true,
        },
      },
    },
  });

  const formattedOrders = ordersData.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    firstName: order.firstName || "Customer",
    lastName: order.lastName || "",
    email: order.email || "",
    phone: order.phone || "",
    streetAddress: order.streetAddress,
    city: order.city,
    state: order.state,
    paymentMethod: order.paymentMethod || "COD",
    orderStatus: order.orderStatus || "PENDING",
    grandTotal: order.grandTotal ? Number(order.grandTotal) : undefined,
    subtotal: order.subtotal ? Number(order.subtotal) : undefined,
    shippingCost: order.shippingCost ? Number(order.shippingCost) : undefined,
    createdAt: order.createdAt.toISOString(),
    orderItems: order.orderItems.map((item) => ({
      id: item.id,
      title: item.title,
      price: Number(item.price),
      quantity: item.quantity,
      imageUrl: item.imageUrl,
    })),
  }));

  return (
    <div className="space-y-6 pb-12">
      <FormHeader title="Orders Management" />
      <OrdersViewer initialOrders={formattedOrders} />
    </div>
  );
}
