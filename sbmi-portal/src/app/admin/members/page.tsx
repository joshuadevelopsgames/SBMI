import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddMemberForm from "./AddMemberForm";

export default async function AdminMembersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const members = await prisma.member.findMany({
    include: { household: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-[#C9A227]" />
        <span className="text-xs tracking-[0.2em] text-[#C9A227] uppercase font-medium">
          Management
        </span>
      </div>
      <h1 className="text-2xl font-serif font-light text-[#1B4332] mb-8">
        Members
      </h1>

      <AddMemberForm className="sbmi-card rounded-none p-6 mb-8" />

      <section className="sbmi-card rounded-none overflow-hidden">
        <div className="p-4 border-b border-[#E8E4DE]">
          <h2 className="font-serif text-[#1B4332]">All members ({members.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAF8F5] text-left">
                <th className="p-3 text-[#1B4332] font-medium">Name</th>
                <th className="p-3 text-[#1B4332] font-medium">Member #</th>
                <th className="p-3 text-[#1B4332] font-medium">Household</th>
                <th className="p-3 text-[#1B4332] font-medium">Status</th>
                <th className="p-3 text-[#1B4332] font-medium">Schedule</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-[#E8E4DE]">
                  <td className="p-3 text-[#3D5A4C]">
                    {m.firstName} {m.lastName}
                  </td>
                  <td className="p-3 text-[#3D5A4C]">{m.memberNumber ?? "—"}</td>
                  <td className="p-3 text-[#3D5A4C]">{m.household?.name ?? "—"}</td>
                  <td className="p-3">
                    <span
                      className={
                        m.status === "ACTIVE"
                          ? "text-[#1B4332]"
                          : m.status === "PENDING"
                            ? "text-[#C9A227]"
                            : "text-[#3D5A4C]"
                      }
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 text-[#3D5A4C]">{m.paymentSchedule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
