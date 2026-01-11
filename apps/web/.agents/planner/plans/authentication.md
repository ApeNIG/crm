# Authentication Implementation Plan

## Executive Summary

Custom authentication with email/password, cookie-based sessions, and middleware route protection. Uses `bcryptjs` for password hashing and `jose` for JWT session management.

---

## 1. Database Schema

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
  @@map("sessions")
}
```

---

## 2. Dependencies

```bash
npm install bcryptjs jose
npm install -D @types/bcryptjs
```

---

## 3. Environment Variables

```bash
AUTH_SECRET="your-super-secret-key-at-least-32-characters-long"
AUTH_SESSION_EXPIRY_DAYS=7
```

---

## 4. API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/login` | Authenticate, create session |
| POST | `/api/auth/logout` | Destroy session |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/register` | Create user (admin only) |
| PATCH | `/api/auth/change-password` | Change password |

---

## 5. Middleware

- Protect all routes except `/login` and `/api/auth/login`
- Redirect unauthenticated to `/login`
- Return 401 for API routes

---

## 6. UI Components

```
src/components/auth/
├── index.ts
├── LoginForm.tsx        # Email/password form
├── UserMenu.tsx         # Avatar + logout dropdown
└── ChangePasswordForm.tsx
```

---

## 7. Pages

- `src/app/login/page.tsx` - Login page
- Update `src/app/layout.tsx` - Add UserMenu to header

---

## 8. Implementation Phases

### Phase 1: Database & Dependencies
- Add User, Session models to Prisma
- Run migration
- Install bcryptjs, jose

### Phase 2: Auth Library
- Create `src/lib/auth.ts`
- Create `src/lib/validations/auth.ts`
- Create `src/types/auth.ts`

### Phase 3: API Routes
- All 5 auth endpoints

### Phase 4: Middleware
- Create `src/middleware.ts`
- Route protection

### Phase 5: Hooks & UI
- Create `src/hooks/useAuth.ts`
- Create components

### Phase 6: Pages & Layout
- Login page
- Header with UserMenu

### Phase 7: Seed & Test
- Admin seed script
- Tests

---

## 9. Security

- bcrypt with 12 salt rounds
- JWT in HTTP-only cookies
- SameSite=Lax for CSRF protection
- Session expiry (default 7 days)
