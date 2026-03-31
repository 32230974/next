import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/products — public, supports ?category=&search=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (err) {
    console.error("[PRODUCTS GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// POST /api/products — admin only
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { name, description, price, image, category, stock, discount } = await req.json();

    if (!name || !description || !price || !category) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image: image || "",
        category,
        stock: parseInt(stock) || 0,
        discount: parseFloat(discount) || 0,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("[PRODUCTS POST]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
