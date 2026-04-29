import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RegistrationPaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.isPre2FA) redirect("/login/2fa");
  if (session.role === "ADMIN") redirect("/admin");
  if (!session.memberId) redirect("/dashboard");
  const m = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { status: true },
  });
  if (m?.status === "ACTIVE") redirect("/dashboard");
  if (m?.status !== "PENDING_REGISTRATION") redirect("/dashboard");
  return <>{children}</>;
}
