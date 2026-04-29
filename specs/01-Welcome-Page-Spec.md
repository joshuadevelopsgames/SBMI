# Spec: One-Page Welcome Website

**SOW:** SOW (3) — One-Page Welcome Website, US1–US5. This spec is the rule set for the welcome page; no behavior beyond cited AC.

---

## 1. Product Summary (from SOW)

- **User roles:** Public visitor, prospective member, existing member.
- **Screens:** One public page only; no subpages.
- **Flows:** View content; submit membership application (form always present); optionally go to login.
- **Exclusions:** CMS, inline editing, post-launch content tooling, copywriting/historical research/content creation beyond layout, benefit comparison/personalization/dynamic content, editing benefits without change request.

---

## 2. Functional Specification

### 2.1 UI States

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| Default | Page load, unauthenticated | Show full page: Iddir info, Samuel Bete section, benefits list, imagery, application form at bottom, login link | US1, US2, US3, US4, US5 |
| Form invalid | Required field missing or invalid | Show clear validation errors; do not submit | US4 AC: errors displayed clearly |
| Form success | Valid submit | Clear confirmation message | US4 AC |
| N/A | — | No loading/editing/CMS states | US1 AC: no CMS |

### 2.2 Validation Rules

- **Application form:** Required fields as defined by project; validate before submit. (US4: “clearly labeled required fields,” “errors displayed clearly if required fields are missing or invalid.”)
- **No other validation** specified (e.g. no email format on welcome page for application).

### 2.3 Error States

- Form: show errors for missing/invalid required fields. (US4.)
- No other error states specified (e.g. no “destination unavailable” behavior in SOW).

### 2.4 Edge Cases

- **Application “if included in scope”:** If not in scope, form is not present. (US4.)
- **“Designated destination” for form data:** Storage/delivery as defined by project — [UNSPECIFIED – REQUIRES PRODUCT DECISION] if not yet defined.
- **“Designated login destination”:** Login URL — [UNSPECIFIED – REQUIRES PRODUCT DECISION] if not in project config.

### 2.5 Explicit Inclusions

- Public URL, no auth. (US1.)
- Single page, no subpages. (US1.)
- Iddir content + Samuel Bete section (client-provided/approved). (US1, US2.)
- Bulleted membership benefits (client-provided/approved). (US2.)
- At least one Ethiopian-themed image; optimized, non-blocking. (US3.)
- Application form at bottom of page; required fields, submit, confirmation, validation errors. (US4.)
- Visible login button/link → navigate to login destination. (US5.)
- Responsive layout (desktop and mobile); no custom device-specific behavior. (US1, US2.)

### 2.6 Explicit Exclusions

- CMS, inline editing, post-launch content update tooling. (US1.)
- Copywriting, historical research, content creation beyond formatting/layout. (US1.)
- Benefit comparison, personalization, dynamic content. (US2.)
- Editing/reordering benefits after implementation without change request. (US2.)
- More than one review cycle for content without change request. (US1.)

---

## 3. Technical Specification

### 3.1 Data Models and Fields

- **Application submission:** Fields = project-defined required (+ any optional) for “membership application.” No schema prescribed in SOW. Store or deliver to “designated destination.” (US4.)

### 3.2 Required Tables

- No SOW requirement for a welcome-specific table. Application data may be stored in an “applications” or equivalent table if destination is internal; otherwise external delivery only. [UNSPECIFIED – REQUIRES PRODUCT DECISION]

### 3.3 API Endpoints

- **Submit application:** One endpoint to accept form data and store or forward to designated destination. (US4.)
- No other endpoints specified for welcome page content (content is static/client-supplied).

### 3.4 Background Jobs

- None specified.

### 3.5 External Integrations

- None specified (form destination may be internal or external).

### 3.6 Security Boundaries

- Page is public; no auth. (US1.)
- No PII handling rules beyond “store or deliver as defined by project.”

---

## 4. SOW Citation Index

- US1: Public visitor overview — AC for single page, public URL, content, Samuel Bete, responsive, no CMS, one review cycle.
- US2: Membership value — AC for bulleted benefits, no auth, client content, no comparison/personalization.
- US3: Cultural imagery — AC for at least one Ethiopian image, load/optimization.
- US4: Membership application — AC for form at bottom of page, required fields, submit, confirmation, errors, destination.
- US5: Login access — AC for visible login link, navigation to login, no auth required for welcome.
