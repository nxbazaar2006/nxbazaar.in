import CategoryPage from "@/app/(front-end)/category/[slug]/page";
import { isSupportedLanguage } from "@/lib/i18n/languages";
import { notFound } from "next/navigation";
export default async function LocalizedCategoryPage({ params, searchParams,
}: { params: Promise<{ lang: string; slug: string }>; searchParams: Record<string, string | string[] | undefined>;
}) { const resolvedParams = await params; if (!isSupportedLanguage(resolvedParams.lang)) { notFound(); } return <CategoryPage params={resolvedParams} searchParams={searchParams} />;
}
