import React from "react";
import type { Row } from "@tanstack/react-table";
export default function DateColumn<TData>({ row, accessorKey,
}: { row: Row<TData>; accessorKey: string;
}) { const createdAt = row.getValue(accessorKey); const originalDate = new Date( createdAt instanceof Date ? createdAt : String(createdAt ?? "") ); const day = originalDate.getDate(); const month = originalDate.toLocaleString("default", { month: "short" }); const year = originalDate.getFullYear(); const formatted = `${day}th ${month} ${year}`; return <div className="">{formatted}</div>; } 