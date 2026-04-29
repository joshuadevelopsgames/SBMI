import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddMemberForm from "./AddMemberForm";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/api/auth/logout?redirect=/login");

  const members = await prisma.member.findMany({
    include: { household: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 min-w-0 bg-[#D4A43A]" />
        <span className="text-xs tracking-[0.2em] text-[#D4A43A] uppercase font-medium shrink-0">
          Management
        </span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-[#1B5E3B] mb-8">
        Members
      </h1>

      <AddMemberForm className="sbmi-card p-6 mb-8" />

      <section className="sbmi-card overflow-hidden">
        <div className="p-4 border-b border-[#E2DCD2]">
          <h2 className="font-display font-semibold text-[#1B5E3B]">All members ({members.length})</h2>
        </div>
        {members.length === 0 ? (
          <div className="p-6 text-[#3D5A4A] text-sm">
            No members found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#FAF7F0] text-left">
                  <th className="p-3 text-[#1B5E3B] font-medium">Name</th>
                  <th className="p-3 text-[#1B5E3B] font-medium">Member #</th>
                  <th className="p-3 text-[#1B5E3B] font-medium">Household</th>
                  <th className="p-3 text-[#1B5E3B] font-medium">Status</th>
                  <th className="p-3 text-[#1B5E3B] font-medium">Schedule</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-t border-[#E2DCD2]">
                    <td className="p-3 text-[#3D5A4A]">
                      {m.firstName} {m.lastName}
                    </td>
                    <td className="p-3 text-[#3D5A4A]">{m.memberNumber ?? "—"}</td>
                    <td className="p-3 text-[#3D5A4A]">{m.household?.name ?? "—"}</td>
                    <td className="p-3">
                      <span
                        className={
                          "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium " +
                          (m.status === "ACTIVE"
                            ? "bg-[#1B5E3B]/10 text-[#1B5E3B]"
                            : m.status === "PENDING"
                              ? "bg-[#D4A43A]/20 text-[#1B5E3B]"
                              : "bg-[#E2DCD2] text-[#3D5A4A]")
                        }
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-[#3D5A4A]">{m.paymentSchedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
