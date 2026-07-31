import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang");

  try {
    const training = await db.training.findUnique({
      where: {
        slug,
      },
      include: {
        translations: true,
      },
    });

    if (!training) {
      return NextResponse.json(
        { message: "Training not found" },
        { status: 404 }
      );
    }

    if (lang && lang !== "en" && training.translations) {
      const translation = training.translations.find(
        (t) => t.language === lang
      );

      if (translation) {
        return NextResponse.json({
          ...training,
          title: translation.title || training.title,
          description: translation.description || training.description,
          content: translation.content || training.content,
        });
      }
    }

    return NextResponse.json(training);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to Fetch Training", error },
      { status: 500 }
    );
  }
} 