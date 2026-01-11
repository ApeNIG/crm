# CRM Project Context

> **Last Updated:** 2026-01-10
> **Current Phase:** Core Features Complete
> **Status:** MVP Ready (pending deployment)

This is a living document that provides context for development sessions. Update this file as the project evolves.

---

## Quick Start

```bash
cd apps/web
npm install
npx prisma generate
npx prisma migrate dev      # Apply migrations
npm run db:seed-admin       # Create admin user (set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME env vars)
npm run dev
```

**Prerequisites:** Node.js 18+, PostgreSQL database

**Environment:** Copy `.env.example` to `.env` and set:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - JWT secret (min 32 characters, generate with `openssl rand -base64 32`)

---

## Project Status

### Completed Features

| Feature | Status | Tests | Docs | Notes |
|---------|--------|-------|------|-------|
| Contact Database | COMPLETE | 70 passing | Yes | Core CRUD with tags, activities |
| Pipeline & Deals | COMPLETE | 168 passing | Yes | Kanban board, stage management, enquiry CRUD |
| Appointments | COMPLETE | 238 passing | Yes | Booking system with calendar, service types |
| Basic Invoicing | COMPLETE | 186 passing | Yes | Invoice generation, line items, payments, booking integration |
| Dashboard | COMPLETE | 202 passing | Yes | Key metrics, breakdowns, activity feed, auto-refresh |
| Authentication | COMPLETE | 119 passing | Yes | User login, session management, role-based access |

### Pending Features (MVP)

| Feature | Priority | Dependencies |
|---------|----------|--------------|
| Email Integration | Medium | Contact Database |
| Reports & Analytics | Low | All above |

---

## Architecture Overview

```
apps/web/                    # Next.js 14+ App Router
├── prisma/
│   └── schema.prisma        # Database schema (Contact, Enquiry, Booking, Invoice, User, Session)
├── src/
│   ├── app/
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Authentication (login, logout, me, register, change-password)
│   │   │   ├── contacts/    # Contact CRUD
│   │   │   ├── enquiries/   # Enquiry CRUD + stage updates
│   │   │   ├── bookings/    # Booking CRUD + status + calendar
│   │   │   ├── invoices/    # Invoice CRUD + line items + payments
│   │   │   ├── service-types/ # Service type CRUD
│   │   │   ├── dashboard/   # Dashboard metrics and activity
│   │   │   └── tags/        # Tag management
│   │   ├── login/           # Login page
│   │   ├── (main)/          # Protected routes with layout
│   │   │   ├── contacts/    # Contact pages
│   │   │   ├── pipeline/    # Pipeline/Kanban pages
│   │   │   ├── bookings/    # Booking list + detail pages
│   │   │   ├── calendar/    # Calendar view page
│   │   │   ├── invoices/    # Invoice pages
│   │   │   └── settings/    # Settings pages
│   │   └── page.tsx         # Dashboard (home)
│   ├── components/
│   │   ├── ui/              # Reusable primitives (shadcn-style)
│   │   ├── auth/            # Login form, user menu
│   │   ├── layout/          # Header, navigation
│   │   ├── contacts/        # Contact domain components
│   │   ├── pipeline/        # Enquiry/Pipeline components
│   │   ├── bookings/        # Booking components
│   │   ├── invoices/        # Invoice components
│   │   ├── calendar/        # FullCalendar integration
│   │   ├── dashboard/       # Dashboard components
│   │   └── service-types/   # Service type components
│   ├── hooks/               # React Query hooks (useAuth, useContacts, etc.)
│   ├── lib/
│   │   ├── db.ts            # Prisma singleton
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── utils.ts         # Utility functions
│   │   └── validations/     # Zod schemas
│   ├── middleware.ts        # Route protection
│   └── types/               # TypeScript types
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Forms | React Hook Form |
| Data Fetching | TanStack Query (React Query) |
| Authentication | Custom (bcryptjs + jose JWT) |
| Styling | Tailwind CSS |
| Components | shadcn/ui patterns |
| Testing | Vitest + Testing Library |

---

## Design System: Lore

**Brand:** Lore — *Every customer has a story*

| Attribute | Value |
|-----------|-------|
| Personality | Warm, approachable, trustworthy, clear |
| Primary Color | `#E07A5F` Terracotta (light) / `#E8927A` Coral (dark) |
| Secondary Color | `#3D405B` Charcoal (light) / `#81B29A` Sage (dark) |
| Border Radius | 8px default (`rounded-md`) |
| Font | Inter / DM Sans / System |

### Design Resources

| Resource | Location |
|----------|----------|
| Full Design System | `docs/design-system/lore-brand.md` |
| CSS Variables | `apps/web/src/app/globals.css` |
| Design Skill | `.claude/skills/design/SKILL.md` |

### Using the Design Skill

Invoke `/design` when building UI to ensure brand consistency:
- Creating new components
- Building pages or layouts
- Reviewing UI implementations

---

## Key Patterns

### API Routes
- Zod validation on all inputs
- Prisma for database operations
- Soft delete with `deletedAt` timestamp
- Activity logging for audit trail

### Authentication
- HTTP-only cookies for JWT tokens
- Password hashing with bcrypt (12 rounds)
- Middleware route protection (`src/middleware.ts`)
- SafeUser type (never expose passwordHash)
- Admin-only user registration

### Components
- shadcn/ui style with `cva` for variants
- `forwardRef` for ref forwarding
- `cn()` utility for class merging

### Data Types
- Use `z.output<typeof schema>` for inferred types (not `z.infer`)
- Separate form types from API types when needed

### Database
- Prisma singleton pattern in `src/lib/db.ts`
- UUID primary keys
- Snake_case column names with `@map()`

---

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run linter

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create/apply migrations
npx prisma studio        # Database browser

# Authentication
npm run db:seed-admin    # Create admin user (requires ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME env vars)

# Testing
npm test                 # Run all tests (1032 tests)
npm run test:watch       # Watch mode
```

---

## Agent Workflow

This project uses a multi-agent system with human-in-the-loop checkpoints:

```
Planner → [Approval] → Builder → Tester → Reviewer → [Approval] → Documenter
```

### Agent Artifacts

| Agent | Output Location |
|-------|-----------------|
| Planner | `.agents/planner/plans/<feature>.md` |
| Builder | `.agents/builder/reports/<feature>.md` |
| Tester | `.agents/tester/reports/<feature>.md` |
| Reviewer | `.agents/reviewer/reviews/<feature>.md` |

---

## Known Issues

| Issue | Severity | Workaround |
|-------|----------|------------|
| Next.js 16 global-error build bug | Medium | Dev works, prod build blocked. See [Issue #85668](https://github.com/vercel/next.js/issues/85668) |
| No database indexes beyond PK | Low | Add in future migration |
| No rate limiting | Medium | Add before production |

---

## Recent Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-10 | Custom auth over NextAuth | Full control, simpler for basic email/password |
| 2026-01-10 | JWT + Database sessions | Enable session revocation, track user sessions |
| 2026-01-10 | bcrypt (12 rounds) | Industry standard password hashing |
| 2025-01-10 | Soft delete pattern | Preserve data for audit, allow recovery |
| 2025-01-10 | Activity logging | Audit trail for compliance |
| 2025-01-10 | Zod for validation | Type-safe, runtime validation |
| 2025-01-10 | React Query | Caching, optimistic updates, loading states |
| 2026-01-10 | Lore Design System | Warm, approachable brand with terracotta/coral palette |
| 2026-01-10 | `/design` skill | Claude Code skill to enforce design consistency |

---

## Next Steps

1. **Email Integration** - Notification system for invoices and bookings
2. **Reports & Analytics** - Business insights and financial reports

---

## File Reference

### Key Files to Know

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema definition |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/auth.ts` | Authentication utilities |
| `src/lib/validations/auth.ts` | Auth validation schemas |
| `src/lib/validations/contact.ts` | Contact validation schemas |
| `src/lib/validations/enquiry.ts` | Enquiry validation schemas |
| `src/lib/validations/booking.ts` | Booking validation schemas |
| `src/lib/validations/service-type.ts` | Service type validation schemas |
| `src/lib/validations/invoice.ts` | Invoice validation schemas |
| `src/middleware.ts` | Route protection middleware |
| `src/hooks/useContacts.ts` | React Query hooks for contacts |
| `src/hooks/useEnquiries.ts` | React Query hooks for enquiries |
| `src/hooks/useBookings.ts` | React Query hooks for bookings |
| `src/hooks/useServiceTypes.ts` | React Query hooks for service types |
| `src/hooks/useInvoices.ts` | React Query hooks for invoices |
| `src/hooks/useDashboard.ts` | React Query hooks for dashboard |
| `src/app/api/auth/login/route.ts` | Login API |
| `src/app/api/auth/register/route.ts` | User registration API (admin only) |
| `src/app/api/contacts/route.ts` | Contact list + create API |
| `src/app/api/enquiries/route.ts` | Enquiry list + create API |
| `src/app/api/bookings/route.ts` | Booking list + create API |
| `src/app/api/service-types/route.ts` | Service type list + create API |
| `src/app/api/invoices/route.ts` | Invoice list + create API |
| `src/app/api/dashboard/route.ts` | Dashboard metrics API |
| `src/app/api/dashboard/activity/route.ts` | Dashboard activity feed API |
| `src/components/contacts/ContactForm.tsx` | Contact create/edit form |
| `src/components/pipeline/EnquiryKanban.tsx` | Kanban board with drag-drop |
| `src/components/pipeline/stageConfig.ts` | Pipeline stage configuration |
| `src/components/bookings/BookingForm.tsx` | Booking create/edit form |
| `src/components/bookings/statusConfig.ts` | Booking status configuration |
| `src/components/calendar/BookingCalendar.tsx` | FullCalendar integration |
| `src/components/invoices/InvoiceForm.tsx` | Invoice create/edit form |
| `src/components/invoices/statusConfig.ts` | Invoice status configuration |
| `src/components/invoices/LineItemsTable.tsx` | Line items management |
| `src/components/invoices/PaymentsList.tsx` | Payment recording and display |
| `src/components/dashboard/MetricsGrid.tsx` | Dashboard key metrics display |
| `src/components/dashboard/ActivityFeed.tsx` | Dashboard activity feed |

### Documentation

| Doc | Location |
|-----|----------|
| Full Spec | `docs/spec.md` |
| API Reference | `docs/api/` |
| Features | `docs/features/` |
| Components | `docs/components/README.md` |
| Database | `docs/database/schema.md` |
| Agent System | `docs/agent-system-design.md` |
| Design System | `docs/design-system/lore-brand.md` |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | JWT signing secret (min 32 characters) |
| `AUTH_SESSION_EXPIRY_DAYS` | No | Session duration in days (default: 7) |

---

## Contacts

- **Spec Author:** User
- **Implementation:** Claude Code Agent System

---

*Update this document as the project evolves.*
