import SalesInvoice from "@/components/Order/SalesInvoice";
import { getData } from "@/lib/getData";
import React from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getData(`orders/${id}`);
  return <SalesInvoice order={order} />;
}