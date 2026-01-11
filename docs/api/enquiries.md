# Enquiries API

> **Base URL:** `/api/enquiries`
> **Authentication:** Required (not yet implemented)

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enquiries` | List enquiries with filtering and pagination |
| POST | `/api/enquiries` | Create a new enquiry |
| GET | `/api/enquiries/:id` | Get a single enquiry with activities |
| PUT | `/api/enquiries/:id` | Update an enquiry |
| DELETE | `/api/enquiries/:id` | Soft-delete an enquiry |
| PATCH | `/api/enquiries/:id/stage` | Update enquiry stage (optimized for drag-drop) |

---

## List Enquiries

```
GET /api/enquiries
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 100 | Items per page (max: 200) |
| `search` | string | - | Search in message, contact name, or email |
| `stage` | string | - | Filter by stage enum |
| `enquiryType` | string | - | Filter by enquiry type enum |
| `contactId` | string | - | Filter by contact UUID |

### Response

```json
{
  "enquiries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "contactId": "660e8400-e29b-41d4-a716-446655440001",
      "enquiryType": "SERVICE",
      "message": "Interested in your wedding photography package",
      "preferredDate": "2025-06-15T00:00:00.000Z",
      "preferredTime": "14:00",
      "estimatedValue": 2500.00,
      "stage": "QUALIFIED",
      "nextActionAt": "2025-01-15T10:00:00.000Z",
      "sourceUrl": "https://example.com/contact",
      "deletedAt": null,
      "createdAt": "2025-01-10T12:00:00.000Z",
      "updatedAt": "2025-01-10T14:30:00.000Z",
      "contact": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "email": "sarah@example.com",
        "phone": "+1234567890",
        "source": "WEBSITE",
        "status": "LEAD"
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

## Create Enquiry

```
POST /api/enquiries
```

### Request Body

```json
{
  "contactId": "660e8400-e29b-41d4-a716-446655440001",
  "enquiryType": "SERVICE",
  "message": "Interested in your wedding photography package",
  "preferredDate": "2025-06-15T00:00:00.000Z",
  "preferredTime": "14:00",
  "estimatedValue": 2500.00,
  "stage": "NEW",
  "nextActionAt": "2025-01-15T10:00:00.000Z",
  "sourceUrl": "https://example.com/contact"
}
```

### Field Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `contactId` | string | Yes | Valid UUID of existing contact |
| `enquiryType` | enum | No | Default: "GENERAL" |
| `message` | string | No | Max 5000 characters |
| `preferredDate` | string | No | ISO 8601 datetime |
| `preferredTime` | string | No | Max 20 characters |
| `estimatedValue` | number | No | Min 0 |
| `stage` | enum | No | Default: "NEW" |
| `nextActionAt` | string | No | ISO 8601 datetime |
| `sourceUrl` | string | No | Valid URL, max 500 characters |

### Stage Enum Values

- `NEW` - Fresh enquiry, not yet reviewed
- `AUTO_RESPONDED` - Automated response sent
- `CONTACTED` - Manual outreach made
- `QUALIFIED` - Lead is qualified and interested
- `PROPOSAL_SENT` - Proposal or quote delivered
- `BOOKED_PAID` - Deal closed successfully
- `LOST` - Deal did not close

### Enquiry Type Enum Values

- `GENERAL` - General enquiry
- `SERVICE` - Service-related enquiry
- `PRODUCT` - Product-related enquiry
- `PARTNERSHIP` - Partnership opportunity

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "contactId": "660e8400-e29b-41d4-a716-446655440001",
  "enquiryType": "SERVICE",
  "message": "Interested in your wedding photography package",
  "preferredDate": "2025-06-15T00:00:00.000Z",
  "preferredTime": "14:00",
  "estimatedValue": 2500.00,
  "stage": "NEW",
  "nextActionAt": "2025-01-15T10:00:00.000Z",
  "sourceUrl": "https://example.com/contact",
  "deletedAt": null,
  "createdAt": "2025-01-10T12:00:00.000Z",
  "updatedAt": "2025-01-10T12:00:00.000Z",
  "contact": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah@example.com"
  }
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | Created successfully |
| 400 | Validation error |
| 404 | Contact not found |
| 500 | Server error |

---

## Get Enquiry

```
GET /api/enquiries/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Enquiry ID |

### Response

Returns full enquiry with contact and activity history:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "contactId": "660e8400-e29b-41d4-a716-446655440001",
  "enquiryType": "SERVICE",
  "message": "Interested in your wedding photography package",
  "preferredDate": "2025-06-15T00:00:00.000Z",
  "preferredTime": "14:00",
  "estimatedValue": 2500.00,
  "stage": "QUALIFIED",
  "nextActionAt": "2025-01-15T10:00:00.000Z",
  "sourceUrl": "https://example.com/contact",
  "deletedAt": null,
  "createdAt": "2025-01-10T12:00:00.000Z",
  "updatedAt": "2025-01-10T14:30:00.000Z",
  "contact": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah@example.com",
    "phone": "+1234567890",
    "source": "WEBSITE",
    "status": "LEAD"
  },
  "activities": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "enquiryId": "550e8400-e29b-41d4-a716-446655440000",
      "type": "STAGE_CHANGED",
      "payload": {
        "from": "CONTACTED",
        "to": "QUALIFIED"
      },
      "actorUserId": null,
      "createdAt": "2025-01-10T14:30:00.000Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "enquiryId": "550e8400-e29b-41d4-a716-446655440000",
      "type": "STAGE_CHANGED",
      "payload": {
        "from": "NEW",
        "to": "CONTACTED"
      },
      "actorUserId": null,
      "createdAt": "2025-01-10T13:00:00.000Z"
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "enquiryId": "550e8400-e29b-41d4-a716-446655440000",
      "type": "ENQUIRY_CREATED",
      "payload": {
        "enquiryType": "SERVICE",
        "contactName": "Sarah Johnson"
      },
      "actorUserId": null,
      "createdAt": "2025-01-10T12:00:00.000Z"
    }
  ]
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 404 | Enquiry not found |
| 500 | Server error |

---

## Update Enquiry

```
PUT /api/enquiries/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Enquiry ID |

### Request Body

All fields are optional (partial update). The `contactId` cannot be changed.

```json
{
  "enquiryType": "PRODUCT",
  "message": "Updated message",
  "estimatedValue": 3000.00,
  "stage": "PROPOSAL_SENT",
  "nextActionAt": "2025-01-20T10:00:00.000Z"
}
```

### Response

Returns updated enquiry with contact and activities.

### Activity Logging

- If `stage` changes, logs a `STAGE_CHANGED` activity with from/to
- If other fields change, logs an `ENQUIRY_UPDATED` activity with changed fields

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Updated successfully |
| 400 | Validation error |
| 404 | Enquiry not found |
| 500 | Server error |

---

## Delete Enquiry

```
DELETE /api/enquiries/:id
```

Performs a soft delete by setting `deletedAt` timestamp.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Enquiry ID |

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
| 404 | Enquiry not found |
| 500 | Server error |

---

## Update Stage

```
PATCH /api/enquiries/:id/stage
```

Optimized endpoint for drag-and-drop stage updates. Skips unnecessary updates if stage is unchanged.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Enquiry ID |

### Request Body

```json
{
  "stage": "QUALIFIED"
}
```

### Response (stage changed)

```json
{
  "success": true,
  "stage": "QUALIFIED",
  "previousStage": "CONTACTED"
}
```

### Response (stage unchanged)

```json
{
  "success": true,
  "stage": "QUALIFIED"
}
```

### Activity Logging

When the stage changes, logs a `STAGE_CHANGED` activity:

```json
{
  "type": "STAGE_CHANGED",
  "payload": {
    "from": "CONTACTED",
    "to": "QUALIFIED"
  }
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid stage value |
| 404 | Enquiry not found |
| 500 | Server error |

---

## Activity Types

Activities are automatically logged for enquiry events:

| Type | Description | Payload |
|------|-------------|---------|
| `ENQUIRY_CREATED` | New enquiry created | `{ enquiryType, contactName }` |
| `ENQUIRY_UPDATED` | Enquiry fields updated | `{ changes: { field: { from, to } } }` |
| `STAGE_CHANGED` | Stage changed | `{ from, to }` |
| `NOTE_ADDED` | Note added | `{ note }` |

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
  "error": "Invalid enquiry data",
  "details": {
    "issues": [
      {
        "path": ["estimatedValue"],
        "message": "Value cannot be negative"
      }
    ]
  }
}
```
