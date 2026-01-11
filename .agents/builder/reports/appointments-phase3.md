# Builder Report: Appointments Phase 3 - Booking API Routes & Hooks

**Date:** 2025-01-10
**Phase:** 3 of Appointments Feature
**Status:** Complete

---

## Summary

Phase 3 implements the complete Booking API infrastructure including all CRUD operations, status management, calendar queries, React Query hooks, and mock data. All implementations follow the established patterns from the enquiries feature.

---

## Files Created

### API Routes

| File | Methods | Description |
|------|---------|-------------|
| `/src/app/api/bookings/route.ts` | GET, POST | List bookings with filters, create new booking |
| `/src/app/api/bookings/[id]/route.ts` | GET, PUT, DELETE | CRUD operations for single booking |
| `/src/app/api/bookings/[id]/status/route.ts` | PATCH | Optimized status-only updates |
| `/src/app/api/bookings/calendar/route.ts` | GET | Calendar view with date range query |

### Hooks

| File | Description |
|------|-------------|
| `/src/hooks/useBookings.ts` | React Query hooks for all booking operations |

### Mock Data

| File | Description |
|------|-------------|
| `/src/lib/mock-data.ts` | Added mockBookings array and helper functions |

---

## Implementation Details

### 1. Booking List API (`GET /api/bookings`)

**Filters supported:**
- `search` - Full-text search across notes, location, contact name, email, service type name
- `status` - Filter by booking status (REQUESTED, PENDING_DEPOSIT, CONFIRMED, etc.)
- `contactId` - Filter by contact UUID
- `serviceTypeId` - Filter by service type UUID
- `dateFrom` / `dateTo` - Filter by booking start date range
- `page` / `limit` - Pagination (default: page 1, limit 100)

**Response includes:**
- Paginated bookings with contact and serviceType relations
- Total count and pagination metadata

### 2. Create Booking API (`POST /api/bookings`)

**Validations:**
- Contact must exist and not be deleted
- Service type must exist and be active
- Enquiry must exist if provided (optional relation)

**Auto-calculation:**
- If `endAt` not provided, calculated from `startAt + serviceType.durationMinutes`

**Activity logging:**
- Creates `BOOKING_CREATED` activity with payload:
  ```json
  {
    "serviceTypeName": "1-Hour Session",
    "startAt": "2025-01-15T10:00:00Z",
    "contactName": "John Doe"
  }
  ```

### 3. Single Booking API (`/api/bookings/[id]`)

**GET:**
- Returns booking with all relations (contact, serviceType, enquiry, activities)
- Activities limited to 50 most recent, ordered by createdAt desc

**PUT:**
- Validates serviceType exists and is active if being changed
- Validates enquiry exists if being changed
- Intelligent activity logging:
  - `BOOKING_RESCHEDULED` if startAt or endAt changed
  - `BOOKING_STATUS_CHANGED` if status changed
  - `BOOKING_UPDATED` for other field changes

**DELETE:**
- Soft delete (sets deletedAt timestamp)

### 4. Status Update API (`PATCH /api/bookings/[id]/status`)

**Optimized endpoint for quick status changes:**
- Single-field update for performance
- Skips update if status unchanged
- Returns success response with previous and new status
- Creates `BOOKING_STATUS_CHANGED` activity

### 5. Calendar API (`GET /api/bookings/calendar`)

**Query parameters (required):**
- `startDate` - ISO datetime string
- `endDate` - ISO datetime string

**Overlap detection:**
- Returns bookings where: `startAt < endDate AND endAt > startDate`
- Excludes soft-deleted bookings
- Includes contact and serviceType relations (no activities for performance)

### 6. React Query Hooks

| Hook | Purpose |
|------|---------|
| `useBookings(filters)` | Fetch paginated booking list |
| `useBooking(id)` | Fetch single booking with all relations |
| `useCalendarBookings(startDate, endDate)` | Fetch bookings for calendar view |
| `useCreateBooking()` | Create mutation with cache invalidation |
| `useUpdateBooking()` | Update mutation with cache invalidation |
| `useUpdateBookingStatus()` | Status update with optimistic updates |
| `useDeleteBooking()` | Soft delete mutation |

**Optimistic Updates:**
The `useUpdateBookingStatus` hook implements optimistic updates:
1. Cancels outgoing queries
2. Snapshots current state
3. Optimistically updates the UI
4. Rolls back on error
5. Refetches on settlement

### 7. Mock Data

**Sample bookings (8 total):**
- Various statuses: CONFIRMED, PENDING_DEPOSIT, REQUESTED, COMPLETED, NO_SHOW, CANCELLED
- Mix of locations and virtual links
- Links to existing mock contacts, service types, and enquiries
- Activity histories showing status progressions

**Helper functions:**
- `getMockBookings(params)` - Filtered list with pagination
- `getMockBooking(id)` - Single booking by ID
- `getMockCalendarBookings(startDate, endDate)` - Date range query

---

## Activity Payload Structures

### BOOKING_CREATED
```typescript
{
  serviceTypeName: string;
  startAt: string; // ISO datetime
  contactName: string;
}
```

### BOOKING_STATUS_CHANGED
```typescript
{
  from: BookingStatus;
  to: BookingStatus;
}
```

### BOOKING_RESCHEDULED
```typescript
{
  previousStartAt: string;
  previousEndAt: string;
  newStartAt: string;
  newEndAt: string;
}
```

### BOOKING_UPDATED
```typescript
{
  changes: Record<string, { from: unknown; to: unknown }>;
}
```

---

## Validation Schemas Used

| Schema | Purpose |
|--------|---------|
| `createBookingSchema` | POST request validation |
| `updateBookingSchema` | PUT request validation |
| `updateBookingStatusSchema` | PATCH /status request validation |
| `bookingQuerySchema` | GET list query parameters |
| `calendarQuerySchema` | GET calendar query parameters |
| `uuidParamSchema` | Path parameter UUID validation |

---

## Patterns Followed

1. **Error handling:** Consistent with enquiries API
2. **Mock data fallback:** Database errors fall back to mock data
3. **UUID validation:** All path parameters validated before processing
4. **Soft delete:** Uses deletedAt timestamp, filtered in all queries
5. **Activity logging:** All mutations logged with structured payloads
6. **Cache invalidation:** Mutations invalidate both bookings and calendarBookings queries

---

## Type Safety

All new files pass TypeScript compilation. Existing test file errors are unrelated to this implementation.

---

## Next Steps (Phase 4)

- Create booking UI components (BookingForm, BookingList, BookingDetail)
- Create booking pages (/appointments route)
- Implement calendar view component
- Add booking status change dropdown/buttons

---

## File Locations

```
/workspace/crm/apps/web/src/
├── app/api/bookings/
│   ├── route.ts                    # GET list, POST create
│   ├── [id]/
│   │   ├── route.ts                # GET, PUT, DELETE single
│   │   └── status/
│   │       └── route.ts            # PATCH status
│   └── calendar/
│       └── route.ts                # GET calendar range
├── hooks/
│   └── useBookings.ts              # React Query hooks
├── lib/
│   ├── mock-data.ts                # Updated with booking mock data
│   └── validations/
│       └── booking.ts              # Updated with uuidParamSchema export
└── types/
    └── booking.ts                  # Existing types (no changes needed)
```
