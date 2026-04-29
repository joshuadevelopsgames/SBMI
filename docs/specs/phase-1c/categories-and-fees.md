# Membership Categories & Fee Rules

**Phase:** 1c — Payments (data model + rule engine)
**Source files:**
- Schema: [prisma/schema.prisma](../../../prisma/schema.prisma) (`Member.paymentSchedule`, `Payment`, future: `MembershipCategory`)
- Helpers: [src/lib/payment-config.ts](../../../src/lib/payment-config.ts), [src/lib/payment-summary.ts](../../../src/lib/payment-summary.ts)

## Purpose

Define how membership categories carry fee rules (registration fee, monthly dues, per-family-member dues) and how those rules are applied to calculate what a member owes. All rules apply prospectively.

## Source user stories

- **US34** — Membership category and fee rules in the system.
- **US35** — Registration fee calculation model.
- **US36** — Registration fee payment options. *(See [onboarding.md](onboarding.md) for the screen-level acceptance.)*
- **US37** — Category-based dues schedule definition.
- **US38** — Per-family-member dues calculation rules.
- **US39** — Monthly dues calculation (category and family aware).
- **US40** — Membership category change handling (prospective only).

## Acceptance criteria

### Category definition (US34)
- Each user account has one assigned membership category.
- Categories are defined and maintained by the EC.
- Each category includes the rule values needed for payment calculations:
  - Registration fee (or none).
  - Monthly dues (base, or none).
  - Whether per-family-member dues apply, and the per-member dues amount.
- Some categories may have **no monthly dues** if SBMI defines them that way.

### Registration fee model (US35)
- Each category may define a registration fee requirement.
- Fee may be a fixed base **plus** an optional fixed amount per eligible family member.
- Per-family registration counts only **EC-approved** family members and only **eligible** ones (age + marital rules).
- Pending family change requests do not affect the calculation until approved.
- The registration fee is calculated **at the time the EC approves the application** and stored on the applicant record.
- Subsequent family changes do not retroactively change the calculated registration fee unless the applicant is still in Pending Registration Completion and SBMI explicitly requires recalculation during development sign-off.
- Once the member is Active (registration fully paid), the registration fee is **permanently satisfied** and is not recalculated due to later family or category changes.
- The system does not process refunds.

### Dues schedule definition (US37)
- Each category has a monthly dues rule recorded by SBMI.
- For each category, the EC can set: monthly dues amount (base or None), and whether per-family-member dues apply.
- Dues rules are not member-editable.
- Dues rules apply prospectively only (universal Prospective-Only Changes).

### Per-family-member dues (US38)
- For categories that require per-family-member dues:
  - EC defines a base amount and a per-eligible-family-member amount.
  - Eligible family members are determined by approved records + age/marital rules.
  - Pending family change requests do not affect dues until approved.
  - The per-family-member amount is a single flat rate applied equally to each eligible dependent regardless of relationship.

### Monthly dues calculation (US39)
- The monthly amount due is derived from the member's current category's rule values.
- If category rules require per-family-member dues, the amount due includes only currently eligible family members.
- Dues changes caused by category or family-composition changes apply **prospectively** to the **next due cycle** only.
- If a family member becomes ineligible due to age (turning 26) or marital status, they are excluded from per-family-member dues calculations starting the next due cycle.

### Category change handling (US40)
- Only the EC can approve and apply a membership category change.
- After a category change, the member's monthly dues amount is recalculated using the new category rules and applies to the **next due cycle only**.
- If the member has active recurring payments and the dues amount changes, the recurring setup is **not modified automatically**; the member must cancel and re-authorize a new amount via Stripe (US48).
- If a category change would imply a higher registration fee than the member previously paid, an Active Member in good standing is treated as **not owing additional registration** (going-forward dues only).

## Data model

The current schema has a single `paymentSchedule` enum on `Member` (`MONTHLY` etc.), which is insufficient for the full SOW.

To satisfy US34 onward, add a `MembershipCategory` table:

```
MembershipCategory {
  id                          String  PK
  name                        String  unique  // Family | Individual | Youth | Supporting
  registrationFeeCents        Int     // base
  registrationFeePerMemberCents Int   default 0
  monthlyDuesCents            Int     // base, may be 0
  perFamilyMemberDuesCents    Int     default 0
  isActive                    Boolean default true
  effectiveFrom               DateTime
}

Member {
  …
  membershipCategoryId        String  FK
  registrationFeeCents        Int     // captured at application approval; immutable after Active
  registrationFeePaidCents    Int     default 0
  …
}
```

Rule values are seeded by SBMI per `[ LIST: Membership categories at launch ]`.

## Open questions / placeholders

- `[ LIST: Full set of membership categories at launch ]` (US34) — pending Gemechu confirmation. Default seed: Family, Individual, Youth, Supporting.
- `[ CONFIRM ]` Per-head vs per-family flat rate (US38). Per Gemechu Feb 27, current dues are `$25/family` flat → seed `perFamilyMemberDuesCents = 0` for all categories at launch.
- `[ DECIDE ]` Upgraded-Active-Member registration top-up (US40) — default is "no top-up after activation".
