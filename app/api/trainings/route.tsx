import { auth } from "@/auth";
import db from "@/lib/db";
import { safelyEnqueueTranslationJobs } from "@/lib/queues/safe-translation-enqueue";
import { createTranslationSourceHash } from "@/lib/translations/source-hash";
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/security";
export async function POST(request) { try { const session = await auth(); const denied = assertAdmin(session); if (denied) return denied; const { title, slug, categoryId, imageUrl, description, isActive, content, } = await request.json(); const sourceHash = createTranslationSourceHash({ title, slug, description, content, }); //Check if this training already exists
const existingTraining = await db.training.findUnique({ where: { slug, }, }); if (existingTraining) { return NextResponse.json( { data: null, message: `Training ( ${title}) already exists in the Database`, }, { status: 409 } ); } const newTraining = await db.training.create({ data: { title, slug, categoryId, imageUrl, description, isActive, content, translations: { create: { language: "en", title, slug, description, content, }, }, }, }); await safelyEnqueueTranslationJobs({ entityType: "BLOG", entityId: newTraining.id, sourceHash, }); return NextResponse.json(newTraining); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to create Training", error, }, { status: 500 } ); }
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang");

    const trainings = await db.training.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: { translations: true },
    });

    if (!lang || lang === "en") {
      return NextResponse.json(trainings);
    }

    const localizedTrainings = trainings.map((training) => {
      const translation = training.translations.find(
        (t) => t.language === lang
      );

      if (!translation) return training;

      return {
        ...training,
        title: translation.title || training.title,
        description: translation.description || training.description,
        content: translation.content || training.content,
      };
    });

    return NextResponse.json(localizedTrainings);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to Fetch Trainings", error },
      { status: 500 }
    );
  }
}
