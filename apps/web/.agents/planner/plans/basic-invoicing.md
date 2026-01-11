# Basic Invoicing Implementation Plan

## Executive Summary

This plan details the implementation of a Basic Invoicing feature for the CRM, following the existing patterns established in the Bookings feature. The invoicing system will allow users to generate invoices from completed bookings, manage line items, track payments, and maintain a clear status workflow.

---

## 1. Database Schema

### New Prisma Models

```prisma
// ============================================
// INVOICING ENUMS
// ============================================

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
  PARTIALLY_PAID
}

enum PaymentMethod {
  CASH
  CARD
  BANK_TRANSFER
  STRIPE
  OTHER
}

enum InvoiceActivityType {
  INVOICE_CREATED
  INVOICE_UPDATED
  INVOICE_STATUS_CHANGED
  INVOICE_SENT
  PAYMENT_RECORDED
  PAYMENT_DELETED
  LINE_ITEM_ADDED
  LINE_ITEM_UPDATED
  LINE_ITEM_DELETED
}

// ============================================
// INVOICE MODELS
// ============================================

model Invoice {
  id               String          @id @default(uuid())
  invoiceNumber    String          @unique @map("invoice_number")
  contactId        String          @map("contact_id")
  bookingId        String?         @map("booking_id")
  status           InvoiceStatus   @default(DRAFT)
  issueDate        DateTime        @default(now()) @map("issue_date")
  dueDate          DateTime        @map("due_date")
  subtotal         Decimal         @db.Decimal(10, 2) @default(0)
  taxRate          Decimal         @db.Decimal(5, 2) @default(0) @map("tax_rate")
  taxAmount        Decimal         @db.Decimal(10, 2) @default(0) @map("tax_amount")
  total            Decimal         @db.Decimal(10, 2) @default(0)
  amountPaid       Decimal         @db.Decimal(10, 2) @default(0) @map("amount_paid")
  amountDue        Decimal         @db.Decimal(10, 2) @default(0) @map("amount_due")
  notes            String?
  terms            String?
  deletedAt        DateTime?       @map("deleted_at")
  createdAt        DateTime        @default(now()) @map("created_at")
  updatedAt        DateTime        @updatedAt @map("updated_at")

  contact    Contact           @relation(fields: [contactId], references: [id], onDelete: Cascade)
  booking    Booking?          @relation(fields: [bookingId], references: [id], onDelete: SetNull)
  lineItems  InvoiceLineItem[]
  payments   Payment[]
  activities InvoiceActivity[]

  @@index([contactId])
  @@index([bookingId])
  @@index([status])
  @@index([invoiceNumber])
  @@index([issueDate])
  @@index([dueDate])
  @@map("invoices")
}

model InvoiceLineItem {
  id          String   @id @default(uuid())
  invoiceId   String   @map("invoice_id")
  description String
  quantity    Decimal  @db.Decimal(10, 2) @default(1)
  unitPrice   Decimal  @db.Decimal(10, 2) @map("unit_price")
  total       Decimal  @db.Decimal(10, 2)
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@map("invoice_line_items")
}

model Payment {
  id            String        @id @default(uuid())
  invoiceId     String        @map("invoice_id")
  amount        Decimal       @db.Decimal(10, 2)
  method        PaymentMethod @default(OTHER)
  reference     String?
  notes         String?
  paidAt        DateTime      @default(now()) @map("paid_at")
  createdAt     DateTime      @default(now()) @map("created_at")

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@index([paidAt])
  @@map("payments")
}

model InvoiceActivity {
  id          String              @id @default(uuid())
  invoiceId   String              @map("invoice_id")
  type        InvoiceActivityType
  payload     Json                @default("{}")
  actorUserId String?             @map("actor_user_id")
  createdAt   DateTime            @default(now()) @map("created_at")

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@map("invoice_activities")
}

model InvoiceCounter {
  id        String   @id @default(uuid())
  year      Int      @unique
  lastNumber Int     @default(0) @map("last_number")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("invoice_counters")
}
```

---

## 2. API Routes

### Invoice Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/invoices` | List invoices with filters |
| POST | `/api/invoices` | Create new invoice |
| GET | `/api/invoices/[id]` | Get single invoice with relations |
| PUT | `/api/invoices/[id]` | Update invoice (DRAFT only) |
| DELETE | `/api/invoices/[id]` | Soft delete invoice |
| PATCH | `/api/invoices/[id]/status` | Update invoice status |
| POST | `/api/invoices/[id]/send` | Mark as sent |
| POST | `/api/invoices/from-booking/[bookingId]` | Generate from booking |

### Line Item Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/invoices/[id]/line-items` | Add line item |
| PUT | `/api/invoices/[id]/line-items/[itemId]` | Update line item |
| DELETE | `/api/invoices/[id]/line-items/[itemId]` | Remove line item |

### Payment Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/invoices/[id]/payments` | Record payment |
| DELETE | `/api/invoices/[id]/payments/[paymentId]` | Delete payment |

---

## 3. UI Components

```
src/components/invoices/
├── statusConfig.ts          # Status colors/labels
├── InvoiceList.tsx          # Table view
├── InvoiceCard.tsx          # Card for list items
├── InvoiceFilters.tsx       # Search & filter controls
├── InvoiceForm.tsx          # Create/edit form
├── InvoiceDetail.tsx        # Full invoice view
├── InvoiceActivityTimeline.tsx
├── LineItemsTable.tsx       # Editable line items
├── LineItemForm.tsx         # Add/edit line item
├── PaymentsList.tsx         # Payment history
├── PaymentForm.tsx          # Record payment modal
├── InvoiceSummary.tsx       # Totals display
└── InvoiceActions.tsx       # Action buttons
```

---

## 4. Pages

```
src/app/invoices/
├── page.tsx                 # Invoice list
├── new/page.tsx             # Create invoice
└── [id]/
    ├── page.tsx             # Invoice detail
    └── edit/page.tsx        # Edit (DRAFT only)
```

---

## 5. Implementation Phases

### Phase 1: Database & Types
- Add Prisma models and enums
- Create validation schemas with tests
- Create TypeScript types

### Phase 2: Core API
- Invoice CRUD endpoints
- Invoice number generation
- Activity logging

### Phase 3: Line Items & Payments API
- Line item CRUD
- Payment recording
- Auto-calculations

### Phase 4: React Query Hooks
- All CRUD hooks
- Cache invalidation

### Phase 5: UI Components
- All components listed above
- Follow booking component patterns

### Phase 6: Pages
- List, create, detail, edit pages
- Navigation integration

### Phase 7: Integration
- Add to booking detail ("Generate Invoice")
- Add to contact detail (invoices tab)
- Testing and polish

---

## 6. Business Logic Rules

### Invoice Number
- Format: `INV-YYYY-NNNN`
- Sequential per year

### Status Transitions
- DRAFT → SENT (via send action)
- SENT → PARTIALLY_PAID (auto on partial payment)
- SENT → PAID (auto on full payment)
- SENT → OVERDUE (manual)
- PARTIALLY_PAID → PAID (auto on full payment)
- Any → CANCELLED (manual)

### Editing Rules
- Only DRAFT invoices can be edited
- SENT+ invoices are read-only
- Payments recorded on SENT, PARTIALLY_PAID, OVERDUE

### Calculations
- Line total = quantity × unitPrice
- Subtotal = sum of line totals
- Tax amount = subtotal × (taxRate / 100)
- Total = subtotal + taxAmount
- Amount due = total - amountPaid
