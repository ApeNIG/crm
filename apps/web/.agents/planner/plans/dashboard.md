# Dashboard Implementation Plan

## Executive Summary

Dashboard feature providing an overview page with key metrics, recent activity, and quick actions. This is primarily a READ-ONLY feature aggregating data from existing Contact, Enquiry, Booking, and Invoice models. **No new database models required.**

---

## 1. API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/dashboard` | Fetch all dashboard data |
| GET | `/api/dashboard/activity` | Activity feed with pagination |

---

## 2. Key Metrics

| Metric | Definition |
|--------|------------|
| Total Contacts | Count of non-deleted contacts |
| Active Enquiries | NOT in BOOKED_PAID or LOST stage |
| Upcoming Bookings | CONFIRMED, next 7 days |
| Outstanding Amount | Sum of SENT + OVERDUE invoice amountDue |
| Revenue This Month | Sum of payments in current month |

---

## 3. Breakdowns

- **Enquiries by Stage** - Count per stage
- **Bookings by Status** - Today + this week counts
- **Invoices by Status** - Count and total amount

---

## 4. Activity Feed

Combined timeline from:
- ContactActivity
- EnquiryActivity
- BookingActivity
- InvoiceActivity

Sorted by createdAt, limited to 20, with pagination.

---

## 5. UI Components

```
src/components/dashboard/
├── index.ts
├── MetricCard.tsx           # Single metric with icon
├── MetricsGrid.tsx          # 5-column grid of metrics
├── EnquiryStageChart.tsx    # Stage breakdown bars
├── BookingStatusSummary.tsx # Today/this week summary
├── InvoiceStatusSummary.tsx # Status + amounts
├── ActivityFeed.tsx         # Combined timeline
├── ActivityFeedItem.tsx     # Single activity row
├── QuickActions.tsx         # Action buttons
└── DashboardSkeleton.tsx    # Loading state
```

---

## 6. Page

Modify `src/app/page.tsx` to render Dashboard (replace current redirect).

Layout:
1. Header + Quick Actions
2. Metrics Grid (5 cards)
3. Three-column breakdown section
4. Activity Feed

---

## 7. Implementation Phases

### Phase 1: Types & API
- Create `src/types/dashboard.ts`
- Create `src/app/api/dashboard/route.ts`
- Implement all metrics and breakdowns

### Phase 2: Activity Feed
- Aggregate from all activity tables
- Map to unified format
- Create pagination endpoint

### Phase 3: Hooks
- Create `src/hooks/useDashboard.ts`
- 30s staleTime, 60s auto-refresh

### Phase 4: Components
- All dashboard components
- Loading skeleton

### Phase 5: Page Integration
- Modify `src/app/page.tsx`
- Responsive layout

### Phase 6: Testing
- Unit tests for components
- API tests

---

## 8. Technical Notes

- Use `Promise.all()` for parallel queries
- Use Prisma `groupBy` and `aggregate` for efficiency
- No chart library needed (pure CSS bars for MVP)
- Reuse existing activity patterns from other timelines
