import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen sbmi-page-bg">
      <header className="bg-[#0F261A] border-b border-[#1B4332]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/admin"
            className="font-serif font-medium text-white tracking-wide"
          >
            SBMI Admin
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/members"
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              Members
            </Link>
            <Link
              href="/admin/approvals"
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              Approvals
            </Link>
            <Link
              href="/admin/reports"
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              Reports
            </Link>
            <Link
              href="/dashboard"
              className="text-[#C9A227] hover:text-[#B8922A] text-sm transition-colors"
            >
              Member view
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
