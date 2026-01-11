# Contacts API

> **Base URL:** `/api/contacts`
> **Authentication:** Required (not yet implemented)

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List contacts with filtering and pagination |
| POST | `/api/contacts` | Create a new contact |
| GET | `/api/contacts/:id` | Get a single contact by ID |
| PUT | `/api/contacts/:id` | Update a contact |
| DELETE | `/api/contacts/:id` | Soft-delete a contact |

---

## List Contacts

```
GET /api/contacts
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 20 | Items per page (max: 100) |
| `search` | string | - | Search in firstName, lastName, email |
| `status` | string | - | Filter by status enum |
| `source` | string | - | Filter by source enum |
| `tagId` | string | - | Filter by tag UUID |

### Response

```json
{
  "contacts": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "source": "WEBSITE",
      "status": "LEAD",
      "marketingOptIn": false,
      "emailStatus": "VALID",
      "notes": null,
      "createdAt": "2025-01-10T12:00:00.000Z",
      "updatedAt": "2025-01-10T12:00:00.000Z",
      "tags": [
        {
          "tag": {
            "id": "uuid",
            "name": "VIP",
            "color": "#FF5733"
          }
        }
      ]
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid query parameters |
| 500 | Server error |

---

## Create Contact

```
POST /api/contacts
```

### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "WEBSITE",
  "status": "LEAD",
  "marketingOptIn": false,
  "notes": "Met at conference",
  "tagIds": ["uuid-1", "uuid-2"]
}
```

### Field Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `firstName` | string | Yes | 1-100 characters |
| `lastName` | string | Yes | 1-100 characters |
| `email` | string | Yes | Valid email, max 255 chars, unique |
| `phone` | string | No | Max 50 characters |
| `source` | enum | No | Default: "OTHER" |
| `status` | enum | No | Default: "LEAD" |
| `marketingOptIn` | boolean | No | Default: false |
| `notes` | string | No | Max 5000 characters |
| `tagIds` | string[] | No | Array of valid UUIDs |

### Source Enum Values

- `WEBSITE` - Website form submission
- `REFERRAL` - Referred by existing contact
- `SOCIAL_MEDIA` - Social media channel
- `EVENT` - In-person event
- `OTHER` - Other source

### Status Enum Values

- `LEAD` - New lead, not yet qualified
- `PROSPECT` - Qualified prospect
- `CUSTOMER` - Active customer
- `CHURNED` - Former customer
- `INACTIVE` - Inactive contact

### Response

```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  ...
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | Created successfully |
| 400 | Validation error |
| 409 | Email already exists |
| 500 | Server error |

---

## Get Contact

```
GET /api/contacts/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Contact ID |

### Response

Returns full contact with tags and activities:

```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "WEBSITE",
  "status": "LEAD",
  "marketingOptIn": false,
  "emailStatus": "VALID",
  "notes": "Met at conference",
  "createdAt": "2025-01-10T12:00:00.000Z",
  "updatedAt": "2025-01-10T12:00:00.000Z",
  "tags": [
    {
      "tag": {
        "id": "uuid",
        "name": "VIP",
        "color": "#FF5733"
      }
    }
  ],
  "activities": [
    {
      "id": "uuid",
      "type": "CONTACT_CREATED",
      "description": "Contact John Doe was created",
      "metadata": {},
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
| 404 | Contact not found |
| 500 | Server error |

---

## Update Contact

```
PUT /api/contacts/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Contact ID |

### Request Body

All fields are optional (partial update):

```json
{
  "firstName": "Jane",
  "status": "CUSTOMER",
  "tagIds": ["uuid-1"]
}
```

### Response

Returns updated contact with tags.

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Updated successfully |
| 400 | Validation error or invalid UUID |
| 404 | Contact not found |
| 409 | Email already exists (if changing email) |
| 500 | Server error |

---

## Delete Contact

```
DELETE /api/contacts/:id
```

Performs a soft delete by setting `deletedAt` timestamp.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Contact ID |

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
| 404 | Contact not found |
| 500 | Server error |

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
  "error": "Validation failed",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```
