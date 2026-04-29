import { Crumbs } from "@/components/portal/Chrome";
import { BarChart3, FileText, Wallet, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const REPORTS = [
  {
    key: "payments",
    title: "Payments report",
    description:
      "Payments across all members with date range and filters. Receipt links open in a new tab.",
    icon: Wallet,
  },
  {
    key: "registration",
    title: "Registration fee status",
    description:
      "Registration fee required, paid to date, and remaining balance per member, including installment progress.",
    icon: FileText,
  },
  {
    key: "delinquency",
    title: "Dues and delinquency",
    description:
      "Members with overdue status and total amount due, for Executive Committee follow-up.",
    icon: AlertCircle,
  },
];

export default function AdminReportsPage() {
  return (
    <>
      <Crumbs items={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]} />
      <div className="page-head">
        <div>
          <h1 className="page-h">Reports</h1>
          <p className="page-sub">
            Read-only, paginated reports for the Executive Committee. Member payment history remains available from each
            member record.
          </p>
        </div>
      </div>

      <div className="callout" style={{ marginBottom: 18 }}>
        <BarChart3 size={16} />
        <span>
          Three standard report layouts are listed below. PDF and CSV export from the app is included; other export
          formats or custom reporting require a separate agreement.
        </span>
      </div>

      <section className="actions-grid">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.key} className="action-card" style={{ cursor: "default" }}>
              <div className="action-icon"><Icon size={19} /></div>
              <div>
                <h4 className="action-title">{r.title}</h4>
                <p className="action-desc">{r.description}</p>
              </div>
              <span
                className="pill pill-neutral"
                style={{ fontSize: 11, padding: "2px 8px", whiteSpace: "nowrap" }}
              >
                <span className="pill-dot"></span>
                Coming soon
              </span>
            </div>
          );
        })}
      </section>
    </>
  );
}
