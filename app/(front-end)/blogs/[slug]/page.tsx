import Breadcrumb from "@/components/frontend/Breadcrumb";
import ProductShareButton from "@/components/frontend/ProductShareButton";
import TrainingHtml from "@/components/TrainingHtml";
import { GlassText } from "@/components/ui/glass-text";
import { getBlogBySlug, getBlogs } from "@/lib/services/blog-service";
import { Clock, Eye, MoveRight, ShoppingCart, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Article Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = blog.seoTitle || blog.title;
  const description = blog.seoDescription || blog.description || "";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nxbazaar.in.com";
  const url = `${baseUrl}/blogs/${blog.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: blog.imageUrl ? [{ url: blog.imageUrl, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: blog.imageUrl ? [blog.imageUrl] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const { blogs: relatedBlogs } = await getBlogs({
    category: blog.categoryId || undefined,
    limit: 4,
  });

  const filteredRelated = relatedBlogs.filter((b) => b.id !== blog.id).slice(0, 3);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nxbazaar.in.com";
  const shareUrl = `${baseUrl}/blogs/${blog.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.description,
    image: blog.imageUrl ? [blog.imageUrl] : [],
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      "@type": "Person",
      name: blog.author?.name || "NXBazaar Specialist",
    },
    publisher: {
      "@type": "Organization",
      name: "NXBazaar",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon.ico`,
      },
    },
  };

  return (
    <div className="py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content */}
          <main className="lg:col-span-8">
            <article className="liquid-card frontend-glass rounded-[32px] p-6 sm:p-10 shadow-lg">
              {/* Category & Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {blog.category && (
                  <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {blog.category.title}
                  </span>
                )}

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {blog.readingTime} min read
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {blog.viewCount} views
                  </span>
                  <ProductShareButton urlToShare={shareUrl} />
                </div>
              </div>

              {/* Title & Description */}
              <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {blog.title}
              </h1>

              {blog.description && (
                <p className="mt-4 text-lg text-slate-700 font-medium leading-relaxed">
                  {blog.description}
                </p>
              )}

              {/* Author Bio Bar */}
              <div className="mt-6 flex items-center gap-3 border-y border-slate-200/60 py-4 text-sm text-slate-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {blog.author?.name || "NXBazaar Expert"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Published on {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Featured Image */}
              {blog.imageUrl && (
                <div className="mt-8 overflow-hidden rounded-2xl aspect-w-16 aspect-h-9">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Rich Body Content */}
              <div className="py-8 prose max-w-none text-slate-800 leading-relaxed">
                <TrainingHtml content={blog.content || ""} />
              </div>
            </article>

            {/* Linked Product Recommendation Box */}
            {blog.product && (
              <div className="liquid-card mt-8 rounded-[28px] border border-emerald-400/40 bg-emerald-500/5 p-6 shadow-md">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {blog.product.imageUrl && (
                      <img
                        src={blog.product.imageUrl}
                        alt={blog.product.title}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                    )}
                    <div>
                      <span className="text-xs font-bold uppercase text-emerald-700">
                        Featured Product
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{blog.product.title}</h3>
                      {blog.product.salePrice && (
                        <p className="text-sm font-extrabold text-emerald-600">
                          ₹{blog.product.salePrice}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/products/${blog.product.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 shadow-md"
                  >
                    <ShoppingCart className="h-4 w-4" /> View Product
                  </Link>
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {filteredRelated.length > 0 && (
              <div className="liquid-card frontend-glass rounded-3xl p-6 shadow-md">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {filteredRelated.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/blogs/${rel.slug}`}
                      className="group flex items-start gap-3 rounded-2xl p-2 transition hover:bg-white/40"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                        {rel.imageUrl && (
                          <img
                            src={rel.imageUrl}
                            alt={rel.title}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-emerald-600">
                          {rel.title}
                        </h4>
                        <span className="mt-1 block text-xs text-slate-500">
                          {rel.readingTime} min read
                        </span>
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