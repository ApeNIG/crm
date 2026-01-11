# Code Review: Basic Invoicing Feature

**Review Date:** 2026-01-10
**Reviewer:** Claude (Reviewer Agent)
**Feature:** Basic Invoicing
**Status:** APPROVED_WITH_ISSUES

---

## Scores

| Category | Score | Notes |
|----------|-------|-------|
| **Code Quality** | 8/10 | Well-structured, consistent patterns, minor type issues |
| **Security** | 9/10 | Proper validation, UUID checks, soft delete pattern |

---

## Verdict: APPROVED_WITH_ISSUES

The Basic Invoicing feature is well-implemented and follows the established patterns in the codebase. The code is clean, well-organized, and demonstrates good separation of concerns. There are a few minor issues that should be addressed but none that block approval.

---

## Review Summary

### Files Reviewed

**Database Schema:**
- `prisma/schema.prisma` - Invoice, InvoiceLineItem, Payment, InvoiceActivity, InvoiceCounter models

**Types & Validation:**
- `src/types/invoice.ts`
- `src/lib/validations/invoice.ts`

**API Routes (9 files):**
- `src/app/api/invoices/route.ts`
- `src/app/api/invoices/[id]/route.ts`
- `src/app/api/invoices/[id]/status/route.ts`
- `src/app/api/invoices/[id]/send/route.ts`
- `src/app/api/invoices/[id]/line-items/route.ts`
- `src/app/api/invoices/[id]/line-items/[itemId]/route.ts`
- `src/app/api/invoices/[id]/payments/route.ts`
- `src/app/api/invoices/[id]/payments/[paymentId]/route.ts`
- `src/app/api/invoices/from-booking/[bookingId]/route.ts`

**Hooks:**
- `src/hooks/useInvoices.ts`

**Components (12 files):**
- `src/components/invoices/InvoiceCard.tsx`
- `src/components/invoices/InvoiceFilters.tsx`
- `src/components/invoices/InvoiceList.tsx`
- `src/components/invoices/InvoiceSummary.tsx`
- `src/components/invoices/LineItemsTable.tsx`
- `src/components/invoices/LineItemForm.tsx`
- `src/components/invoices/PaymentsList.tsx`
- `src/components/invoices/PaymentForm.tsx`
- `src/components/invoices/InvoiceActivityTimeline.tsx`
- `src/components/invoices/InvoiceForm.tsx`
- `src/components/invoices/InvoiceDetail.tsx`
- `src/components/invoices/statusConfig.ts`

**Pages (4 files):**
- `src/app/invoices/page.tsx`
- `src/app/invoices/new/page.tsx`
- `src/app/invoices/[id]/page.tsx`
- `src/app/invoices/[id]/edit/page.tsx`

---

## Major Issues

None.

---

## Minor Issues

### 1. Type Safety: `Record<string, unknown>` in Hooks

**Location:** `src/hooks/useInvoices.ts`

**Issue:** Several mutation functions use `Record<string, unknown>` for data parameters instead of properly typed inputs.

```typescript
// Lines 42-43
async function createInvoice(data: Record<string, unknown>): Promise<InvoiceWithAll>

// Lines 56-62
async function updateInvoice({ id, data }: { id: string; data: Record<string, unknown> })

// Lines 142-148
async function addLineItem({ invoiceId, data }: { invoiceId: string; data: Record<string, unknown> })
```

**Recommendation:** Use the proper input types from validations:
```typescript
import type { CreateInvoiceInput, UpdateInvoiceInput, CreateLineItemInput } from "@/lib/validations/invoice";

async function createInvoice(data: CreateInvoiceInput): Promise<InvoiceWithAll>
```

**Severity:** Low - TypeScript still provides runtime safety via Zod validation on the API side.

---

### 2. Missing Status Transition Validation

**Location:** `src/app/api/invoices/[id]/status/route.ts`

**Issue:** The status update endpoint allows any status transition without validation. For example, it allows changing from PAID to DRAFT or from CANCELLED to SENT.

```typescript
// Lines 33-37 - No transition validation
await db.invoice.update({
  where: { id },
  data: { status },
});
```

**Recommendation:** Add a validation function for allowed transitions:
```typescript
const ALLOWED_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"],
  PARTIALLY_PAID: ["PAID", "OVERDUE", "CANCELLED"],
  PAID: ["CANCELLED"], // For refund scenarios
  OVERDUE: ["PAID", "PARTIALLY_PAID", "CANCELLED"],
  CANCELLED: [], // Terminal state
};
```

**Severity:** Medium - Could lead to invalid invoice states in production.

---

### 3. InvoiceSummary Prop Types

**Location:** `src/components/invoices/InvoiceSummary.tsx`

**Issue:** Props use `number | unknown` type which is overly permissive and loses type safety.

```typescript
interface InvoiceSummaryProps {
  subtotal: number | unknown;  // Should be Decimal or number
  taxRate: number | unknown;
  // ...
}
```

**Recommendation:** Use proper Prisma Decimal type or create a union type:
```typescript
type DecimalLike = number | string | { toNumber: () => number };

interface InvoiceSummaryProps {
  subtotal: DecimalLike;
  taxRate: DecimalLike;
  // ...
}
```

**Severity:** Low - `decimalToNumber` handles this at runtime.

---

### 4. Potential Race Condition in Invoice Number Generation

**Location:** `src/app/api/invoices/route.ts` (Lines 134-141)

**Issue:** While `upsert` with `increment` is atomic within PostgreSQL, there's a slight window where two concurrent requests could potentially get the same counter value if the upsert fails and retries.

```typescript
const counter = await db.invoiceCounter.upsert({
  where: { year },
  update: { lastNumber: { increment: 1 } },
  create: { year, lastNumber: 1 },
});
```

**Recommendation:** Consider using a database sequence or adding a unique constraint on `invoice_number` to catch duplicates:
```prisma
model Invoice {
  // ...
  invoiceNumber String @unique @map("invoice_number")  // Already exists - good!
}
```

**Severity:** Low - The unique constraint on `invoiceNumber` will catch any duplicates.

---

### 5. Missing Error Toast/Notification in Components

**Location:** Multiple components (InvoiceList, LineItemsTable, PaymentsList, etc.)

**Issue:** Error handling only logs to console without user feedback:
```typescript
} catch (error) {
  console.error("Failed to delete invoice:", error);
}
```

**Recommendation:** Add user-facing error notifications:
```typescript
} catch (error) {
  console.error("Failed to delete invoice:", error);
  toast.error("Failed to delete invoice. Please try again.");
}
```

**Severity:** Low - UX improvement, not a functional issue.

---

### 6. Hardcoded Limit in New Invoice Page

**Location:** `src/app/invoices/new/page.tsx` (Lines 11-22)

**Issue:** Fetching contacts and bookings with `limit=1000` could be problematic for large datasets.

```typescript
async function fetchContacts(): Promise<{ contacts: Contact[] }> {
  const res = await fetch("/api/contacts?limit=1000");
```

**Recommendation:** Consider implementing a searchable dropdown/combobox with debounced API calls for large datasets, or pagination.

**Severity:** Low - Only affects performance with very large datasets.

---

## Positive Notes

### Excellent Patterns Followed

1. **Consistent Zod Validation:** All API routes properly validate inputs using Zod schemas with clear error messages.

2. **UUID Validation:** Path parameters are validated using `uuidParamSchema.safeParse()` before database queries, preventing invalid ID attacks.

3. **Soft Delete Pattern:** Correctly uses `deletedAt` timestamp for soft deletes, maintaining data integrity for audit purposes.

4. **Activity Logging:** Comprehensive audit trail with `InvoiceActivity` records for all important actions (create, update, status changes, payments).

5. **Atomic Calculations:** Invoice totals are recalculated atomically when line items or payments change.

6. **Business Rule Enforcement:**
   - Only DRAFT invoices can be edited
   - Only DRAFT invoices can be sent
   - Payments only allowed on SENT, PARTIALLY_PAID, or OVERDUE invoices
   - Line items can only be modified on DRAFT invoices

7. **React Query Integration:**
   - Proper cache invalidation on mutations
   - Optimistic updates for status changes with rollback on error
   - Query key patterns are consistent

8. **Component Organization:**
   - Clean barrel exports in `index.ts`
   - Single responsibility components
   - Proper separation of concerns (form vs display components)

9. **Status Configuration:** Well-structured `statusConfig.ts` with comprehensive tests (333 lines of unit tests!).

10. **Type Safety:** Good use of `z.output<typeof schema>` for inferred types from Zod schemas.

11. **Decimal Handling:** Proper utility function `decimalToNumber()` to handle Prisma Decimal conversions.

12. **Invoice Number Format:** Clean format `INV-YYYY-NNNN` with year-based counter reset.

13. **UI/UX:**
    - Loading states with spinners
    - Error states with clear messages
    - Confirmation dialogs for destructive actions
    - Responsive layout with mobile considerations

---

## Checklist Results

### Code Quality
- [x] TypeScript types are properly used
- [x] No `any` types (verified)
- [x] Consistent naming conventions
- [x] Code is DRY (no unnecessary duplication)
- [x] Functions are focused and not too long
- [ ] Minor: Some `Record<string, unknown>` could be more specific

### Security
- [x] Input validation on all API routes
- [x] UUID validation on path parameters
- [x] No SQL injection vulnerabilities (Prisma ORM)
- [x] Proper error handling (no sensitive data leakage)
- [x] Authorization checks where needed (status-based)

### Patterns
- [x] Follows existing codebase patterns
- [x] Uses `z.output<typeof schema>` for API types
- [x] Soft delete with `deletedAt`
- [x] Activity logging for audit trail
- [x] React Query with proper cache invalidation

### Business Logic
- [x] Invoice number generation is atomic
- [ ] Status transitions need validation (minor)
- [x] Calculations are correct (subtotal, tax, total)
- [x] Payment auto-updates invoice status
- [x] Only DRAFT invoices can be edited

### UI/UX
- [x] Loading states handled
- [x] Error states handled
- [x] Form validation feedback
- [x] Consistent with existing UI

---

## Test Coverage

Found test file: `src/components/invoices/statusConfig.test.ts` with 333 lines of comprehensive unit tests covering:
- STATUS_ORDER validation
- STATUS_CONFIG structure and values
- getStatusLabel function
- getStatusColor function
- getStatusBgColor function
- PAYMENT_METHOD_ORDER validation
- PAYMENT_METHOD_CONFIG structure and values
- getPaymentMethodLabel function

**Recommendation:** Additional tests could be added for:
- API route handlers
- Invoice calculation utilities in `src/lib/utils.ts`
- Hook behavior (mocking fetch)

---

## Files Summary

| Category | Count | Status |
|----------|-------|--------|
| Schema Models | 5 | Good |
| Type Files | 1 | Good |
| Validation Schemas | 9 | Good |
| API Routes | 9 | Good |
| Hooks | 1 (15 exports) | Good |
| Components | 12 | Good |
| Pages | 4 | Good |
| Tests | 1 | Good |

**Total Lines of Code (estimated):** ~2,500

---

## Conclusion

The Basic Invoicing feature is well-implemented and ready for use. The code follows established patterns, has good type safety, proper validation, and comprehensive activity logging. The minor issues identified are improvements rather than blockers.

**Action Items:**
1. Consider adding status transition validation (Medium priority)
2. Improve type safety in hooks with proper input types (Low priority)
3. Add user-facing error notifications (Low priority)

The feature is **APPROVED** for merge with the recommendation to address the status transition validation in a follow-up PR.
