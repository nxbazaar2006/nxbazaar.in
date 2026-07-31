"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
export default function SubCategoryStatusToggle({ subCategory }) { const [loading, setLoading] = useState(false); const router = useRouter(); const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; async function toggleStatus() { try { setLoading(true); const response = await fetch( `${baseUrl}/api/subcategories/${subCategory.id}/toggle-status`, { method: "PATCH" } ); const data = await response.json(); if (!response.ok) { toast.error(data.message ?? "Failed to update status"); return; } toast.success( `Subcategory ${data.isActive ? "activated" : "deactivated"}` ); router.refresh(); } catch (error) { console.error(error); toast.error("Failed to update subcategory status"); } finally { setLoading(false); } } return ( <button type="button" onClick={toggleStatus} disabled={loading} className={ subCategory.isActive ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700" : "rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700" } > {loading ? "Updating..." : subCategory.isActive ? "Active" : "Inactive"} </button> );
}
