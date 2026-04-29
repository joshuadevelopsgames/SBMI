# Download Bylaws

**Phase:** 1b — Member experience
**Surface:** A link/CTA on the member dashboard ("Download bylaws") and as a Quick Action card.
**Source files:** [src/app/dashboard/page.tsx](../../../src/app/dashboard/page.tsx)

## Purpose

Give members one-click access to the most current bylaws PDF as published by SBMI.

## Source user stories

- **US33** — Download current bylaws PDF.

## Acceptance criteria

- The member dashboard displays a clearly labelled link to download the bylaws.
- Selecting the link **opens the bylaws PDF in a new browser tab** (`target="_blank" rel="noopener noreferrer"`).
- The PDF served is the most recent bylaws file uploaded by the EC via the EC bylaws management screen (US80, Phase 2a).
- The PDF is read-only.
- The system does not track downloads, views, or acknowledgements.

## Routes / surfaces

- Static file at `/bylaws.pdf` (served from `public/`); the EC's upload screen replaces this file in place (Phase 2a).

## Implementation notes

- Currently links to `/bylaws.pdf` directly. The EC upload UI (US80) is Phase 2a; until then, replace the PDF manually in `public/`.

## Open questions / placeholders

- None.
