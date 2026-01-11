# Dashboard

## Overview

The Dashboard provides a real-time overview of business activity, displaying key metrics, breakdowns by status/stage, and a unified activity feed across all entities (contacts, enquiries, bookings, invoices).

## Key Metrics

| Metric | Description | Calculation |
|--------|-------------|-------------|
| Total Contacts | Active contacts in the database | Count of non-deleted contacts |
| Active Enquiries | Enquiries in progress | Enquiries not in BOOKED_PAID or LOST stage |
| Upcoming Bookings | Confirmed bookings in next 7 days | CONFIRMED bookings with startAt within 7 days |
| Outstanding Amount | Unpaid invoice balance | Sum of amountDue for SENT, OVERDUE, PARTIALLY_PAID invoices |
| Revenue This Month | Payments received this month | Sum of payment amounts in current month |

## Breakdowns

### Enquiry Stage Breakdown

Displays count of enquiries grouped by pipeline stage:
- NEW, CONTACTED, QUALIFIED, PROPOSAL_SENT, NEGOTIATION, BOOKED_PAID, LOST

### Booking Status Summary

Shows booking counts for today and this week by status:
- PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW

### Invoice Status Summary

Displays invoice counts and total amounts by status:
- DRAFT, SENT, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED

## Activity Feed

A unified, chronological feed of recent activity across all entities:

### Supported Activity Types

**Contact Activities:**
- CONTACT_CREATED, CONTACT_UPDATED, NOTE_ADDED, TAG_ADDED, TAG_REMOVED

**Enquiry Activities:**
- ENQUIRY_CREATED, ENQUIRY_UPDATED, STAGE_CHANGED

**Booking Activities:**
- BOOKING_CREATED, BOOKING_UPDATED, BOOKING_STATUS_CHANGED, BOOKING_RESCHEDULED, BOOKING_NOTE_ADDED

**Invoice Activities:**
- INVOICE_CREATED, INVOICE_UPDATED, INVOICE_STATUS_CHANGED, INVOICE_SENT, PAYMENT_RECORDED, PAYMENT_DELETED, LINE_ITEM_ADDED, LINE_ITEM_UPDATED, LINE_ITEM_DELETED

### Activity Item Format

Each activity includes:
- Entity type (contact, enquiry, booking, invoice)
- Human-readable description with context
- Link to the related entity
- Timestamp

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Full dashboard data (metrics, breakdowns, recent activity) |
| GET | `/api/dashboard/activity` | Paginated activity feed with filtering |

## Components

| Component | Purpose |
|-----------|---------|
| `MetricCard` | Individual metric display with icon and value |
| `MetricsGrid` | Grid layout of all key metrics |
| `EnquiryStageChart` | Visual breakdown of enquiry stages |
| `BookingStatusSummary` | Booking status counts for today/week |
| `InvoiceStatusSummary` | Invoice status counts with amounts |
| `ActivityFeed` | Scrollable activity list with load more |
| `ActivityFeedItem` | Individual activity entry |
| `QuickActions` | Common action buttons (new contact, booking, etc.) |
| `DashboardSkeleton` | Loading state placeholder |

## Auto-Refresh Behavior

The dashboard uses React Query with automatic refresh:

- **Stale time:** 30 seconds - data considered fresh for 30s
- **Refetch interval:** 60 seconds - automatic background refresh every minute
- **On window focus:** Refetches when user returns to tab

This ensures data stays current without manual refresh.

## React Query Hooks

```typescript
// Fetch dashboard data with auto-refresh
const { data, isLoading, isError } = useDashboard();

// Fetch paginated activity with infinite scroll
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useDashboardActivity({ entityType: "booking" });
```

## Related Documentation

- [Dashboard API](/workspace/crm/apps/web/docs/api/dashboard.md) - API endpoint reference
- [Contact Database](/workspace/crm/docs/features/contacts.md) - Contact management
- [Pipeline & Deals](/workspace/crm/docs/features/pipeline.md) - Enquiry management
- [Appointments](/workspace/crm/docs/features/appointments.md) - Booking system
- [Basic Invoicing](/workspace/crm/apps/web/docs/features/invoicing.md) - Invoice management
