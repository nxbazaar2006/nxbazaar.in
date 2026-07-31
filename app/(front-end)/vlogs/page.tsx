import { GlassText } from "@/components/ui/glass-text";
import { getVlogs } from "@/lib/services/vlog-service";
import type { VlogItem } from "@/types/blog";
import { Eye, MoveRight, Play, Search, Video } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NXBazaar Video Hub & Vlogs",
  description:
    "Watch video demonstrations, product unboxing, expert farming tutorials, and guides.",
  openGraph: {
    title: "NXBazaar Video Hub & Vlogs",
    description:
      "Watch video demonstrations, product unboxing, expert farming tutorials, and guides.",
    type: "website",
  },
};

export const revalidate = 60;

export default async function VlogsHubPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const search = resolvedSearchParams?.search || "";
  const category = resolvedSearchParams?.category || "";
  const page = Number.parseInt(resolvedSearchParams?.page || "1", 10);

  const { vlogs, total, totalPages } = await getVlogs({
    search,
    category,
    status: "PUBLISHED",
    page,
    limit: 12,
  });

  const featuredVlogs = vlogs.filter((v) => v.isFeatured).slice(0, 2);

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="liquid-card frontend-glass rounded-[36px] p-8 sm:p-12 text-center shadow-xl">
          <div className="mx-auto max-w-3xl">
            <GlassText
              variant="light"
              title="NXBazaar Video Hub & Demos"
              description="Watch farming guides, equipment tutorials, product demos, and video blogs."
              headingAs="h1"
              headingClassName="text-3xl sm:text-5xl font-extrabold tracking-tight"
            />

            <form action="/vlogs" method="GET" className="mt-8 flex items-center justify-center">
              <div className="relative w-full max-w-xl">
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search videos, tutorials, or product demos..."
                  className="liquid-card w-full rounded-full border border-white/50 bg-white/40 py-3.5 pl-12 pr-28 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Featured Video Player */}
        {featuredVlogs.length > 0 && !search && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <Video className="h-6 w-6 text-rose-500" />
              <h2 className="text-2xl font-bold text-slate-900">Featured Video Tutorials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredVlogs.map((vlog) => (
                <VlogCard key={vlog.id} vlog={vlog} featured />
              ))}
            </div>
          </div>
        )}

        {/* Main Vlog Listing Grid */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">All Videos ({total})</h2>
          </div>

          {vlogs.length === 0 ? (
            <div className="liquid-card rounded-3xl p-12 text-center text-slate-600">
              <p className="text-lg font-medium">No video logs found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {vlogs.map((vlog) => (
                <VlogCard key={vlog.id} vlog={vlog} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-10">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                return (
                  <Link
                    key={p}
                    href={`/vlogs?page=${p}${search ? `&search=${search}` : ""}`}
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      p === page
                        ? "bg-rose-600 text-white shadow-md"
                        : "liquid-card text-slate-700 hover:bg-white/60"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VlogCard({ vlog, featured = false }: { vlog: VlogItem; featured?: boolean }) {
  return (
    <div
      className={`liquid-card group overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        featured ? "border border-rose-400/40 bg-gradient-to-br from-rose-500/5 to-purple-500/5" : ""
      }`}
    >
      {/* Video Thumbnail with Play Button */}
      <div className="relative aspect-w-16 aspect-h-9 h-52 w-full overflow-hidden bg-slate-900">
        {vlog.thumbnailUrl ? (
          <img
            src={vlog.thumbnailUrl}
            alt={vlog.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105 opacity-90"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-400">
            No Thumbnail
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
          <Link
            href={`/vlogs/${vlog.slug}`}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl transition transform group-hover:scale-110"
          >
            <Play className="h-6 w-6 fill-current ml-1" />
          </Link>
        </div>

        {vlog.duration && (
          <span className="absolute right-3 bottom-3 rounded-md bg-black/80 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
            {vlog.duration}
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mb-2">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {vlog.viewCount} views
          </span>
        </div>

        <h3 className="text-lg font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-rose-600 transition">
          <Link href={`/vlogs/${vlog.slug}`}>{vlog.title}</Link>
        </h3>

        <p className="mt-2 text-xs text-slate-600 line-clamp-2">{vlog.description}</p>

        <div className="mt-5 border-t border-slate-200/60 pt-4">
          <Link
            href={`/vlogs/${vlog.slug}`}
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-900 group-hover:text-rose-600 transition"
          >
            Watch Video <MoveRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
