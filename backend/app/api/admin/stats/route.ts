import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats — admin only
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const [totalOrders, totalUsers, totalProducts, revenueData, recentOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.user.count({ where: { role: "USER" } }),
        prisma.product.count(),
        prisma.order.aggregate({ _sum: { total: true } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true } } },
        }),
      ]);

    return NextResponse.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue: revenueData._sum.total ?? 0,
      recentOrders,
    });
  } catch (err) {
    console.error("[ADMIN STATS]", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
