import React from "react";
import { getSingleImageUrl } from "@/lib/image-utils";

export default function ImageColumn({
  row,
  accessorKey,
  imageUrl: imageUrlProp,
}: {
  row: any;
  accessorKey: string;
  imageUrl?: string;
}) {
  const rawImageUrl =
    imageUrlProp !== undefined
      ? imageUrlProp
      : (row?.original?.[accessorKey] ??
          row?.original?.imageUrl ??
          row?.original?.image ??
          (() => {
            try {
              return row.getValue(`${accessorKey}`);
            } catch {
              return undefined;
            }
          })());

  const imageUrl = getSingleImageUrl(rawImageUrl, "");
  const hasImageUrl = typeof imageUrl === "string" && imageUrl.trim().length > 0;

  return (
    <div className="shrink-0">
      {hasImageUrl ? (
        <img
          src={imageUrl}
          alt={accessorKey || "Category Image"}
          className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : (
        <div
          aria-label="No image"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600"
        >
          NA
        </div>
      )}
    </div>
  );
}