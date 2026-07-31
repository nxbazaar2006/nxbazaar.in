"use client";

import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function EditBtn({
  editEndpoint,
  title,
}: {
  editEndpoint: string;
  title: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const router = useRouter();

  const normalizedEndpoint = editEndpoint.replace(/^\/+/, "");
  const href = `${baseUrl}/dashboard/${normalizedEndpoint}`;

  function handleEdit() {
    router.push(href);
  }

  return (
    <LiquidGlassButton
      type="button"
      size="sm"
      variant="danger"
      leftIcon={<Pencil />}
      onClick={handleEdit}
      fullWidth
      className="text-base font-semibold !text-white hover:!text-white [&_*]:!text-white [&_svg]:!text-white [&_svg]:!stroke-white"
    >
      Edit {title}
    </LiquidGlassButton>
  );
}