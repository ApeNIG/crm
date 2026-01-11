# Tags API

> **Base URL:** `/api/tags`
> **Authentication:** Required (not yet implemented)

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tags` | List all tags |
| POST | `/api/tags` | Create a new tag |

---

## List Tags

```
GET /api/tags
```

### Response

```json
{
  "tags": [
    {
      "id": "uuid",
      "name": "VIP",
      "color": "#FF5733",
      "createdAt": "2025-01-10T12:00:00.000Z",
      "updatedAt": "2025-01-10T12:00:00.000Z"
    },
    {
      "id": "uuid",
      "name": "Newsletter",
      "color": "#3498DB",
      "createdAt": "2025-01-10T12:00:00.000Z",
      "updatedAt": "2025-01-10T12:00:00.000Z"
    }
  ]
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 500 | Server error |

---

## Create Tag

```
POST /api/tags
```

### Request Body

```json
{
  "name": "VIP",
  "color": "#FF5733"
}
```

### Field Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | 1-50 characters, unique |
| `color` | string | Yes | Valid hex color (e.g., "#FF5733") |

### Response

```json
{
  "id": "uuid",
  "name": "VIP",
  "color": "#FF5733",
  "createdAt": "2025-01-10T12:00:00.000Z",
  "updatedAt": "2025-01-10T12:00:00.000Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | Created successfully |
| 400 | Validation error |
| 409 | Tag name already exists |
| 500 | Server error |

---

## Usage with Contacts

Tags are associated with contacts via the `tagIds` field:

### Adding tags when creating a contact:
```json
POST /api/contacts
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "tagIds": ["tag-uuid-1", "tag-uuid-2"]
}
```

### Updating tags on a contact:
```json
PUT /api/contacts/:id
{
  "tagIds": ["tag-uuid-1", "tag-uuid-3"]
}
```

This replaces all existing tags with the new set.
