import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) return NextResponse.json({ message: "Order not found." }, { status: 404 });

    // Only the owner or an admin can view the order
    if (order.userId !== userId && role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("[ORDER GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
