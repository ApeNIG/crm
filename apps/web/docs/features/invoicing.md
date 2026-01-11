# Basic Invoicing

## Overview

The Basic Invoicing feature provides invoice generation, line item management, payment tracking, and integration with the Appointments system. Users can create invoices manually or generate them directly from bookings, track payments, and manage the invoice lifecycle through various statuses.

## User Stories

- As a business user, I can create an invoice for a contact so that I can bill them for services
- As a business user, I can generate an invoice directly from a booking so that billing is streamlined
- As a business user, I can add, edit, and remove line items from a draft invoice so that I can itemize charges
- As a business user, I can record payments against an invoice so that I can track what has been paid
- As a business user, I can see the status of all invoices so that I know which need attention
- As a business user, I can mark an invoice as sent so that I can track when it was delivered
- As a business user, I can view the activity history of an invoice so that I have an audit trail

## Technical Overview

### Entry Points

| Type | Path | Purpose |
|------|------|---------|
| Page | `/invoices` | List all invoices with filtering |
| Page | `/invoices/new` | Create new invoice form |
| Page | `/invoices/[id]` | Invoice detail view with payments and activity |
| Page | `/invoices/[id]/edit` | Edit draft invoice |
| API | `/api/invoices` | List/create invoices |
| API | `/api/invoices/[id]` | Get/update/delete single invoice |
| API | `/api/invoices/[id]/status` | Update invoice status |
| API | `/api/invoices/[id]/send` | Mark invoice as sent |
| API | `/api/invoices/[id]/line-items` | Add line items |
| API | `/api/invoices/[id]/line-items/[itemId]` | Update/delete line items |
| API | `/api/invoices/[id]/payments` | Record payments |
| API | `/api/invoices/[id]/payments/[paymentId]` | Delete payments |
| API | `/api/invoices/from-booking/[bookingId]` | Generate invoice from booking |

### Key Components

- `InvoiceList.tsx` - Paginated list with filtering and status badges
- `InvoiceCard.tsx` - Individual invoice card for list display
- `InvoiceFilters.tsx` - Search and filter controls
- `InvoiceForm.tsx` - Create/edit form with contact selection
- `InvoiceDetail.tsx` - Full invoice view with actions
- `InvoiceSummary.tsx` - Financial summary display
- `LineItemsTable.tsx` - Add/edit/delete line items
- `LineItemForm.tsx` - Line item input form
- `PaymentsList.tsx` - Payment history and recording
- `PaymentForm.tsx` - Payment input form
- `InvoiceActivityTimeline.tsx` - Chronological list of invoice events
- `statusConfig.ts` - Status order, labels, and styling configuration

### Database Schema

#### Invoice Model

```prisma
model Invoice {
  id            String        @id @default(uuid())
  invoiceNumber String        @unique @map("invoice_number")
  contactId     String        @map("contact_id")
  bookingId     String?       @map("booking_id")
  status        InvoiceStatus @default(DRAFT)
  issueDate     DateTime      @default(now()) @map("issue_date")
  dueDate       DateTime      @map("due_date")
  subtotal      Decimal       @default(0) @db.Decimal(10, 2)
  taxRate       Decimal       @default(0) @map("tax_rate") @db.Decimal(5, 2)
  taxAmount     Decimal       @default(0) @map("tax_amount") @db.Decimal(10, 2)
  total         Decimal       @default(0) @db.Decimal(10, 2)
  amountPaid    Decimal       @default(0) @map("amount_paid") @db.Decimal(10, 2)
  amountDue     Decimal       @default(0) @map("amount_due") @db.Decimal(10, 2)
  notes         String?
  terms         String?
  deletedAt     DateTime?     @map("deleted_at")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  contact    Contact           @relation(...)
  booking    Booking?          @relation(...)
  lineItems  InvoiceLineItem[]
  payments   Payment[]
  activities InvoiceActivity[]
}
```

#### InvoiceLineItem Model

```prisma
model InvoiceLineItem {
  id          String   @id @default(uuid())
  invoiceId   String   @map("invoice_id")
  description String
  quantity    Decimal  @default(1) @db.Decimal(10, 2)
  unitPrice   Decimal  @map("unit_price") @db.Decimal(10, 2)
  total       Decimal  @db.Decimal(10, 2)
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  invoice Invoice @relation(...)
}
```

#### Payment Model

```prisma
model Payment {
  id        String        @id @default(uuid())
  invoiceId String        @map("invoice_id")
  amount    Decimal       @db.Decimal(10, 2)
  method    PaymentMethod @default(OTHER)
  reference String?
  notes     String?
  paidAt    DateTime      @default(now()) @map("paid_at")
  createdAt DateTime      @default(now()) @map("created_at")

  invoice Invoice @relation(...)
}
```

#### InvoiceActivity Model

```prisma
model InvoiceActivity {
  id          String              @id @default(uuid())
  invoiceId   String              @map("invoice_id")
  type        InvoiceActivityType
  payload     Json                @default("{}")
  actorUserId String?             @map("actor_user_id")
  createdAt   DateTime            @default(now()) @map("created_at")

  invoice Invoice @relation(...)
}
```

#### InvoiceCounter Model

```prisma
model InvoiceCounter {
  id         String   @id @default(uuid())
  year       Int      @unique
  lastNumber Int      @default(0) @map("last_number")
  updatedAt  DateTime @updatedAt @map("updated_at")
}
```

## Status Workflow

### Invoice Statuses

| Status | Label | Description |
|--------|-------|-------------|
| DRAFT | Draft | New invoice being prepared |
| SENT | Sent | Invoice delivered to customer |
| PARTIALLY_PAID | Partially Paid | Some payment received |
| PAID | Paid | Fully paid |
| OVERDUE | Overdue | Past due date, unpaid |
| CANCELLED | Cancelled | Invoice cancelled |

### Status Transitions

```
DRAFT -> SENT (via send action or manual status change)
SENT -> PARTIALLY_PAID (payment recorded)
SENT -> PAID (full payment recorded)
SENT -> OVERDUE (manual status change)
PARTIALLY_PAID -> PAID (remaining payment recorded)
PARTIALLY_PAID -> SENT (payment deleted)
PAID -> PARTIALLY_PAID (payment deleted)
Any -> CANCELLED (manual status change)
```

### Payment Methods

| Method | Label |
|--------|-------|
| CASH | Cash |
| CARD | Card |
| BANK_TRANSFER | Bank Transfer |
| STRIPE | Stripe |
| OTHER | Other |

## Business Rules

### Invoice Numbering

Invoices are automatically numbered in the format `INV-YYYY-NNNN`:
- `YYYY` is the current year
- `NNNN` is a zero-padded sequential number per year
- Generated via `InvoiceCounter` table to ensure uniqueness

### Editing Restrictions

- Only DRAFT invoices can be edited
- Only DRAFT invoices can have line items added/edited/deleted
- Only SENT, PARTIALLY_PAID, or OVERDUE invoices can accept payments

### Automatic Status Updates

When recording a payment:
- If total paid >= invoice total: status becomes PAID
- If total paid > 0 but < invoice total: status becomes PARTIALLY_PAID

When deleting a payment:
- If total paid becomes 0: status reverts to SENT
- If total paid becomes > 0 but < invoice total: status becomes PARTIALLY_PAID

### Total Calculations

- Line item total = quantity x unitPrice
- Subtotal = sum of all line item totals
- Tax amount = subtotal x (taxRate / 100)
- Total = subtotal + taxAmount
- Amount due = total - amountPaid

## Activity Types

| Type | Description |
|------|-------------|
| INVOICE_CREATED | Invoice created (manual or from booking) |
| INVOICE_UPDATED | Invoice fields modified |
| INVOICE_STATUS_CHANGED | Status transition occurred |
| INVOICE_SENT | Invoice marked as sent |
| PAYMENT_RECORDED | Payment added |
| PAYMENT_DELETED | Payment removed |
| LINE_ITEM_ADDED | Line item added |
| LINE_ITEM_UPDATED | Line item modified |
| LINE_ITEM_DELETED | Line item removed |

## Integration with Bookings

### Create Invoice from Booking

The `/api/invoices/from-booking/[bookingId]` endpoint:
1. Validates the booking exists and is not deleted
2. Checks no invoice already exists for the booking
3. Generates a new invoice number
4. Creates a line item from the service type (name and price)
5. Sets the booking reference on the invoice
6. Links both to the same contact

### Default Values When Creating from Booking

- Issue date: Current date
- Due date: 30 days from current date (configurable via request body)
- Tax rate: 0 (configurable via request body)
- Line item description: Service name + booking date

## Configuration

### Status Configuration

Status order, labels, and colors are defined in `src/components/invoices/statusConfig.ts`:

```typescript
import { STATUS_ORDER, STATUS_CONFIG, getStatusLabel, getStatusColor } from '@/components/invoices/statusConfig';

// Get all statuses in order
STATUS_ORDER; // ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']

// Get config for a status
STATUS_CONFIG['DRAFT']; // { key, label, color, bgColor }

// Helper functions
getStatusLabel('DRAFT'); // 'Draft'
getStatusColor('DRAFT'); // 'text-gray-700'
getStatusBgColor('DRAFT'); // 'bg-gray-100'
```

### Validation Schemas

Invoice validation is defined in `src/lib/validations/invoice.ts`:

- `createInvoiceSchema` - Validates new invoice creation
- `updateInvoiceSchema` - Validates partial updates
- `updateInvoiceStatusSchema` - Validates status-only updates
- `createLineItemSchema` - Validates line item creation
- `updateLineItemSchema` - Validates line item updates
- `createPaymentSchema` - Validates payment recording
- `invoiceQuerySchema` - Validates list query parameters
- `invoiceFormSchema` - Form-specific validation
- `lineItemFormSchema` - Line item form validation
- `paymentFormSchema` - Payment form validation

## How to Extend

### Adding a New Status

1. Add the status to the `InvoiceStatus` enum in `prisma/schema.prisma`
2. Run `npx prisma generate` to update the Prisma client
3. Add the status to `STATUS_ORDER` array in `statusConfig.ts`
4. Add status configuration to `STATUS_CONFIG` object
5. Update validation schema in `invoice.ts`
6. Update any status transition logic in API routes

### Adding a New Payment Method

1. Add the method to the `PaymentMethod` enum in `prisma/schema.prisma`
2. Run `npx prisma generate` to update the Prisma client
3. Add the method to `PAYMENT_METHOD_ORDER` in `statusConfig.ts`
4. Add method configuration to `PAYMENT_METHOD_CONFIG`
5. Update the `paymentMethodEnum` in `invoice.ts`

### Adding a New Activity Type

1. Add the type to `InvoiceActivityType` enum in `prisma/schema.prisma`
2. Run `npx prisma generate` to update the Prisma client
3. Add icon and color configuration in `InvoiceActivityTimeline.tsx`
4. Add rendering logic for the new activity type

### Adding New Invoice Fields

1. Add the field to the `Invoice` model in `prisma/schema.prisma`
2. Create a migration with `npx prisma migrate dev`
3. Add field to `createInvoiceSchema` and `updateInvoiceSchema`
4. Add field to `InvoiceForm.tsx`
5. Display field in `InvoiceDetail.tsx` and/or `InvoiceCard.tsx`

## Related Documentation

- [Invoices API](/workspace/crm/apps/web/docs/api/invoices.md) - API endpoint reference
- [Appointments Feature](/workspace/crm/docs/features/appointments.md) - Booking management
- [Contact Database](/workspace/crm/docs/features/contacts.md) - Contact management
- [Database Schema](/workspace/crm/docs/database/schema.md) - Full database schema
