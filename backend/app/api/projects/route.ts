import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageSection } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.portfolioProject.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ projects });
  } catch (err) {
    console.error("[PROJECTS GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const allowed = await canManageSection(session, "PROJECTS");
    if (!allowed) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { title, slug, summary, details, image } = await req.json();

    if (!title || !slug || !summary || !details || !image) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const project = await prisma.portfolioProject.create({
      data: { title, slug, summary, details, image },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ message: "Project slug already exists." }, { status: 409 });
    }
    console.error("[PROJECTS POST]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
