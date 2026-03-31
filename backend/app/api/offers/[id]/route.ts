import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/offers/[id] — admin only
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { title, description, discount, code, expiresAt, active } = await req.json();

    const { id } = await params;
    const offer = await prisma.offer.update({
      where: { id },
      data: {
        title,
        description,
        discount: parseFloat(discount),
        code: code.toUpperCase(),
        expiresAt: new Date(expiresAt),
        active,
      },
    });

    return NextResponse.json({ offer });
  } catch (err) {
    console.error("[OFFER PUT]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// DELETE /api/offers/[id] — admin only
export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await prisma.offer.delete({ where: { id } });
    return NextResponse.json({ message: "Offer deleted." });
  } catch (err) {
    console.error("[OFFER DELETE]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
