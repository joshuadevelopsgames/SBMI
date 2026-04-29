# Changelog — 2026-02-16

Daily notes for changes made to `sbmi.ca/`.

## Base44 full-project handoff prompt

### Goal

Make it easy to hand the entire SBMI.ca project to Base44 for end-to-end regeneration (one-pager + portals + API + Prisma), without leaking secrets.

### What changed

- Added a single Base44 “full project regeneration” prompt + upload checklist + routes/spec pointers.
- Tightened language to explicitly forbid invented features/endpoints and require surfacing spec gaps as questions.

### Files

- `docs/BASE44-FULL-PROJECT-PROMPT.md`

