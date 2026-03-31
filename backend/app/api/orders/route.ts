import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type OrderRequestItem = {
  productId: string;
  quantity: number;
};

// GET /api/orders — returns current user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const userId = (session.user as any).id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[ORDERS GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// POST /api/orders — place a new order
// Body: { items: [{ productId, quantity }] }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const userId = (session.user as any).id;
    const body = (await req.json()) as { items?: OrderRequestItem[] };
    const items = body.items;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Order must have at least one item." }, { status: 400 });
    }

    // Fetch products to get current prices
    const productIds = items.map((i) => i.productId);
    const products: Array<{ id: string; price: number; discount: number | null }> =
      await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, discount: true },
    });

    let total = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const price = product.discount
        ? product.price - (product.price * product.discount) / 100
        : product.price;

      total += price * item.quantity;

      return {
        productId: product.id,
        quantity: item.quantity,
        price,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    // Decrease stock for each product
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error("[ORDERS POST]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
