# Authentication

## Overview

The Authentication feature provides secure user login, session management, and role-based access control. All protected routes require authentication via JWT-based sessions stored in HTTP-only cookies. User registration is admin-only to maintain controlled access.

## User Model

### Database Schema

```prisma
enum UserRole {
  ADMIN
  USER
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  name          String
  role          UserRole  @default(USER)
  isActive      Boolean   @default(true) @map("is_active")
  lastLoginAt   DateTime? @map("last_login_at")
  deletedAt     DateTime? @map("deleted_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  sessions      Session[]

  @@map("users")
}

model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  userAgent String?  @map("user_agent")
  ipAddress String?  @map("ip_address")
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("sessions")
}
```

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| ADMIN | Administrator | Full access, can register new users |
| USER | Standard user | Access to CRM features, cannot register users |

## Session Management

### How Sessions Work

1. User submits email and password to `/api/auth/login`
2. Server validates credentials and creates a session record in the database
3. Server generates a signed JWT containing session ID, user ID, email, and role
4. JWT is stored in an HTTP-only cookie named `session`
5. Subsequent requests include the cookie automatically
6. Middleware verifies the JWT on each request

### Session Properties

| Property | Value |
|----------|-------|
| Cookie name | `session` |
| Default expiry | 7 days |
| Storage | Database + JWT cookie |
| Security | HTTP-only, Secure (production), SameSite=Lax |

### Token Structure

The JWT token contains:
- `sessionId` - Database session ID
- `userId` - User ID
- `email` - User email
- `role` - User role (ADMIN/USER)
- `iat` - Issued at timestamp
- `exp` - Expiration timestamp

## Password Requirements

Passwords must meet all of the following criteria:

| Rule | Requirement |
|------|-------------|
| Length | Minimum 8 characters |
| Uppercase | At least one uppercase letter (A-Z) |
| Lowercase | At least one lowercase letter (a-z) |
| Number | At least one digit (0-9) |

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Authenticate user | No |
| POST | `/api/auth/logout` | End session | No (clears cookie) |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/register` | Create new user | Yes (Admin only) |
| PATCH | `/api/auth/change-password` | Change password | Yes |

See [Auth API Documentation](/workspace/crm/apps/web/docs/api/auth.md) for detailed request/response examples.

## Middleware Protection

The Next.js middleware (`src/middleware.ts`) protects all routes except:

### Public Routes
- `/login` - Login page

### Public API Routes
- `/api/auth/login` - Login endpoint

### Middleware Behavior

| Scenario | Page Routes | API Routes |
|----------|-------------|------------|
| No session cookie | Redirect to `/login` | Return 401 |
| Invalid/expired token | Redirect to `/login`, clear cookie | Return 401, clear cookie |
| Valid session | Allow access | Allow access |
| Authenticated user on `/login` | Redirect to `/` | N/A |

### Excluded Paths

The middleware excludes static assets:
- `_next/static/*` - Static files
- `_next/image/*` - Optimized images
- `favicon.ico`
- Image files (svg, png, jpg, etc.)
- Font files (woff, woff2, ttf, eot)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | Secret key for JWT signing (min 32 characters) |
| `AUTH_SESSION_EXPIRY_DAYS` | No | Session expiry in days (default: 7) |
| `ADMIN_EMAIL` | For seeding | Admin email for seed script |
| `ADMIN_PASSWORD` | For seeding | Admin password for seed script |
| `ADMIN_NAME` | No | Admin display name (default: "Admin User") |

## Setup Instructions

### 1. Run Database Migrations

```bash
cd apps/web
npx prisma migrate dev
```

### 2. Set Environment Variables

Add to `.env`:

```bash
# Required: JWT signing secret (generate a secure random string)
AUTH_SECRET=your-secure-secret-key-at-least-32-chars

# Optional: Session duration (default 7 days)
AUTH_SESSION_EXPIRY_DAYS=7
```

### 3. Create Admin User

Run the seed script with admin credentials:

```bash
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=YourSecurePassword123 \
ADMIN_NAME="Admin User" \
npx tsx prisma/seed-admin.ts
```

The script will:
- Create a new admin user if email doesn't exist
- Upgrade an existing user to ADMIN role if email exists
- Validate password requirements before creating

### 4. Verify Setup

1. Start the development server: `npm run dev`
2. Navigate to `/login`
3. Log in with the admin credentials
4. You should be redirected to the dashboard

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Authentication utilities (hashing, sessions, cookies) |
| `src/lib/validations/auth.ts` | Zod validation schemas |
| `src/types/auth.ts` | TypeScript types |
| `src/middleware.ts` | Route protection middleware |
| `src/app/api/auth/*/route.ts` | API route handlers |
| `prisma/seed-admin.ts` | Admin user seeding script |

## Security Considerations

- Passwords are hashed using bcrypt with 12 salt rounds
- JWTs are signed with HS256 algorithm
- Session tokens are stored in HTTP-only cookies (not accessible via JavaScript)
- Generic error messages prevent email enumeration on login
- Password change invalidates all existing sessions
- Inactive users (`isActive: false`) cannot log in
- Soft-deleted users (`deletedAt` set) cannot log in

## Related Documentation

- [Auth API Reference](/workspace/crm/apps/web/docs/api/auth.md) - API endpoint details
- [Database Schema](/workspace/crm/docs/database/schema.md) - Full database schema
