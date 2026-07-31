import { auth } from "@/auth";
import db from "@/lib/db";
import { safelyEnqueueTranslationJobs } from "@/lib/queues/safe-translation-enqueue";
import { createTranslationSourceHash } from "@/lib/translations/source-hash";
import { generateLocalizedSlug } from "@/lib/utils/generateLocalizedSlug";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function POST(request) { try { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const { title, link, imageUrl, isActive } = await request.json(); const sourceHash = createTranslationSourceHash({ title, slug: generateLocalizedSlug(title, "en"), description: null, link, }); const newBanner = await db.banner.create({ data: { title, link, imageUrl, isActive, translations: { create: { language: "en", title, slug: generateLocalizedSlug(title, "en"), description: null, link, }, }, }, }); await safelyEnqueueTranslationJobs({ entityType: "BANNER", entityId: newBanner.id, sourceHash, }); return NextResponse.json(newBanner); } catch (error) { console.error(error); return NextResponse.json( { error: "Failed to create Banner", }, { status: 500 } ); }
}
export async function GET(request) { try { const banners = await db.banner.findMany({ orderBy: { createdAt: "desc", }, include: { translations: true }, }); return NextResponse.json(banners); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Fetch Banner", error, }, { status: 500 } ); }
}
