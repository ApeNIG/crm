# Dashboard API

> **Base URL:** `/api/dashboard`
> **Authentication:** Required (not yet implemented)

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Full dashboard data with metrics and breakdowns |
| GET | `/api/dashboard/activity` | Paginated activity feed |

---

## Get Dashboard Data

```
GET /api/dashboard
```

Returns all dashboard metrics, breakdowns, and recent activity in a single request.

### Response

```json
{
  "metrics": {
    "totalContacts": 150,
    "activeEnquiries": 23,
    "upcomingBookings": 8,
    "outstandingAmount": 4500.00,
    "revenueThisMonth": 12750.00
  },
  "enquiryBreakdown": [
    { "stage": "NEW", "count": 5 },
    { "stage": "CONTACTED", "count": 8 },
    { "stage": "QUALIFIED", "count": 6 },
    { "stage": "PROPOSAL_SENT", "count": 2 },
    { "stage": "NEGOTIATION", "count": 2 },
    { "stage": "BOOKED_PAID", "count": 45 },
    { "stage": "LOST", "count": 12 }
  ],
  "bookingBreakdown": [
    { "status": "CONFIRMED", "todayCount": 3, "weekCount": 8 },
    { "status": "PENDING", "todayCount": 1, "weekCount": 4 },
    { "status": "COMPLETED", "todayCount": 2, "weekCount": 5 }
  ],
  "invoiceBreakdown": [
    { "status": "DRAFT", "count": 3, "totalAmount": 1500.00 },
    { "status": "SENT", "count": 8, "totalAmount": 3200.00 },
    { "status": "PARTIALLY_PAID", "count": 2, "totalAmount": 800.00 },
    { "status": "PAID", "count": 45, "totalAmount": 28500.00 },
    { "status": "OVERDUE", "count": 1, "totalAmount": 500.00 }
  ],
  "recentActivity": [
    {
      "id": "uuid",
      "entityType": "booking",
      "entityId": "uuid",
      "type": "BOOKING_CREATED",
      "description": "John Doe - Photography Session: Booking created",
      "href": "/bookings/uuid",
      "createdAt": "2026-01-10T14:30:00.000Z"
    }
  ]
}
```

### Response Schema

#### DashboardMetrics

| Field | Type | Description |
|-------|------|-------------|
| `totalContacts` | number | Non-deleted contact count |
| `activeEnquiries` | number | Enquiries not in BOOKED_PAID or LOST |
| `upcomingBookings` | number | CONFIRMED bookings in next 7 days |
| `outstandingAmount` | number | Sum of amountDue for unpaid invoices |
| `revenueThisMonth` | number | Sum of payments in current month |

#### EnquiryStageBreakdown

| Field | Type | Description |
|-------|------|-------------|
| `stage` | EnquiryStage | Pipeline stage enum |
| `count` | number | Enquiry count in stage |

#### BookingStatusBreakdown

| Field | Type | Description |
|-------|------|-------------|
| `status` | BookingStatus | Booking status enum |
| `todayCount` | number | Bookings with startAt today |
| `weekCount` | number | Bookings with startAt in next 7 days |

#### InvoiceStatusBreakdown

| Field | Type | Description |
|-------|------|-------------|
| `status` | InvoiceStatus | Invoice status enum |
| `count` | number | Invoice count with status |
| `totalAmount` | number | Sum of invoice totals |

#### DashboardActivityItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Activity ID |
| `entityType` | "contact" \| "enquiry" \| "booking" \| "invoice" | Entity type |
| `entityId` | string | Related entity ID |
| `type` | string | Activity type (e.g., BOOKING_CREATED) |
| `description` | string | Human-readable description |
| `href` | string | Link to entity detail page |
| `createdAt` | string | ISO 8601 timestamp |

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 500 | Server error |

---

## Get Activity Feed

```
GET /api/dashboard/activity
```

Returns a paginated activity feed with optional filtering by entity type.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 20 | Items per page (1-100) |
| `entityType` | string | - | Filter by: contact, enquiry, booking, invoice |

### Example Requests

```bash
# Get first page of all activities
GET /api/dashboard/activity

# Get page 2 with 50 items
GET /api/dashboard/activity?page=2&limit=50

# Get only booking activities
GET /api/dashboard/activity?entityType=booking
```

### Response

```json
{
  "activities": [
    {
      "id": "uuid",
      "entityType": "invoice",
      "entityId": "uuid",
      "type": "PAYMENT_RECORDED",
      "description": "INV-2026-0015 (Jane Smith): Payment of 500.00 recorded",
      "href": "/invoices/uuid",
      "createdAt": "2026-01-10T15:45:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `activities` | DashboardActivityItem[] | Array of activity items |
| `total` | number | Total activity count |
| `page` | number | Current page number |
| `limit` | number | Items per page |
| `hasMore` | boolean | Whether more pages exist |

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid query parameters |
| 500 | Server error |

---

## Activity Types Reference

### Contact Activities

| Type | Description Format |
|------|-------------------|
| CONTACT_CREATED | "{name}: Contact created" |
| CONTACT_UPDATED | "{name}: {field} updated" or "{name}: {n} fields updated" |
| NOTE_ADDED | "{name}: {preview}" |
| TAG_ADDED | "{name}: Tag \"{tagName}\" added" |
| TAG_REMOVED | "{name}: Tag \"{tagName}\" removed" |

### Enquiry Activities

| Type | Description Format |
|------|-------------------|
| ENQUIRY_CREATED | "{name}: Enquiry created" |
| ENQUIRY_UPDATED | "{name}: Enquiry updated" |
| STAGE_CHANGED | "{name}: Stage changed to {stage}" |

### Booking Activities

| Type | Description Format |
|------|-------------------|
| BOOKING_CREATED | "{name} - {service}: Booking created" |
| BOOKING_UPDATED | "{name} - {service}: Booking updated" |
| BOOKING_STATUS_CHANGED | "{name} - {service}: Status changed to {status}" |
| BOOKING_RESCHEDULED | "{name} - {service}: Booking rescheduled" |
| BOOKING_NOTE_ADDED | "{name} - {service}: Booking note added" |

### Invoice Activities

| Type | Description Format |
|------|-------------------|
| INVOICE_CREATED | "{invoiceNumber} ({name}): Invoice {number} created" |
| INVOICE_UPDATED | "{invoiceNumber} ({name}): Invoice updated" |
| INVOICE_STATUS_CHANGED | "{invoiceNumber} ({name}): Status changed to {status}" |
| INVOICE_SENT | "{invoiceNumber} ({name}): Invoice sent" |
| PAYMENT_RECORDED | "{invoiceNumber} ({name}): Payment of {amount} recorded" |
| PAYMENT_DELETED | "{invoiceNumber} ({name}): Payment deleted" |
| LINE_ITEM_ADDED | "{invoiceNumber} ({name}): Line item \"{desc}\" added" |
| LINE_ITEM_UPDATED | "{invoiceNumber} ({name}): Line item updated" |
| LINE_ITEM_DELETED | "{invoiceNumber} ({name}): Line item deleted" |

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
  "error": "Invalid query parameters",
  "details": [
    {
      "path": ["page"],
      "message": "Expected number, received string"
    }
  ]
}
```
