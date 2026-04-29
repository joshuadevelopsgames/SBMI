# SBMI One-Pager — Style Guide

Reference for the public welcome/landing page (single-page site). Use this for design consistency, rebrands, or handing off to Framer/designers.

---

## 1. Colour Palette

| Role | Hex | Usage |
|------|-----|--------|
| **Primary green** | `#1B4332` | Headings, primary text, primary button text, CTA contrast |
| **Green mid** | `#2D5A45` | Hero gradient, secondary buttons (background), accents |
| **Green dark** | `#0F261A` | Footer background |
| **Gold** | `#C9A227` | Accent lines, labels, links, primary buttons (background), icons |
| **Gold hover** | `#B8922A` | Primary button hover, link hover |
| **Muted** | `#3D5A4C` | Body copy, secondary text |
| **Cream** | `#FAF8F5` | Page background (sections), cards where appropriate |
| **Border** | `#E8E4DE` | Input borders, card borders, dividers |
| **White** | `#FFFFFF` | Hero text, cards, form backgrounds |

---

## 2. Typography

- **Headings (display, section titles):** Serif — Cormorant Garamond. Light (300) for hero; regular/medium for section titles. Colour: `#1B4332` (or white on dark green).
- **Body / UI:** Sans-serif — Inter. Weights: 300, 400, 500, 600. Body colour: `#3D5A4C` or white/white-alfa on dark.
- **Small caps / labels:** Uppercase, letter-spacing ~0.2em, size ~0.75rem, colour gold `#C9A227`.
- **Scale:** Hero title large (e.g. 4xl–7xl); section titles 3xl–5xl; body base; captions/small text 0.875rem or smaller.

---

## 3. Layout & Spacing

- **Page background:** Full-width cream `#FAF8F5`; no side margins on the canvas.
- **Content width:** Max-width ~72rem (1152px) or ~80rem (1280px), centred; horizontal padding ~1.5rem (24px).
- **Sections:** Vertical padding py-24 to py-32 (96px–128px) for major sections.
- **Corners:** Sharp — use `border-radius: 0` (no rounded corners) for buttons, inputs, cards.
- **Login (top-right):** Fixed; gold button, green text; rounded-none.

---

## 4. Components

### Hero
- Full-viewport height; gradient background `from-[#1B4332] via-[#2D5A45] to-[#1B4332]`.
- Optional: subtle pattern or texture overlay (e.g. gold at low opacity).
- Centred content: decorative gold line + icon + line; serif title (white); gold tagline; white/70 body; two CTAs — primary gold “Apply to Join”, secondary green “Contact Us”.
- Optional: scroll cue (e.g. arrow) at bottom.

### Section headers
- Small gold line (h-px, w-8) + gold small-caps label + gold line.
- Serif H2 in `#1B4332`; body in `#3D5A4C`.

### Buttons
- Primary: background `#C9A227`, text `#1B4332`, hover background `#B8922A`, rounded-none.
- Secondary: background `#2D5A45`, text white, hover `#1B4332`, rounded-none.

### Cards / form containers
- Background white; border 1px `#E8E4DE`; rounded-none; padding as needed.

### Footer
- Background `#0F261A`; text white / white-alfa; gold for icons and accent lines; serif for quote; mailto and location; copyright in low-contrast (e.g. white/30).

---

## 5. Application form (bottom of one-pager)

- Section background can match hero green or stay cream; form container white with border.
- Labels: `#1B4332`; required asterisk gold.
- Inputs: border `#E8E4DE`; focus border/ring gold; rounded-none.
- Submit button: primary (gold bg, green text).
- No extra pages; form is always present on the single page (per SOW).

---

## 6. Accessibility & Motion

- Ensure contrast ratios meet WCAG AA where text is used (green on cream, white on green, gold on green).
- Decorative motion (e.g. fade-in, scroll-triggered) is optional; keep subtle and non-essential so content is usable without motion.

---

## 7. Assets & Copy

- **Logo:** SBMI / Samuel Bete Iddir — use as provided; decorative in footer.
- **Copy:** Single public page; no CMS; content fixed (membership benefits, “What is an Iddir”, our story, how it works, who we serve, application form). One review cycle in scope; no ongoing content tooling.

---

*This guide describes the one-pager only. Member and admin portals use a separate palette (Ethiopian flag colours) and are documented in the Framer portal prompt.*
