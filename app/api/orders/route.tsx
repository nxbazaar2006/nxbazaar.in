import { auth } from "@/auth";
import db from "@/lib/db";
import { resolveProductHsn } from "@/lib/hsn/resolve-product-hsn";
import {
  calculateOrderTotals,
  calculateSellerOrderTotals,
} from "@/lib/orders/checkout-calculations";
import { assertAdmin, assertAuthenticated, badRequest } from "@/lib/security";
import { calculateGst } from "@/lib/tax/gst";
import { NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  checkoutFormData: z.object({
    city: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    email: z.string().trim().optional().nullable(),
    firstName: z.string().trim().min(1, "First Name is required"),
    lastName: z.string().trim().min(1, "Last Name is required"),
    paymentMethod: z.string().trim().min(1, "Payment method is required"),
    phone: z.string().trim().min(1, "Phone number is required"),
    shippingCost: z.coerce.number().nonnegative().default(0),
    state: z.string().optional().nullable(),
    streetAddress: z.string().optional().nullable(),
  }),
  orderItems: z
    .array(
      z.object({
        id: z.string().min(1, "Product ID is required"),
        productVariantId: z.string().optional().nullable(),
        qty: z.coerce.number().int().positive("Quantity must be greater than 0"),
        title: z.string().optional(),
        selectedAttributes: z.unknown().optional(),
      })
    )
    .min(1, "Order items cannot be empty"),
});

function generateOrderNumber(length: number) {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let orderNumber = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    orderNumber += characters.charAt(randomIndex);
  }
  return orderNumber;
}

async function decrementSellerInventory({
  prisma,
  productId,
  productVariantId,
  sellerId,
  quantity,
  remainingQuantity,
}: {
  prisma: any;
  productId: string;
  productVariantId: string | null;
  sellerId: string;
  quantity: number;
  remainingQuantity: number;
}) {
  const existingInventory = await prisma.inventory.findFirst({
    where: {
      productId,
      productVariantId,
      sellerId,
    },
    select: { id: true },
  });

  if (!existingInventory) {
    await prisma.inventory.create({
      data: {
        productId,
        productVariantId,
        sellerId,
        quantity: remainingQuantity,
        transactionType: "STOCK_OUT",
        note: "Created from checkout stock deduction",
      },
    });
    return;
  }

  const inventoryUpdate = await prisma.inventory.updateMany({
    where: {
      id: existingInventory.id,
      quantity: { gte: quantity },
    },
    data: {
      quantity: { decrement: quantity },
      transactionType: "STOCK_OUT",
      note: "Checkout stock deduction",
    },
  });

  if (inventoryUpdate.count !== 1) {
    throw new Error("Seller inventory is out of stock");
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const denied = assertAuthenticated(session);
    if (denied) return denied;

    const rawBody = await request.json();
    const parsed = checkoutSchema.safeParse(rawBody);

    if (!parsed.success) {
      const issueMessage = parsed.error.issues[0]?.message || "Invalid payload format";
      console.error("POST /api/orders Validation Failed:", parsed.error.format());
      return badRequest(`Invalid checkout payload: ${issueMessage}`);
    }

    const { checkoutFormData, orderItems } = parsed.data;
    const {
      city,
      country,
      email,
      firstName,
      lastName,
      paymentMethod,
      phone,
      shippingCost,
      state,
      streetAddress,
    } = checkoutFormData;
    const userId = session.user.id;

    const result = await db.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          userId,
          firstName,
          lastName,
          email: email || session.user.email || "",
          phone,
          streetAddress,
          city,
          country,
          state,
          shippingCost,
          paymentMethod,
          orderNumber: generateOrderNumber(8),
        },
      });

      const verifiedItems: any[] = [];

      for (const item of orderItems) {
        const quantity = item.qty;
        if (!quantity || quantity < 1) {
          throw new Error(`Invalid quantity for ${item.title}`);
        }

        const product = await prisma.product.findUnique({
          where: { id: item.id },
          include: {
            user: { include: { sellerProfile: true } },
            variants: item.productVariantId
              ? { where: { id: item.productVariantId } }
              : true,
          },
        });

        if (!product || !product.isActive) {
          throw new Error(`Product not available: ${item.title || item.id}`);
        }

        const hsn = await resolveProductHsn(product.id);
        const sellerState = product.user?.sellerProfile?.state;

        if (product.productType === "VARIABLE") {
          const variant = product.variants?.[0];
          if (!variant || !variant.isActive) {
            throw new Error(`Variant not available: ${item.title || item.id}`);
          }

          const stockUpdate = await prisma.productVariant.updateMany({
            where: {
              id: variant.id,
              isActive: true,
              stock: { gte: quantity },
            },
            data: { stock: { decrement: quantity } },
          });

          if (stockUpdate.count !== 1) {
            throw new Error(`Out of stock: ${variant.sku}`);
          }

          const updatedVariant = await prisma.productVariant.findUnique({
            where: { id: variant.id },
            select: { stock: true },
          });

          await decrementSellerInventory({
            prisma,
            productId: product.id,
            productVariantId: variant.id,
            sellerId: product.userId,
            quantity,
            remainingQuantity: updatedVariant?.stock ?? 0,
          });

          const price = Number(variant.price);
          const regularPrice = Number(variant.comparePrice || variant.price);
          const subtotal = price * quantity;
          const commissionRate = product.user?.sellerProfile?.commissionRate ?? 0;
          const commissionAmount =
            Math.round(((subtotal * commissionRate) / 100) * 100) / 100;
          const tax = calculateGst({
            taxableAmount: subtotal,
            gstRate: hsn.gstRate,
            sellerStateCode: sellerState,
            customerStateCode: state,
            taxTreatment: hsn.taxType,
          });

          verifiedItems.push({
            productId: product.id,
            productVariantId: variant.id,
            productCode: variant.productCode || product.productCode,
            sku: variant.sku,
            barcode: variant.barcode,
            vendorId: product.userId,
            quantity,
            price,
            regularPrice,
            salePrice: price,
            subtotal,
            taxableValue: subtotal,
            orderId: newOrder.id,
            imageUrl: variant.imageUrl || product.imageUrl,
            title: item.title || `${product.title} - ${variant.title}`,
            selectedAttributes: item.selectedAttributes || [],
            hsnCode: hsn.code,
            hsnDescription: hsn.description,
            hsnDescriptionSnapshot: hsn.description,
            hsnSource: hsn.source,
            gstRate: hsn.gstRate,
            taxTreatmentSnapshot: hsn.taxType,
            cgstRate: tax.cgstRate,
            sgstRate: tax.sgstRate,
            igstRate: tax.igstRate,
            cessRate: hsn.cessRate ?? null,
            cgstAmount: tax.cgstAmount,
            sgstAmount: tax.sgstAmount,
            igstAmount: tax.igstAmount,
            taxAmount: tax.totalTax,
            commissionRate,
            commissionAmount,
            sellerPayable:
              Math.round((subtotal + tax.totalTax - commissionAmount) * 100) / 100,
          });
        } else {
          const stockUpdate = await prisma.product.updateMany({
            where: {
              id: product.id,
              isActive: true,
              productStock: { gte: quantity },
            },
            data: { productStock: { decrement: quantity } },
          });

          if (stockUpdate.count !== 1) {
            throw new Error(`Out of stock: ${product.title}`);
          }

          const updatedProductStock = await prisma.product.findUnique({
            where: { id: product.id },
            select: { productStock: true },
          });

          await decrementSellerInventory({
            prisma,
            productId: product.id,
            productVariantId: null,
            sellerId: product.userId,
            quantity,
            remainingQuantity: updatedProductStock?.productStock ?? 0,
          });

          const price = Number(product.salePrice);
          const regularPrice = Number(product.productPrice);
          const subtotal = price * quantity;
          const commissionRate = product.user?.sellerProfile?.commissionRate ?? 0;
          const commissionAmount =
            Math.round(((subtotal * commissionRate) / 100) * 100) / 100;
          const tax = calculateGst({
            taxableAmount: subtotal,
            gstRate: hsn.gstRate,
            sellerStateCode: sellerState,
            customerStateCode: state,
            taxTreatment: hsn.taxType,
          });

          verifiedItems.push({
            productId: product.id,
            productVariantId: null,
            productCode: product.productCode,
            sku: product.sku,
            barcode: product.barcode,
            vendorId: product.userId,
            quantity,
            price,
            regularPrice,
            salePrice: price,
            subtotal,
            taxableValue: subtotal,
            orderId: newOrder.id,
            imageUrl: product.imageUrl,
            title: product.title,
            selectedAttributes: [],
            hsnCode: hsn.code,
            hsnDescription: hsn.description,
            hsnDescriptionSnapshot: hsn.description,
            hsnSource: hsn.source,
            gstRate: hsn.gstRate,
            taxTreatmentSnapshot: hsn.taxType,
            cgstRate: tax.cgstRate,
            sgstRate: tax.sgstRate,
            igstRate: tax.igstRate,
            cessRate: hsn.cessRate ?? null,
            cgstAmount: tax.cgstAmount,
            sgstAmount: tax.sgstAmount,
            igstAmount: tax.igstAmount,
            taxAmount: tax.totalTax,
            commissionRate,
            commissionAmount,
            sellerPayable:
              Math.round((subtotal + tax.totalTax - commissionAmount) * 100) / 100,
          });
        }
      }

      const orderTotals = calculateOrderTotals(verifiedItems, shippingCost);
      const updatedOrder = await prisma.order.update({
        where: { id: newOrder.id },
        data: {
          subtotal: orderTotals.subtotal,
          discountTotal: orderTotals.discountTotal,
          taxableTotal: orderTotals.taxableTotal,
          cgstTotal: orderTotals.cgstTotal,
          sgstTotal: orderTotals.sgstTotal,
          igstTotal: orderTotals.igstTotal,
          taxTotal: orderTotals.taxTotal,
          grandTotal: orderTotals.grandTotal,
        },
      });

      const sellerOrderBySellerId = new Map();
      const sellerTotals = calculateSellerOrderTotals(verifiedItems);
      for (const [index, sellerTotal] of sellerTotals.entries()) {
        const sellerOrder = await prisma.sellerOrder.create({
          data: {
            orderId: newOrder.id,
            sellerId: sellerTotal.sellerId,
            orderNumber: `${newOrder.orderNumber}-${index + 1}`,
            itemSubtotal: sellerTotal.subtotal,
            discountTotal: sellerTotal.discountTotal,
            taxableTotal: sellerTotal.taxableTotal,
            cgstTotal: sellerTotal.cgstTotal,
            sgstTotal: sellerTotal.sgstTotal,
            igstTotal: sellerTotal.igstTotal,
            shippingTotal: sellerTotal.shippingTotal,
            commissionTotal: sellerTotal.commissionTotal,
            sellerPayable: sellerTotal.sellerPayable,
          },
        });
        sellerOrderBySellerId.set(sellerTotal.sellerId, sellerOrder.id);
      }

      const newOrderItems = await prisma.orderItem.createMany({
        data: verifiedItems.map((item) => ({
          ...item,
          sellerOrderId: sellerOrderBySellerId.get(item.vendorId),
        })),
      });

      const sales = await Promise.all(
        verifiedItems.map(async (item) => {
          const totalAmount = item.subtotal;
          const newSale = await prisma.sale.create({
            data: {
              orderId: newOrder.id,
              productTitle: item.title,
              productImage: item.imageUrl,
              productPrice: item.price,
              productQty: item.quantity,
              productId: item.productId,
              productVariantId: item.productVariantId,
              vendorId: item.vendorId,
              total: totalAmount,
            },
          });
          return newSale;
        })
      );

      return { newOrder: updatedOrder, newOrderItems, sales };
    });

    return NextResponse.json(result.newOrder);
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to create Order", error },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const denied = assertAdmin(session);
    if (denied) return denied;

    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { message: "Failed to Fetch Orders", error },
      { status: 500 }
    );
  }
}
