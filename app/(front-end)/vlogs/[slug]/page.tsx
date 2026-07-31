import Breadcrumb from "@/components/frontend/Breadcrumb";
import ProductShareButton from "@/components/frontend/ProductShareButton";
import TrainingHtml from "@/components/TrainingHtml";
import { getVlogBySlug, getVlogs } from "@/lib/services/vlog-service";
import { Eye, MoveRight, Play, ShoppingCart, User, Video } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vlog = await getVlogBySlug(slug);

  if (!vlog) {
    return {
      title: "Video Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = vlog.seoTitle || vlog.title;
  const description = vlog.seoDescription || vlog.description || "";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nxbazaar.in.com";
  const url = `${baseUrl}/vlogs/${vlog.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "video.other",
      images: vlog.thumbnailUrl ? [{ url: vlog.thumbnailUrl, alt: title }] : undefined,
    },
    twitter: {
      card: "player",
      title,
      description,
      images: vlog.thumbnailUrl ? [vlog.thumbnailUrl] : undefined,
    },
  };
}

export default async function VlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vlog = await getVlogBySlug(slug);

  if (!vlog) {
    notFound();
  }

  const { vlogs: relatedVlogs } = await getVlogs({
    category: vlog.categoryId || undefined,
    limit: 4,
  });

  const filteredRelated = relatedVlogs.filter((v) => v.id !== vlog.id).slice(0, 3);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nxbazaar.in.com";
  const shareUrl = `${baseUrl}/vlogs/${vlog.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: vlog.title,
    description: vlog.description,
    thumbnailUrl: vlog.thumbnailUrl ? [vlog.thumbnailUrl] : [],
    uploadDate: vlog.createdAt,
    embedUrl: vlog.videoUrl,
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
          {/* Main Video & Content */}
          <main className="lg:col-span-8">
            <div className="liquid-card frontend-glass overflow-hidden rounded-[32px] p-6 sm:p-8 shadow-xl">
              {/* Responsive Video Embed Player */}
              <div className="relative aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-2xl bg-black shadow-inner">
                <iframe
                  src={vlog.videoUrl}
                  title={vlog.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="h-full w-full border-0"
                />
              </div>

              {/* Title & Stats */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
                <div>
                  {vlog.category && (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase text-rose-700">
                      {vlog.category.title}
                    </span>
                  )}
                  <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                    {vlog.title}
                  </h1>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> {vlog.viewCount} views
                  </span>
                  <ProductShareButton urlToShare={shareUrl} />
                </div>
              </div>

              {/* Author Bio Bar */}
              <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {vlog.author?.name || "NXBazaar Video Creator"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Uploaded on {new Date(vlog.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Video Description */}
              <div className="mt-6 py-4 prose max-w-none text-slate-800 leading-relaxed">
                <p className="text-base font-medium text-slate-700">{vlog.description}</p>
                {vlog.content && <TrainingHtml content={vlog.content} />}
              </div>
            </div>

            {/* Linked Product Box */}
            {vlog.product && (
              <div className="liquid-card mt-8 rounded-[28px] border border-rose-400/40 bg-rose-500/5 p-6 shadow-md">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {vlog.product.imageUrl && (
                      <img
                        src={vlog.product.imageUrl}
                        alt={vlog.product.title}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                    )}
                    <div>
                      <span className="text-xs font-bold uppercase text-rose-700">
                        Demonstrated Product
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{vlog.product.title}</h3>
                      {vlog.product.salePrice && (
                        <p className="text-sm font-extrabold text-rose-600">
                          ₹{vlog.product.salePrice}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/products/${vlog.product.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700 shadow-md"
                  >
                    <ShoppingCart className="h-4 w-4" /> Buy Product
                  </Link>
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {filteredRelated.length > 0 && (
              <div className="liquid-card frontend-glass rounded-3xl p-6 shadow-md">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Related Videos</h3>
                <div className="space-y-4">
                  {filteredRelated.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/vlogs/${rel.slug}`}
                      className="group flex items-start gap-3 rounded-2xl p-2 transition hover:bg-white/40"
                    >
                      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                        {rel.thumbnailUrl && (
                          <img
                            src={rel.thumbnailUrl}
                            alt={rel.title}
                            className="h-full w-full object-cover transition group-hover:scale-105 opacity-80"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-5 w-5 fill-current text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-rose-600">
                          {rel.title}
                        </h4>
                        <span className="mt-1 block text-xs text-slate-500">
                          {rel.viewCount} views
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
