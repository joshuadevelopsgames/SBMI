import { prisma } from "@/lib/db";

/**
 * After password + 2FA (or password-only when 2FA skipped), send members to
 * registration payment until status is ACTIVE.
 */
export async function getMemberDashboardRedirect(
  roleName: string,
  memberId: string | null | undefined
): Promise<string> {
  if (roleName === "ADMIN") return "/admin";
  if (!memberId) return "/dashboard";
  const m = await prisma.member.findUnique({
    where: { id: memberId },
    select: { status: true },
  });
  if (m?.status === "PENDING_REGISTRATION") return "/registration-payment";
  return "/dashboard";
}
