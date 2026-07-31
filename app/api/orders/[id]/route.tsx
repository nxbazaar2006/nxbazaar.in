import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateStatusSchema = z.object({
  orderStatus: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELED",
  ]),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: { include: { hsnCode: true } },
                subCategory: { include: { hsnCode: true } },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order Not Found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to Fetch an Order", error },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const existingOrder = await db.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json({ message: "Order Not Found" }, { status: 404 });
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: { orderStatus: parsed.data.orderStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${parsed.data.orderStatus}`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update order status", error },
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
    const existingOrder = await db.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json({ message: "Order Not Found" }, { status: 404 });
    }

    const deletedOrder = await db.order.delete({ where: { id } });
    return NextResponse.json(deletedOrder);
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to Delete an Order", error },
      { status: 500 }
    );
  }
}