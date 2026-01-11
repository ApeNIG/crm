# Implementation Plan: Appointments (Booking)

> **Created:** 2026-01-10
> **Feature:** Appointments / Booking System
> **Status:** Ready for Review
> **Estimated Effort:** Medium-Large (similar scope to Pipeline & Deals)

---

## 1. Overview

The Appointments feature enables scheduling and management of bookings for contacts. It provides a calendar view for visual scheduling, list views for management, and integrates with the existing Contact and Enquiry systems. Bookings can optionally originate from enquiries and track service types, locations, and deposit status.

This is a core MVP feature that bridges the gap between lead management (enquiries) and service delivery (bookings).

---

## 2. Acceptance Criteria

### Core Functionality
- [ ] Users can create bookings linked to contacts
- [ ] Users can optionally link bookings to enquiries
- [ ] Users can select service types for bookings
- [ ] Bookings have start/end times stored in UTC
- [ ] Booking status can be changed (Requested, Pending Deposit, Confirmed, Completed, Cancelled, No-show, Rescheduled)
- [ ] Bookings support location (address or "Virtual") with optional virtual meeting link
- [ ] Internal notes can be added to bookings
- [ ] Deposit paid status can be tracked

### Service Types
- [ ] Admin can create/edit/delete service types
- [ ] Service types have name, duration, price, and description
- [ ] Service types can be activated/deactivated
- [ ] Duration defaults to 60 minutes

### Calendar View
- [ ] Week view displays bookings in time slots
- [ ] Month view displays bookings by day
- [ ] Users can toggle between week/month views
- [ ] Clicking a slot opens booking creation
- [ ] Clicking a booking opens booking detail

### List View
- [ ] Bookings displayed in sortable table
- [ ] Filter by status, date range, contact, service type
- [ ] Search bookings by contact name/email
- [ ] Pagination for large datasets

### Activity Timeline
- [ ] BOOKING_CREATED logged when booking created
- [ ] BOOKING_UPDATED logged when booking fields change
- [ ] BOOKING_STATUS_CHANGED logged on status transitions
- [ ] BOOKING_RESCHEDULED logged when start/end times change
- [ ] BOOKING_NOTE_ADDED logged when notes modified

### Integration
- [ ] Bookings appear on contact detail page
- [ ] Bookings can be created from enquiry detail page
- [ ] Contact status updates to CUSTOMER when booking completed

---

## 3. Database Schema

### 3.1 New Enums

```prisma
enum BookingStatus {
  REQUESTED
  PENDING_DEPOSIT
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
  RESCHEDULED
}

enum BookingActivityType {
  BOOKING_CREATED
  BOOKING_UPDATED
  BOOKING_STATUS_CHANGED
  BOOKING_RESCHEDULED
  BOOKING_NOTE_ADDED
}
```

### 3.2 ServiceType Model

```prisma
model ServiceType {
  id              String    @id @default(uuid())
  name            String
  description     String?
  durationMinutes Int       @default(60) @map("duration_minutes")
  price           Decimal?  @db.Decimal(10, 2)
  isActive        Boolean   @default(true) @map("is_active")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  bookings Booking[]

  @@map("service_types")
}
```

### 3.3 Booking Model

```prisma
model Booking {
  id            String        @id @default(uuid())
  contactId     String        @map("contact_id")
  enquiryId     String?       @map("enquiry_id")
  serviceTypeId String        @map("service_type_id")
  startAt       DateTime      @map("start_at") @db.Timestamptz
  endAt         DateTime      @map("end_at") @db.Timestamptz
  status        BookingStatus @default(REQUESTED)
  location      String?
  virtualLink   String?       @map("virtual_link")
  notes         String?
  depositPaid   Boolean       @default(false) @map("deposit_paid")
  depositPaidAt DateTime?     @map("deposit_paid_at")
  deletedAt     DateTime?     @map("deleted_at")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  contact     Contact          @relation(fields: [contactId], references: [id], onDelete: Cascade)
  enquiry     Enquiry?         @relation(fields: [enquiryId], references: [id], onDelete: SetNull)
  serviceType ServiceType      @relation(fields: [serviceTypeId], references: [id])
  activities  BookingActivity[]

  @@index([contactId])
  @@index([enquiryId])
  @@index([serviceTypeId])
  @@index([startAt])
  @@index([status])
  @@map("bookings")
}
```

### 3.4 BookingActivity Model

```prisma
model BookingActivity {
  id          String              @id @default(uuid())
  bookingId   String              @map("booking_id")
  type        BookingActivityType
  payload     Json                @default("{}")
  actorUserId String?             @map("actor_user_id")
  createdAt   DateTime            @default(now()) @map("created_at")

  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([bookingId])
  @@map("booking_activities")
}
```

### 3.5 Model Updates

Add relation to Contact model:
```prisma
model Contact {
  // ... existing fields
  bookings Booking[]
}
```

Add relation to Enquiry model:
```prisma
model Enquiry {
  // ... existing fields
  bookings Booking[]
}
```

---

## 4. Implementation Steps

### Phase 1: Database & Types

#### 4.1 Prisma Schema Updates
- [ ] Add `BookingStatus` enum to schema.prisma
- [ ] Add `BookingActivityType` enum to schema.prisma
- [ ] Add `ServiceType` model to schema.prisma
- [ ] Add `Booking` model to schema.prisma
- [ ] Add `BookingActivity` model to schema.prisma
- [ ] Add `bookings` relation to Contact model
- [ ] Add `bookings` relation to Enquiry model
- [ ] Run `npx prisma generate` to regenerate client
- [ ] Create migration file (for documentation, DB may not be connected)

#### 4.2 Validation Schemas
Create `/src/lib/validations/booking.ts`:
- [ ] `bookingStatusEnum` - Zod enum for BookingStatus
- [ ] `createServiceTypeSchema` - For creating service types
- [ ] `updateServiceTypeSchema` - Partial for updates
- [ ] `createBookingSchema` - For creating bookings
- [ ] `updateBookingSchema` - Partial for updates (excludes contactId)
- [ ] `updateBookingStatusSchema` - For status-only updates
- [ ] `bookingQuerySchema` - For list filtering/pagination
- [ ] `calendarQuerySchema` - For calendar date range queries

Create `/src/lib/validations/service-type.ts`:
- [ ] `createServiceTypeSchema`
- [ ] `updateServiceTypeSchema`
- [ ] `serviceTypeQuerySchema`

#### 4.3 TypeScript Types
Create `/src/types/booking.ts`:
- [ ] Re-export Prisma types (BookingStatus, BookingActivityType)
- [ ] `BookingWithContact` - Booking + contact relation
- [ ] `BookingWithAll` - Booking + contact + serviceType + activities
- [ ] `BookingListResponse` - Paginated list response
- [ ] `BookingFilters` - Query filter type
- [ ] `CalendarFilters` - Calendar query type
- [ ] `StatusConfig` - Status metadata for UI (similar to StageConfig)

Create `/src/types/service-type.ts`:
- [ ] Re-export `ServiceType` from Prisma
- [ ] `ServiceTypeListResponse`

---

### Phase 2: API Routes

#### 2.1 Service Type Routes

**`/api/service-types/route.ts`** (GET, POST)
- [ ] GET: List all service types (with optional `isActive` filter)
- [ ] POST: Create new service type (validate with createServiceTypeSchema)

**`/api/service-types/[id]/route.ts`** (GET, PUT, DELETE)
- [ ] GET: Fetch single service type
- [ ] PUT: Update service type (validate with updateServiceTypeSchema)
- [ ] DELETE: Soft delete or deactivate service type

#### 2.2 Booking Routes

**`/api/bookings/route.ts`** (GET, POST)
- [ ] GET: List bookings with filters (status, dateRange, contactId, serviceTypeId, search)
- [ ] POST: Create booking
  - Validate with createBookingSchema
  - Verify contact exists
  - Verify serviceType exists and is active
  - Verify enquiry exists (if provided)
  - Calculate endAt from startAt + serviceType.durationMinutes
  - Create BookingActivity (BOOKING_CREATED)

**`/api/bookings/[id]/route.ts`** (GET, PUT, DELETE)
- [ ] GET: Fetch booking with contact, serviceType, activities
- [ ] PUT: Update booking
  - Track changes for activity log
  - If startAt/endAt changed, log BOOKING_RESCHEDULED
  - If status changed, log BOOKING_STATUS_CHANGED
  - Otherwise log BOOKING_UPDATED
- [ ] DELETE: Soft delete (set deletedAt)

**`/api/bookings/[id]/status/route.ts`** (PATCH)
- [ ] PATCH: Update booking status only (optimized for quick status changes)
  - Validate with updateBookingStatusSchema
  - Create BOOKING_STATUS_CHANGED activity
  - Return updated booking

**`/api/bookings/calendar/route.ts`** (GET)
- [ ] GET: Fetch bookings for calendar view
  - Accept startDate, endDate parameters
  - Return bookings within range (exclude soft-deleted)
  - Include contact and serviceType relations

---

### Phase 3: React Query Hooks

Create `/src/hooks/useBookings.ts`:
- [ ] `useBookings(filters)` - Fetch paginated booking list
- [ ] `useBooking(id)` - Fetch single booking
- [ ] `useCalendarBookings(startDate, endDate)` - Fetch bookings for calendar
- [ ] `useCreateBooking()` - Create booking mutation
- [ ] `useUpdateBooking()` - Update booking mutation
- [ ] `useUpdateBookingStatus()` - Status-only update (optimistic)
- [ ] `useDeleteBooking()` - Soft delete mutation

Create `/src/hooks/useServiceTypes.ts`:
- [ ] `useServiceTypes(filters?)` - Fetch service types list
- [ ] `useServiceType(id)` - Fetch single service type
- [ ] `useCreateServiceType()` - Create mutation
- [ ] `useUpdateServiceType()` - Update mutation
- [ ] `useDeleteServiceType()` - Delete/deactivate mutation

---

### Phase 4: UI Components

#### 4.1 Booking Components
Create in `/src/components/bookings/`:

**`statusConfig.ts`**
- [ ] `STATUS_ORDER` - Array of statuses in display order
- [ ] `STATUS_CONFIG` - Map of status to { key, label, color, bgColor }
- [ ] `getStatusLabel()`, `getStatusColor()`, `getStatusBgColor()` helpers

**`BookingCard.tsx`**
- [ ] Compact card for calendar/list views
- [ ] Shows: contact name, service type, time, status badge
- [ ] Clickable (navigates to detail)

**`BookingForm.tsx`**
- [ ] Form for create/edit booking
- [ ] Contact selector (searchable dropdown)
- [ ] Service type selector
- [ ] Date/time picker for start time
- [ ] End time auto-calculated from duration (or manual override)
- [ ] Location input (with "Virtual" quick option)
- [ ] Virtual link input (shown if location is "Virtual")
- [ ] Status selector
- [ ] Notes textarea
- [ ] Deposit paid checkbox
- [ ] React Hook Form + Zod validation

**`BookingDetail.tsx`**
- [ ] Full booking view
- [ ] Header: contact name, status badge, edit/delete buttons
- [ ] Details card: service type, date/time, location, notes
- [ ] Contact sidebar: quick link to contact
- [ ] Activity timeline

**`BookingActivityTimeline.tsx`**
- [ ] Renders booking activity log
- [ ] Activity type icons/colors
- [ ] Formatted payloads for each type
- [ ] Relative timestamps

**`BookingList.tsx`**
- [ ] Table view of bookings
- [ ] Columns: contact, service, date/time, status, actions
- [ ] Sortable by date
- [ ] Row click navigates to detail

**`BookingFilters.tsx`**
- [ ] Filter controls for list view
- [ ] Status dropdown
- [ ] Date range picker
- [ ] Service type dropdown
- [ ] Search input

#### 4.2 Calendar Components
Create in `/src/components/calendar/`:

**`BookingCalendar.tsx`**
- [ ] Main calendar component
- [ ] Uses a calendar library (see Phase 6)
- [ ] Week and month view toggle
- [ ] Displays bookings as events
- [ ] Click event opens booking detail
- [ ] Click empty slot opens create form (with pre-filled date/time)

**`CalendarToolbar.tsx`**
- [ ] Navigation (prev/next/today)
- [ ] View toggle (week/month)
- [ ] Date display

**`CalendarEvent.tsx`**
- [ ] Render individual booking event
- [ ] Shows: time, contact name, service type (truncated)
- [ ] Color-coded by status

#### 4.3 Service Type Components
Create in `/src/components/service-types/`:

**`ServiceTypeForm.tsx`**
- [ ] Form for create/edit service type
- [ ] Name, description, duration, price, active toggle

**`ServiceTypeList.tsx`**
- [ ] List/table of service types
- [ ] Shows: name, duration, price, active status
- [ ] Edit/delete actions

---

### Phase 5: Pages

#### 5.1 Booking Pages
Create in `/src/app/bookings/`:

**`page.tsx`** - `/bookings`
- [ ] List view of all bookings
- [ ] Header with "New Booking" button
- [ ] Filter controls
- [ ] BookingList component
- [ ] Pagination

**`[id]/page.tsx`** - `/bookings/[id]`
- [ ] Booking detail page
- [ ] Back link to list
- [ ] BookingDetail component

**`[id]/edit/page.tsx`** - `/bookings/[id]/edit`
- [ ] Edit booking page
- [ ] BookingForm with existing data

**`new/page.tsx`** - `/bookings/new`
- [ ] Create booking page
- [ ] BookingForm (empty)
- [ ] Support `?contactId=` and `?enquiryId=` query params for pre-selection

#### 5.2 Calendar Page
Create in `/src/app/calendar/`:

**`page.tsx`** - `/calendar`
- [ ] Calendar view header
- [ ] CalendarToolbar
- [ ] BookingCalendar component
- [ ] "New Booking" floating action or toolbar button

#### 5.3 Settings Pages
Create in `/src/app/settings/services/`:

**`page.tsx`** - `/settings/services`
- [ ] Service type management page
- [ ] ServiceTypeList
- [ ] "Add Service Type" button

**`new/page.tsx`** - `/settings/services/new`
- [ ] Create service type page
- [ ] ServiceTypeForm

**`[id]/edit/page.tsx`** - `/settings/services/[id]/edit`
- [ ] Edit service type page
- [ ] ServiceTypeForm with existing data

---

### Phase 6: Calendar Integration

#### Calendar Library Choice

**Recommended: `@fullcalendar/react`**
- Industry standard, feature-rich
- Good TypeScript support
- Week/month views built-in
- Event drag-drop support (Phase 2)
- MIT license

**Alternative: `react-big-calendar`**
- Simpler, lighter weight
- Good for basic week/month views
- More customization needed

**Alternative: Custom Implementation**
- Maximum control
- More development time
- Recommended only if specific requirements

#### Implementation Steps
- [ ] Install calendar library: `npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction`
- [ ] Create calendar wrapper component
- [ ] Configure week view (default)
- [ ] Configure month view
- [ ] Style events with status colors
- [ ] Handle event click (navigate to detail)
- [ ] Handle date click (navigate to create with date)
- [ ] Responsive: stack views on mobile

---

## 5. Testing Strategy

### 5.1 Validation Schema Tests
Create `/src/lib/validations/booking.test.ts`:
- [ ] Test bookingStatusEnum accepts all valid statuses
- [ ] Test createBookingSchema with valid/invalid data
- [ ] Test date/time transformation
- [ ] Test updateBookingSchema partial validation
- [ ] Test updateBookingStatusSchema
- [ ] Test bookingQuerySchema pagination defaults
- [ ] Test calendarQuerySchema date validation

Create `/src/lib/validations/service-type.test.ts`:
- [ ] Test createServiceTypeSchema
- [ ] Test duration defaults to 60
- [ ] Test price validation (decimal)
- [ ] Test updateServiceTypeSchema partial

### 5.2 Component Tests
- [ ] `statusConfig.test.ts` - Status helpers return correct values
- [ ] `BookingCard.test.tsx` - Renders booking info correctly
- [ ] `BookingForm.test.tsx` - Form validation, submission
- [ ] `BookingDetail.test.tsx` - Renders all booking details
- [ ] `BookingActivityTimeline.test.tsx` - Renders activities correctly
- [ ] `ServiceTypeForm.test.tsx` - Form validation
- [ ] `ServiceTypeList.test.tsx` - Renders list, handles actions

### 5.3 API Route Tests (Integration)
If test database available:
- [ ] Test booking CRUD operations
- [ ] Test activity logging
- [ ] Test status transitions
- [ ] Test calendar query with date range
- [ ] Test service type CRUD

### 5.4 Hook Tests
- [ ] Test useBookings returns correct data shape
- [ ] Test useCalendarBookings date filtering
- [ ] Test mutation hooks invalidate queries

---

## 6. Risks & Considerations

### 6.1 Technical Risks

| Risk | Mitigation |
|------|------------|
| Calendar library bundle size | Use dynamic import, tree-shake unused views |
| Timezone complexity | Store UTC in DB, convert on display using business timezone |
| Double-booking | Add database constraint or transaction check (Phase 2) |
| Large calendar datasets | Limit query to visible date range, lazy load |

### 6.2 UX Considerations

| Consideration | Approach |
|---------------|----------|
| Mobile calendar | Switch to agenda/list view on small screens |
| Quick status changes | Status dropdown on list view, not just detail |
| Booking conflicts | Show warning if overlapping times (Phase 2) |
| Service type changes | Warn if editing service type with existing bookings |

### 6.3 Scope Boundaries (MVP)

**Included:**
- Basic CRUD for bookings and service types
- Calendar week/month views
- List view with filters
- Activity timeline
- Link to contacts and enquiries

**Deferred to Phase 2:**
- Availability calculation / conflict detection
- Booking reminders (email integration)
- Deposit payment integration (Stripe)
- Drag-drop rescheduling on calendar
- Recurring bookings
- Public booking form
- Multi-staff calendars
- Buffer time between bookings

---

## 7. File Structure Summary

```
src/
├── app/
│   ├── api/
│   │   ├── bookings/
│   │   │   ├── route.ts              # GET (list), POST (create)
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts          # GET, PUT, DELETE
│   │   │   │   └── status/
│   │   │   │       └── route.ts      # PATCH (status only)
│   │   │   └── calendar/
│   │   │       └── route.ts          # GET (calendar range)
│   │   └── service-types/
│   │       ├── route.ts              # GET, POST
│   │       └── [id]/
│   │           └── route.ts          # GET, PUT, DELETE
│   ├── bookings/
│   │   ├── page.tsx                  # List view
│   │   ├── new/
│   │   │   └── page.tsx              # Create
│   │   └── [id]/
│   │       ├── page.tsx              # Detail
│   │       └── edit/
│   │           └── page.tsx          # Edit
│   ├── calendar/
│   │   └── page.tsx                  # Calendar view
│   └── settings/
│       └── services/
│           ├── page.tsx              # Service types list
│           ├── new/
│           │   └── page.tsx          # Create service type
│           └── [id]/
│               └── edit/
│                   └── page.tsx      # Edit service type
├── components/
│   ├── bookings/
│   │   ├── statusConfig.ts
│   │   ├── BookingCard.tsx
│   │   ├── BookingForm.tsx
│   │   ├── BookingDetail.tsx
│   │   ├── BookingActivityTimeline.tsx
│   │   ├── BookingList.tsx
│   │   ├── BookingFilters.tsx
│   │   └── *.test.tsx
│   ├── calendar/
│   │   ├── BookingCalendar.tsx
│   │   ├── CalendarToolbar.tsx
│   │   ├── CalendarEvent.tsx
│   │   └── *.test.tsx
│   └── service-types/
│       ├── ServiceTypeForm.tsx
│       ├── ServiceTypeList.tsx
│       └── *.test.tsx
├── hooks/
│   ├── useBookings.ts
│   └── useServiceTypes.ts
├── lib/
│   └── validations/
│       ├── booking.ts
│       ├── booking.test.ts
│       ├── service-type.ts
│       └── service-type.test.ts
└── types/
    ├── booking.ts
    └── service-type.ts
```

---

## 8. Dependencies

### New Dependencies to Install

```bash
# Calendar (recommended)
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

# Date handling (if not already installed)
npm install date-fns
```

### Existing Dependencies Used
- React Hook Form (forms)
- Zod (validation)
- TanStack Query (data fetching)
- Tailwind CSS (styling)
- shadcn/ui components (Button, Card, Input, Select, etc.)
- Prisma (ORM)

---

## 9. Implementation Order

Recommended implementation sequence:

1. **Database Schema** - Add models, generate Prisma client
2. **Validation Schemas** - Create Zod schemas with tests
3. **Types** - Define TypeScript types
4. **Service Type API** - Routes for service type CRUD
5. **Service Type UI** - Settings pages for service types
6. **Booking API** - Routes for booking CRUD
7. **Booking Hooks** - React Query hooks
8. **Status Config** - Status metadata for UI
9. **Booking Form** - Create/edit form component
10. **Booking Detail** - Detail view with activity timeline
11. **Booking List** - List view with filters
12. **Booking Pages** - Wire up pages
13. **Calendar Integration** - Install library, create components
14. **Calendar Page** - Wire up calendar view
15. **Contact Integration** - Show bookings on contact detail
16. **Final Testing** - End-to-end testing

---

## 10. Approval Checklist

Before implementation begins, confirm:

- [ ] Database schema approved
- [ ] API endpoint structure approved
- [ ] Calendar library choice approved (FullCalendar recommended)
- [ ] MVP scope boundaries clear
- [ ] No blockers identified

---

*Plan created by Planner Agent. Ready for user approval.*
