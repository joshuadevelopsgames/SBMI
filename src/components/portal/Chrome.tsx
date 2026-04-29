"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  Wallet,
  LifeBuoy,
  User,
  FileText,
  Heart,
  LogOut,
  ClipboardCheck,
  BarChart3,
  Eye,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
  { key: "family", label: "Family", href: "/dashboard/family", icon: Users },
  { key: "payments", label: "Payments", href: "/dashboard/payments", icon: Wallet },
  { key: "assistance", label: "Assistance", href: "/dashboard/assistance", icon: LifeBuoy },
  { key: "profile", label: "Profile", href: "/dashboard/profile", icon: User },
] as const;

const ADMIN_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: "/admin", icon: Home },
  { key: "approvals", label: "Approvals", href: "/admin/approvals", icon: ClipboardCheck },
  { key: "members", label: "Members", href: "/admin/members", icon: Users },
  { key: "reports", label: "Reports", href: "/admin/reports", icon: BarChart3 },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

export type MemberInfo = {
  firstName: string;
  lastName: string;
  initials: string;
} | null;

function pathToActive(pathname: string): NavKey {
  if (pathname.startsWith("/dashboard/family")) return "family";
  if (pathname.startsWith("/dashboard/payments")) return "payments";
  if (pathname.startsWith("/dashboard/assistance")) return "assistance";
  if (pathname.startsWith("/dashboard/profile")) return "profile";
  return "dashboard";
}

function pathToAdminActive(pathname: string): "dashboard" | "approvals" | "members" | "reports" {
  if (pathname.startsWith("/admin/approvals")) return "approvals";
  if (pathname.startsWith("/admin/members")) return "members";
  if (pathname.startsWith("/admin/reports")) return "reports";
  return "dashboard";
}

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link href="/dashboard" className="topbar-brand">
      <div className="brand-mark" style={small ? { width: 32, height: 32, fontSize: 14, borderRadius: 8 } : undefined}>
        <span>SB</span>
      </div>
      <div className="topbar-brand-text">
        Samuel Bete Mutual Aid
        <small>Member Portal</small>
      </div>
    </Link>
  );
}

type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  href?: string;
  variant?: "default" | "warn" | "accent";
};

function NotificationBell({ endpoint }: { endpoint: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetch(endpoint)
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((data: { items?: NotificationItem[] }) => {
        if (cancelled) return;
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const count = items.length;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="iconbtn"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={17} />
        {count > 0 ? <span className="badge" aria-hidden="true" /> : null}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 340,
            maxHeight: "min(420px, 70vh)",
            overflow: "auto",
            background: "var(--card)",
            border: "1px solid var(--hairline)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--shadow-2)",
            zIndex: 60,
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--hairline)",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--ink-900)",
              letterSpacing: "0.02em",
            }}
          >
            Notifications
          </div>
          {loading ? (
            <div style={{ padding: "20px 14px", fontSize: 13, color: "var(--ink-500)" }}>Loading…</div>
          ) : failed ? (
            <div style={{ padding: "20px 14px", fontSize: 13, color: "var(--ink-600)" }}>
              Could not load notifications. Try again later.
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: "22px 14px", fontSize: 13, color: "var(--ink-500)", lineHeight: 1.5 }}>
              You&apos;re all caught up — nothing needs your attention right now.
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {items.map((it) => {
                const accent =
                  it.variant === "warn"
                    ? "3px solid #D97757"
                    : it.variant === "accent"
                      ? "3px solid var(--green)"
                      : undefined;
                const inner = (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink-900)", lineHeight: 1.35 }}>{it.title}</div>
                    {it.description ? (
                      <div style={{ marginTop: 4, fontSize: 12, color: "var(--ink-600)", lineHeight: 1.45 }}>{it.description}</div>
                    ) : null}
                  </>
                );
                const pad = { padding: "12px 14px", borderBottom: "1px solid var(--hairline)" as const };
                const rowStyle = accent ? { ...pad, borderLeft: accent, paddingLeft: 11 } : pad;
                return (
                  <li key={it.id}>
                    {it.href ? (
                      <Link
                        href={it.href}
                        onClick={() => setOpen(false)}
                        style={{
                          display: "block",
                          textDecoration: "none",
                          color: "inherit",
                          ...rowStyle,
                        }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div style={rowStyle}>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileMenu({ memberInfo }: { memberInfo: MemberInfo }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const initials = memberInfo?.initials ?? "—";
  const name = memberInfo ? `${memberInfo.firstName} ${memberInfo.lastName.charAt(0)}.` : "Member";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="profile-chip"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="avatar">{initials}</div>
        {name}
        <ChevronDown size={14} style={{ color: "var(--ink-400)" }} />
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            width: 200,
            background: "var(--card)",
            border: "1px solid var(--hairline)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--shadow-2)",
            overflow: "hidden",
            zIndex: 50,
          }}
        >
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, color: "var(--ink-700)", textDecoration: "none" }}
          >
            <User size={15} style={{ color: "var(--ink-500)" }} /> Profile & settings
          </Link>
          <form action="/api/auth/logout" method="POST" style={{ borderTop: "1px solid var(--hairline)" }}>
            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--ink-700)",
                background: "transparent",
                border: 0,
                textAlign: "left",
              }}
            >
              <LogOut size={15} style={{ color: "var(--ink-500)" }} /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function HeaderUtility({ memberInfo }: { memberInfo: MemberInfo }) {
  return (
    <div className="topbar-right">
      <button className="iconbtn" aria-label="Search">
        <Search size={17} />
      </button>
      <NotificationBell endpoint="/api/dashboard/notifications" />
      <ProfileMenu memberInfo={memberInfo} />
    </div>
  );
}

export function TopHeader({ memberInfo }: { memberInfo: MemberInfo }) {
  const pathname = usePathname() ?? "/dashboard";
  const active = pathToActive(pathname);

  return (
    <header className="topbar">
      <Brand small />
      <nav className="topnav">
        {NAV_ITEMS.map((it) => {
          const Icon = it.icon;
          return (
            <Link key={it.key} href={it.href} className={active === it.key ? "active" : ""}>
              <Icon size={15} /> {it.label}
            </Link>
          );
        })}
      </nav>
      <HeaderUtility memberInfo={memberInfo} />
    </header>
  );
}

/* SideNav (V2) — fixed left sidebar + slim utility bar.
 * The parent stage must carry the .nav-side modifier so .nav-side .dash-stage
 * leaves room for the 248px sidebar (see globals.css:1567). */
export function SideNav({ memberInfo }: { memberInfo: MemberInfo }) {
  const pathname = usePathname() ?? "/dashboard";
  const active = pathToActive(pathname);

  return (
    <>
      <aside className="sidenav">
        <div className="sidenav-brand">
          <Brand small />
        </div>
        <div className="sidenav-section-label">Menu</div>
        <nav className="sidenav-nav">
          {NAV_ITEMS.map((it) => {
            const Icon = it.icon;
            const isActive = active === it.key;
            return (
              <Link key={it.key} href={it.href} className={isActive ? "active" : ""}>
                <span className="sidenav-icon"><Icon size={16} /></span>
                <span>{it.label}</span>
                {isActive && <span className="sidenav-rail" aria-hidden="true"></span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidenav-section-label" style={{ marginTop: 24 }}>Quick</div>
        <nav className="sidenav-nav">
          <a href="/bylaws.pdf" target="_blank" rel="noopener noreferrer">
            <span className="sidenav-icon"><FileText size={16} /></span>
            <span>Bylaws</span>
          </a>
          <Link href="/dashboard/assistance">
            <span className="sidenav-icon"><Heart size={16} /></span>
            <span>Request help</span>
          </Link>
        </nav>

        <div className="sidenav-foot">
          <div className="sidenav-help">
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-900)" }}>Need a hand?</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-500)", lineHeight: 1.5, marginTop: 2 }}>
              Reach the Executive Committee any time.
            </div>
            <Link
              href="/dashboard/assistance"
              className="text-link"
              style={{ color: "var(--green)", fontWeight: 600, fontSize: 12, marginTop: 8, display: "inline-block" }}
            >
              Contact EC →
            </Link>
          </div>
        </div>
      </aside>
      <header className="utilitybar">
        <div className="utility-search" aria-hidden="true">
          <Search size={15} style={{ color: "var(--ink-400)" }} />
          <span>Search members, payments, requests…</span>
          <span className="kbd">⌘K</span>
        </div>
        <div className="utility-right">
          <NotificationBell endpoint="/api/dashboard/notifications" />
          <ProfileMenu memberInfo={memberInfo} />
        </div>
      </header>
    </>
  );
}

/* AdminSideNav (V2) — admin variant: same shell as SideNav with admin nav items + governance footer card. */
export function AdminSideNav({ memberInfo }: { memberInfo: MemberInfo }) {
  const pathname = usePathname() ?? "/admin";
  const active = pathToAdminActive(pathname);

  return (
    <>
      <aside className="sidenav">
        <div className="sidenav-brand">
          <Link href="/admin" className="topbar-brand" style={{ textDecoration: "none" }}>
            <div className="brand-mark" style={{ width: 32, height: 32, fontSize: 14, borderRadius: 8 }}>
              <span>SB</span>
            </div>
            <div className="topbar-brand-text">
              SBMI Governance
              <small>Executive Committee</small>
            </div>
          </Link>
        </div>
        <div className="sidenav-section-label">Menu</div>
        <nav className="sidenav-nav">
          {ADMIN_NAV_ITEMS.map((it) => {
            const Icon = it.icon;
            const isActive = active === it.key;
            return (
              <Link key={it.key} href={it.href} className={isActive ? "active" : ""}>
                <span className="sidenav-icon"><Icon size={16} /></span>
                <span>{it.label}</span>
                {isActive && <span className="sidenav-rail" aria-hidden="true"></span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidenav-section-label" style={{ marginTop: 24 }}>Quick</div>
        <nav className="sidenav-nav">
          <Link href="/dashboard">
            <span className="sidenav-icon"><Eye size={16} /></span>
            <span>View as member</span>
          </Link>
          <a href="/bylaws.pdf" target="_blank" rel="noopener noreferrer">
            <span className="sidenav-icon"><FileText size={16} /></span>
            <span>Bylaws</span>
          </a>
        </nav>

        <div className="sidenav-foot">
          <div className="sidenav-help">
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-900)" }}>
              Governance area
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-500)", lineHeight: 1.5, marginTop: 2 }}>
              Decisions made here are recorded with your Executive Committee identity.
            </div>
          </div>
        </div>
      </aside>
      <header className="utilitybar">
        <div className="utility-search" aria-hidden="true">
          <Search size={15} style={{ color: "var(--ink-400)" }} />
          <span>Search applications, members, payments…</span>
          <span className="kbd">⌘K</span>
        </div>
        <div className="utility-right">
          <NotificationBell endpoint="/api/admin/notifications" />
          <ProfileMenu memberInfo={memberInfo} />
        </div>
      </header>
    </>
  );
}

/* Standalone shell head for unauthenticated screens (welcome / 2fa / forgot) */
export function ShellHead({ rightSlot }: { rightSlot?: ReactNode }) {
  return (
    <header className="shell-head">
      <Link href="/" className="topbar-brand" style={{ textDecoration: "none" }}>
        <div className="brand-mark" style={{ width: 32, height: 32, fontSize: 14, borderRadius: 8 }}>
          <span>SB</span>
        </div>
        <div className="topbar-brand-text">
          Samuel Bete Mutual Aid
          <small>Member Portal</small>
        </div>
      </Link>
      <div className="shell-head-right">
        {rightSlot ?? (
          <Link href="/login" className="text-link">
            Need help? Contact EC →
          </Link>
        )}
      </div>
    </header>
  );
}

const SUPPORT_MAILTO =
  typeof process.env.NEXT_PUBLIC_SUPPORT_EMAIL === "string" && process.env.NEXT_PUBLIC_SUPPORT_EMAIL
    ? `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`
    : "mailto:info@sbmi.ca";

export function ShellFoot() {
  return (
    <footer className="shell-foot">
      <span>© {new Date().getFullYear()} Samuel Bete Mutual Aid Association · Calgary, AB</span>
      <span>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href={SUPPORT_MAILTO}>Contact</a>
      </span>
    </footer>
  );
}

export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="crumbs">
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <ChevronRight size={12} />}
          {it.href ? (
            <Link href={it.href}>{it.label}</Link>
          ) : (
            <span style={{ color: "var(--ink-900)", fontWeight: 500 }}>{it.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function MemberFooter() {
  return (
    <div className="dash-foot">
      <span>© {new Date().getFullYear()} Samuel Bete Mutual Aid Association · Calgary, AB</span>
      <span>
        <a href="/bylaws.pdf" target="_blank" rel="noopener noreferrer">Bylaws</a>
        <a href={SUPPORT_MAILTO}>Contact EC</a>
      </span>
    </div>
  );
}

export { NAV_ITEMS, FileText, Heart };
