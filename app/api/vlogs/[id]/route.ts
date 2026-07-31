import { auth } from "@/auth";
import db from "@/lib/db";
import { deleteVlog, updateVlog } from "@/lib/services/vlog-service";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const vlog = await db.vlog.findUnique({
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

    if (!vlog) {
      return NextResponse.json({ message: "Vlog not found" }, { status: 404 });
    }

    return NextResponse.json(vlog);
  } catch (error) {
    console.error(`GET /api/vlogs/${id} error:`, error);
    return NextResponse.json(
      { message: "Failed to fetch vlog", error },
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

    const existingVlog = await db.vlog.findUnique({ where: { id } });
    if (!existingVlog) {
      return NextResponse.json({ message: "Vlog not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && existingVlog.authorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await updateVlog(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PUT /api/vlogs/${id} error:`, error);
    return NextResponse.json(
      { message: "Failed to update vlog", error },
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

    const existingVlog = await db.vlog.findUnique({ where: { id } });
    if (!existingVlog) {
      return NextResponse.json({ message: "Vlog not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && existingVlog.authorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await deleteVlog(id);
    return NextResponse.json({ message: "Vlog deleted successfully" });
  } catch (error) {
    console.error(`DELETE /api/vlogs/${id} error:`, error);
    return NextResponse.json(
      { message: "Failed to delete vlog", error },
      { status: 500 }
    );
  }
}
