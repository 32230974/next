import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageSection } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const project = await prisma.portfolioProject.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ message: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (err) {
    console.error("[PROJECT GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const allowed = await canManageSection(session, "PROJECTS");
    if (!allowed) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const { title, slug, summary, details, image } = await req.json();

    const project = await prisma.portfolioProject.update({
      where: { id },
      data: { title, slug, summary, details, image },
    });

    return NextResponse.json({ project });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ message: "Project slug already exists." }, { status: 409 });
    }
    console.error("[PROJECT PUT]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const allowed = await canManageSection(session, "PROJECTS");
    if (!allowed) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await prisma.portfolioProject.delete({ where: { id } });
    return NextResponse.json({ message: "Project deleted." });
  } catch (err) {
    console.error("[PROJECT DELETE]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
