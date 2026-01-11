# Lore Design System

> **Version:** 1.0.0
> **Last Updated:** 2026-01-10
> **Status:** Active

---

## Brand Overview

**Lore** — *Every customer has a story*

Lore is a CRM that captures and nurtures the narrative of each customer relationship. The brand is warm, approachable, and human-centered, designed to make relationship management feel personal rather than transactional.

### Brand Personality

- **Warm:** Inviting colors and soft shapes create comfort
- **Approachable:** Friendly, not corporate; human, not robotic
- **Trustworthy:** Reliable, consistent, professional without being cold
- **Clear:** Information is easy to find and understand

---

## Color Palette

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-primary` | `#E07A5F` Terracotta | `#E8927A` Soft Coral | Primary actions, links, focus rings |
| `--color-primary-hover` | `#C96B52` | `#EDA391` | Hover states for primary |
| `--color-secondary` | `#3D405B` Charcoal | `#81B29A` Sage | Secondary actions, headers |
| `--color-secondary-hover` | `#2E3147` | `#6A9B82` | Hover states for secondary |

### Surface Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-background` | `#FAF9F7` Warm White | `#1A1B23` Deep Navy | Page background |
| `--color-surface` | `#FFFFFF` White | `#252633` Card Dark | Cards, modals, elevated surfaces |
| `--color-surface-hover` | `#F4F1ED` | `#2E2F3D` | Hover states for surfaces |
| `--color-muted` | `#F4F1ED` Warm Gray | `#32333F` Muted Dark | Borders, disabled states, subtle backgrounds |
| `--color-muted-foreground` | `#6B7280` | `#9CA3AF` | Secondary text, placeholders |

### Text Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-foreground` | `#2D2D2D` Near Black | `#F5F5F5` Near White | Primary text |
| `--color-foreground-muted` | `#6B7280` Gray | `#9CA3AF` Light Gray | Secondary text |

### Status Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-success` | `#81B29A` Sage | `#81B29A` Sage | Success states, confirmations |
| `--color-success-foreground` | `#FFFFFF` | `#1A1B23` | Text on success backgrounds |
| `--color-warning` | `#F2CC8F` Honey | `#F2CC8F` Honey | Warnings, pending states |
| `--color-warning-foreground` | `#2D2D2D` | `#2D2D2D` | Text on warning backgrounds |
| `--color-destructive` | `#C1666B` Dusty Rose | `#D4787D` Soft Red | Errors, delete actions |
| `--color-destructive-foreground` | `#FFFFFF` | `#FFFFFF` | Text on destructive backgrounds |

### Pipeline Stage Colors

| Stage | Color | Hex |
|-------|-------|-----|
| New | Blue | `#60A5FA` |
| Contacted | Indigo | `#818CF8` |
| Qualified | Purple | `#A78BFA` |
| Proposal | Amber | `#FBBF24` |
| Negotiation | Orange | `#FB923C` |
| Won | Sage | `#81B29A` |
| Lost | Dusty Rose | `#C1666B` |

### Booking Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Scheduled | Blue | `#60A5FA` |
| Confirmed | Indigo | `#818CF8` |
| In Progress | Amber | `#FBBF24` |
| Completed | Sage | `#81B29A` |
| Cancelled | Dusty Rose | `#C1666B` |
| No Show | Gray | `#6B7280` |

### Invoice Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Draft | Gray | `#6B7280` |
| Sent | Blue | `#60A5FA` |
| Paid | Sage | `#81B29A` |
| Partially Paid | Amber | `#FBBF24` |
| Overdue | Dusty Rose | `#C1666B` |
| Cancelled | Gray | `#9CA3AF` |

---

## Typography

### Font Stack

```css
--font-sans: 'Inter', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `text-xs` | 12px | 400 | 1.5 | Captions, badges |
| `text-sm` | 14px | 400 | 1.5 | Secondary text, labels |
| `text-base` | 16px | 400 | 1.5 | Body text |
| `text-lg` | 18px | 500 | 1.4 | Subheadings |
| `text-xl` | 20px | 600 | 1.3 | Section headers |
| `text-2xl` | 24px | 600 | 1.3 | Page titles |
| `text-3xl` | 30px | 700 | 1.2 | Hero text |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Subheadings, emphasis |
| Semibold | 600 | Headings, buttons |
| Bold | 700 | Hero text, strong emphasis |

---

## Spacing

Based on 4px grid system.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing, icon gaps |
| `--space-2` | 8px | Default element spacing |
| `--space-3` | 12px | Form element padding |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-5` | 20px | Medium sections |
| `--space-6` | 24px | Large sections |
| `--space-8` | 32px | Page sections |
| `--space-10` | 40px | Major sections |
| `--space-12` | 48px | Page margins |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements, badges |
| `--radius-md` | 8px | Buttons, inputs, cards |
| `--radius-lg` | 12px | Large cards, panels |
| `--radius-xl` | 16px | Modals, dialogs |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

Warm-tinted shadows for a softer feel.

```css
/* Light mode */
--shadow-sm: 0 1px 2px rgba(45, 45, 45, 0.05);
--shadow-md: 0 4px 6px rgba(45, 45, 45, 0.07), 0 2px 4px rgba(45, 45, 45, 0.05);
--shadow-lg: 0 10px 15px rgba(45, 45, 45, 0.1), 0 4px 6px rgba(45, 45, 45, 0.05);
--shadow-xl: 0 20px 25px rgba(45, 45, 45, 0.1), 0 8px 10px rgba(45, 45, 45, 0.04);

/* Dark mode */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5), 0 4px 6px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.5), 0 8px 10px rgba(0, 0, 0, 0.3);
```

---

## Component Guidelines

### Buttons

- **Primary:** Terracotta background, white text, `--radius-md`
- **Secondary:** Outlined with charcoal border, transparent background
- **Ghost:** No border, subtle hover background
- **Destructive:** Dusty rose background for dangerous actions

### Cards

- White/dark surface background
- `--radius-lg` (12px) border radius
- `--shadow-md` for elevation
- `--space-4` (16px) padding

### Forms

- Inputs: `--radius-md`, 1px muted border
- Focus: 2px primary ring with 2px offset
- Labels: `text-sm`, semibold
- Errors: Destructive color, `text-sm`

### Tables

- Header: Muted background, semibold text
- Rows: Subtle hover state
- Borders: Muted color, 1px

### Modals

- `--radius-xl` (16px) border radius
- `--shadow-xl` elevation
- Backdrop: Black at 50% opacity

---

## Iconography

Using **Lucide React** icons.

- Default size: 16px (small), 20px (medium), 24px (large)
- Stroke width: 2px
- Color: Inherit from text color

---

## Motion

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 100ms | Micro-interactions |
| `--duration-normal` | 200ms | Standard transitions |
| `--duration-slow` | 300ms | Complex animations |

### Easing

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
```

---

## Accessibility

- Maintain WCAG 2.1 AA contrast ratios (4.5:1 for text, 3:1 for UI)
- Focus indicators: 2px solid primary with 2px offset
- All interactive elements keyboard accessible
- Motion: Respect `prefers-reduced-motion`

---

## File Reference

| File | Purpose |
|------|---------|
| `src/app/globals.css` | CSS variables and Tailwind config |
| `src/components/ui/` | Base component implementations |
| `docs/design-system/lore-brand.md` | This document |

---

*This design system evolves with the product. Update as patterns emerge.*
