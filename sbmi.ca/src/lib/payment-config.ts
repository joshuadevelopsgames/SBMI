/**
 * SOW Payments: monthly contribution and penalty from bylaws (Article 8.2).
 * Source must be configured; no default values (avoids assumption).
 * Set MONTHLY_CONTRIBUTION_CENTS and PENALTY_AMOUNT_CENTS in env, or leave unset
 * to show "configuration required" in payment UI.
 */
export function getMonthlyContributionCents(): number | null {
  const v = process.env.MONTHLY_CONTRIBUTION_CENTS;
  if (v == null || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) || n < 0 ? null : n;
}

export function getPenaltyAmountCents(): number | null {
  const v = process.env.PENALTY_AMOUNT_CENTS;
  if (v == null || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) || n < 0 ? null : n;
}

export function hasPaymentConfig(): boolean {
  return getMonthlyContributionCents() != null && getPenaltyAmountCents() != null;
}
