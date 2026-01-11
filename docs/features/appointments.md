# Appointments (Booking System)

## Overview

The Appointments feature provides a complete booking and scheduling system for managing client appointments. Users can create bookings linked to contacts and service types, view appointments in both list and calendar views, and track the full lifecycle of each booking from initial request through completion.

The system integrates tightly with the Contact Database and Pipeline features, allowing bookings to be created from enquiries and maintaining a complete activity history for each appointment. Service types define the available services with their durations and pricing, providing a consistent foundation for scheduling.

## User Stories

- As a user, I can create a booking for a contact selecting a service type, date, and time
- As a user, I can view all bookings in a filterable list organized by date
- As a user, I can view bookings in a calendar with week and month views
- As a user, I can click on a calendar event to see booking details
- As a user, I can click on an empty time slot to create a new booking
- As a user, I can update booking status (Requested, Pending Deposit, Confirmed, Completed, Cancelled, No Show, Rescheduled)
- As a user, I can track deposit payment status on bookings
- As a user, I can add physical locations or virtual meeting links to bookings
- As a user, I can view the complete activity history of a booking
- As a user, I can manage service types with names, descriptions, durations, and prices
- As a user, I can deactivate service types without losing historical data

## Technical Overview

### Entry Points

| Type | Path | Purpose |
|------|------|---------|
| Page | `/bookings` | Booking list with filters and search |
| Page | `/bookings/new` | Create new booking form |
| Page | `/bookings/[id]` | Booking detail view with activity timeline |
| Page | `/bookings/[id]/edit` | Edit booking form |
| Page | `/calendar` | Calendar view of all bookings |
| Page | `/settings/services` | Service type list and management |
| Page | `/settings/services/new` | Create new service type |
| Page | `/settings/services/[id]/edit` | Edit service type |
| API | `/api/bookings` | List/create bookings |
| API | `/api/bookings/[id]` | Get/update/delete single booking |
| API | `/api/bookings/[id]/status` | Optimized status update |
| API | `/api/bookings/calendar` | Calendar-specific booking query |
| API | `/api/service-types` | List/create service types |
| API | `/api/service-types/[id]` | Get/update/deactivate service type |

### Key Components

- **BookingCalendar** - FullCalendar integration with week/month views, status-based coloring, and click-to-create functionality
- **BookingForm** - Create/edit form with contact selection, service type picker, date/time inputs, and location fields
- **BookingDetail** - Full booking view with status badge, contact info, service details, location/virtual link, and activity timeline
- **BookingList** - Filterable table of bookings with status badges and quick actions
- **BookingFilters** - Filter controls for status, date range, service type, and search
- **BookingCard** - Compact card display for list views
- **BookingActivityTimeline** - Chronological list of booking events
- **CalendarToolbar** - Calendar navigation controls
- **ServiceTypeForm** - Create/edit form for service types
- **ServiceTypeList** - Grid of service type cards
- **ServiceTypeCard** - Card display with duration, price, and active status

### Data Flow

1. **Calendar View Load**
   - `BookingCalendar` component initializes with current week date range
   - `useCalendarBookings` hook fetches bookings for the visible range
   - Bookings are transformed into FullCalendar events with status-based colors
   - On view/date change, `handleDatesSet` updates the date range and triggers refetch

2. **Create Booking**
   - User navigates to `/bookings/new` or clicks empty calendar slot
   - `BookingForm` loads contacts and service types via React Query
   - User selects contact, service type, date/time, and optional fields
   - Form validates with Zod schema
   - `useCreateBooking` mutation POSTs to `/api/bookings`
   - Server verifies contact, service type, and optional enquiry exist
   - Server creates booking and logs BOOKING_CREATED activity
   - Redirect to booking list or calendar on success

3. **Update Status**
   - User selects new status from dropdown in detail view
   - `useUpdateBookingStatus` mutation patches `/api/bookings/[id]/status`
   - Optimistic update immediately reflects change in UI
   - Server verifies booking exists and status changed
   - Server logs BOOKING_STATUS_CHANGED activity
   - On error, UI rolls back to previous state

4. **Activity Logging**
   - All significant changes automatically logged in `booking_activities`
   - Activity types: BOOKING_CREATED, BOOKING_UPDATED, BOOKING_STATUS_CHANGED, BOOKING_RESCHEDULED, BOOKING_NOTE_ADDED
   - Payload stores context (status from/to, field changes, new times)

### Database Tables

#### bookings
Core booking data with references to contact, service type, and optional enquiry.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| contact_id | UUID | Reference to contacts table |
| enquiry_id | UUID | Optional reference to enquiries table |
| service_type_id | UUID | Reference to service_types table |
| start_at | Timestamptz | Booking start date/time |
| end_at | Timestamptz | Booking end date/time |
| status | Enum | REQUESTED, PENDING_DEPOSIT, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED |
| location | String | Physical location (optional) |
| virtual_link | String | Virtual meeting URL (optional) |
| notes | String | Internal notes |
| deposit_paid | Boolean | Whether deposit has been paid |
| deposit_paid_at | DateTime | When deposit was paid |
| deleted_at | DateTime | Soft delete timestamp |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

#### booking_activities
Audit trail of all booking events with JSON payload for context.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| booking_id | UUID | Reference to bookings table |
| type | Enum | Activity type (BOOKING_CREATED, etc.) |
| payload | JSON | Activity-specific data |
| actor_user_id | UUID | User who performed action (optional) |
| created_at | DateTime | When activity occurred |

#### service_types
Available services with duration and pricing configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | String | Service name |
| description | String | Service description (optional) |
| duration_minutes | Int | Default duration (5-480 minutes) |
| price | Decimal | Service price (optional) |
| is_active | Boolean | Whether service is available for new bookings |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

### Booking Statuses

| Status | Label | Description |
|--------|-------|-------------|
| REQUESTED | Requested | Initial state, booking requested but not confirmed |
| PENDING_DEPOSIT | Pending Deposit | Awaiting deposit payment |
| CONFIRMED | Confirmed | Booking confirmed and scheduled |
| COMPLETED | Completed | Appointment took place |
| CANCELLED | Cancelled | Booking was cancelled |
| NO_SHOW | No Show | Client did not attend |
| RESCHEDULED | Rescheduled | Booking moved to different time |

## Configuration

### Status Configuration

Status labels, colors, and order are defined in `src/components/bookings/statusConfig.ts`:

```typescript
import { STATUS_ORDER, STATUS_CONFIG, getStatusLabel, getStatusColor, getStatusBgColor } from '@/components/bookings/statusConfig';

// Get all statuses in order
STATUS_ORDER; // ['REQUESTED', 'PENDING_DEPOSIT', ...]

// Get config for a status
STATUS_CONFIG['CONFIRMED']; // { key, label, color, bgColor }

// Helper functions
getStatusLabel('CONFIRMED'); // 'Confirmed'
getStatusColor('CONFIRMED'); // 'text-green-700'
getStatusBgColor('CONFIRMED'); // 'bg-green-50'
```

### Calendar Configuration

The calendar component accepts configuration props:

```typescript
<BookingCalendar
  initialView="timeGridWeek"      // or "dayGridMonth"
  businessHoursStart="09:00:00"   // Business hours start
  businessHoursEnd="18:00:00"     // Business hours end
  height="auto"                    // Calendar height
/>
```

### Validation Schemas

Booking validation is defined in `src/lib/validations/booking.ts`:

- `createBookingSchema` - Validates new booking creation
- `updateBookingSchema` - Validates partial updates (contactId excluded)
- `updateBookingStatusSchema` - Validates status-only updates
- `bookingQuerySchema` - Validates list query parameters
- `calendarQuerySchema` - Validates calendar date range queries
- `bookingFormSchema` - Form-specific schema for react-hook-form

Service type validation is defined in `src/lib/validations/service-type.ts`:

- `createServiceTypeSchema` - Validates new service type creation
- `updateServiceTypeSchema` - Validates partial updates
- `serviceTypeQuerySchema` - Validates list query parameters
- `serviceTypeFormSchema` - Form-specific schema for react-hook-form

### Default Values

| Field | Default |
|-------|---------|
| Booking Status | REQUESTED |
| Deposit Paid | false |
| Duration Minutes | 60 |
| Service isActive | true |
| Page | 1 |
| Limit | 100 (bookings), 50 (service types) |

## How to Extend

### Adding a New Booking Status

1. Add the status to the `BookingStatus` enum in `prisma/schema.prisma`
2. Run `npx prisma generate` to update the Prisma client
3. Add the status to `STATUS_ORDER` array in `statusConfig.ts`
4. Add status configuration to `STATUS_CONFIG` object with label, color, and bgColor
5. Add hex color values to `STATUS_COLORS` in `BookingCalendar.tsx` for calendar display
6. Update validation schema in `booking.ts` if using Zod enum

### Adding a New Activity Type

1. Add the type to `BookingActivityType` enum in `prisma/schema.prisma`
2. Run `npx prisma generate` to update the Prisma client
3. Add icon and color configuration in `BookingActivityTimeline.tsx`
4. Add rendering logic for the new activity type's payload
5. Update API routes to create activities of the new type

### Adding New Booking Fields

1. Add the field to the `Booking` model in `prisma/schema.prisma`
2. Create a migration with `npx prisma migrate dev`
3. Add field to `createBookingSchema` and `updateBookingSchema` in `booking.ts`
4. Add field to `bookingFormSchema` with form-appropriate validation
5. Add field to `BookingForm.tsx` with appropriate input component
6. Display field in `BookingCard.tsx` and/or `BookingDetail.tsx`
7. Update TypeScript types in `src/types/booking.ts` if needed

### Adding New Service Type Fields

1. Add the field to the `ServiceType` model in `prisma/schema.prisma`
2. Create a migration with `npx prisma migrate dev`
3. Add field to `createServiceTypeSchema` and `updateServiceTypeSchema`
4. Add field to `ServiceTypeForm.tsx`
5. Display field in `ServiceTypeCard.tsx` and/or `ServiceTypeList.tsx`

### Customizing Calendar Views

The calendar uses FullCalendar with these plugins:
- `dayGridPlugin` - Month view
- `timeGridPlugin` - Week view with time slots
- `interactionPlugin` - Click and select interactions

To add new views or modify behavior:
1. Import additional FullCalendar plugins as needed
2. Update `headerToolbar` configuration for view buttons
3. Modify event rendering in the `events` transformation
4. Add new event handlers for custom interactions

## Related Documentation

- [Bookings API](/workspace/crm/docs/api/bookings.md) - API endpoint reference
- [Service Types API](/workspace/crm/docs/api/service-types.md) - Service type API reference
- [Pipeline & Deals](/workspace/crm/docs/features/pipeline.md) - Enquiry management (bookings can link to enquiries)
- [Database Schema](/workspace/crm/docs/database/schema.md) - Full database schema
