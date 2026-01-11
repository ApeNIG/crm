# Small Business CRM — MVP Build Specification

> **Version:** 1.0
> **Status:** Ready for Development Estimation
> **Scope:** Single-tenant web application for lead capture, booking management, and automated follow-up

---

## Table of Contents

1. [Objective](#1-objective)
2. [Core Concept](#2-core-concept)
3. [Users & Roles](#3-users--roles)
4. [Tech Stack](#4-tech-stack)
5. [Multi-Tenancy Model](#5-multi-tenancy-model)
6. [Data Model](#6-data-model)
7. [Pipeline Stages](#7-pipeline-stages)
8. [Forms](#8-forms)
9. [Automated Workflows](#9-automated-workflows)
10. [Email Configuration](#10-email-configuration)
11. [Calendar & Timezone Rules](#11-calendar--timezone-rules)
12. [Authentication & Authorization](#12-authentication--authorization)
13. [Payments Integration](#13-payments-integration)
14. [Error States & Failure Handling](#14-error-states--failure-handling)
15. [Reporting Dashboard](#15-reporting-dashboard)
16. [Mobile & Accessibility](#16-mobile--accessibility)
17. [Screen List](#17-screen-list)
18. [Non-Functional Requirements](#18-non-functional-requirements)
19. [Environment & Configuration](#19-environment--configuration)
20. [MVP vs Phase 2 Scope](#20-mvp-vs-phase-2-scope)

---

## 1) Objective

Build a web-based CRM that captures every enquiry/booking/sale, stores it against a customer record, and automates key emails and follow-ups to move leads into paying customers.

**Success criteria:**
- Every lead captured and tracked
- No manual email sending for standard touchpoints
- Clear visibility into pipeline health
- Bookings don't double-book or fall through cracks

---

## 2) Core Concept

**Single source of truth:** Every person = a **Contact**, and everything they do becomes an **Activity** attached to that contact (enquiry, booking, payment, emails, notes).

**Two tracks that merge:**

| Track | Purpose |
|-------|---------|
| **Lead Track** | Enquiry → follow-up → conversion |
| **Booking/Sales Track** | Booking/order → payment → delivery → aftercare |

Both tracks operate on the same Contact record, giving full customer history in one place.

---

## 3) Users & Roles

### MVP Roles

| Role | Description |
|------|-------------|
| **Admin** | Full access to all features, settings, templates, users, and reporting |
| **Staff** | Manage leads, contacts, bookings; limited access to settings and financials |

### Permission Matrix

| Feature | Admin | Staff |
|---------|-------|-------|
| Contacts | CRUD | CRUD |
| Enquiries | CRUD | CRUD |
| Bookings | CRUD | CRUD |
| Payments | View + Refund | View |
| Email Templates | CRUD | View |
| Settings | CRUD | View |
| Users | CRUD | — |
| Reports | Full | Limited |

---

## 4) Tech Stack

### Recommended: Full TypeScript (Single Codebase)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | Next.js 14+ (App Router) | Server components, built-in API routes, good DX |
| **Backend** | Next.js API Routes + Server Actions | Single deployment, simpler ops |
| **Database** | PostgreSQL (via Supabase or Neon) | Relational fits this domain; RLS for security |
| **ORM** | Prisma or Drizzle | Type-safe queries, migrations |
| **Auth** | NextAuth.js v5 or Supabase Auth | Battle-tested, handles sessions |
| **Email** | Resend or Postmark | Transactional focus, good deliverability |
| **Payments** | Stripe Checkout + Webhooks | Industry standard, PCI compliant |
| **Queue/Jobs** | Inngest or Trigger.dev | Serverless-friendly, retries, scheduling |
| **Hosting** | Vercel + Supabase | Low ops burden, scales with usage |
| **UI Components** | shadcn/ui + Radix | Accessible, customizable |
| **Styling** | Tailwind CSS | Rapid development |
| **Forms** | React Hook Form + Zod | Type-safe validation |

### Alternative: Separate Backend

| Layer | Choice |
|-------|--------|
| **Frontend** | React + Vite or Next.js |
| **Backend** | Node.js (Fastify) or Python (FastAPI) |
| **Database** | PostgreSQL on Railway/Render |
| **Queue** | BullMQ + Redis or Celery |

> **Decision required:** Single codebase (faster MVP) or separate backend (better for future mobile apps/API consumers)?

---

## 5) Multi-Tenancy Model

### MVP: Single-Tenant

This system serves **one business**. No tenant isolation, subdomain routing, or per-tenant billing.

**Implications:**
- All data in shared tables (no `tenant_id` column)
- Single Stripe account
- Single email sender domain
- Simpler auth (no organization switching)

### Phase 2: Multi-Tenant (If Converting to SaaS)

If this becomes a SaaS product later, add:
- `organization_id` foreign key to all tables
- Row-Level Security policies
- Subdomain or path-based routing
- Per-org Stripe Connect accounts
- Per-org email sender verification

**Acceptance Criteria (MVP):**
- System assumes single business context
- No organization/tenant selector in UI
- All users belong to same implicit organization

---

## 6) Data Model

### 6.1) Contact

The central entity. Every person in the system is a Contact.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| first_name | string | Required |
| last_name | string | Required |
| email | string | Unique, used for deduplication |
| phone | string | Optional |
| source | enum | Instagram, Website, Referral, Walk-in, Other |
| status | enum | Lead, Customer, Past Customer, Cold, Do Not Contact |
| owner_user_id | UUID | FK to User (assigned team member) |
| marketing_opt_in | boolean | Default false |
| marketing_opt_in_at | timestamp | When consent was given |
| email_status | enum | valid, bounced, complained (default: valid) |
| notes | text | Free-form notes |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relationships:**
- Has many: Enquiries, Bookings, Invoices, EmailLogs, Activities
- Has many through: Tags (via ContactTag join table)

### 6.2) Tag

For flexible categorization of contacts.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | string | Unique, e.g., "VIP", "Wedding", "Corporate" |
| color | string | Hex color for UI display |
| created_at | timestamp | |

**Join Table: ContactTag**
| Field | Type |
|-------|------|
| contact_id | UUID |
| tag_id | UUID |
| created_at | timestamp |

### 6.3) Enquiry

A lead event — someone expressing interest.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| contact_id | UUID | FK to Contact |
| enquiry_type | enum | General, Service, Product, Partnership |
| message | text | What they said |
| preferred_date | date | Optional |
| preferred_time | string | Optional (e.g., "morning", "14:00") |
| estimated_value | decimal | Optional, for pipeline reporting |
| stage | enum | See Pipeline Stages |
| next_action_at | timestamp | Follow-up reminder |
| source_url | string | Which form/page they came from |
| created_at | timestamp | |
| updated_at | timestamp | |

### 6.4) ServiceType

Defines bookable services with their rules.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | string | e.g., "Consultation", "Full Session" |
| description | text | Optional |
| duration_minutes | int | e.g., 60 |
| price | decimal | Optional |
| deposit_amount | decimal | Optional, if deposit required |
| deposit_required | boolean | Default false |
| buffer_before | int | Minutes before (override global) |
| buffer_after | int | Minutes after (override global) |
| is_active | boolean | Default true |
| created_at | timestamp | |
| updated_at | timestamp | |

### 6.5) Booking

An appointment or scheduled service.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| contact_id | UUID | FK to Contact |
| enquiry_id | UUID | Optional FK to Enquiry (if booking originated from enquiry) |
| service_type_id | UUID | FK to ServiceType |
| start_at | timestamptz | UTC |
| end_at | timestamptz | UTC |
| status | enum | See Booking Pipeline |
| location | string | Address or "Virtual" |
| virtual_link | string | Optional meeting URL |
| notes | text | Internal notes |
| deposit_paid | boolean | Default false |
| deposit_paid_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Booking Statuses:**
- Requested
- Pending Deposit
- Confirmed
- Completed
- Cancelled
- No-show
- Rescheduled

### 6.6) Invoice / PaymentRef

Tracks payments and orders.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| contact_id | UUID | FK to Contact |
| booking_id | UUID | Optional FK to Booking |
| stripe_checkout_session_id | string | |
| stripe_payment_intent_id | string | |
| amount | decimal | In smallest currency unit |
| currency | string | e.g., "gbp", "usd" |
| status | enum | unpaid, paid, refunded, disputed |
| description | string | What this payment is for |
| paid_at | timestamp | |
| refunded_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

### 6.7) EmailLog

Tracks every email sent, for audit and debugging.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| contact_id | UUID | FK to Contact |
| enquiry_id | UUID | Optional FK |
| booking_id | UUID | Optional FK |
| template_key | string | e.g., "enquiry_auto_reply" |
| category | enum | transactional, marketing |
| subject | string | Rendered subject line |
| to_email | string | Recipient email at send time |
| status | enum | queued, sent, delivered, opened, bounced, complained, failed |
| provider_message_id | string | From email provider |
| opened_at | timestamp | |
| clicked_at | timestamp | |
| bounced_at | timestamp | |
| retry_count | int | Default 0 |
| last_error | text | |
| sent_at | timestamp | |
| created_at | timestamp | |

### 6.8) EmailTemplate

Admin-editable email templates.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| key | string | Unique, e.g., "booking_confirmation" |
| name | string | Human-readable name |
| subject | string | With variable placeholders |
| body_html | text | HTML content with placeholders |
| body_text | text | Plain text fallback |
| category | enum | transactional, marketing |
| is_active | boolean | Default true |
| created_at | timestamp | |
| updated_at | timestamp | |

**Standard Template Keys:**
- `enquiry_auto_reply`
- `enquiry_follow_up`
- `booking_received`
- `booking_deposit_request`
- `booking_confirmed`
- `booking_reminder_48h`
- `booking_reminder_24h`
- `booking_thank_you`
- `booking_review_request`
- `booking_missed`
- `booking_cancelled`
- `booking_rescheduled`

### 6.9) Activity

Audit trail for everything that happens to a contact.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| contact_id | UUID | FK to Contact |
| type | enum | See Activity Types below |
| payload | jsonb | Typed per activity type |
| actor_user_id | UUID | Nullable (null = system) |
| created_at | timestamp | |

**Activity Types:**
- `enquiry_submitted`
- `enquiry_stage_changed`
- `contact_created`
- `contact_updated`
- `booking_created`
- `booking_status_changed`
- `booking_rescheduled`
- `email_sent`
- `email_delivered`
- `email_bounced`
- `payment_received`
- `payment_refunded`
- `note_added`
- `tag_added`
- `tag_removed`

**Payload Schemas (TypeScript):**

```typescript
interface EnquirySubmittedPayload {
  enquiry_id: string;
  source: string;
  form_url?: string;
}

interface StageChangedPayload {
  enquiry_id: string;
  from_stage: string;
  to_stage: string;
}

interface BookingStatusChangedPayload {
  booking_id: string;
  from_status: string;
  to_status: string;
  reason?: string;
}

interface BookingRescheduledPayload {
  booking_id: string;
  from_start: string; // ISO timestamp
  to_start: string;
  initiated_by: 'staff' | 'customer';
}

interface EmailSentPayload {
  email_log_id: string;
  template_key: string;
  subject: string;
  category: 'transactional' | 'marketing';
}

interface PaymentReceivedPayload {
  payment_ref_id: string;
  amount: number;
  currency: string;
  booking_id?: string;
}

interface NoteAddedPayload {
  note_id: string;
  preview: string; // first 100 chars
}

interface TagPayload {
  tag_id: string;
  tag_name: string;
}
```

### 6.10) User

System users (staff and admins).

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| email | string | Unique |
| password_hash | string | Nullable if magic-link only |
| first_name | string | |
| last_name | string | |
| role | enum | admin, staff |
| email_verified_at | timestamp | Nullable |
| last_login_at | timestamp | |
| is_active | boolean | Default true |
| created_at | timestamp | |
| updated_at | timestamp | |

### 6.11) Session

For session-based authentication.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to User |
| token_hash | string | Hashed session token |
| expires_at | timestamp | |
| created_at | timestamp | |

### 6.12) Settings

Application-wide configuration (singleton pattern or key-value).

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| business_name | string | |
| business_timezone | string | IANA timezone, e.g., "Europe/London" |
| working_hours | jsonb | See Calendar Rules |
| default_buffer_before | int | Minutes, default 15 |
| default_buffer_after | int | Minutes, default 15 |
| booking_lead_time | int | Minimum hours in advance to book |
| cancellation_policy | text | Displayed to customers |
| updated_at | timestamp | |

### 6.13) WebhookEvent

For idempotent webhook processing.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| provider | enum | stripe, resend |
| provider_event_id | string | Unique per provider |
| event_type | string | e.g., "payment_intent.succeeded" |
| payload | jsonb | Raw webhook payload |
| processed_at | timestamp | Nullable until processed |
| created_at | timestamp | |

**Unique constraint:** (provider, provider_event_id)

---

## 7) Pipeline Stages

### 7.1) Lead Pipeline

Tracks enquiries from submission to conversion.

| Stage | Description | Auto-triggered? |
|-------|-------------|-----------------|
| **New Lead** | Form just submitted | Yes, on form submit |
| **Auto-Responded** | Instant email sent | Yes, after auto-reply |
| **Contacted** | Staff replied or call made | Manual |
| **Qualified** | Confirmed fit (budget, timing, need) | Manual |
| **Proposal Sent** | Quote or checkout link sent | Manual |
| **Booked/Paid** | Conversion complete | Auto on payment/booking |
| **Lost** | Not proceeding | Manual |

### 7.2) Booking Pipeline

Tracks appointments from request to completion.

| Stage | Description | Auto-triggered? |
|-------|-------------|-----------------|
| **Requested** | Booking request received | Yes, on booking creation |
| **Pending Deposit** | Awaiting payment | Auto if deposit required |
| **Confirmed** | Deposit paid or no deposit needed | Auto on payment |
| **Completed** | Service delivered | Manual |
| **Follow-up Due** | Aftercare period | Auto after completion |
| **Repeat/Upsell** | Ready for next engagement | Manual |

### Acceptance Criteria

- Dragging an enquiry between stages updates the record and creates Activity log
- Stage changes are timestamped
- Lost/Closed stages require a reason (optional but prompted)

---

## 8) Forms

### 8.1) Enquiry Form (Public)

**Purpose:** Capture leads from website

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| First name | text | Yes | |
| Last name | text | Yes | |
| Email | email | Yes | Used for deduplication |
| Phone | tel | No | |
| Service interest | select | No | Maps to enquiry_type |
| Message | textarea | Yes | |
| Preferred dates | text | No | Free-form |
| Marketing consent | checkbox | No | Default unchecked |
| Honeypot | hidden | — | Spam prevention |

**On Submit:**
1. Validate all fields (client + server)
2. Check honeypot (reject silently if filled)
3. Find or create Contact by email
4. Create Enquiry linked to Contact
5. Create Activity: `enquiry_submitted`
6. Trigger Workflow 1 (auto-response)
7. Return success message

### 8.2) Booking Request Form (Public or Internal)

**Purpose:** Schedule appointments

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Service type | select | Yes | From ServiceType table |
| Preferred date | date picker | Yes | Shows available slots |
| Preferred time | time select | Yes | Based on availability |
| First name | text | Yes | If not logged in |
| Last name | text | Yes | |
| Email | email | Yes | |
| Phone | tel | No | |
| Notes | textarea | No | Special requests |

**On Submit:**
1. Validate availability (no double-booking)
2. Find or create Contact
3. Create Booking with status = Requested (or Pending Deposit)
4. Create Activity: `booking_created`
5. Trigger booking confirmation workflow

### 8.3) Internal Quick-Add Forms

For staff to quickly add records without full forms:
- Quick-add Contact (name, email, phone, source)
- Quick-add Note (to existing contact)
- Quick-add Booking (to existing contact)

---

## 9) Automated Workflows

### 9.1) Workflow: New Enquiry

**Trigger:** Enquiry form submitted

**Actions:**
1. Create/update Contact record
2. Create Enquiry record (stage = New Lead)
3. Send instant auto-response email (`enquiry_auto_reply`)
4. Update stage to Auto-Responded
5. Create internal task: "Review enquiry" due in 1 business day
6. If no manual stage change after 24h → send follow-up email (`enquiry_follow_up`)

**Acceptance Criteria:**
- Auto-response sends within 60 seconds of submission
- Follow-up only sends if still in Auto-Responded stage
- All emails logged to EmailLog + Activity

### 9.2) Workflow: Booking Request

**Trigger:** Booking created with status = Requested

**Actions:**
1. Send booking acknowledgement (`booking_received`)
2. If deposit required:
   - Generate Stripe checkout link
   - Send deposit request email (`booking_deposit_request`)
   - Set status = Pending Deposit
3. If no deposit required:
   - Set status = Confirmed
   - Send confirmation email (`booking_confirmed`)

**Acceptance Criteria:**
- Checkout link expires after 48 hours
- Deposit email includes clear payment CTA

### 9.3) Workflow: Payment Received

**Trigger:** Stripe webhook `checkout.session.completed` or `payment_intent.succeeded`

**Actions:**
1. Find associated Booking by metadata
2. Create/update PaymentRef record
3. Set Booking status = Confirmed
4. Set deposit_paid = true
5. Send confirmation email (`booking_confirmed`)
6. Create Activity: `payment_received`

**Acceptance Criteria:**
- Idempotent: duplicate webhooks don't duplicate actions
- Email sends only once per booking confirmation

### 9.4) Workflow: Booking Reminders

**Trigger:** Booking status = Confirmed, approaching start time

**Actions:**
- T-48h: Send reminder email (`booking_reminder_48h`) if configured
- T-24h: Send reminder email (`booking_reminder_24h`)

**Acceptance Criteria:**
- Reminders don't send for cancelled/rescheduled bookings
- Reminder timing respects business timezone
- Each reminder sends only once (idempotency key: booking_id + reminder_type)

### 9.5) Workflow: Post-Service Follow-up

**Trigger:** Booking marked as Completed

**Actions:**
1. Send thank-you email (`booking_thank_you`) immediately
2. After 24-72h: Send review request (`booking_review_request`)
3. If no review after 7 days: One nudge (optional)
4. Add tag based on service type (e.g., "Served: Consultation")
5. Update Contact status to Customer (if was Lead)
6. Move to Follow-up Due stage

**Acceptance Criteria:**
- Review request respects marketing opt-in? (No — this is transactional)
- Tag auto-applied based on ServiceType

### 9.6) Workflow: No-Show Handling

**Trigger:** Booking marked as No-show

**Actions:**
1. Send "missed you" email (`booking_missed`) with reschedule link
2. Create Activity: `booking_status_changed` with reason
3. Flag for admin review if repeat no-show

### 9.7) Workflow: Lead Nurture (Marketing)

**Trigger:** Contact.marketing_opt_in = true AND Contact.status = Lead

**Actions:**
- Day 0: Add to segment "Leads - [Interest Area]"
- Day 3: Send value email
- Day 7: Send example/results email
- Day 14: Send FAQ/objections email
- Day 21: Send offer/booking CTA email

**Acceptance Criteria:**
- Sequence stops if Contact converts (status changes)
- Unsubscribe immediately removes from sequence
- Only runs for contacts who opted in

---

## 10) Email Configuration

### 10.1) Provider Setup

**Recommended:** Resend or Postmark

| Provider | Pros | Free Tier |
|----------|------|-----------|
| Resend | Modern API, good TS SDK, webhooks | 3,000/month |
| Postmark | Excellent deliverability, separate streams | 100/month |

### 10.2) Sending Rules

| Category | Opt-in Required? | Unsubscribe Link? |
|----------|------------------|-------------------|
| Transactional | No | No (but include contact info) |
| Marketing | Yes | Yes (required by law) |

**Transactional emails:**
- Enquiry confirmations
- Booking confirmations, reminders, changes
- Payment receipts
- Password reset

**Marketing emails:**
- Nurture sequences
- Promotions
- Newsletters
- Re-engagement

### 10.3) Webhook Events to Handle

| Event | Action |
|-------|--------|
| `delivered` | Update EmailLog.status = delivered |
| `opened` | Update EmailLog.opened_at |
| `clicked` | Update EmailLog.clicked_at |
| `bounced` | Update EmailLog.status = bounced, flag Contact |
| `complained` | Set Contact.marketing_opt_in = false, log |

### 10.4) Email Template Variables

Available in all templates:

```
{{contact.first_name}}
{{contact.last_name}}
{{contact.email}}
{{business.name}}
{{business.phone}}
{{business.email}}
```

Booking templates additionally:

```
{{booking.service_name}}
{{booking.date}}           // Formatted in business TZ
{{booking.time}}
{{booking.location}}
{{booking.virtual_link}}
{{booking.reschedule_url}}
{{booking.cancel_url}}
```

Payment templates:

```
{{payment.amount}}         // Formatted with currency
{{payment.receipt_url}}
```

### Acceptance Criteria

- Bounced contacts do not receive further emails until manually cleared
- Complaint auto-opts contact out of marketing
- All email sends logged with full audit trail
- Templates render correctly with missing optional variables

---

## 11) Calendar & Timezone Rules

### 11.1) Timezone Handling

| Rule | Implementation |
|------|----------------|
| Database storage | All timestamps in UTC (`timestamptz`) |
| Business timezone | Single configurable timezone in Settings |
| Display | All dates/times shown in business timezone |
| Booking logic | Working hours defined in business timezone |

**Acceptance Criteria:**
- Booking at "10:00 AM" in London displays as "10:00 AM" regardless of viewer's browser
- T-24h reminder fires at correct UTC instant
- Changing business timezone does NOT shift existing bookings

### 11.2) Working Hours

Stored in Settings as JSON:

```json
{
  "monday": { "start": "09:00", "end": "17:00" },
  "tuesday": { "start": "09:00", "end": "17:00" },
  "wednesday": { "start": "09:00", "end": "17:00" },
  "thursday": { "start": "09:00", "end": "17:00" },
  "friday": { "start": "09:00", "end": "17:00" },
  "saturday": null,
  "sunday": null
}
```

### 11.3) Booking Rules

| Rule | Default | Configurable |
|------|---------|--------------|
| Buffer before | 15 min | Per service type or global |
| Buffer after | 15 min | Per service type or global |
| Minimum lead time | 24 hours | Global |
| Maximum advance booking | 90 days | Global |

### 11.4) Blackout Dates

Simple table for holidays/unavailable dates:

| Field | Type |
|-------|------|
| id | UUID |
| date | date |
| reason | string |
| created_at | timestamp |

### 11.5) Availability Calculation

When showing available slots:

1. Start with working hours for the day
2. Subtract existing confirmed bookings (including buffers)
3. Subtract blackout dates
4. Filter by service duration (slot must fit)
5. Filter by lead time (must be far enough in future)

**Acceptance Criteria:**
- Double-booking prevented at database level (constraint or transaction)
- Buffers respected between bookings
- Blackout dates show as unavailable

---

## 12) Authentication & Authorization

### 12.1) Auth Method

**Primary:** Email + Password
- Email/password registration for staff users
- Email verification required before first login
- Password reset via email link (1-hour expiry)
- Session-based auth (HTTP-only cookies, 7-day expiry)

**Optional Enhancement:** Magic Links
- Passwordless login via email
- Better UX, fewer support tickets

### 12.2) Password Requirements

- Minimum 8 characters
- At least one letter and one number
- Checked against common password list (optional)

### 12.3) Session Management

- HTTP-only, secure, SameSite=Lax cookies
- 7-day expiry, refresh on activity
- Invalidate all sessions on password change
- Single session per device (optional: allow multiple)

### 12.4) Rate Limiting

| Action | Limit |
|--------|-------|
| Login attempts | 5 per 15 min per email |
| Password reset requests | 3 per hour per email |
| Form submissions | 10 per minute per IP |

### Acceptance Criteria

- Staff cannot access Settings or Users pages (403 or hidden)
- Password reset tokens are single-use
- Failed login attempts logged
- Sessions invalidate on password change

---

## 13) Payments Integration

### 13.1) Stripe Setup

**Mode:** Stripe Checkout (hosted payment page)

**Flow:**
1. System creates Checkout Session with booking metadata
2. Customer redirected to Stripe
3. On success: redirect to confirmation page
4. Webhook confirms payment and updates system

### 13.2) Checkout Session Creation

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'gbp',
      product_data: {
        name: `Deposit: ${serviceName}`,
        description: `Booking on ${bookingDate}`,
      },
      unit_amount: depositAmountInPence,
    },
    quantity: 1,
  }],
  metadata: {
    booking_id: bookingId,
    contact_id: contactId,
  },
  success_url: `${appUrl}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${appUrl}/booking/${bookingId}`,
  expires_at: Math.floor(Date.now() / 1000) + 48 * 60 * 60, // 48h
});
```

### 13.3) Webhook Events to Handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Mark booking confirmed, create PaymentRef |
| `payment_intent.succeeded` | Update PaymentRef status |
| `charge.refunded` | Update PaymentRef, alert admin |
| `charge.dispute.created` | Alert admin, do NOT auto-cancel |

### 13.4) Idempotency

Store `stripe_event_id` in WebhookEvent table. Before processing:
1. Check if event ID exists and is processed
2. If yes, return 200 OK immediately
3. If no, process and mark as processed

### Acceptance Criteria

- Payment success automatically confirms booking
- Duplicate webhooks handled gracefully
- Refunds logged but don't auto-cancel (manual decision)
- Disputes alert admin for manual handling

---

## 14) Error States & Failure Handling

### 14.1) Form Submission Failures

| Scenario | System Behavior |
|----------|-----------------|
| Duplicate email | Update existing Contact, create new Enquiry |
| Invalid email format | Client + server validation, show error |
| Spam detected | Silent reject, log, return fake success |
| Database error | Generic error to user, full log, alert admin |

### 14.2) Payment Failures

| Scenario | System Behavior |
|----------|-----------------|
| Webhook delayed | Booking stays "Pending Deposit" until webhook |
| Payment declined | User sees Stripe error, booking unchanged |
| Webhook fails | Stripe retries; system handles idempotently |
| Refund/dispute | Log, alert admin, no auto-action |

### 14.3) Email Failures

| Scenario | System Behavior |
|----------|-----------------|
| Provider API down | Queue for retry (1m, 5m, 15m, 1h, give up) |
| Hard bounce | Mark Contact.email_status = bounced, stop sends |
| Soft bounce | Retry 3x over 24h, then treat as hard |
| Rate limited | Queue respects provider limits |

### 14.4) Scheduled Job Failures

| Scenario | System Behavior |
|----------|-----------------|
| Reminder job fails | Retry 3x with backoff, then alert admin |
| Duplicate execution | Idempotency check prevents duplicate sends |

### Acceptance Criteria

- No duplicate emails for same trigger + record
- Bounced contacts blocked from future emails
- Failed webhooks don't corrupt data
- Admin alerted for: disputes, repeated failures, high bounce rate

---

## 15) Reporting Dashboard

### 15.1) MVP Metrics

| Metric | Calculation |
|--------|-------------|
| Leads this week/month | Count of Enquiries created in period |
| Leads by source | Enquiries grouped by Contact.source |
| Conversion rate | Enquiries reaching Booked/Paid ÷ Total enquiries |
| Time to first response | Avg time from enquiry creation to first stage change |
| Bookings this week/month | Count of Bookings created |
| Revenue | Sum of paid PaymentRef.amount in period |
| No-show rate | No-show bookings ÷ Total completed + no-show |

### 15.2) Dashboard Layout

**Top row:** Key numbers (cards)
- New leads this week
- Bookings this week
- Revenue this month
- Conversion rate

**Charts:**
- Leads over time (line/bar, last 30 days)
- Leads by source (pie/bar)
- Bookings by status (current snapshot)

**Lists:**
- Recent enquiries (last 10)
- Upcoming bookings (next 7 days)
- Overdue follow-ups

### Acceptance Criteria

- Dashboard loads in < 2 seconds
- Numbers match database totals
- Date ranges selectable (this week, this month, custom)

---

## 16) Mobile & Accessibility

### 16.1) Responsive Design

- All screens usable on mobile (min 320px width)
- Touch-friendly tap targets (min 44x44px)
- Calendar switches to agenda/list on small screens
- Forms stack vertically on mobile
- No horizontal scrolling required

### 16.2) Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All elements focusable and operable |
| Screen readers | Semantic HTML, ARIA labels |
| Color contrast | 4.5:1 minimum for text |
| Focus indicators | Visible focus ring on all interactive elements |
| Form labels | All inputs have associated labels |
| Error announcements | Form errors announced to screen readers |

### Acceptance Criteria

- Lighthouse accessibility score ≥ 90
- All forms completable via keyboard only
- No information conveyed by color alone

---

## 17) Screen List

### 17.1) Public Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Enquiry Form | `/enquire` | Lead capture |
| Booking Request | `/book` | Self-service booking (Phase 2) |
| Payment Success | `/booking/confirmed` | Post-payment confirmation |

### 17.2) App Screens (Authenticated)

| Screen | Route | Purpose |
|--------|-------|---------|
| Dashboard | `/` | Overview metrics and quick actions |
| Pipeline Board | `/pipeline` | Kanban view of lead stages |
| Enquiry Inbox | `/enquiries` | List view with filters |
| Enquiry Detail | `/enquiries/[id]` | Full enquiry info + actions |
| Contact List | `/contacts` | Searchable contact directory |
| Contact Detail | `/contacts/[id]` | Profile, timeline, linked records |
| Booking Calendar | `/calendar` | Week/month view of bookings |
| Booking Detail | `/bookings/[id]` | Full booking info + actions |
| Email Templates | `/settings/templates` | Manage email templates |
| Service Types | `/settings/services` | Manage bookable services |
| Working Hours | `/settings/hours` | Set availability |
| Pipeline Stages | `/settings/pipeline` | Customize stage names |
| Users | `/settings/users` | Manage team (admin only) |
| General Settings | `/settings` | Business info, timezone |

### 17.3) Screen Wireframe Notes

**Contact Detail Page:**
```
+------------------------------------------+
| [Back] Contact Name            [Actions] |
+------------------------------------------+
| Email: ...          Status: [dropdown]   |
| Phone: ...          Owner: [dropdown]    |
| Source: ...         Tags: [+ Add]        |
+------------------------------------------+
| [Tab: Timeline] [Tab: Enquiries] [Tab: Bookings] |
+------------------------------------------+
| Activity Timeline                        |
| - Enquiry submitted (2h ago)             |
| - Auto-reply sent (2h ago)               |
| - Stage changed: New → Contacted (1h ago)|
| - Note added: "Called, voicemail" (1h)   |
+------------------------------------------+
| [Add Note]                               |
+------------------------------------------+
```

---

## 18) Non-Functional Requirements

### 18.1) Performance

| Metric | Target |
|--------|--------|
| Page load (dashboard) | < 2 seconds |
| Form submission response | < 1 second |
| Search results | < 500ms |
| List pagination | 50 items per page default |

### 18.2) Security

| Requirement | Implementation |
|-------------|----------------|
| Password storage | bcrypt or Argon2 (cost factor 12+) |
| Session tokens | Cryptographically random, hashed in DB |
| HTTPS | Required in production |
| CSRF protection | Double-submit cookie or SameSite |
| Input validation | Server-side validation on all inputs |
| SQL injection | Parameterized queries via ORM |
| XSS prevention | Output encoding, CSP headers |
| Rate limiting | On login, forms, API endpoints |

### 18.3) Reliability

| Requirement | Implementation |
|-------------|----------------|
| Uptime target | 99.5% (allows ~3.6h downtime/month) |
| Backups | Daily automated, 30-day retention |
| Error tracking | Sentry or similar |
| Monitoring | Uptime checks, error rate alerts |

### 18.4) Auditability

- Every data change logged with who/what/when
- Activity timeline provides full customer history
- Email logs prove what was sent and when
- Webhook events stored for debugging

---

## 19) Environment & Configuration

### 19.1) Environment Variables

```bash
# Database
DATABASE_URL=postgres://user:pass@host:5432/dbname

# Authentication
AUTH_SECRET=<random-32-chars-minimum>
NEXTAUTH_URL=https://app.yourbusiness.com

# Email Provider
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=notifications@yourbusiness.com
EMAIL_REPLY_TO=hello@yourbusiness.com

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Application
NEXT_PUBLIC_APP_URL=https://app.yourbusiness.com
NEXT_PUBLIC_APP_NAME=Your Business CRM

# Optional
SENTRY_DSN=https://xxxx@sentry.io/xxxx
```

### 19.2) Configuration Validation

On application start:
1. Check all required env vars present
2. Validate DATABASE_URL is connectable
3. Validate Stripe keys are valid (test API call)
4. Fail fast with clear error if anything missing

### 19.3) Environments

| Environment | Purpose | Database |
|-------------|---------|----------|
| Development | Local dev | Local Postgres or Supabase dev |
| Staging | Pre-production testing | Separate staging database |
| Production | Live system | Production database |

**Rules:**
- Production secrets never in code or version control
- Staging uses test Stripe keys
- Development can use `.env.local` file

---

## 20) MVP vs Phase 2 Scope

### 20.1) MVP (Build First)

| Feature | Status |
|---------|--------|
| Contact database with timeline | ✅ In scope |
| Enquiry form + auto-response | ✅ In scope |
| Lead pipeline board | ✅ In scope |
| Booking creation (internal) | ✅ In scope |
| Booking calendar view | ✅ In scope |
| Stripe deposits | ✅ In scope |
| Transactional email automation | ✅ In scope |
| Basic email templates (admin-editable) | ✅ In scope |
| Dashboard with key metrics | ✅ In scope |
| User management (admin/staff) | ✅ In scope |
| Settings (hours, services, stages) | ✅ In scope |

### 20.2) Phase 2 (After MVP Works)

| Feature | Rationale for Deferral |
|---------|------------------------|
| Public booking page | Internal booking works first |
| Drag-and-drop workflow builder | Pre-built workflows sufficient for MVP |
| Full email campaign builder | Use external tool initially |
| Advanced segmentation | Manual tagging works first |
| SMS/WhatsApp automation | Email sufficient initially |
| Multi-staff calendars | Single calendar for MVP |
| Customer self-service portal | Staff can reschedule for now |
| Proposals/quotes generator | Manual quotes for now |
| Inventory management | Out of scope entirely |
| Accounting integration | Export to CSV initially |
| Mobile native app | Responsive web sufficient |

### 20.3) Explicit Non-Goals

These are **not** in scope for this project:

- E-commerce / shopping cart (use Shopify)
- Project management (use Notion/Asana)
- Team chat (use Slack)
- Document storage (use Google Drive)
- Accounting (use Xero/QuickBooks)
- Mass email marketing (use Mailchimp/ConvertKit)

---

## Appendix A: Acceptance Test Checklist

### A.1) Lead Capture

- [ ] Submitting enquiry form creates Contact if new email
- [ ] Submitting enquiry form updates Contact if email exists
- [ ] Enquiry linked to correct Contact
- [ ] Auto-response email sends within 60 seconds
- [ ] Activity timeline shows "Enquiry submitted"
- [ ] Stage auto-advances to "Auto-Responded"
- [ ] Duplicate form submissions don't create duplicate contacts
- [ ] Spam submissions (honeypot filled) silently rejected

### A.2) Pipeline Management

- [ ] Pipeline board shows all enquiries in correct stages
- [ ] Dragging card changes stage and logs activity
- [ ] Filtering by source/owner/date works
- [ ] Stage change triggers follow-up date update (if applicable)

### A.3) Booking System

- [ ] Creating booking checks for conflicts
- [ ] Double-booking prevented (error shown)
- [ ] Booking appears in calendar view
- [ ] Booking appears in contact timeline
- [ ] Deposit request email sends if deposit required
- [ ] Status changes logged to activity

### A.4) Payments

- [ ] Stripe checkout link generates correctly
- [ ] Successful payment updates booking to Confirmed
- [ ] Payment logged in PaymentRef table
- [ ] Activity shows "Payment received"
- [ ] Confirmation email sends after payment
- [ ] Duplicate webhooks don't duplicate records

### A.5) Email Automation

- [ ] Each template renders with correct variables
- [ ] Reminders send at correct times (T-48h, T-24h)
- [ ] Bounced emails update contact status
- [ ] Marketing emails respect opt-in flag
- [ ] Unsubscribe link works and updates contact

### A.6) Access Control

- [ ] Staff cannot access /settings/users
- [ ] Staff cannot delete contacts (if restricted)
- [ ] Admin can access all pages
- [ ] Unauthenticated users redirected to login
- [ ] Session expires after 7 days of inactivity

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Contact** | Any person in the system (lead or customer) |
| **Enquiry** | A lead event — expression of interest |
| **Booking** | A scheduled appointment or service |
| **Pipeline** | Visual stages that records move through |
| **Transactional email** | Required communication (confirmations, receipts) |
| **Marketing email** | Optional promotional communication |
| **Activity** | A logged event in the contact timeline |
| **Webhook** | External service notifying our system of events |

---

## Appendix C: Configuration Defaults

These defaults are configured for a **service-based + creative/agency hybrid** business operating **Monday–Saturday**.

### C.1) Pipeline Stages

**Lead Pipeline:**
| Stage | Description | Auto-triggered |
|-------|-------------|----------------|
| New Lead | Form just submitted | Yes |
| Auto-Responded | Instant email sent | Yes |
| Contacted | Staff replied or called | Manual |
| Qualified | Confirmed fit and interest | Manual |
| Proposal Sent | Quote or booking link sent | Manual |
| Booked/Paid | Converted | Auto on payment |
| Lost | Not proceeding | Manual |

**Booking Pipeline:**
| Stage | Description |
|-------|-------------|
| Requested | Booking created |
| Pending Deposit | Awaiting payment (if required) |
| Confirmed | Ready to go |
| Completed | Service delivered |
| Follow-up Due | Post-service period |

### C.2) Service Types

| Service | Duration | Price | Deposit Required | Deposit Amount |
|---------|----------|-------|------------------|----------------|
| Discovery Call | 30 min | Free | No | — |
| Consultation | 60 min | £75 | No | — |
| Standard Session | 60 min | £150 | Yes | £50 |
| Extended Session | 90 min | £200 | Yes | £75 |
| Project Kickoff | 120 min | £300 | Yes | £100 |

> **Note:** Adjust prices and names to match your actual services. The structure (free intro → paid consultation → deposit-required sessions) works for most service/creative businesses.

### C.3) Working Hours

| Day | Hours |
|-----|-------|
| Monday | 09:00 – 17:30 |
| Tuesday | 09:00 – 17:30 |
| Wednesday | 09:00 – 17:30 |
| Thursday | 09:00 – 17:30 |
| Friday | 09:00 – 17:30 |
| Saturday | 10:00 – 15:00 |
| Sunday | Closed |

**Timezone:** `Europe/London` (change to your local timezone)

### C.4) Booking Rules

| Rule | Default |
|------|---------|
| Buffer before appointment | 15 minutes |
| Buffer after appointment | 15 minutes |
| Minimum booking lead time | 24 hours |
| Maximum advance booking | 60 days |
| Cancellation notice required | 24 hours |

### C.5) Reminder Schedule

| Reminder | Timing | Channel |
|----------|--------|---------|
| Booking confirmation | Immediate | Email |
| First reminder | 48 hours before | Email |
| Final reminder | 24 hours before | Email |
| Post-service thank you | Immediate | Email |
| Review request | 48 hours after | Email |

### C.6) Deposit Policy

**Rule:** Deposits required for services priced **£100 or above**.

| Scenario | Deposit |
|----------|---------|
| Free/low-cost services | No deposit |
| Standard paid services (< £100) | No deposit |
| Premium services (≥ £100) | Fixed amount per service |
| New clients (optional) | Can require deposit regardless of service |

**Deposit amounts:** Set per service type (see C.2 table).

**Refund policy:**
- Cancellation 48h+ before: Full refund
- Cancellation 24-48h before: 50% refund
- Cancellation < 24h / no-show: No refund

### C.7) Email Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| Sender name | `[Your Business Name]` | **ACTION: Replace** |
| Sender email | `hello@yourdomain.com` | **ACTION: Replace** |
| Reply-to | `hello@yourdomain.com` | **ACTION: Replace** |
| Email provider | Resend | Recommended for MVP |

**Required DNS setup:**
- SPF record
- DKIM signing
- DMARC policy (optional but recommended)

### C.8) User Accounts (Initial Setup)

| Role | Who | Access |
|------|-----|--------|
| Admin | Business owner | Full access |
| Admin | Operations manager (if applicable) | Full access |
| Staff | Team members handling bookings | Limited access |

**Recommendation:** Start with 1-2 admin accounts. Add staff accounts as needed.

---

## Appendix D: Pre-Launch Checklist

Before going live, complete these items:

### Business Configuration
- [ ] Update business name in Settings
- [ ] Set correct timezone
- [ ] Configure working hours
- [ ] Add all service types with correct pricing
- [ ] Set deposit amounts for premium services
- [ ] Define any blackout dates (holidays)

### Email Setup
- [ ] Verify sender domain with email provider
- [ ] Configure DNS records (SPF, DKIM)
- [ ] Customize all email templates with your branding
- [ ] Test each automated email (enquiry, booking, reminders)
- [ ] Add unsubscribe link to marketing templates

### Payments Setup
- [ ] Connect Stripe account (live mode)
- [ ] Test payment flow with real card (small amount, refund after)
- [ ] Verify webhook endpoint is receiving events
- [ ] Set up Stripe email receipts (optional)

### Forms Setup
- [ ] Embed enquiry form on website
- [ ] Test form submission end-to-end
- [ ] Verify auto-response email arrives
- [ ] Check contact appears in CRM with correct data

### Team Setup
- [ ] Create admin account(s)
- [ ] Create staff account(s)
- [ ] Brief team on pipeline stages and workflow
- [ ] Document any internal processes

### Go-Live
- [ ] Redirect old contact forms to new enquiry form
- [ ] Monitor first 10 enquiries closely
- [ ] Check email deliverability (no spam folder issues)
- [ ] Verify calendar blocking works correctly

---

*End of Specification*
