import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/family", label: "Manage family" },
  { href: "/dashboard/reports", label: "View reports" },
  { href: "/bylaws.pdf", label: "Bylaws (PDF)", external: true },
  { href: "/dashboard/payments", label: "Make payment" },
  { href: "/dashboard/assistance", label: "Request assistance" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function MemberFooter() {
  return (
    <footer className="border-t border-[#E2DCD2] bg-[#FAF7F0] mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="font-display font-semibold text-[#1B5E3B] text-base tracking-wide">SBMI</span>
            <nav className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[#3D5A4A]" aria-label="Footer navigation">
              {FOOTER_LINKS.map(({ href, label, external }) =>
                external ? (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#1B5E3B] transition-colors"
                  >
                    {label}
                  </a>
                ) : (
                  <Link key={href} href={href} className="hover:text-[#1B5E3B] transition-colors">
                    {label}
                  </Link>
                )
              )}
            </nav>
          </div>
          <p className="text-sm text-[#3D5A4A]">
            For assistance, email{" "}
            <a
              href="mailto:assistance@sbmi.ca"
              className="text-[#B84444] hover:underline font-medium"
            >
              assistance@sbmi.ca
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
