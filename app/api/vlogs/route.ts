import { auth } from "@/auth";
import { createVlog, getVlogs } from "@/lib/services/vlog-service";
import type { PostQueryFilters, PostStatus } from "@/types/blog";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const status = (searchParams.get("status") as PostStatus) || "PUBLISHED";
    const authorId = searchParams.get("authorId") || undefined;
    const productId = searchParams.get("productId") || undefined;
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

    const filters: PostQueryFilters = {
      search,
      category,
      tag,
      status,
      authorId,
      productId,
      page,
      limit,
    };

    const result = await getVlogs(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/vlogs error:", error);
    return NextResponse.json(
      { message: "Failed to fetch vlogs", error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      videoUrl,
      thumbnailUrl,
      description,
      content,
      seoTitle,
      seoDescription,
      status = "DRAFT",
      categoryId,
      productId,
      duration = "05:00",
      isFeatured = false,
      isTrending = false,
    } = body;

    if (!title || !slug || !videoUrl) {
      return NextResponse.json(
        { message: "Title, slug, and videoUrl are required" },
        { status: 400 }
      );
    }

    const newVlog = await createVlog(
      {
        title,
        slug,
        videoUrl,
        thumbnailUrl,
        description,
        content,
        seoTitle,
        seoDescription,
        status: status as PostStatus,
        categoryId,
        productId,
        duration,
        isFeatured,
        isTrending,
      },
      session.user.id
    );

    return NextResponse.json(newVlog, { status: 201 });
  } catch (error) {
    console.error("POST /api/vlogs error:", error);
    return NextResponse.json(
      { message: "Failed to create vlog", error },
      { status: 500 }
    );
  }
}
