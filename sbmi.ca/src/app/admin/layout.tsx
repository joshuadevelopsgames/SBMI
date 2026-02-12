import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/api/auth/logout?redirect=/login");
  if (session.role !== "ADMIN") redirect("/dashboard");
  if (session.isPre2FA) redirect("/login/2fa");

  return (
    <div className="min-h-screen sbmi-page-bg">
      <header className="bg-[#0F3D2C] shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-display font-semibold text-white tracking-wide text-lg"
          >
            <Image src="/sbmi-logo.png" alt="" width={36} height={36} className="rounded-full object-contain" unoptimized />
            SBMI Admin
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/members"
              className="px-3 py-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
            >
              Members
            </Link>
            <Link
              href="/admin/approvals"
              className="px-3 py-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
            >
              Approvals
            </Link>
            <Link
              href="/admin/reports"
              className="px-3 py-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
            >
              Reports
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Breadcrumbs
            rootHref="/admin"
            rootLabel="Admin"
            theme="light"
            labelMap={{
              "/admin": "Dashboard",
              "/admin/members": "Members",
              "/admin/approvals": "Approvals",
              "/admin/reports": "Reports",
            }}
          />
        </div>
        {children}
      </main>
    </div>
  );
}
