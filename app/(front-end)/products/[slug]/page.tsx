import Breadcrumb from "@/components/frontend/Breadcrumb";
import CategoryCarousel from "@/components/frontend/CategoryCarousel";
import ProductImageCarousel from "@/components/frontend/ProductImageCarousel";
import ProductShareButton from "@/components/frontend/ProductShareButton";
import ProductBarcodeActions from "@/components/ProductBarcodeActions";
import ProductVariantSelector, {
  type ProductVariantSelectorProduct,
} from "@/components/frontend/ProductVariantSelector";
import LocationSelector from "@/components/location/location-selector";
import { GlassText } from "@/components/ui/glass-text";
import { getData } from "@/lib/getData";
import { resolveEffectiveHsn } from "@/lib/hsn/resolve-effective-hsn";
import { asArray } from "@/lib/normalizeApiData";
import { getCatalogTheme } from "@/lib/theme/catalog-theme";
import type { HsnCodeTaxRecord } from "@/types/hsn";
import { Send } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type ProductDetailData = ProductVariantSelectorProduct & {
  categoryId?: string | null;
  subCategoryId?: string | null;
  departmentId?: string | null;
  departmentSlug?: string | null;
  category: { id?: string; slug?: string; hsnCode: HsnCodeTaxRecord | null };
  subCategory: { id?: string; slug?: string; hsnCode: HsnCodeTaxRecord | null } | null;
  hsnCode: HsnCodeTaxRecord | null;
};

type CategoryWithProducts = {
  products?: Array<{ id: string }>;
};

function productUrl(slug: string, lang?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nxbazaar.in.com";
  return `${baseUrl}${lang ? `/${lang}/product` : "/products"}/${slug}`;
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug, lang } = resolvedParams;
  const languageQuery = lang ? `?lang=${lang}` : "";
  const product = await getData<ProductDetailData | null>(
    `products/product/${slug}${languageQuery}`,
  );

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    product.description?.replace(/<[^>]*>/g, "").slice(0, 155) ||
    `Shop ${product.title} on Nxbazaar.in.`;

  return {
    title: product.title,
    description,
    alternates: {
      canonical: productUrl(product.slug, lang),
    },
    openGraph: {
      title: product.title,
      description,
      url: productUrl(product.slug, lang),
      type: "website",
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const { slug, lang } = resolvedParams;
  const languageQuery = lang ? `?lang=${lang}` : "";
  const product = await getData<ProductDetailData>(
    `products/product/${slug}${languageQuery}`,
  );

  if (!product) notFound();

  const effectiveHsn = resolveEffectiveHsn({
    productHsn: product.hsnCode,
    productOverrideEnabled: product.hsnOverrideEnabled,
    categoryHsn: product.category?.hsnCode,
    subCategoryHsn: product.subCategory?.hsnCode,
  });

  const theme = getCatalogTheme({
    departmentId: product.departmentId,
    departmentSlug: product.departmentSlug,
    categoryId: product.categoryId ?? product.category?.id,
    categorySlug: product.category?.slug,
    subCategoryId: product.subCategoryId ?? product.subCategory?.id,
    subCategorySlug: product.subCategory?.slug,
  });

  const { id } = product;
  const catId = product.categoryId;
  const category = await getData<CategoryWithProducts>(`categories/${catId}`);
  const categoryProducts = asArray(category.products);
  const products = categoryProducts.filter((product) => product.id !== id);
  const urlToShare = productUrl(product.slug, lang);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.productImages?.length
      ? product.productImages
      : product.imageUrl
        ? [product.imageUrl]
        : [],
    sku: product.sku || product.variants?.[0]?.sku,
    offers: {
      "@type": "Offer",
      url: urlToShare,
      priceCurrency: "INR",
      price: product.salePrice,
      availability:
        (product.productStock ?? product.variants?.[0]?.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className={`${theme.subCategoryClassName} nx-catalog-theme`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Breadcrumb />
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        <ProductImageCarousel
          productImages={product.productImages}
          thumbnail={product.imageUrl}
          alt={product.title}
        />
        <div className="liquid-card nx-theme-surface col-span-12 p-6 md:col-span-7 lg:col-span-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <GlassText
              variant="light"
              title={product.title}
              description={product.description}
              headingAs="h1"
              headingClassName="text-2xl leading-tight sm:text-3xl lg:text-4xl"
              className="flex-1"
            >
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-700">
                <p className="rounded-full border border-white/55 bg-white/35 px-3 py-1 text-slate-700">
                  HSN:{" "}
                  {effectiveHsn.hsn
                    ? `${effectiveHsn.hsn.code} (${effectiveHsn.hsn.gstRate}% GST)`
                    : "HSN Not Assigned"}
                </p>
                <p className="rounded-full border border-white/55 bg-white/35 px-3 py-1 text-slate-700">
                  SKU: {product.sku || "Pending"}
                </p>
                <p className="rounded-full border border-white/55 bg-white/35 px-3 py-1 text-slate-700">
                  Product Code: {product.productCode || "Pending"}
                </p>
                <p className="rounded-full border border-white/55 bg-white/35 px-3 py-1 text-slate-700">
                  Barcode: {product.barcode || "Pending"}
                </p>
              </div>
              <div className="mt-4">
                <ProductBarcodeActions
                  barcode={product.barcode}
                  title={product.title}
                  productCode={product.productCode}
                  sku={product.sku}
                />
                <Link href={`/dashboard/products/${product.id}/history`} className="mt-2 inline-block rounded-md border px-3 py-2 text-sm text-slate-700">
                  History
                </Link>
              </div>
            </GlassText>
            <ProductShareButton urlToShare={urlToShare} />
          </div>
          <ProductVariantSelector product={product} />
          {product.variants?.length ? (
            <div className="liquid-card nx-theme-surface mt-5 space-y-3 rounded-lg border p-4 text-sm text-slate-800">
              <h2 className="text-base font-semibold">Variant Barcodes</h2>
              <div className="space-y-3">
                {product.variants.map((variant) => (
                  <div key={variant.id} className="flex flex-col gap-3 border-t border-white/50 pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{variant.title}</p>
                      <p className="text-xs text-slate-600">SKU: {variant.sku}</p>
                      <p className="text-xs text-slate-600">Barcode: {variant.barcode}</p>
                    </div>
                    <ProductBarcodeActions
                      barcode={variant.barcode}
                      title={`${product.title} - ${variant.title}`}
                      productCode={product.productCode}
                      sku={variant.sku}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <aside className="liquid-card nx-theme-surface frontend-glass col-span-12 hidden overflow-hidden rounded-[28px] text-slate-800 md:block lg:col-span-3">
          <div className="p-4">
            <GlassText
              variant="light"
              title="Delivery & Returns"
              description="Eligible for Free Delivery."
              headingAs="h2"
              headingClassName="text-lg uppercase"
              className="mb-4"
            >
              <div className="nx-theme-accent-bg mt-4 flex items-center gap-3 rounded-lg px-4 py-2 text-white">
                <span>Limi Express</span>
                <Send />
              </div>
              <Link href="#" className="mt-3 inline-block text-sm text-slate-700">
                View Details
              </Link>
            </GlassText>
            <LocationSelector className="mt-4" />
          </div>
        </aside>
      </div>
      <div className="my-8 space-y-8">
        <div className="liquid-card nx-theme-surface frontend-glass rounded-[30px] p-6 shadow-lg">
          <GlassText
            variant="light"
            title="Product Buying Guide & Related Articles"
            description={`Read expert tips and buying guides for ${product.title}`}
            headingAs="h2"
            headingClassName="text-xl font-bold"
            className="mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/50 bg-white/30 p-4">
              <h3 className="font-bold text-slate-900">Buying & Maintenance Guide</h3>
              <p className="mt-1 text-xs text-slate-600">
                Check specifications, optimal usage tips, warranty information, and recommended operating guidelines for {product.title}.
              </p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/30 p-4">
              <h3 className="font-bold text-slate-900">Frequently Asked Questions</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                <li>• <strong>Q:</strong> Is this product eligible for free delivery? <strong>A:</strong> Yes, eligible for Limi Express shipping.</li>
                <li>• <strong>Q:</strong> Does it come with warranty? <strong>A:</strong> Standard manufacturer warranty applies.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="liquid-card nx-theme-surface frontend-glass rounded-[30px] p-4">
          <GlassText
            variant="light"
            title="Similar Products"
            headingAs="h2"
            headingClassName="text-xl"
            className="mb-4 ml-3 max-w-sm"
          />
          <CategoryCarousel products={products} />
        </div>
      </div>
    </div>
  );
}
