# Implementation Plan: Contact Database

> **Agent:** Planner
> **Feature:** Contact Database (Foundation Feature #1)
> **Status:** Awaiting Approval
> **Created:** 2025-01-10

---

## 1. Summary

The Contact Database is the foundational feature of the CRM. It establishes the core data model (Contact, Tag, Activity), sets up the database schema, and provides CRUD operations via API and UI. Every other feature depends on this — enquiries, bookings, emails all link to Contacts.

This plan includes initial project scaffolding since this is the first feature.

---

## 2. Spec References

- **Section 2 (Core Concept):** Contact as single source of truth
- **Section 6.1 (Contact):** Full field definition
- **Section 6.2 (Tag):** Tag model and ContactTag join table
- **Section 6.9 (Activity):** Activity timeline model
- **Section 17 (Screen List):** Contact List and Contact Detail pages

---

## 3. Dependencies

| Type | Items |
|------|-------|
| **Requires** | None (this is the foundation) |
| **Blocks** | All other features (Enquiries, Bookings, Pipeline, etc.) |

---

## 4. Files to Create

| File Path | Purpose |
|-----------|---------|
| `apps/web/package.json` | Next.js project config |
| `apps/web/tsconfig.json` | TypeScript configuration |
| `apps/web/tailwind.config.ts` | Tailwind CSS config |
| `apps/web/next.config.js` | Next.js configuration |
| `apps/web/.env.example` | Environment variable template |
| `apps/web/prisma/schema.prisma` | Database schema |
| `apps/web/src/app/layout.tsx` | Root layout |
| `apps/web/src/app/page.tsx` | Home redirect to /contacts |
| `apps/web/src/app/contacts/page.tsx` | Contact list page |
| `apps/web/src/app/contacts/[id]/page.tsx` | Contact detail page |
| `apps/web/src/app/contacts/new/page.tsx` | New contact page |
| `apps/web/src/app/api/contacts/route.ts` | GET (list) + POST (create) |
| `apps/web/src/app/api/contacts/[id]/route.ts` | GET, PUT, DELETE single contact |
| `apps/web/src/app/api/tags/route.ts` | GET (list) + POST (create) tags |
| `apps/web/src/lib/db.ts` | Prisma client singleton |
| `apps/web/src/lib/validations/contact.ts` | Zod schemas for contact |
| `apps/web/src/types/contact.ts` | TypeScript types |
| `apps/web/src/components/contacts/ContactList.tsx` | Contact table/list component |
| `apps/web/src/components/contacts/ContactForm.tsx` | Create/edit form component |
| `apps/web/src/components/contacts/ContactDetail.tsx` | Detail view component |
| `apps/web/src/components/contacts/ActivityTimeline.tsx` | Activity feed component |
| `apps/web/src/components/contacts/TagBadge.tsx` | Tag display component |
| `apps/web/src/components/ui/` | shadcn/ui components (Button, Input, etc.) |

---

## 5. Files to Modify

None — this is a greenfield project.

---

## 6. Implementation Steps

### Phase A: Project Setup (Steps 1-5)

**Step 1: Initialize Next.js project**
```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Step 2: Install dependencies**
```bash
npm install prisma @prisma/client zod react-hook-form @hookform/resolvers
npm install @tanstack/react-query
npm install -D @types/node
npx prisma init
```

**Step 3: Install shadcn/ui**
```bash
npx shadcn@latest init
npx shadcn@latest add button input label card table badge dialog form select textarea
```

**Step 4: Configure environment**
- Create `.env` with DATABASE_URL
- Update `.env.example` with required variables

**Step 5: Set up Prisma client singleton**
- Create `src/lib/db.ts` with connection pooling for serverless

---

### Phase B: Database Schema (Steps 6-8)

**Step 6: Define Contact model in Prisma**
```prisma
model Contact {
  id                String    @id @default(uuid())
  firstName         String    @map("first_name")
  lastName          String    @map("last_name")
  email             String    @unique
  phone             String?
  source            ContactSource @default(OTHER)
  status            ContactStatus @default(LEAD)
  ownerUserId       String?   @map("owner_user_id")
  marketingOptIn    Boolean   @default(false) @map("marketing_opt_in")
  marketingOptInAt  DateTime? @map("marketing_opt_in_at")
  emailStatus       EmailStatus @default(VALID) @map("email_status")
  notes             String?
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  tags              ContactTag[]
  activities        Activity[]

  @@map("contacts")
}

enum ContactSource {
  INSTAGRAM
  WEBSITE
  REFERRAL
  WALK_IN
  OTHER
}

enum ContactStatus {
  LEAD
  CUSTOMER
  PAST_CUSTOMER
  COLD
  DO_NOT_CONTACT
}

enum EmailStatus {
  VALID
  BOUNCED
  COMPLAINED
}
```

**Step 7: Define Tag and ContactTag models**
```prisma
model Tag {
  id        String   @id @default(uuid())
  name      String   @unique
  color     String   @default("#6B7280")
  createdAt DateTime @default(now()) @map("created_at")

  contacts  ContactTag[]

  @@map("tags")
}

model ContactTag {
  contactId String   @map("contact_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")

  contact   Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([contactId, tagId])
  @@map("contact_tags")
}
```

**Step 8: Define Activity model**
```prisma
model Activity {
  id          String   @id @default(uuid())
  contactId   String   @map("contact_id")
  type        ActivityType
  payload     Json     @default("{}")
  actorUserId String?  @map("actor_user_id")
  createdAt   DateTime @default(now()) @map("created_at")

  contact     Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)

  @@map("activities")
}

enum ActivityType {
  CONTACT_CREATED
  CONTACT_UPDATED
  NOTE_ADDED
  TAG_ADDED
  TAG_REMOVED
  // More types added by future features
}
```

**Step 9: Run initial migration**
```bash
npx prisma migrate dev --name init_contact_database
npx prisma generate
```

---

### Phase C: API Layer (Steps 10-14)

**Step 10: Create Zod validation schemas**
```typescript
// src/lib/validations/contact.ts
export const createContactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  source: z.enum(["INSTAGRAM", "WEBSITE", "REFERRAL", "WALK_IN", "OTHER"]).optional(),
  status: z.enum(["LEAD", "CUSTOMER", "PAST_CUSTOMER", "COLD", "DO_NOT_CONTACT"]).optional(),
  marketingOptIn: z.boolean().optional(),
  notes: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const contactQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["LEAD", "CUSTOMER", "PAST_CUSTOMER", "COLD", "DO_NOT_CONTACT"]).optional(),
  source: z.enum(["INSTAGRAM", "WEBSITE", "REFERRAL", "WALK_IN", "OTHER"]).optional(),
  tagId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});
```

**Step 11: Implement GET /api/contacts (list)**
- Accept query params: search, status, source, tagId, page, limit
- Return paginated results with total count
- Include tags in response
- Sort by most recently updated

**Step 12: Implement POST /api/contacts (create)**
- Validate input with Zod
- Check for duplicate email (return existing if found, or error)
- Create contact with optional tags
- Create CONTACT_CREATED activity
- Return created contact

**Step 13: Implement GET/PUT/DELETE /api/contacts/[id]**
- GET: Return contact with tags and recent activities
- PUT: Update contact, create CONTACT_UPDATED activity
- DELETE: Soft delete or hard delete (decision needed)

**Step 14: Implement tags API**
- GET /api/tags: List all tags
- POST /api/tags: Create new tag

---

### Phase D: UI Components (Steps 15-20)

**Step 15: Create ContactList component**
- Table with columns: Name, Email, Phone, Status, Source, Tags, Updated
- Search input (filters by name/email)
- Filter dropdowns (status, source, tag)
- Pagination controls
- Click row to navigate to detail

**Step 16: Create ContactForm component**
- Fields for all contact properties
- Tag multi-select
- Marketing opt-in checkbox with consent text
- Submit button with loading state
- Client-side validation with react-hook-form

**Step 17: Create ContactDetail component**
- Header: Name, status badge, edit button
- Info section: Email, phone, source, owner
- Tags section: Display with add/remove
- Notes section: Editable text area
- Tab or section for Activity Timeline

**Step 18: Create ActivityTimeline component**
- Chronological list of activities
- Icon per activity type
- Relative timestamps ("2 hours ago")
- Payload details (e.g., "Status changed from Lead to Customer")

**Step 19: Create TagBadge component**
- Displays tag name with background color
- Optional remove button (x)

**Step 20: Wire up pages**
- `/contacts` → ContactList with data fetching
- `/contacts/new` → ContactForm in create mode
- `/contacts/[id]` → ContactDetail with data fetching
- `/contacts/[id]/edit` → ContactForm in edit mode

---

### Phase E: Data Fetching (Steps 21-22)

**Step 21: Set up React Query provider**
- Create QueryClientProvider in layout
- Configure stale time, retry logic

**Step 22: Create contact hooks**
```typescript
// src/hooks/useContacts.ts
export function useContacts(filters: ContactFilters) { ... }
export function useContact(id: string) { ... }
export function useCreateContact() { ... }
export function useUpdateContact() { ... }
export function useDeleteContact() { ... }
```

---

## 7. Data Model

```prisma
// Complete schema for this feature

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Contact {
  id                String        @id @default(uuid())
  firstName         String        @map("first_name")
  lastName          String        @map("last_name")
  email             String        @unique
  phone             String?
  source            ContactSource @default(OTHER)
  status            ContactStatus @default(LEAD)
  ownerUserId       String?       @map("owner_user_id")
  marketingOptIn    Boolean       @default(false) @map("marketing_opt_in")
  marketingOptInAt  DateTime?     @map("marketing_opt_in_at")
  emailStatus       EmailStatus   @default(VALID) @map("email_status")
  notes             String?
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  tags              ContactTag[]
  activities        Activity[]

  @@map("contacts")
}

model Tag {
  id        String       @id @default(uuid())
  name      String       @unique
  color     String       @default("#6B7280")
  createdAt DateTime     @default(now()) @map("created_at")

  contacts  ContactTag[]

  @@map("tags")
}

model ContactTag {
  contactId String   @map("contact_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")

  contact   Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([contactId, tagId])
  @@map("contact_tags")
}

model Activity {
  id          String       @id @default(uuid())
  contactId   String       @map("contact_id")
  type        ActivityType
  payload     Json         @default("{}")
  actorUserId String?      @map("actor_user_id")
  createdAt   DateTime     @default(now()) @map("created_at")

  contact     Contact      @relation(fields: [contactId], references: [id], onDelete: Cascade)

  @@map("activities")
}

enum ContactSource {
  INSTAGRAM
  WEBSITE
  REFERRAL
  WALK_IN
  OTHER
}

enum ContactStatus {
  LEAD
  CUSTOMER
  PAST_CUSTOMER
  COLD
  DO_NOT_CONTACT
}

enum EmailStatus {
  VALID
  BOUNCED
  COMPLAINED
}

enum ActivityType {
  CONTACT_CREATED
  CONTACT_UPDATED
  NOTE_ADDED
  TAG_ADDED
  TAG_REMOVED
}
```

---

## 8. API Endpoints

| Method | Route | Purpose | Auth Required |
|--------|-------|---------|---------------|
| GET | `/api/contacts` | List contacts with filters/pagination | Yes (Phase 2) |
| POST | `/api/contacts` | Create new contact | Yes (Phase 2) |
| GET | `/api/contacts/[id]` | Get single contact with details | Yes (Phase 2) |
| PUT | `/api/contacts/[id]` | Update contact | Yes (Phase 2) |
| DELETE | `/api/contacts/[id]` | Delete contact | Yes (Phase 2) |
| GET | `/api/tags` | List all tags | Yes (Phase 2) |
| POST | `/api/tags` | Create new tag | Yes (Phase 2) |

**Note:** Auth middleware will be added in Auth System feature. For this feature, endpoints are unprotected to enable development.

---

## 9. Acceptance Criteria

### Database
- [ ] Prisma schema compiles without errors
- [ ] Migration runs successfully
- [ ] Contact table has all specified fields
- [ ] Tag and ContactTag tables exist with proper relationships
- [ ] Activity table exists with proper relationship to Contact

### API - Contacts
- [ ] GET /api/contacts returns paginated list
- [ ] GET /api/contacts supports search by name/email
- [ ] GET /api/contacts supports filtering by status, source, tag
- [ ] POST /api/contacts creates contact with valid data
- [ ] POST /api/contacts returns validation errors for invalid data
- [ ] POST /api/contacts handles duplicate email appropriately
- [ ] POST /api/contacts creates CONTACT_CREATED activity
- [ ] GET /api/contacts/[id] returns contact with tags and activities
- [ ] PUT /api/contacts/[id] updates contact
- [ ] PUT /api/contacts/[id] creates CONTACT_UPDATED activity
- [ ] DELETE /api/contacts/[id] removes contact

### API - Tags
- [ ] GET /api/tags returns all tags
- [ ] POST /api/tags creates new tag
- [ ] Tag names are unique (error on duplicate)

### UI - Contact List
- [ ] Displays contacts in table format
- [ ] Search filters results as you type
- [ ] Status dropdown filters results
- [ ] Clicking row navigates to detail page
- [ ] Pagination works (next/prev, shows count)
- [ ] Empty state shown when no contacts

### UI - Contact Form
- [ ] All fields render correctly
- [ ] Validation errors display inline
- [ ] Submit creates contact and redirects to detail
- [ ] Tag multi-select works
- [ ] Marketing checkbox records timestamp when checked

### UI - Contact Detail
- [ ] Displays all contact information
- [ ] Shows tags with colors
- [ ] Activity timeline shows recent activities
- [ ] Edit button navigates to edit form
- [ ] Can add/remove tags inline

### Activity Timeline
- [ ] Activities display in reverse chronological order
- [ ] Each activity shows type, timestamp, and relevant details
- [ ] CONTACT_CREATED activity appears after contact creation

---

## 10. Questions / Decisions Needed

1. **Delete behavior:** Should contact deletion be soft delete (mark as deleted) or hard delete (remove from database)?
   - **Recommendation:** Soft delete (add `deletedAt` timestamp, filter from queries)
   - **Rationale:** Preserves audit trail, allows recovery

2. **Duplicate email handling:** When creating a contact with an email that exists, should we:
   - A) Return error "Email already exists"
   - B) Return existing contact (upsert-like behavior)
   - C) Allow duplicates (not recommended)
   - **Recommendation:** Option A for explicit CRM, users should search first

3. **Initial data:** Should we seed the database with sample data for development?
   - **Recommendation:** Yes, create seed script with 10-20 sample contacts

4. **Tag management:** Can staff create tags, or only admins?
   - **Recommendation:** Staff can create (captured in Auth System feature)

---

## 11. Complexity Estimate

| Aspect | Rating | Notes |
|--------|--------|-------|
| **Overall Size** | **M** (Medium) | Standard CRUD but foundational |
| **Schema** | S | Straightforward relational model |
| **API** | S | Standard REST endpoints |
| **UI** | M | Multiple pages and components |
| **Risk Areas** | Low | Well-understood patterns |

**Estimated effort:** 2-3 focused building sessions

---

## 12. Out of Scope (Handled by Other Features)

- Authentication / protected routes → Auth System feature
- Contact import/export → Phase 2
- Contact merge (dedupe) → Phase 2
- Bulk operations → Phase 2
- Owner assignment → Auth System feature (needs User model)

---

*Plan ready for review. Awaiting human approval before Builder proceeds.*
