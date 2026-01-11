# Invoices API

> **Base URL:** `/api/invoices`
> **Authentication:** Required (not yet implemented)

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices with filtering and pagination |
| POST | `/api/invoices` | Create a new invoice |
| GET | `/api/invoices/:id` | Get a single invoice by ID |
| PUT | `/api/invoices/:id` | Update a draft invoice |
| DELETE | `/api/invoices/:id` | Soft-delete an invoice |
| PATCH | `/api/invoices/:id/status` | Update invoice status |
| POST | `/api/invoices/:id/send` | Mark invoice as sent |
| POST | `/api/invoices/:id/line-items` | Add a line item |
| PUT | `/api/invoices/:id/line-items/:itemId` | Update a line item |
| DELETE | `/api/invoices/:id/line-items/:itemId` | Delete a line item |
| POST | `/api/invoices/:id/payments` | Record a payment |
| DELETE | `/api/invoices/:id/payments/:paymentId` | Delete a payment |
| POST | `/api/invoices/from-booking/:bookingId` | Create invoice from booking |

---

## List Invoices

```
GET /api/invoices
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 100 | Items per page (max: 200) |
| `search` | string | - | Search in invoice number, notes, contact name/email |
| `status` | string | - | Filter by status enum |
| `contactId` | UUID | - | Filter by contact ID |
| `bookingId` | UUID | - | Filter by booking ID |
| `dateFrom` | ISO date | - | Filter by issue date (from) |
| `dateTo` | ISO date | - | Filter by issue date (to) |

### Response

```json
{
  "invoices": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-2025-0001",
      "contactId": "uuid",
      "bookingId": "uuid",
      "status": "DRAFT",
      "issueDate": "2025-01-10T00:00:00.000Z",
      "dueDate": "2025-02-09T00:00:00.000Z",
      "subtotal": "100.00",
      "taxRate": "20.00",
      "taxAmount": "20.00",
      "total": "120.00",
      "amountPaid": "0.00",
      "amountDue": "120.00",
      "notes": null,
      "terms": null,
      "createdAt": "2025-01-10T12:00:00.000Z",
      "updatedAt": "2025-01-10T12:00:00.000Z",
      "contact": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "booking": {
        "id": "uuid",
        "startAt": "2025-01-15T10:00:00.000Z",
        "serviceType": {
          "id": "uuid",
          "name": "Photography Session"
        }
      },
      "_count": {
        "lineItems": 2,
        "payments": 0
      }
    }
  ],
  "total": 50,
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

## Create Invoice

```
POST /api/invoices
```

### Request Body

```json
{
  "contactId": "uuid",
  "bookingId": "uuid",
  "issueDate": "2025-01-10T00:00:00.000Z",
  "dueDate": "2025-02-09T00:00:00.000Z",
  "taxRate": 20,
  "notes": "Thank you for your business",
  "terms": "Payment due within 30 days",
  "lineItems": [
    {
      "description": "Photography Session",
      "quantity": 1,
      "unitPrice": 100,
      "sortOrder": 0
    }
  ]
}
```

### Field Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `contactId` | UUID | Yes | Must exist and not be deleted |
| `bookingId` | UUID | No | Must exist and not be deleted if provided |
| `issueDate` | ISO date | No | Defaults to now |
| `dueDate` | ISO date | Yes | - |
| `taxRate` | number | No | 0-100, defaults to 0 |
| `notes` | string | No | Max 2000 characters |
| `terms` | string | No | Max 2000 characters |
| `lineItems` | array | No | Array of line item objects |

### Line Item Object

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `description` | string | Yes | 1-500 characters |
| `quantity` | number | No | > 0, defaults to 1 |
| `unitPrice` | number | Yes | >= 0 |
| `sortOrder` | number | No | >= 0, defaults to index |

### Response

Returns the created invoice with all relations (contact, booking, lineItems, payments, activities).

```json
{
  "id": "uuid",
  "invoiceNumber": "INV-2025-0001",
  "status": "DRAFT",
  ...
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | Created successfully |
| 400 | Validation error |
| 404 | Contact or booking not found |
| 500 | Server error |

---

## Get Invoice

```
GET /api/invoices/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Invoice ID |

### Response

Returns full invoice with all relations:

```json
{
  "id": "uuid",
  "invoiceNumber": "INV-2025-0001",
  "contactId": "uuid",
  "bookingId": "uuid",
  "status": "DRAFT",
  "issueDate": "2025-01-10T00:00:00.000Z",
  "dueDate": "2025-02-09T00:00:00.000Z",
  "subtotal": "100.00",
  "taxRate": "20.00",
  "taxAmount": "20.00",
  "total": "120.00",
  "amountPaid": "0.00",
  "amountDue": "120.00",
  "notes": null,
  "terms": null,
  "contact": { ... },
  "booking": { ... },
  "lineItems": [
    {
      "id": "uuid",
      "description": "Photography Session",
      "quantity": "1.00",
      "unitPrice": "100.00",
      "total": "100.00",
      "sortOrder": 0
    }
  ],
  "payments": [],
  "activities": [
    {
      "id": "uuid",
      "type": "INVOICE_CREATED",
      "payload": { "invoiceNumber": "INV-2025-0001", ... },
      "createdAt": "2025-01-10T12:00:00.000Z"
    }
  ]
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid UUID format |
| 404 | Invoice not found |
| 500 | Server error |

---

## Update Invoice

```
PUT /api/invoices/:id
```

**Note:** Only DRAFT invoices can be updated.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Invoice ID |

### Request Body

All fields are optional (partial update):

```json
{
  "issueDate": "2025-01-15T00:00:00.000Z",
  "dueDate": "2025-02-14T00:00:00.000Z",
  "taxRate": 10,
  "notes": "Updated notes",
  "terms": "Updated terms"
}
```

**Note:** `contactId` and `bookingId` cannot be changed after creation.

### Response

Returns updated invoice with all relations.

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Updated successfully |
| 400 | Validation error, invalid UUID, or not a DRAFT invoice |
| 404 | Invoice not found |
| 500 | Server error |

---

## Delete Invoice

```
DELETE /api/invoices/:id
```

Performs a soft delete by setting `deletedAt` timestamp.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Invoice ID |

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
| 400 | Invalid UUID format |
| 404 | Invoice not found |
| 500 | Server error |

---

## Update Invoice Status

```
PATCH /api/invoices/:id/status
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Invoice ID |

### Request Body

```json
{
  "status": "OVERDUE"
}
```

### Status Enum Values

- `DRAFT` - New invoice being prepared
- `SENT` - Invoice delivered to customer
- `PARTIALLY_PAID` - Some payment received
- `PAID` - Fully paid
- `OVERDUE` - Past due date, unpaid
- `CANCELLED` - Invoice cancelled

### Response

```json
{
  "success": true,
  "status": "OVERDUE",
  "previousStatus": "SENT"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Status updated successfully |
| 400 | Invalid status or UUID |
| 404 | Invoice not found |
| 500 | Server error |

---

## Send Invoice

```
POST /api/invoices/:id/send
```

Marks a DRAFT invoice as SENT. Creates status change and send activities.

**Note:** Only DRAFT invoices can be sent.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Invoice ID |

### Response

Returns the updated invoice with all relations.

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Invoice sent successfully |
| 400 | Invalid UUID or not a DRAFT invoice |
| 404 | Invoice not found |
| 500 | Server error |

---

## Add Line Item

```
POST /api/invoices/:id/line-items
```

**Note:** Only DRAFT invoices can have line items added.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Invoice ID |

### Request Body

```json
{
  "description": "Additional Service",
  "quantity": 2,
  "unitPrice": 50.00,
  "sortOrder": 1
}
```

### Field Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `description` | string | Yes | 1-500 characters |
| `quantity` | number | No | > 0, defaults to 1 |
| `unitPrice` | number | Yes | >= 0 |
| `sortOrder` | number | No | >= 0, auto-increments |

### Response

Returns the created line item:

```json
{
  "id": "uuid",
  "invoiceId": "uuid",
  "description": "Additional Service",
  "quantity": "2.00",
  "unitPrice": "50.00",
  "total": "100.00",
  "sortOrder": 1,
  "createdAt": "2025-01-10T12:00:00.000Z",
  "updatedAt": "2025-01-10T12:00:00.000Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | Line item added successfully |
| 400 | Validation error, invalid UUID, or not a DRAFT invoice |
| 404 | Invoice not found |
| 500 | Server error |

---

## Update Line Item

```
PUT /api/invoices/:id/line-items/:itemId
```

**Note:** Only line items on DRAFT invoices can be updated.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Invoice ID |
| `itemId` | UUID | Line item ID |

### Request Body

All fields are optional (partial update):

```json
{
  "description": "Updated description",
  "quantity": 3,
  "unitPrice": 75.00,
  "sortOrder": 2
}
```

### Response

Returns the updated line item.

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Line item updated successfully |
| 400 | Validation error, invalid UUID, or not a DRAFT invoice |
| 404 | Invoice or line item not found |
| 500 | Server error |

---

## Delete Line Item

```
DELETE /api/invoices/:id/line-items/:itemId
```

**Note:** Only line items on DRAFT invoices can be deleted.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Invoice ID |
| `itemId` | UUID | Line item ID |

### Response

```json
{
  "success": true
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Line item deleted successfully |
| 400 | Invalid UUID or not a DRAFT invoice |
| 404 | Invoice or line item not found |
| 500 | Server error |

---

## Record Payment

```
POST /api/invoices/:id/payments
```

**Note:** Only SENT, PARTIALLY_PAID, or OVERDUE invoices can accept payments.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Invoice ID |

### Request Body

```json
{
  "amount": 50.00,
  "method": "CARD",
  "reference": "TXN-123456",
  "notes": "Partial payment",
  "paidAt": "2025-01-10T14:30:00.000Z"
}
```

### Field Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `amount` | number | Yes | > 0 |
| `method` | enum | No | Defaults to "OTHER" |
| `reference` | string | No | Max 200 characters |
| `notes` | string | No | Max 1000 characters |
| `paidAt` | ISO date | No | Defaults to now |

### Payment Method Enum Values

- `CASH` - Cash payment
- `CARD` - Card payment
- `BANK_TRANSFER` - Bank transfer
- `STRIPE` - Stripe payment
- `OTHER` - Other method

### Automatic Status Updates

- If payment brings total paid >= invoice total: status becomes `PAID`
- If payment brings total paid > 0 but < invoice total: status becomes `PARTIALLY_PAID`

### Response

Returns the created payment:

```json
{
  "id": "uuid",
  "invoiceId": "uuid",
  "amount": "50.00",
  "method": "CARD",
  "reference": "TXN-123456",
  "notes": "Partial payment",
  "paidAt": "2025-01-10T14:30:00.000Z",
  "createdAt": "2025-01-10T14:30:00.000Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | Payment recorded successfully |
| 400 | Validation error, invalid UUID, or invalid invoice status |
| 404 | Invoice not found |
| 500 | Server error |

---

## Delete Payment

```
DELETE /api/invoices/:id/payments/:paymentId
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Invoice ID |
| `paymentId` | UUID | Payment ID |

### Automatic Status Updates

- If remaining total paid becomes 0: status reverts to `SENT`
- If remaining total paid > 0 but < invoice total: status becomes `PARTIALLY_PAID`

### Response

```json
{
  "success": true
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Payment deleted successfully |
| 400 | Invalid UUID format |
| 404 | Invoice or payment not found |
| 500 | Server error |

---

## Create Invoice from Booking

```
POST /api/invoices/from-booking/:bookingId
```

Generates an invoice directly from an existing booking.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `bookingId` | UUID | Booking ID |

### Request Body (Optional)

```json
{
  "dueDate": "2025-02-14T00:00:00.000Z",
  "taxRate": 20
}
```

### Default Values

- Issue date: Current date
- Due date: 30 days from now (if not specified)
- Tax rate: 0 (if not specified)
- Line item: Service type name + booking date

### Response

Returns the created invoice with all relations.

### Status Codes

| Code | Description |
|------|-------------|
| 201 | Invoice created successfully |
| 400 | Invalid UUID or invoice already exists for booking |
| 404 | Booking not found |
| 500 | Server error |

### Error Response (Invoice Already Exists)

```json
{
  "error": "An invoice already exists for this booking",
  "invoiceId": "uuid"
}
```

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
  "error": "Invalid invoice data",
  "details": {
    "issues": [
      {
        "path": ["dueDate"],
        "message": "Invalid due date"
      }
    ]
  }
}
```
