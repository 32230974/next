import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageSection } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const canManage = await canManageSection(session, "NEWS");

    const posts = await prisma.newsPost.findMany({
      where: canManage ? undefined : { published: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("[NEWS GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const allowed = await canManageSection(session, "NEWS");
    if (!allowed) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const { title, slug, excerpt, content, image, published } = await req.json();
    if (!title || !slug || !excerpt || !content || !image) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const post = await prisma.newsPost.create({
      data: { title, slug, excerpt, content, image, published: published ?? true },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ message: "News slug already exists." }, { status: 409 });
    }
    console.error("[NEWS POST]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
