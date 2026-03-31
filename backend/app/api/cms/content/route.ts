import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PermissionSection } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageSection } from "@/lib/permissions";

const keyMap: Record<string, PermissionSection> = {
  home: "HOME",
  about: "ABOUT",
  services: "SERVICES",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key) {
      const content = await prisma.cmsContent.findUnique({ where: { key } });
      return NextResponse.json({ content });
    }

    const content = await prisma.cmsContent.findMany({ orderBy: { key: "asc" } });
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[CMS CONTENT GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { key, title, body } = await req.json();

    if (!key || !title || !body) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const section = keyMap[key];
    if (!section) {
      return NextResponse.json({ message: "Unsupported content key." }, { status: 400 });
    }

    const allowed = await canManageSection(session, section);
    if (!allowed) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const content = await prisma.cmsContent.upsert({
      where: { key },
      update: { title, body },
      create: { key, title, body },
    });

    return NextResponse.json({ content });
  } catch (err) {
    console.error("[CMS CONTENT PUT]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
