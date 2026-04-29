/** SOW US4 / categories-and-fees: canonical codes for apply + member record. */
export const MEMBERSHIP_CATEGORY_OPTIONS = [
  { code: "FULL_INDIVIDUAL", label: "Full Member (Individual)" },
  { code: "HOUSEHOLD_MEMBER", label: "Household Member" },
  { code: "YOUTH", label: "Youth (under 18)" },
  { code: "SUPPORTING", label: "Supporting Member" },
] as const;

export type MembershipCategoryCode = (typeof MEMBERSHIP_CATEGORY_OPTIONS)[number]["code"];

export function isMembershipCategoryCode(v: string): v is MembershipCategoryCode {
  return MEMBERSHIP_CATEGORY_OPTIONS.some((o) => o.code === v);
}

export function labelForCategoryCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const o = MEMBERSHIP_CATEGORY_OPTIONS.find((x) => x.code === code);
  return o?.label ?? code;
}
