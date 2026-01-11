# Auth API

> **Base URL:** `/api/auth`
> **Authentication:** Varies by endpoint (see individual endpoints)

---

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Authenticate user and create session | No |
| POST | `/api/auth/logout` | Destroy session and clear cookie | No |
| GET | `/api/auth/me` | Get current authenticated user | Yes |
| POST | `/api/auth/register` | Create a new user (admin only) | Yes (Admin) |
| PATCH | `/api/auth/change-password` | Change current user's password | Yes |

---

## Login

```
POST /api/auth/login
```

Authenticates a user and creates a new session.

### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

### Field Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Non-empty |

### Response (Success)

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "isActive": true,
    "lastLoginAt": "2026-01-10T12:00:00.000Z",
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-10T12:00:00.000Z"
  }
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Login successful |
| 400 | Invalid request data |
| 401 | Invalid credentials or account disabled |
| 500 | Server error |

### Notes

- Sets an HTTP-only `session` cookie on success
- Uses generic error message to prevent email enumeration
- Disabled accounts (`isActive: false`) return "Account is disabled"
- Updates user's `lastLoginAt` timestamp

---

## Logout

```
POST /api/auth/logout
```

Destroys the current session and clears the session cookie.

### Request Body

None required.

### Response

```json
{
  "success": true
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Always returns success |

### Notes

- Always returns success even if no session exists
- Deletes session from database if found
- Clears the session cookie

---

## Get Current User

```
GET /api/auth/me
```

Returns the currently authenticated user.

### Response (Authenticated)

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "isActive": true,
    "lastLoginAt": "2026-01-10T12:00:00.000Z",
    "deletedAt": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-10T12:00:00.000Z"
  }
}
```

### Response (Not Authenticated)

```json
{
  "user": null
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Always returns 200 with user or null |

### Notes

- Does not return 401 for unauthenticated requests
- Returns `user: null` if no valid session
- Useful for checking authentication state on page load

---

## Register User

```
POST /api/auth/register
```

Creates a new user account. **Admin access required.**

### Request Body

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "name": "Jane Doe",
  "role": "USER"
}
```

### Field Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| `name` | string | Yes | 1-100 characters |
| `role` | enum | No | "ADMIN" or "USER" (default: "USER") |

### Response (Success)

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "role": "USER",
    "isActive": true,
    "lastLoginAt": null,
    "deletedAt": null,
    "createdAt": "2026-01-10T12:00:00.000Z",
    "updatedAt": "2026-01-10T12:00:00.000Z"
  }
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "A user with this email already exists"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | User created successfully |
| 400 | Invalid registration data |
| 401 | Authentication required |
| 403 | Admin access required |
| 409 | Email already exists |
| 500 | Server error |

### Notes

- Only ADMIN users can create new accounts
- Email is stored in lowercase
- Password is never returned in responses

---

## Change Password

```
PATCH /api/auth/change-password
```

Changes the current user's password.

### Request Body

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePassword456"
}
```

### Field Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `currentPassword` | string | Yes | Non-empty |
| `newPassword` | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |

### Response (Success)

```json
{
  "success": true
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Password changed successfully |
| 400 | Invalid data, wrong current password, or same password |
| 401 | Authentication required |
| 404 | User not found |
| 500 | Server error |

### Notes

- New password must be different from current password
- All existing sessions are invalidated for security
- A new session is created for the current browser
- User remains logged in after password change

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

---

## Authentication Cookie

The `session` cookie is set on successful login:

| Property | Value |
|----------|-------|
| Name | `session` |
| HttpOnly | true |
| Secure | true (production only) |
| SameSite | Lax |
| Path | / |
| MaxAge | 7 days (configurable) |

The cookie contains a signed JWT with session information.
