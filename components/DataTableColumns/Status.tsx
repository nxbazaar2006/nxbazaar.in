"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Status({ row, accessorKey }) {
  const savedStatus = row.getValue(`${accessorKey}`);
  const userId = row.original.id;
  const [status, setStatus] = useState(savedStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(e) {
    const newStatus = e.target.value === "true";
    setStatus(newStatus);

    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const response = await fetch(`${baseUrl}/api/farmers/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          emailVerified: true,
        }),
      });

      if (response.ok) {
        toast.success("Farmer Status Updated Successfully");
      } else {
        toast.error("Something Went wrong");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return loading ? (
    <p>Updating...</p>
  ) : (
    <select
      id="status"
      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      style={{ borderColor: status ? "green" : "red" }}
      value={status.toString()}
      onChange={handleChange}
    >
      <option value="true">APPROVED</option>
      <option value="false">PENDING</option>
    </select>
  );
}
