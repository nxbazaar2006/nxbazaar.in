import HomePage from "@/app/(front-end)/page";
import { isSupportedLanguage } from "@/lib/i18n/languages";
import { notFound } from "next/navigation";
export default async function LocalizedHomePage({ params,
}: { params: Promise<{ lang: string }>;
}) { const { lang } = await params; if (!isSupportedLanguage(lang)) { notFound(); } return <HomePage />;
}
