import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/offers — public, returns all active offers
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = !!session && (session.user as any).role === "ADMIN";

    const offers = await prisma.offer.findMany({
      where: isAdmin ? undefined : { active: true, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ offers });
  } catch (err) {
    console.error("[OFFERS GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// POST /api/offers — admin only
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { title, description, discount, code, expiresAt } = await req.json();

    if (!title || !discount || !code || !expiresAt) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        title,
        description: description || "",
        discount: parseFloat(discount),
        code: code.toUpperCase(),
        expiresAt: new Date(expiresAt),
        active: true,
      },
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ message: "Promo code already exists." }, { status: 409 });
    }
    console.error("[OFFERS POST]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
