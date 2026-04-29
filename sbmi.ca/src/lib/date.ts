/**
 * Site-wide: all dates and times are shown in Calgary (Alberta) timezone.
 * IANA: America/Edmonton (Alberta, same as Calgary).
 */
export const SITE_TIMEZONE = "America/Edmonton";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SITE_TIMEZONE,
  year: "numeric",
  month: "long",
  day: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SITE_TIMEZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

/** Format a date (or ISO string) in Calgary timezone — e.g. "January 15, 2000". */
export function formatDate(value: Date | string | null | undefined): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return dateFormatter.format(d);
}

/** Format a date in Calgary as short numeric — e.g. "2000-01-15" or locale short. */
export function formatDateShort(value: Date | string | null | undefined): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return shortDateFormatter.format(d);
}

/** Format a calendar date string (YYYY-MM-DD) for display without timezone shift — e.g. "January 15, 2000". */
export function formatCalendarDate(isoDateOnly: string): string {
  const s = typeof isoDateOnly === "string" ? isoDateOnly.slice(0, 10) : "";
  if (!s || s.length < 10) return "—";
  const [y, m, d] = s.split("-");
  const monthIdx = parseInt(m ?? "1", 10) - 1;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${monthNames[monthIdx] ?? m} ${parseInt(d ?? "1", 10)}, ${y}`;
}
