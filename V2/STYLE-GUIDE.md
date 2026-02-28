# SBMI.ca Style Guide

This document outlines the design system, color palette, typography, and component styles for the Samuel Bete Mutual Iddir (SBMI) web application.

## Color Palette

The color scheme is inspired by the Ethiopian flag, using deep, professional tones for a clean and trustworthy aesthetic.

| Color          | Hex       | CSS Variable            | Usage                                                      |
| -------------- | --------- | ----------------------- | ---------------------------------------------------------- |
| **Primary**    |           |                         |                                                            |
| Deep Green     | `#1B5E20` | `var(--color-green)`    | Primary actions, headers, active states, highlights        |
| Golden Yellow  | `#F9A825` | `var(--color-gold)`     | Secondary highlights, warnings, "Paid Ahead" status        |
| Warm Red       | `#C62828` | `var(--color-red)`      | Errors, destructive actions, "Overdue" status            |
| **Neutrals**   |           |                         |                                                            |
| Gray 900       | `#212121` | `var(--color-gray-900)` | Main text, headings                                        |
| Gray 700       | `#616161` | `var(--color-gray-700)` | Secondary text, labels                                     |
| Gray 500       | `#9E9E9E` | `var(--color-gray-500)` | Tertiary text, placeholders, subtle borders              |
| Gray 200       | `#EEEEEE` | `var(--color-gray-200)` | Borders, dividers                                          |
| Gray 100       | `#F5F5F5` | `var(--color-gray-100)` | Light backgrounds                                          |
| Gray 50        | `#FAFAFA` | `var(--color-gray-50)`  | Page backgrounds                                           |
| White          | `#FFFFFF` | `var(--color-white)`    | Card backgrounds, main content areas                       |
| **Accents**    |           |                         |                                                            |
| Green (Pale)   | `#E8F5E9` | `var(--color-green-pale)` | Background for success states, active items              |
| Gold (Light)   | `#FFF8E1` | `var(--color-gold-light)` | Background for warning states                            |
| Red (Light)    | `#FFEBEE` | `var(--color-red-light)`  | Background for error states                              |

### Ethiopian Flag Bar

A decorative element `div.flag-bar` is used to subtly incorporate the full flag colors. It is a 1px tall bar composed of three colored sections.

```css
.flag-bar {
  display: flex;
  height: 1px;
}
.flag-bar::before, .flag-bar::after {
  content: 																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																
  flex: 1;
  background: var(--color-green);
}
.flag-bar::after {
  content: 																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																													
  flex: 1;
  background: var(--color-red);
}
```

## Typography

- **Headings:** `var(--font-serif)` - A serif font (e.g., Lora, Merriweather) for a classic, trustworthy feel.
- **Body Text:** `var(--font-sans)` - A sans-serif font (e.g., Inter, Lato) for readability.

| Element         | Font Family      | Font Size | Font Weight | Color                   |
| --------------- | ---------------- | --------- | ----------- | ----------------------- |
| `<h1>`, `<h2>`    | `var(--font-serif)` | 20-32px   | 700         | `var(--color-gray-900)` |
| `<h3>`, `<h4>`    | `var(--font-sans)`  | 15-18px   | 700         | `var(--color-gray-900)` |
| Body Text       | `var(--font-sans)`  | 14-15px   | 400         | `var(--color-gray-700)` |
| Labels          | `var(--font-sans)`  | 12-13px   | 600         | `var(--color-gray-700)` |

## Components

### Buttons

- **`.btn-primary`**: Green background, white text. Used for primary calls to action.
- **`.btn-secondary`**: White background, gray border, gray text. Used for secondary actions.
- **`.btn-danger`**: Red background or border. Used for destructive actions like deleting or cancelling.

### Forms

- **`.form-input`**: Standard text input with a light gray border. Focus state adds a green border.
- **`.form-label`**: Bold, slightly smaller text above the input.
- **`.error-message`**: Small red text appearing below an input with a validation error.

### Badges

Badges are used to indicate status throughout the application.

- **`.badge-current`**: Green background, white text. (e.g., "Up to Date", "Approved")
- **`.badge-overdue`**: Red background, white text. (e.g., "Overdue", "Rejected")
- **`.badge-ahead`**: Yellow background, dark text. (e.g., "Paid Ahead", "Pending")

### Layout

- **Member Portal**: Two-column layout with a fixed sidebar on the left and main content on the right.
- **Admin Portal**: Similar two-column layout but with a dark-themed sidebar for clear distinction.
- **Cards**: Content is organized into cards with white backgrounds, subtle borders, and padding.
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																					 padding.
