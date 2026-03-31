import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PermissionSection } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: { select: { section: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[ADMIN PERMISSIONS GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { userId, sections } = await req.json() as { userId?: string; sections?: PermissionSection[] };

    if (!userId || !Array.isArray(sections)) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const validSections = new Set(Object.values(PermissionSection));
    const normalized = sections.filter((s) => validSections.has(s));

    await prisma.$transaction([
      prisma.userPermission.deleteMany({ where: { userId } }),
      ...(normalized.length > 0
        ? [
            prisma.userPermission.createMany({
              data: normalized.map((section) => ({ userId, section })),
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ message: "Permissions updated." });
  } catch (err) {
    console.error("[ADMIN PERMISSIONS PUT]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
