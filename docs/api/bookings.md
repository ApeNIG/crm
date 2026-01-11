# Bookings API

> **Base URL:** `/api/bookings`
> **Authentication:** Required (not yet implemented)

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List bookings with filtering and pagination |
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings/:id` | Get a single booking with activities |
| PUT | `/api/bookings/:id` | Update a booking |
| DELETE | `/api/bookings/:id` | Soft-delete a booking |
| PATCH | `/api/bookings/:id/status` | Update booking status (optimized) |
| GET | `/api/bookings/calendar` | Get bookings for calendar view |

---

## List Bookings

```
GET /api/bookings
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 100 | Items per page (max: 200) |
| `search` | string | - | Search in notes, location, contact name, email, or service type name |
| `status` | string | - | Filter by booking status enum |
| `contactId` | string | - | Filter by contact UUID |
| `serviceTypeId` | string | - | Filter by service type UUID |
| `dateFrom` | string | - | Filter bookings starting on or after (ISO 8601 datetime) |
| `dateTo` | string | - | Filter bookings starting on or before (ISO 8601 datetime) |

### Response

```json
{
  "bookings": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "contactId": "660e8400-e29b-41d4-a716-446655440001",
      "enquiryId": null,
      "serviceTypeId": "770e8400-e29b-41d4-a716-446655440002",
      "startAt": "2025-01-15T14:00:00.000Z",
      "endAt": "2025-01-15T15:30:00.000Z",
      "status": "CONFIRMED",
      "location": "123 Main Street, Suite 100",
      "virtualLink": null,
      "notes": "First-time client, mentioned by referral",
      "depositPaid": true,
      "depositPaidAt": "2025-01-10T10:30:00.000Z",
      "deletedAt": null,
      "createdAt": "2025-01-08T12:00:00.000Z",
      "updatedAt": "2025-01-10T10:30:00.000Z",
      "contact": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "email": "sarah@example.com",
        "phone": "+1234567890",
        "source": "REFERRAL",
        "status": "CUSTOMER"
      },
      "serviceType": {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "Consultation",
        "description": "Initial consultation session",
        "durationMinutes": 90,
        "price": "150.00",
        "isActive": true
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 100,
  "totalPages": 1
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid query parameters |
| 500 | Server error |

---

## Create Booking

```
POST /api/bookings
```

### Request Body

```json
{
  "contactId": "660e8400-e29b-41d4-a716-446655440001",
  "serviceTypeId": "770e8400-e29b-41d4-a716-446655440002",
  "enquiryId": "880e8400-e29b-41d4-a716-446655440003",
  "startAt": "2025-01-15T14:00:00.000Z",
  "endAt": "2025-01-15T15:30:00.000Z",
  "status": "REQUESTED",
  "location": "123 Main Street, Suite 100",
  "virtualLink": "https://zoom.us/j/123456789",
  "notes": "First-time client, mentioned by referral",
  "depositPaid": false
}
```

### Field Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `contactId` | string | Yes | Valid UUID of existing contact |
| `serviceTypeId` | string | Yes | Valid UUID of active service type |
| `enquiryId` | string | No | Valid UUID of existing enquiry |
| `startAt` | string | Yes | ISO 8601 datetime |
| `endAt` | string | Yes | ISO 8601 datetime |
| `status` | enum | No | Default: "REQUESTED" |
| `location` | string | No | Max 500 characters |
| `virtualLink` | string | No | Valid URL, max 500 characters |
| `notes` | string | No | Max 5000 characters |
| `depositPaid` | boolean | No | Default: false |

### Status Enum Values

- `REQUESTED` - Booking requested, awaiting confirmation
- `PENDING_DEPOSIT` - Awaiting deposit payment
- `CONFIRMED` - Booking confirmed
- `COMPLETED` - Appointment completed
- `CANCELLED` - Booking cancelled
- `NO_SHOW` - Client did not attend
- `RESCHEDULED` - Booking moved to new time

### Response

Returns the created booking with contact and service type relations:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "contactId": "660e8400-e29b-41d4-a716-446655440001",
  "serviceTypeId": "770e8400-e29b-41d4-a716-446655440002",
  "enquiryId": null,
  "startAt": "2025-01-15T14:00:00.000Z",
  "endAt": "2025-01-15T15:30:00.000Z",
  "status": "REQUESTED",
  "location": "123 Main Street, Suite 100",
  "virtualLink": null,
  "notes": "First-time client",
  "depositPaid": false,
  "depositPaidAt": null,
  "deletedAt": null,
  "createdAt": "2025-01-08T12:00:00.000Z",
  "updatedAt": "2025-01-08T12:00:00.000Z",
  "contact": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah@example.com"
  },
  "serviceType": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Consultation",
    "durationMinutes": 90,
    "price": "150.00"
  }
}
```

### Activity Logging

Creates a `BOOKING_CREATED` activity with payload:

```json
{
  "serviceTypeName": "Consultation",
  "startAt": "2025-01-15T14:00:00.000Z",
  "contactName": "Sarah Johnson"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | Created successfully |
| 400 | Validation error or inactive service type |
| 404 | Contact, service type, or enquiry not found |
| 500 | Server error |

---

## Get Booking

```
GET /api/bookings/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Booking ID |

### Response

Returns full booking with contact, service type, enquiry, and activity history:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "contactId": "660e8400-e29b-41d4-a716-446655440001",
  "enquiryId": null,
  "serviceTypeId": "770e8400-e29b-41d4-a716-446655440002",
  "startAt": "2025-01-15T14:00:00.000Z",
  "endAt": "2025-01-15T15:30:00.000Z",
  "status": "CONFIRMED",
  "location": "123 Main Street, Suite 100",
  "virtualLink": null,
  "notes": "First-time client",
  "depositPaid": true,
  "depositPaidAt": "2025-01-10T10:30:00.000Z",
  "deletedAt": null,
  "createdAt": "2025-01-08T12:00:00.000Z",
  "updatedAt": "2025-01-10T10:30:00.000Z",
  "contact": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah@example.com",
    "phone": "+1234567890",
    "source": "REFERRAL",
    "status": "CUSTOMER"
  },
  "serviceType": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Consultation",
    "description": "Initial consultation session",
    "durationMinutes": 90,
    "price": "150.00",
    "isActive": true
  },
  "enquiry": null,
  "activities": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "bookingId": "550e8400-e29b-41d4-a716-446655440000",
      "type": "BOOKING_STATUS_CHANGED",
      "payload": {
        "from": "PENDING_DEPOSIT",
        "to": "CONFIRMED"
      },
      "actorUserId": null,
      "createdAt": "2025-01-10T10:30:00.000Z"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "bookingId": "550e8400-e29b-41d4-a716-446655440000",
      "type": "BOOKING_STATUS_CHANGED",
      "payload": {
        "from": "REQUESTED",
        "to": "PENDING_DEPOSIT"
      },
      "actorUserId": null,
      "createdAt": "2025-01-09T09:00:00.000Z"
    },
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440006",
      "bookingId": "550e8400-e29b-41d4-a716-446655440000",
      "type": "BOOKING_CREATED",
      "payload": {
        "serviceTypeName": "Consultation",
        "startAt": "2025-01-15T14:00:00.000Z",
        "contactName": "Sarah Johnson"
      },
      "actorUserId": null,
      "createdAt": "2025-01-08T12:00:00.000Z"
    }
  ]
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid booking ID format |
| 404 | Booking not found |
| 500 | Server error |

---

## Update Booking

```
PUT /api/bookings/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Booking ID |

### Request Body

All fields are optional (partial update). The `contactId` cannot be changed.

```json
{
  "serviceTypeId": "770e8400-e29b-41d4-a716-446655440002",
  "startAt": "2025-01-16T10:00:00.000Z",
  "endAt": "2025-01-16T11:30:00.000Z",
  "status": "CONFIRMED",
  "location": "New location",
  "notes": "Updated notes",
  "depositPaid": true
}
```

### Response

Returns updated booking with contact, service type, enquiry, and activities.

### Activity Logging

Based on what changed, one of these activities is logged:

**BOOKING_RESCHEDULED** (if startAt or endAt changed):
```json
{
  "type": "BOOKING_RESCHEDULED",
  "payload": {
    "previousStartAt": "2025-01-15T14:00:00.000Z",
    "previousEndAt": "2025-01-15T15:30:00.000Z",
    "newStartAt": "2025-01-16T10:00:00.000Z",
    "newEndAt": "2025-01-16T11:30:00.000Z"
  }
}
```

**BOOKING_STATUS_CHANGED** (if status changed but not date/time):
```json
{
  "type": "BOOKING_STATUS_CHANGED",
  "payload": {
    "from": "REQUESTED",
    "to": "CONFIRMED"
  }
}
```

**BOOKING_UPDATED** (for other field changes):
```json
{
  "type": "BOOKING_UPDATED",
  "payload": {
    "changes": {
      "location": { "from": "Old location", "to": "New location" },
      "depositPaid": { "from": false, "to": true }
    }
  }
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Updated successfully |
| 400 | Validation error or inactive service type |
| 404 | Booking, service type, or enquiry not found |
| 500 | Server error |

---

## Delete Booking

```
DELETE /api/bookings/:id
```

Performs a soft delete by setting `deletedAt` timestamp.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Booking ID |

### Response

```json
{
  "success": true
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Deleted successfully |
| 400 | Invalid booking ID format |
| 404 | Booking not found |
| 500 | Server error |

---

## Update Status

```
PATCH /api/bookings/:id/status
```

Optimized endpoint for quick status updates. Skips update if status unchanged.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Booking ID |

### Request Body

```json
{
  "status": "CONFIRMED"
}
```

### Response (status changed)

```json
{
  "success": true,
  "status": "CONFIRMED",
  "previousStatus": "REQUESTED"
}
```

### Response (status unchanged)

```json
{
  "success": true,
  "status": "CONFIRMED"
}
```

### Activity Logging

When the status changes, logs a `BOOKING_STATUS_CHANGED` activity:

```json
{
  "type": "BOOKING_STATUS_CHANGED",
  "payload": {
    "from": "REQUESTED",
    "to": "CONFIRMED"
  }
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid status value or ID format |
| 404 | Booking not found |
| 500 | Server error |

---

## Calendar Bookings

```
GET /api/bookings/calendar
```

Fetch bookings for a date range, optimized for calendar display.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | Yes | Range start (ISO 8601 datetime) |
| `endDate` | string | Yes | Range end (ISO 8601 datetime) |

### Response

```json
{
  "bookings": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "contactId": "660e8400-e29b-41d4-a716-446655440001",
      "serviceTypeId": "770e8400-e29b-41d4-a716-446655440002",
      "startAt": "2025-01-15T14:00:00.000Z",
      "endAt": "2025-01-15T15:30:00.000Z",
      "status": "CONFIRMED",
      "location": "123 Main Street",
      "virtualLink": null,
      "notes": null,
      "depositPaid": true,
      "contact": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "email": "sarah@example.com"
      },
      "serviceType": {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "Consultation",
        "durationMinutes": 90,
        "price": "150.00"
      }
    }
  ]
}
```

### Notes

- Returns bookings that **overlap** with the date range (not just those starting within it)
- A booking overlaps if: `booking.startAt < endDate AND booking.endAt > startDate`
- Excludes soft-deleted bookings

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Missing or invalid date parameters |
| 500 | Server error |

---

## Activity Types

Activities are automatically logged for booking events:

| Type | Description | Payload |
|------|-------------|---------|
| `BOOKING_CREATED` | New booking created | `{ serviceTypeName, startAt, contactName }` |
| `BOOKING_UPDATED` | Booking fields updated | `{ changes: { field: { from, to } } }` |
| `BOOKING_STATUS_CHANGED` | Status changed | `{ from, to }` |
| `BOOKING_RESCHEDULED` | Date/time changed | `{ previousStartAt, previousEndAt, newStartAt, newEndAt }` |
| `BOOKING_NOTE_ADDED` | Note added | `{ preview }` |

---

## Error Response Format

All errors return a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

For validation errors (400):

```json
{
  "error": "Invalid booking data",
  "details": {
    "issues": [
      {
        "path": ["startAt"],
        "message": "Invalid start date/time"
      }
    ]
  }
}
```
