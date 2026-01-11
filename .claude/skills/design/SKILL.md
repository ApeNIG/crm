---
name: design
description: Enforce Lore design system when building UI components. Use when creating React components, pages, forms, or any user interface elements. Ensures brand consistency with terracotta/coral palette, warm approachable aesthetic, and shadcn/ui patterns.
---

# Lore Design Skill

You are a senior frontend designer helping build the **Lore CRM**. Your role is to ensure all UI work follows the Lore design system for a consistent, polished product.

## Brand Essence

**Lore** — *Every customer has a story*

- **Personality:** Warm, approachable, trustworthy, clear
- **Aesthetic:** Friendly, human, inviting — not cold or corporate
- **Colors:** Terracotta/coral primary, sage accents, warm neutrals

## Quick Reference

### Primary Colors

| Token | Light | Dark | Tailwind Class |
|-------|-------|------|----------------|
| Primary | `#E07A5F` | `#E8927A` | `bg-primary`, `text-primary` |
| Secondary | `#3D405B` | `#81B29A` | `bg-secondary`, `text-secondary` |
| Background | `#FAF9F7` | `#1A1B23` | `bg-background` |
| Surface | `#FFFFFF` | `#252633` | `bg-surface` |
| Muted | `#F4F1ED` | `#32333F` | `bg-muted`, `text-muted-foreground` |

### Status Colors

| Status | Color | Tailwind |
|--------|-------|----------|
| Success | `#81B29A` Sage | `bg-success`, `text-success` |
| Warning | `#F2CC8F` Honey | `bg-warning`, `text-warning` |
| Destructive | `#C1666B` Dusty Rose | `bg-destructive`, `text-destructive` |

### Border Radius

| Size | Value | Usage |
|------|-------|-------|
| `rounded-sm` | 4px | Badges, small elements |
| `rounded-md` | 8px | Buttons, inputs, cards |
| `rounded-lg` | 12px | Large cards, panels |
| `rounded-xl` | 16px | Modals, dialogs |

## Component Guidelines

### Buttons

```tsx
// Primary - main actions
<Button className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-md">
  Save Contact
</Button>

// Secondary - secondary actions
<Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground rounded-md">
  Cancel
</Button>

// Destructive - dangerous actions
<Button variant="destructive" className="bg-destructive hover:opacity-90 text-destructive-foreground rounded-md">
  Delete
</Button>
```

### Cards

```tsx
<div className="bg-surface rounded-lg shadow-md p-4 border border-border">
  {/* Card content */}
</div>
```

### Forms

```tsx
// Input with label
<div className="space-y-2">
  <label className="text-sm font-semibold text-foreground">
    Email
  </label>
  <input
    className="w-full px-3 py-2 rounded-md border border-border bg-surface
               focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  />
</div>

// Error state
<p className="text-sm text-destructive">This field is required</p>
```

### Tables

```tsx
<table className="w-full">
  <thead className="bg-muted">
    <tr>
      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border hover:bg-surface-hover">
      <td className="px-4 py-3 text-sm">John Doe</td>
    </tr>
  </tbody>
</table>
```

## Pipeline Stages

Use semantic stage colors:

| Stage | Tailwind Class |
|-------|----------------|
| New | `bg-stage-new` |
| Contacted | `bg-stage-contacted` |
| Qualified | `bg-stage-qualified` |
| Proposal | `bg-stage-proposal` |
| Negotiation | `bg-stage-negotiation` |
| Won | `bg-stage-won` |
| Lost | `bg-stage-lost` |

## Booking Statuses

| Status | Tailwind Class |
|--------|----------------|
| Scheduled | `bg-booking-scheduled` |
| Confirmed | `bg-booking-confirmed` |
| In Progress | `bg-booking-in-progress` |
| Completed | `bg-booking-completed` |
| Cancelled | `bg-booking-cancelled` |
| No Show | `bg-booking-no-show` |

## Invoice Statuses

| Status | Tailwind Class |
|--------|----------------|
| Draft | `bg-invoice-draft` |
| Sent | `bg-invoice-sent` |
| Paid | `bg-invoice-paid` |
| Partial | `bg-invoice-partial` |
| Overdue | `bg-invoice-overdue` |
| Cancelled | `bg-invoice-cancelled` |

## Do's and Don'ts

### Do

- Use semantic color tokens (`bg-primary`) not raw hex values
- Apply `rounded-md` (8px) to interactive elements
- Use `shadow-md` for elevated surfaces
- Include hover states on interactive elements
- Maintain 4.5:1 contrast ratio for text
- Add focus rings for keyboard navigation
- Use the existing UI components in `src/components/ui/`

### Don't

- Use cold blues or grays that conflict with warm palette
- Use sharp corners (0px radius) on UI elements
- Skip hover/focus states
- Use inline styles for colors
- Create new one-off components when existing ones work
- Ignore dark mode — always check both modes

## Reference Files

| File | Purpose |
|------|---------|
| `docs/design-system/lore-brand.md` | Complete design system documentation |
| `apps/web/src/app/globals.css` | CSS variables and Tailwind theme |
| `apps/web/src/components/ui/` | Base component library |
| `apps/web/src/components/pipeline/stageConfig.ts` | Pipeline stage styling |
| `apps/web/src/components/bookings/statusConfig.ts` | Booking status styling |
| `apps/web/src/components/invoices/statusConfig.ts` | Invoice status styling |

## When Building Components

1. **Check existing patterns** — Look at similar components first
2. **Use design tokens** — Never hardcode colors
3. **Test both modes** — Verify light and dark themes
4. **Keep it simple** — Don't over-engineer styling
5. **Follow shadcn/ui patterns** — Use `cva`, `cn()`, and `forwardRef`

## Icons

Use **Lucide React** icons:
- Default size: 16px (h-4 w-4), 20px (h-5 w-5), 24px (h-6 w-6)
- Color: `currentColor` (inherits from parent)
- Stroke width: 2px

```tsx
import { User, Mail, Phone } from 'lucide-react'

<User className="h-4 w-4 text-muted-foreground" />
```

---

*For the complete design system specification, see `docs/design-system/lore-brand.md`*
