import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageSection } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const allowed = await canManageSection(session, "CONTACT");
    if (!allowed) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("[CONTACT GET]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const submission = await prisma.contactSubmission.create({
      data: { name, email, phone: phone || null, message },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error("[CONTACT POST]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
