import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.memberId) redirect("/api/auth/logout?redirect=/login");

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    include: { household: true, user: { select: { email: true } } },
  });
  if (!member) redirect("/dashboard");

  const email = member.user?.email ?? null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 min-w-0 bg-[#D4A43A]" />
        <span className="text-xs tracking-[0.2em] text-[#D4A43A] uppercase font-medium shrink-0">
          Account
        </span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-[#1B5E3B] mb-8">
        Profile
      </h1>

      <ProfileForm member={member} email={email} />
    </div>
  );
}
