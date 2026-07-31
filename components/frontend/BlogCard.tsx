import { convertIsoDateToNormal } from "@/lib/convertIsoDatetoNormal";
import { getData } from "@/lib/getData";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export default async function BlogCard({
  training,
  lang,
}: {
  training: any;
  lang?: string;
}) {
  const categoryId = training.categoryId;
  const category = categoryId ? await getData(`categories/${categoryId}`) : null;
  const categoryTitle = category?.title || "Blog";
  const normalDate = convertIsoDateToNormal(training.createdAt);
  const hasImage =
    typeof training.imageUrl === "string" && training.imageUrl.trim().length > 0;

  const blogHref = lang
    ? `/${lang}/blogs/${training.slug}`
    : `/blogs/${training.slug}`;

  const readMoreText =
    lang === "hi"
      ? "और पढ़ें"
      : lang === "mr"
      ? "अधिक वाचा"
      : "Continue Reading";

  return (
    <div className="liquid-card group p-6">
      <div className="relative">
        <div className="block overflow-hidden aspect-w-16 aspect-h-9 rounded-xl">
          {hasImage ? (
            <img
              className="object-cover w-full h-48 transition-all duration-200 transform group-hover:scale-110"
              src={training.imageUrl}
              alt={training.title || "Blog Image"}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
              No Image
            </div>
          )}
        </div>
        <span className="absolute px-3 py-2 text-xs font-bold tracking-widest text-gray-900 uppercase bg-white/90 backdrop-blur-sm rounded left-3 top-3">
          {categoryTitle}
        </span>
      </div>
      <p className="mt-6 text-sm font-medium text-gray-500">{normalDate}</p>
      <h2 className="mt-4 text-xl font-bold leading-tight text-gray-900 xl:pr-8">
        <Link href={blogHref} className="line-clamp-2 hover:text-emerald-600 transition-colors">
          {training.title}
        </Link>
      </h2>
      <div className="mt-6">
        <Link
          href={blogHref}
          className="inline-flex items-center pb-2 text-xs font-bold tracking-widest text-gray-900 uppercase border-b border-gray-900 group-hover:border-emerald-600 group-hover:text-emerald-600 transition-colors"
        >
          {readMoreText}
          <MoveRight className="w-4 h-4 ml-2 transition-all duration-200 transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
