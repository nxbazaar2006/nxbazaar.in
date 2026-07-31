import { GlassText } from "@/components/ui/glass-text";
import { getBlogs } from "@/lib/services/blog-service";
import type { BlogItem } from "@/types/blog";
import { Clock, Eye, MoveRight, Search, Sparkles, Tag, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NXBazaar Blogs & Knowledge Hub",
  description:
    "Discover expert farming guides, product reviews, agricultural insights, and market trends.",
  openGraph: {
    title: "NXBazaar Blogs & Knowledge Hub",
    description:
      "Discover expert farming guides, product reviews, agricultural insights, and market trends.",
    type: "website",
  },
};

export const revalidate = 60; // ISR revalidation every 60s

export default async function BlogsPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; category?: string; tag?: string; page?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const search = resolvedSearchParams?.search || "";
  const category = resolvedSearchParams?.category || "";
  const tag = resolvedSearchParams?.tag || "";
  const page = Number.parseInt(resolvedSearchParams?.page || "1", 10);

  const { blogs, total, totalPages } = await getBlogs({
    search,
    category,
    tag,
    status: "PUBLISHED",
    page,
    limit: 12,
  });

  const featuredBlogs = blogs.filter((b) => b.isFeatured).slice(0, 3);
  const trendingBlogs = blogs.filter((b) => b.isTrending).slice(0, 4);

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="liquid-card frontend-glass relative overflow-hidden rounded-[36px] p-8 sm:p-12 text-center shadow-xl">
          <div className="mx-auto max-w-3xl">
            <GlassText
              variant="light"
              title="NXBazaar Knowledge & Blogs Hub"
              description="Explore expert guides, product reviews, smart farming insights, and market trends."
              headingAs="h1"
              headingClassName="text-3xl sm:text-5xl font-extrabold tracking-tight"
            />

            {/* Search Bar */}
            <form action="/blogs" method="GET" className="mt-8 flex items-center justify-center">
              <div className="relative w-full max-w-xl">
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search articles, guides, or products..."
                  className="liquid-card w-full rounded-full border border-white/50 bg-white/40 py-3.5 pl-12 pr-28 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Featured Section */}
        {featuredBlogs.length > 0 && !search && (
          <div className="mt-14">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-slate-900">Featured Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} featured />
              ))}
            </div>
          </div>
        )}

        {/* Trending & Main Section */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Blog List */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {search ? `Search Results for "${search}"` : "Latest Articles"}
              </h2>
              <span className="text-sm font-medium text-slate-500">{total} Posts</span>
            </div>

            {blogs.length === 0 ? (
              <div className="liquid-card rounded-3xl p-12 text-center text-slate-600">
                <p className="text-lg font-medium">No blog articles found matching your criteria.</p>
                <Link
                  href="/blogs"
                  className="mt-4 inline-block rounded-full bg-slate-900 px-6 py-2 text-sm text-white"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <Link
                      key={p}
                      href={`/blogs?page=${p}${search ? `&search=${search}` : ""}`}
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        p === page
                          ? "bg-emerald-600 text-white shadow-md"
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

          {/* Sidebar Widget */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Trending Widget */}
            {trendingBlogs.length > 0 && (
              <div className="liquid-card frontend-glass rounded-3xl p-6 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-rose-500" />
                  <h3 className="text-lg font-bold text-slate-900">Trending Now</h3>
                </div>
                <div className="space-y-4">
                  {trendingBlogs.map((b) => (
                    <Link
                      key={b.id}
                      href={`/blogs/${b.slug}`}
                      className="group flex items-start gap-3 rounded-2xl p-2 transition hover:bg-white/40"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                        {b.imageUrl && (
                          <img
                            src={b.imageUrl}
                            alt={b.title}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-emerald-600">
                          {b.title}
                        </h4>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {b.readingTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {b.viewCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ blog, featured = false }: { blog: BlogItem; featured?: boolean }) {
  return (
    <div
      className={`liquid-card group overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        featured ? "border border-amber-400/40 bg-gradient-to-br from-amber-500/5 to-emerald-500/5" : ""
      }`}
    >
      <div className="relative aspect-w-16 aspect-h-9 h-48 w-full overflow-hidden bg-slate-100">
        {blog.imageUrl ? (
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
            No Image
          </div>
        )}
        {blog.category && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 backdrop-blur-md">
            {blog.category.title}
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {blog.readingTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {blog.viewCount} views
          </span>
        </div>

        <h3 className="text-lg font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition">
          <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
        </h3>

        <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-2">
          {blog.description}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-4">
          <Link
            href={`/blogs/${blog.slug}`}
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-900 transition group-hover:text-emerald-600"
          >
            Read Article <MoveRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}