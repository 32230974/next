import { PermissionSection } from "@prisma/client";
import { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function canManageSection(
  session: Session | null,
  section: PermissionSection
): Promise<boolean> {
  if (!session?.user) return false;

  if ((session.user as { role?: string }).role === "ADMIN") {
    return true;
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) return false;

  const permission = await prisma.userPermission.findUnique({
    where: {
      userId_section: { userId, section },
    },
    select: { id: true },
  });

  return !!permission;
}
