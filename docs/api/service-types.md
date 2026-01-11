# Service Types API

> **Base URL:** `/api/service-types`
> **Authentication:** Required (not yet implemented)

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/service-types` | List service types with filtering and pagination |
| POST | `/api/service-types` | Create a new service type |
| GET | `/api/service-types/:id` | Get a single service type |
| PUT | `/api/service-types/:id` | Update a service type |
| DELETE | `/api/service-types/:id` | Deactivate a service type |

---

## List Service Types

```
GET /api/service-types
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 50 | Items per page (max: 100) |
| `isActive` | string | - | Filter by active status ("true" or "false") |

### Response

```json
{
  "serviceTypes": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Consultation",
      "description": "Initial consultation session to discuss your needs",
      "durationMinutes": 90,
      "price": "150.00",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Follow-up Session",
      "description": "Follow-up appointment for existing clients",
      "durationMinutes": 60,
      "price": "100.00",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

### Notes

- Service types are ordered alphabetically by name
- Price is returned as a string (Prisma Decimal type)
- Inactive service types are included unless filtered with `isActive=true`

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid query parameters |
| 500 | Server error |

---

## Create Service Type

```
POST /api/service-types
```

### Request Body

```json
{
  "name": "Workshop",
  "description": "Full-day workshop session",
  "durationMinutes": 480,
  "price": 500.00,
  "isActive": true
}
```

### Field Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | 1-100 characters |
| `description` | string | No | Max 1000 characters |
| `durationMinutes` | number | No | 5-480 minutes, must be integer. Default: 60 |
| `price` | number | No | Min 0, nullable for free services |
| `isActive` | boolean | No | Default: true |

### Response

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "name": "Workshop",
  "description": "Full-day workshop session",
  "durationMinutes": 480,
  "price": "500.00",
  "isActive": true,
  "createdAt": "2025-01-10T12:00:00.000Z",
  "updatedAt": "2025-01-10T12:00:00.000Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | Created successfully |
| 400 | Validation error |
| 500 | Server error |

---

## Get Service Type

```
GET /api/service-types/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Service type ID |

### Response

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Consultation",
  "description": "Initial consultation session to discuss your needs",
  "durationMinutes": 90,
  "price": "150.00",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid service type ID format |
| 404 | Service type not found |
| 500 | Server error |

---

## Update Service Type

```
PUT /api/service-types/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Service type ID |

### Request Body

All fields are optional (partial update).

```json
{
  "name": "Extended Consultation",
  "durationMinutes": 120,
  "price": 200.00
}
```

### Response

Returns the updated service type:

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Extended Consultation",
  "description": "Initial consultation session to discuss your needs",
  "durationMinutes": 120,
  "price": "200.00",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-10T14:30:00.000Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Updated successfully |
| 400 | Validation error |
| 404 | Service type not found |
| 500 | Server error |

---

## Deactivate Service Type

```
DELETE /api/service-types/:id
```

Sets `isActive = false` instead of deleting. This preserves referential integrity with existing bookings that reference this service type.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Service type ID |

### Response

```json
{
  "success": true
}
```

### Notes

- Deactivated service types are not available for new bookings
- Existing bookings retain their reference to the service type
- Use `PUT` with `isActive: true` to reactivate a service type

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Deactivated successfully |
| 400 | Invalid service type ID format |
| 404 | Service type not found |
| 500 | Server error |

---

## Duration Guidelines

The `durationMinutes` field enforces these constraints:

| Constraint | Value | Reason |
|------------|-------|--------|
| Minimum | 5 minutes | Practical minimum for any service |
| Maximum | 480 minutes (8 hours) | Reasonable maximum for a single appointment |
| Must be integer | Yes | Partial minutes not supported |
| Default | 60 minutes | Standard hour-long appointment |

### Common Durations

| Duration | Minutes |
|----------|---------|
| Quick check-in | 15 |
| Standard session | 60 |
| Extended session | 90 |
| Half-day | 240 |
| Full-day | 480 |

---

## Price Handling

The `price` field uses Prisma Decimal type for accurate financial calculations:

- **Storage:** Decimal(10, 2) - up to 10 digits with 2 decimal places
- **Response format:** String (e.g., "150.00") to preserve precision
- **Null handling:** Null or undefined price indicates a free service
- **Minimum:** Cannot be negative

### Examples

```json
// Paid service
{ "price": 150.00 }  // Request
{ "price": "150.00" } // Response

// Free service
{ "price": null }     // Request
{ "price": null }     // Response

// Zero price (also free)
{ "price": 0 }        // Request
{ "price": "0.00" }   // Response
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
  "error": "Invalid service type data",
  "details": {
    "issues": [
      {
        "path": ["name"],
        "message": "Name is required"
      },
      {
        "path": ["durationMinutes"],
        "message": "Duration must be at least 5 minutes"
      }
    ]
  }
}
```
