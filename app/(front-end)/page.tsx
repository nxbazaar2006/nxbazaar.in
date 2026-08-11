import { NxGlassHome } from "@/components/frontend/nx-home";
import { asArray } from "@/lib/normalizeApiData";
import type { HomepageBanner, HomepageCategory, HomepageProduct } from "@/types/homepage";
import type { BlogItem } from "@/types/blog";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nxbazaar.in";
const canonicalUrl = new URL("/", siteUrl).toString();

export const metadata: Metadata = {
  title: "NXBazaar | Premium Multi-Vendor E-Commerce Marketplace",
  description: "Discover verified sellers, top categories, and fresh deals on NXBazaar.",
  keywords: [
    "NXBazaar",
    "online marketplace",
    "multi-vendor shopping",
    "verified sellers",
    "online shopping",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NXBazaar | Premium Multi-Vendor E-Commerce Marketplace",
    description: "Discover verified sellers, top categories, and fresh deals on NXBazaar.",
    url: canonicalUrl,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NXBazaar | Premium Multi-Vendor E-Commerce Marketplace",
    description: "Discover verified sellers, top categories, and fresh deals on NXBazaar.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

function normalizeImageUrl(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized) return null;
  if (normalized.startsWith("/")) return normalized;

  try {
    const url = new URL(normalized);
    const allowedHosts = ["utfs.io", "ufs.sh", "cdn.nxbazaar.in", "images.unsplash.com"];
    return url.protocol === "https:" && allowedHosts.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
    )
      ? normalized
      : null;
  } catch {
    return null;
  }
}

function finitePrice(value: unknown) {
  const numericValue = value == null ? null : Number(value);
  return numericValue !== null && Number.isFinite(numericValue) ? numericValue : null;
}

function mapProduct(product: HomepageProduct) {
  return {
    id: typeof product.id === "string" ? product.id : "",
    title: typeof product.title === "string" && product.title.trim() ? product.title.trim() : "Untitled product",
    slug: typeof product.slug === "string" && product.slug.trim() ? product.slug.trim() : null,
    imageUrl: normalizeImageUrl(product.imageUrl),
    salePrice: finitePrice(product.salePrice),
    productPrice: finitePrice(product.productPrice),
    categoryName: typeof product.category === "string"
      ? product.category
      : product.category?.title ?? null,
  };
}

async function getHomepageData<T>(endpoint: string, dataKey?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/${endpoint}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return { data: [] as T[], unavailable: true };
    const payload = await response.json();
    const data = dataKey && payload && typeof payload === "object" ? payload[dataKey] : payload;
    return { data: asArray<T>(data), unavailable: false };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Dynamic server usage") ||
        (error as Error & { digest?: string }).digest === "DYNAMIC_SERVER_USAGE")
    ) throw error;
    return { data: [] as T[], unavailable: true };
  }
}

export default async function HomePage() {
  const [categoryResult, productResult, blogResult, bannerResult] = await Promise.allSettled([
    getHomepageData<HomepageCategory>("categories"),
    getHomepageData<HomepageProduct>("products"),
    getHomepageData<BlogItem>("blogs?limit=3", "blogs"),
    getHomepageData<HomepageBanner>("banners"),
  ]);

  const categoriesUnavailable = categoryResult.status === "rejected" || categoryResult.value.unavailable;
  const productsUnavailable = productResult.status === "rejected" || productResult.value.unavailable;
  const categoriesData = categoryResult.status === "fulfilled" ? categoryResult.value.data : [];
  const productsData = productResult.status === "fulfilled" ? productResult.value.data : [];
  const blogs = blogResult.status === "fulfilled" ? blogResult.value.data.slice(0, 3) : [];
  const banners = bannerResult.status === "fulfilled" ? bannerResult.value.data : [];

  const categories = categoriesData.map((category) => ({
    id: category.id,
    title: category.title?.trim() || "Untitled category",
    slug: category.slug?.trim() || null,
    imageUrl: normalizeImageUrl(category.imageUrl),
  }));
  const categoryProducts = categoriesData.flatMap((category) => category.products || []);
  const productRecords = [...productsData, ...categoryProducts].filter(
    (product, index, records) => records.findIndex((candidate) => candidate.id === product.id) === index,
  );
  const products = productRecords.map(mapProduct).filter((product) => product.id);
  const newArrivals = productsData.map(mapProduct).filter((product) => product.id).slice(0, 6);
  const flashDeals = products.filter(
    (product) =>
      product.salePrice != null &&
      product.productPrice != null &&
      product.salePrice < product.productPrice,
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NXBazaar",
    url: canonicalUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${canonicalUrl}search?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <NxGlassHome
        categories={categories}
        products={products}
        newArrivals={newArrivals}
        flashDeals={flashDeals}
        blogs={blogs}
        banners={banners}
        categoriesUnavailable={categoriesUnavailable}
        productsUnavailable={productsUnavailable}
      />
      
    </>
  );
}
