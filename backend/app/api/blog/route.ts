import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageSection } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const canManage = await canManageSection(session, "BLOG");

    const posts = await prisma.blogPost.findMany({
      where: canManage ? undefined : { published: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("[BLOG GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const allowed = await canManageSection(session, "BLOG");
    if (!allowed) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { title, slug, excerpt, content, image, published } = await req.json();
    if (!title || !slug || !excerpt || !content || !image) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        image,
        published: published ?? true,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ message: "Blog slug already exists." }, { status: 409 });
    }
    console.error("[BLOG POST]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
