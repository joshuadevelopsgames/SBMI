"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { User, LogOut } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/family", label: "Manage family" },
  { href: "/dashboard/reports", label: "View reports" },
  { href: "/bylaws.pdf", label: "Bylaws (PDF)", external: true },
  { href: "/dashboard/payments", label: "Make payment" },
  { href: "/dashboard/assistance", label: "Request assistance" },
];

type MemberInfo = { firstName: string; lastName: string; memberSinceYear: number | null } | null;

export function MemberHeader({ memberInfo }: { memberInfo?: MemberInfo }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className="bg-[#1B5E3B] shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 shrink-0"
        >
          <Image src="/sbmi-logo.png" alt="" width={36} height={36} className="rounded-full object-contain" unoptimized />
          <span className="font-display font-semibold text-white tracking-wide text-lg">SBMI Portal</span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="lg:hidden text-white/80 hover:text-white p-1"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Member navigation">
          {NAV_LINKS.map(({ href, label, external }) => {
            const isActive = !external && pathname === href;
            const baseClasses = "px-3 py-1.5 rounded-md text-sm font-medium transition-colors";
            const activeClasses = isActive
              ? "text-white bg-white/15"
              : "text-white/80 hover:text-white hover:bg-white/10";
            return external ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${baseClasses} ${activeClasses}`}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className={`${baseClasses} ${activeClasses}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Profile dropdown */}
        <div className="relative shrink-0" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
            aria-expanded={open}
            aria-haspopup="true"
            aria-label="Profile menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-lg bg-white border border-[#E2DCD2] shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2DCD2] bg-[#FAF7F0]">
                {memberInfo ? (
                  <>
                    <p className="font-medium text-[#1B5E3B]">
                      {memberInfo.firstName} {memberInfo.lastName}
                    </p>
                    {memberInfo.memberSinceYear != null && (
                      <p className="text-xs text-[#3D5A4A] mt-0.5">
                        Member since {memberInfo.memberSinceYear}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-[#3D5A4A]">Account</p>
                )}
              </div>
              <div className="py-1.5">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#3D5A4A] hover:bg-[#FAF7F0] hover:text-[#1B5E3B] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <User className="w-4 h-4 shrink-0 text-[#1B5E3B]/70" />
                  Edit profile
                </Link>
              </div>
              <div className="border-t border-[#E2DCD2] py-1.5">
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#3D5A4A] hover:bg-[#FAF7F0] hover:text-[#1B5E3B] transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-[#1B5E3B]/70" />
                    Log out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-white/10 px-4 py-2 space-y-1" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ href, label, external }) => {
            const isActive = !external && pathname === href;
            const baseClasses = "block px-3 py-2 rounded-md text-sm font-medium transition-colors";
            const activeClasses = isActive
              ? "text-white bg-white/15"
              : "text-white/80 hover:text-white hover:bg-white/10";
            return external ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${baseClasses} ${activeClasses}`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className={`${baseClasses} ${activeClasses}`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
