import { auth } from "@/auth";
import Heading from "@/components/ui/heading";
import PageHeader from "@/components/shared/page-header";
import TableActions from "@/components/backoffice/TableActions";
import DataTable from "@/components/data-table-components/DataTable";
import { getData } from "@/lib/getData"; import Link from "next/link";
import React from "react";
import { columns } from "./columns";
import { asArray } from "@/lib/normalizeApiData";
export default async function Sales() { const session = await auth(); const id = session?.user?.id; const role = session?.user?.role; const allSalesData = await getData("sales"); const allSales = asArray(allSalesData); // Fetch all the Sales // Filter by vendorId => to get sales for this vendor //Fetch Order by Id // Customer Name, email,Phone,OrderNumber
const farmerSales = allSales.filter((sale) => sale.vendorId === id); return ( <div> {/* Header */} {/* <PageHeader heading="Coupons" href="/dashboard/coupons/new" linkTitle="Add Coupon" /> */} <div className="py-8"> {role === "ADMIN" ? ( <DataTable data={allSales} columns={columns} /> ) : ( <DataTable data={farmerSales} columns={columns} /> )} </div> </div> );
}
