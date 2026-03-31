import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageSection } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const allowed = await canManageSection(session, "PROJECTS");
    if (!allowed) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const submissions = await prisma.projectInterest.findMany({
      include: { project: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("[PROJECT INTERESTS GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
