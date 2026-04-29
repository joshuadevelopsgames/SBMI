# Welcome page (public landing)

**Phase:** 1a — Foundation
**Route:** `/`
**Source files:** [src/app/page.tsx](../../../src/app/page.tsx)

## Purpose

Public-facing single page that introduces SBMI, communicates the value of membership, and accepts membership applications without authentication. (SOW Section 4.1.)

## Source user stories

- **US1** — Public visitor overview.
- **US2** — Membership value communication (benefits grouped by category).
- **US3** — Cultural representation through imagery (multi-ethnic-inclusive).
- **US4** — Membership application form with optional supporting document upload.
- **US5** — Login access link from welcome page.

## Acceptance criteria

### Page structure
- Single public URL, no authentication required.
- One page; no subpages or CMS.
- Includes informational content describing what the Iddir is, using SBMI-supplied/approved text only (US1).
- Includes a section referencing Samuel Bete using SBMI-supplied content (US1).
- May link out to additional SBMI-provided resources (links only; no new pages built) (US1, Apr 14).
- Login link is visible (US5).

### Membership benefits
- Benefits are grouped by membership category (Family, Individual, Youth, Supporting; final list per `[ LIST: ]` placeholder in US34).
- Each category card has a heading, single-line description, and feature list (US2).
- Layout leaves space for new categories to be added in a future content update (Apr 14).

### Imagery
- At least one culturally respectful image approved by SBMI (US3).
- Imagery is inclusive rather than tied to any single nationality (Apr 14).
- Image licensing beyond royalty-free is excluded.

### Application form (bottom of page)
- Required fields: full name, address (must support 25 km Calgary residency check), email, phone, family composition, proposed membership category. (US4 + bylaws Article 2.)
- Submitting without authentication creates an Application record with status `PENDING` (Pending Executive Committee Review).
- Applicant is **not** auto-activated.
- No payment is collected at this stage.
- Confirmation message is shown after submission ("under review").
- Optional supporting document: PDF or image, attached to the Application record and visible to EC reviewer (US4 new from Apr 14, shares engineering with US88).
- Submitted form data surfaces as a governance notification per the US68 pattern.

### Footer
- Standard SBMI footer (logo, mailto for support).

## Routes / surfaces

- `GET /` — server-rendered page.
- `POST /api/apply` — form submission endpoint.

## Implementation notes

- **`/`** ([`HomeWelcomeV2.tsx`](../../../src/app/HomeWelcomeV2.tsx)): collects structured address + city/province/postal; combines mailing line for `POST /api/apply`. Body includes `household_size`, `proposed_category`, optional `message`.
- **`POST /api/apply`**: validates address, household composition, and membership category code (`membership-categories.ts`).
- Section anchors (`#about`, `#apply`, etc.) use programmatic scroll + `scroll-margin-top` so in-page links work under the fixed nav (including `/ #apply` from `/login`).
- Document upload is not yet wired; placeholder dropzone shown if present in UI.
- Membership categories are data-driven via shared category codes / seed list — confirm against `[ LIST ]` at launch.

## Open questions / placeholders

- `[ CONTENT REQUIRED: web-content for benefits per category ]` — pending Mollalign delivery.
- `[ CONFIRM: Application form fields ]` — final field list pending SBMI confirmation; bylaws Article 2 implies Calgary + 25 km, age 18+, family composition.
- `[ LIST: Membership categories at launch ]` — Family / Individual / Youth confirmed minimum; check for Honorary, Lifetime, Supporting.
