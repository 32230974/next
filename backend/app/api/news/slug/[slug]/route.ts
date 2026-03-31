import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageSection } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const canManage = await canManageSection(session, "NEWS");

    const { slug } = await params;
    const post = await prisma.newsPost.findUnique({ where: { slug } });
    if (!post || (!canManage && !post.published)) {
      return NextResponse.json({ message: "News not found." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("[NEWS SLUG GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
