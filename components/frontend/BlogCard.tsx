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
    <div className="liquid-card w-full h-full rounded-[24px] border border-white/25 bg-white/15 backdrop-blur-2xl p-4 sm:p-5 lg:p-6 text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-[3px] hover:border-white/40 hover:bg-white/20 group relative flex flex-col justify-between overflow-hidden">
      <div>
        <div className="relative overflow-hidden rounded-[18px]">
          <div className="block overflow-hidden aspect-w-16 aspect-h-9 rounded-[18px]">
            {hasImage ? (
              <img
                className="object-cover w-full h-48 transition-all duration-300 transform group-hover:scale-105"
                src={training.imageUrl}
                alt={training.title || "Blog Image"}
              />
            ) : (
              <div className="w-full h-48 bg-slate-200/60 flex items-center justify-center text-slate-500 font-semibold">
                No Image
              </div>
            )}
          </div>
          <span className="absolute px-3 py-1 text-xs font-bold tracking-widest text-slate-900 uppercase bg-white/80 backdrop-blur-md rounded-full left-3 top-3 border border-white/60">
            {categoryTitle}
          </span>
        </div>
        <p className="mt-4 text-xs font-medium text-slate-500">{normalDate}</p>
        <h2 className="mt-2 text-base sm:text-lg font-bold leading-relaxed text-slate-900">
          <Link href={blogHref} className="line-clamp-2 hover:text-emerald-600 transition-colors">
            {training.title}
          </Link>
        </h2>
      </div>

      <div className="mt-6 pt-3 border-t border-white/20">
        <Link
          href={blogHref}
          className="inline-flex items-center text-xs font-bold tracking-widest text-slate-800 uppercase group-hover:text-emerald-700 transition-colors"
        >
          {readMoreText}
          <MoveRight className="w-4 h-4 ml-2 transition-all duration-200 transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
