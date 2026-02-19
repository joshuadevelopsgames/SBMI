# Changelog — 2026-02-19

Daily implementation notes for SBMI.ca updates.

## Household member add/remove now requires admin approval

**Goal**
- Require admin approval for household/family member add and remove actions before data changes are applied.

**What changed**
- Added a new persistence model and migration for pending family-member change requests (`ADD` / `REMOVE`) with approval status tracking.
- Updated member family APIs so add/remove create pending requests instead of immediately creating/deleting records.
- Added a member endpoint to list pending household change requests and updated the family dashboard UI to show pending requests and submission confirmations.
- Added admin approval processing for household change requests, including approve/reject actions and audit logging.
- Extended admin approvals UI to display and process pending household member changes.
- Updated SOW/spec docs to formally reflect the add/remove admin-approval requirement.

**Files**
- `prisma/schema.prisma`
- `prisma/migrations/20260219000000_family_member_change_requests/migration.sql`
- `src/app/api/dashboard/family-members/route.ts`
- `src/app/api/dashboard/family-members/[id]/route.ts`
- `src/app/api/dashboard/family-member-change-requests/route.ts`
- `src/app/api/admin/family-member-change-requests/[id]/decision/route.ts`
- `src/app/dashboard/family/page.tsx`
- `src/app/dashboard/assistance/page.tsx`
- `src/app/admin/approvals/page.tsx`
- `src/app/admin/approvals/ApprovalQueue.tsx`
- `src/app/admin/page.tsx`
- `specs/00-SOW-Master-Spec.md`
- `specs/04-Family-Management-Spec.md`
