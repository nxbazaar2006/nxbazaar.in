import { convertIsoDateToNormal } from "@/lib/convertIsoDatetoNormal";
import Link from "next/link";
import React from "react";

export default function RecentTrainings({
  recentTrainings,
  lang,
}: {
  recentTrainings: any[];
  lang?: string;
}) {
  return (
    <div className="lg:col-span-2">
      <p className="text-xl font-bold text-gray-900">
        {lang === "hi"
          ? "संबंधित ब्लॉग"
          : lang === "mr"
          ? "संबंधित ब्लॉग"
          : "Related Blogs"}
      </p>
      <div className="mt-6 space-y-5">
        {(recentTrainings || []).map((training: any, i: number) => {
          const hasImage =
            typeof training?.imageUrl === "string" &&
            training.imageUrl.trim().length > 0;
          const href = lang
            ? `/${lang}/blogs/${training.slug}`
            : `/blogs/${training.slug}`;

          return (
            <div
              key={training.id || i}
              className="liquid-card relative overflow-hidden p-4 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start flex-col lg:items-center">
                {hasImage ? (
                  <img
                    className="object-cover w-full h-16 rounded-lg shrink-0"
                    src={training.imageUrl}
                    alt={training.title || "Blog Post"}
                  />
                ) : (
                  <div className="w-full h-16 rounded-lg bg-gray-200 shrink-0 flex items-center justify-center text-xs text-gray-500 font-semibold">
                    No Image
                  </div>
                )}
                <div className="ml-5">
                  <p className="text-sm leading-7 font-bold text-gray-900 mt-2.5">
                    <Link href={href} className="line-clamp-2">
                      {training.title}
                      <span
                        className="absolute inset-0"
                        aria-hidden="true"
                      ></span>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
