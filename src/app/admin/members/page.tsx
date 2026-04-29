import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddMemberForm from "./AddMemberForm";
import { Crumbs } from "@/components/portal/Chrome";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/api/auth/logout?redirect=/login");

  const members = await prisma.member.findMany({
    include: { household: true },
    orderBy: { createdAt: "desc" },
  });

  const counts = members.reduce(
    (acc, m) => {
      if (m.status === "ACTIVE") acc.active++;
      else if (m.status === "PENDING" || m.status === "PENDING_REGISTRATION") acc.pending++;
      else acc.other++;
      return acc;
    },
    { active: 0, pending: 0, other: 0 }
  );

  return (
    <>
      <Crumbs items={[{ label: "Admin", href: "/admin" }, { label: "Members" }]} />
      <div className="page-head">
        <div>
          <h1 className="page-h">Members</h1>
          <p className="page-sub">
            All members in the system. Add admin-created accounts when a member needs immediate access without going through the public application form.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Active", value: counts.active, sub: "Currently in good standing" },
          { label: "Pending", value: counts.pending, sub: "Application or registration payment" },
          { label: "Other", value: counts.other, sub: "Suspended / terminated" },
        ].map((card) => (
          <div key={card.label} className="card card-pad" style={{ padding: "18px 20px" }}>
            <div
              style={{
                fontSize: 11.5,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--ink-500)",
                fontWeight: 600,
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-stack)",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                marginTop: 4,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 className="card-title" style={{ marginBottom: 12, color: "var(--ink-700)" }}>
          Add admin-created member
        </h2>
        <AddMemberForm />
      </div>

      <div>
        <h2 className="card-title" style={{ marginBottom: 12, color: "var(--ink-700)" }}>
          All members
        </h2>
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Roster</h3>
            <span style={{ fontSize: 12.5, color: "var(--ink-500)" }}>
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>
          {members.length === 0 ? (
            <div style={{ padding: 24, color: "var(--ink-500)", fontSize: 13.5 }}>
              No members on file yet.
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Member #</th>
                  <th>Household</th>
                  <th>Status</th>
                  <th>Schedule</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="tbl-cell-strong">
                      {m.firstName} {m.lastName}
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink-500)" }}>
                      {m.memberNumber ?? "—"}
                    </td>
                    <td style={{ color: "var(--ink-700)" }}>{m.household?.name ?? "—"}</td>
                    <td>
                      <span
                        className={
                          "pill " +
                          (m.status === "ACTIVE"
                            ? "pill-ok"
                            : m.status === "PENDING" || m.status === "PENDING_REGISTRATION"
                              ? "pill-warn"
                              : "pill-neutral")
                        }
                      >
                        <span className="pill-dot"></span>
                        {m.status === "ACTIVE"
                          ? "Active"
                          : m.status === "PENDING_REGISTRATION"
                            ? "Pending registration"
                            : m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td style={{ color: "var(--ink-500)", textTransform: "lowercase" }}>
                      {m.paymentSchedule.toLowerCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="tbl-foot">
            <span>
              Showing {members.length} of {members.length} {members.length === 1 ? "member" : "members"}.
            </span>
            <span style={{ fontSize: 12, color: "var(--ink-400)" }}>
              Status changes apply prospectively from the date of approval.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
