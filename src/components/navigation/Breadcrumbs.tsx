"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbTheme = "dark" | "light";

function titleCaseSegment(segment: string): string {
  const s = segment.replace(/[-_]+/g, " ").trim();
  if (!s) return "—";
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs({
  rootHref,
  rootLabel,
  labelMap,
  theme = "dark",
  hideIfSingle = true,
}: {
  rootHref: string;
  rootLabel: string;
  labelMap?: Record<string, string>;
  theme?: BreadcrumbTheme;
  hideIfSingle?: boolean;
}) {
  const pathname = usePathname();
  if (!pathname.startsWith(rootHref)) return null;

  const parts = pathname.split("/").filter(Boolean);
  const rootParts = rootHref.split("/").filter(Boolean);
  if (rootParts.length === 0) return null;

  const rest = parts.slice(rootParts.length);
  const crumbs: Array<{ href: string; label: string }> = [
    { href: rootHref, label: rootLabel },
    ...rest.map((seg, idx) => {
      const href = "/" + [...rootParts, ...rest.slice(0, idx + 1)].join("/");
      const label = labelMap?.[href] ?? titleCaseSegment(seg);
      return { href, label };
    }),
  ];

  if (hideIfSingle && crumbs.length <= 1) return null;

  const linkClass =
    theme === "dark"
      ? "text-white/70 hover:text-white transition-colors"
      : "text-[#3D5A4A]/80 hover:text-[#1B5E3B] transition-colors";
  const currentClass = theme === "dark" ? "text-white" : "text-[#1B5E3B]";
  const sepClass = theme === "dark" ? "text-white/35" : "text-[#3D5A4A]/50";
  const backHref = crumbs.length > 1 ? crumbs[crumbs.length - 2].href : null;
  const backLabel = crumbs.length > 1 ? crumbs[crumbs.length - 2].label : null;

  return (
    <nav aria-label="Breadcrumb" className="text-xs sm:text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {backHref && backLabel && (
          <Link
            href={backHref}
            className={`inline-flex items-center gap-1 font-medium ${linkClass}`}
            aria-label={`Back to ${backLabel}`}
          >
            <span aria-hidden="true">←</span>
            <span>Back</span>
          </Link>
        )}
        {backHref && <span className={sepClass}>|</span>}
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((c, i) => {
          const isCurrent = i === crumbs.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-2">
              {isCurrent ? (
                <span className={currentClass}>{c.label}</span>
              ) : (
                <Link href={c.href} className={linkClass}>
                  {c.label}
                </Link>
              )}
              {!isCurrent && <span className={sepClass}>/</span>}
            </li>
          );
        })}
        </ol>
      </div>
    </nav>
  );
}

