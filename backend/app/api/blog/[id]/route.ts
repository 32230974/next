import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageSection } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const canManage = await canManageSection(session, "BLOG");

    const { id } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post || (!canManage && !post.published)) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("[BLOG ID GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const allowed = await canManageSection(session, "BLOG");
    if (!allowed) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const { id } = await params;
    const { title, slug, excerpt, content, image, published } = await req.json();

    const post = await prisma.blogPost.update({
      where: { id },
      data: { title, slug, excerpt, content, image, published },
    });

    return NextResponse.json({ post });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ message: "Blog slug already exists." }, { status: 409 });
    }
    console.error("[BLOG ID PUT]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const allowed = await canManageSection(session, "BLOG");
    if (!allowed) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ message: "Post deleted." });
  } catch (err) {
    console.error("[BLOG ID DELETE]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
