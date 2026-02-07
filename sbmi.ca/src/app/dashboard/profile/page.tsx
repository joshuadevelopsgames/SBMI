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
    include: { household: true },
  });
  if (!member) redirect("/dashboard");

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-[#C9A227]" />
        <span className="text-xs tracking-[0.2em] text-[#C9A227] uppercase font-medium">
          Account
        </span>
      </div>
      <h1 className="text-2xl font-serif font-light text-[#1B4332] mb-8">
        Profile
      </h1>

      <ProfileForm member={member} />
    </div>
  );
}
