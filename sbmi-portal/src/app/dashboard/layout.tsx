import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "ADMIN") redirect("/admin");

  return (
    <div className="min-h-screen sbmi-page-bg">
      <header className="bg-[#1B4332] border-b border-[#2D5A45]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="font-serif font-medium text-white tracking-wide"
          >
            SBMI Portal
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/dashboard/payments"
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              Payments
            </Link>
            <Link
              href="/dashboard/claims"
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              Claims
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
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
