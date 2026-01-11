# Database Schema

> **ORM:** Prisma
> **Database:** PostgreSQL
> **Schema Location:** `apps/web/prisma/schema.prisma`

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    Contact      │       │   ContactTag    │       │      Tag        │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───────│ contactId (FK)  │───────│ id (PK)         │
│ firstName       │       │ tagId (FK)      │       │ name            │
│ lastName        │       │ assignedAt      │       │ color           │
│ email (unique)  │       └─────────────────┘       │ createdAt       │
│ phone           │                                 │ updatedAt       │
│ source          │                                 └─────────────────┘
│ status          │
│ ownerUserId     │       ┌─────────────────┐
│ marketingOptIn  │       │    Activity     │
│ marketingOptInAt│       ├─────────────────┤
│ emailStatus     │───────│ contactId (FK)  │
│ notes           │       │ id (PK)         │
│ deletedAt       │       │ type            │
│ createdAt       │       │ description     │
│ updatedAt       │       │ metadata        │
└─────────────────┘       │ createdAt       │
                          └─────────────────┘
```

---

## Tables

### Contact

The primary entity representing a person in the CRM.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `uuid()` | Primary key |
| `first_name` | VARCHAR | No | - | First name (1-100 chars) |
| `last_name` | VARCHAR | No | - | Last name (1-100 chars) |
| `email` | VARCHAR | No | - | Email address (unique) |
| `phone` | VARCHAR | Yes | NULL | Phone number |
| `source` | ENUM | No | `OTHER` | Lead source |
| `status` | ENUM | No | `LEAD` | Contact status |
| `owner_user_id` | UUID | Yes | NULL | Assigned user (future) |
| `marketing_opt_in` | BOOLEAN | No | `false` | Marketing consent |
| `marketing_opt_in_at` | TIMESTAMP | Yes | NULL | Consent timestamp |
| `email_status` | ENUM | No | `VALID` | Email deliverability |
| `notes` | TEXT | Yes | NULL | Free-form notes |
| `deleted_at` | TIMESTAMP | Yes | NULL | Soft delete timestamp |
| `created_at` | TIMESTAMP | No | `now()` | Creation timestamp |
| `updated_at` | TIMESTAMP | No | auto | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Recommended: Index on `status`, `deleted_at`

---

### Tag

Labels for categorizing contacts.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `uuid()` | Primary key |
| `name` | VARCHAR | No | - | Tag name (unique, 1-50 chars) |
| `color` | VARCHAR | No | - | Hex color code |
| `created_at` | TIMESTAMP | No | `now()` | Creation timestamp |
| `updated_at` | TIMESTAMP | No | auto | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `name`

---

### ContactTag (Junction Table)

Many-to-many relationship between contacts and tags.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `contact_id` | UUID | No | - | FK to Contact |
| `tag_id` | UUID | No | - | FK to Tag |
| `assigned_at` | TIMESTAMP | No | `now()` | When tag was added |

**Indexes:**
- Composite primary key on `(contact_id, tag_id)`
- FK index on `contact_id`
- FK index on `tag_id`

---

### Activity

Audit trail for contact events.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `uuid()` | Primary key |
| `contact_id` | UUID | No | - | FK to Contact |
| `type` | ENUM | No | - | Activity type |
| `description` | TEXT | No | - | Human-readable description |
| `metadata` | JSONB | No | `{}` | Additional structured data |
| `created_at` | TIMESTAMP | No | `now()` | Event timestamp |

**Indexes:**
- Primary key on `id`
- FK index on `contact_id`
- Recommended: Index on `type`, `created_at`

---

## Enums

### ContactSource

Where the contact came from.

| Value | Description |
|-------|-------------|
| `WEBSITE` | Website form submission |
| `REFERRAL` | Referred by existing contact |
| `SOCIAL_MEDIA` | Social media channel |
| `EVENT` | In-person event |
| `OTHER` | Other source |

### ContactStatus

Current status in the sales pipeline.

| Value | Description |
|-------|-------------|
| `LEAD` | New lead, not yet qualified |
| `PROSPECT` | Qualified prospect |
| `CUSTOMER` | Active customer |
| `CHURNED` | Former customer |
| `INACTIVE` | Inactive contact |

### EmailStatus

Email deliverability status.

| Value | Description |
|-------|-------------|
| `VALID` | Email is valid and deliverable |
| `INVALID` | Email failed validation |
| `BOUNCED` | Email bounced |
| `UNSUBSCRIBED` | Contact unsubscribed |

### ActivityType

Types of activities logged.

| Value | Description |
|-------|-------------|
| `CONTACT_CREATED` | Contact was created |
| `CONTACT_UPDATED` | Contact was modified |
| `NOTE_ADDED` | Note was added |
| `EMAIL_SENT` | Email was sent |
| `STATUS_CHANGED` | Status was changed |

---

## Soft Delete Pattern

Contacts use soft delete via the `deleted_at` column:

```typescript
// Exclude deleted contacts (default behavior)
await prisma.contact.findMany({
  where: { deletedAt: null }
});

// Include deleted contacts
await prisma.contact.findMany({
  where: {} // No filter
});

// Only deleted contacts
await prisma.contact.findMany({
  where: { deletedAt: { not: null } }
});

// Soft delete a contact
await prisma.contact.update({
  where: { id },
  data: { deletedAt: new Date() }
});

// Restore a deleted contact
await prisma.contact.update({
  where: { id },
  data: { deletedAt: null }
});
```

---

## Prisma Client Usage

### Singleton Pattern

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### Common Queries

```typescript
// Get contact with relations
const contact = await prisma.contact.findUnique({
  where: { id },
  include: {
    tags: { include: { tag: true } },
    activities: { orderBy: { createdAt: "desc" } },
  },
});

// List contacts with pagination
const contacts = await prisma.contact.findMany({
  where: { deletedAt: null },
  include: { tags: { include: { tag: true } } },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: "desc" },
});

// Search contacts
const contacts = await prisma.contact.findMany({
  where: {
    deletedAt: null,
    OR: [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ],
  },
});
```

---

## Migrations

```bash
# Create migration from schema changes
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View database in browser
npx prisma studio
```
