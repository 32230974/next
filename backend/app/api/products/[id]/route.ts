import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/products/[id] — public
export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ message: "Product not found." }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    console.error("[PRODUCT GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// PUT /api/products/[id] — admin only
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const data = await req.json();

    const { id } = await params;
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        image: data.image,
        category: data.category,
        stock: parseInt(data.stock),
        discount: parseFloat(data.discount) || 0,
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error("[PRODUCT PUT]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// DELETE /api/products/[id] — admin only
export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted." });
  } catch (err) {
    console.error("[PRODUCT DELETE]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
