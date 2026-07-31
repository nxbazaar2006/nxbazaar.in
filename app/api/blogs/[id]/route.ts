import { auth } from "@/auth";
import db from "@/lib/db";
import { deleteBlog, updateBlog } from "@/lib/services/blog-service";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const blog = await db.blog.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        author: {
          select: { id: true, name: true, email: true, role: true },
        },
        product: {
          select: { id: true, title: true, slug: true, imageUrl: true, salePrice: true },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error(`GET /api/blogs/${id} error:`, error);
    return NextResponse.json(
      { message: "Failed to fetch blog", error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingBlog = await db.blog.findUnique({ where: { id } });
    if (!existingBlog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    // Authorization check: Admin or Author
    if (session.user.role !== "ADMIN" && existingBlog.authorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await updateBlog(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PUT /api/blogs/${id} error:`, error);
    return NextResponse.json(
      { message: "Failed to update blog", error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingBlog = await db.blog.findUnique({ where: { id } });
    if (!existingBlog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && existingBlog.authorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await deleteBlog(id);
    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(`DELETE /api/blogs/${id} error:`, error);
    return NextResponse.json(
      { message: "Failed to delete blog", error },
      { status: 500 }
    );
  }
}
