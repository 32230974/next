import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const project = await prisma.portfolioProject.findUnique({ where: { id }, select: { id: true } });
    if (!project) {
      return NextResponse.json({ message: "Project not found." }, { status: 404 });
    }

    const submission = await prisma.projectInterest.create({
      data: {
        projectId: id,
        name,
        email,
        phone: phone || null,
        message,
      },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error("[PROJECT INTEREST POST]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
