import ProductDetailPage from "@/app/(front-end)/products/[slug]/page";
import { isSupportedLanguage } from "@/lib/i18n/languages";
import { notFound } from "next/navigation";
export { generateMetadata } from "@/app/(front-end)/products/[slug]/page";
export default async function LocalizedProductPage({ params,
}: { params: Promise<{ lang: string; slug: string }>;
}) { const resolvedParams = await params; if (!isSupportedLanguage(resolvedParams.lang)) { notFound(); } return <ProductDetailPage params={resolvedParams} />;
}
