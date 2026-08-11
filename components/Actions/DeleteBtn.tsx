"use client";

import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function DeleteBtn({ endpoint, title }) {
  const [loading, setLoading] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const apiUrl = endpoint.startsWith("/") ? endpoint : `/api/${endpoint}`;
        const res = await fetch(apiUrl, { method: "DELETE" });
        const data = await res.json().catch(() => null);
        if (res.ok) {
          router.refresh();
          setLoading(false);
          toast.success(`${title} Deleted Successfully`);
        } else {
          setLoading(false);
          toast.error(data?.message ?? `Failed to delete ${title}`);
        }
      } else {
        setLoading(false);
      }
    });
  }

  return (
    <LiquidGlassButton
      type="button"
      size="sm"
      variant="danger"
      leftIcon={<Trash2 />}
      loading={loading}
      disabled={loading}
      onClick={handleDelete}
      fullWidth
      className="text-base font-semibold !text-white hover:!text-white [&_*]:!text-white [&_svg]:!text-white [&_svg]:!stroke-white"
    >
      {loading ? "Deleting..." : `Delete ${title}`}
    </LiquidGlassButton>
  );
}
