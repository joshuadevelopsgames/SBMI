# Spec: Download Bylaws

**SOW:** SOW (3) — Download Bylaws, US31. This spec is the rule set for bylaws download; no behavior beyond cited AC.

---

## 1. Product Summary (from SOW)

- **User roles:** Member.
- **Screens:** No dedicated screen; dashboard link opens PDF in new tab.
- **Flows:** Click link → open current bylaws PDF in new tab.
- **Exclusions:** Modifying/annotating/versioning in system; tracking downloads/views/acknowledgements.

---

## 2. Functional Specification

### 2.1 UI States

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| Link available | Member on dashboard | Clearly labeled link to download bylaws | US31 |
| On click | User selects link | Open bylaws PDF in new browser tab; read-only | US31 |

### 2.2 Validation Rules

- None (no form).

### 2.3 Error States

- No error states specified (e.g. missing PDF, 404). [UNSPECIFIED – REQUIRES PRODUCT DECISION]

### 2.4 Edge Cases

- **“Most recent approved by SBMI”:** PDF updated by manual replacement via “management tools in the administrator.” SOW does not define admin tooling. [UNSPECIFIED – REQUIRES PRODUCT DECISION: admin file replacement flow]
- **Versioning:** System does not modify, annotate, or version content. (US31.)

### 2.5 Explicit Inclusions

- Dashboard displays clearly labeled link to download bylaws. (US31.)
- Selecting link opens PDF in new tab. (US31.)
- PDF = most recent bylaws approved by SBMI; read-only. (US31.)
- Updating PDF = manual replacement of file by SBMI using admin management tools. (US31.)
- Informational reference only; no system enforcement. (US31.)

### 2.6 Explicit Exclusions

- Modifying, annotating, or versioning bylaws in system. (US31.)
- Tracking downloads, views, or acknowledgements. (US31.)

---

## 3. Technical Specification

### 3.1 Data Models and Fields

- No model required for bylaws content. Single PDF asset (path or URL); “current” = one approved file.

### 3.2 Required Tables

- None. Optional: config or asset table for “current bylaws PDF path” if admin replaces file via app. [UNSPECIFIED – REQUIRES PRODUCT DECISION]

### 3.3 API Endpoints

- Option A: Static asset route (e.g. /bylaws.pdf or /api/bylaws/document) serving one PDF.
- Option B: Redirect to stored URL. No SOW requirement for versioned or multiple documents.

### 3.4 Background Jobs

- None.

### 3.5 External Integrations

- None.

### 3.6 Security Boundaries

- Link and PDF available only to authenticated members (dashboard link). (US31 implied.)

---

## 4. SOW Citation Index

- US31: Download current bylaws PDF — labeled link, new tab, most recent SBMI-approved, read-only, no modify/annotate/version, no tracking, manual replacement via admin.
