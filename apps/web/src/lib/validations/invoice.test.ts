import { describe, it, expect } from "vitest";
import {
  uuidParamSchema,
  invoiceStatusEnum,
  paymentMethodEnum,
  invoiceActivityTypeEnum,
  createLineItemSchema,
  updateLineItemSchema,
  createPaymentSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
  invoiceQuerySchema,
  invoiceFormSchema,
  lineItemFormSchema,
  paymentFormSchema,
} from "./invoice";

// ============================================
// UUID PARAM SCHEMA TESTS
// ============================================

describe("uuidParamSchema", () => {
  it("should accept valid UUID", () => {
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";
    const result = uuidParamSchema.safeParse(validUUID);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(validUUID);
    }
  });

  it("should reject invalid UUID format", () => {
    const result = uuidParamSchema.safeParse("not-a-uuid");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid ID format");
    }
  });

  it("should reject empty string", () => {
    const result = uuidParamSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("should reject UUID with wrong format", () => {
    const result = uuidParamSchema.safeParse("550e8400e29b41d4a716446655440000");
    expect(result.success).toBe(false);
  });
});

// ============================================
// ENUM TESTS
// ============================================

describe("invoiceStatusEnum", () => {
  it("should accept all valid status values", () => {
    const statuses = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED", "PARTIALLY_PAID"];

    for (const status of statuses) {
      const result = invoiceStatusEnum.safeParse(status);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid status values", () => {
    const result = invoiceStatusEnum.safeParse("INVALID_STATUS");
    expect(result.success).toBe(false);
  });

  it("should reject lowercase status values", () => {
    const result = invoiceStatusEnum.safeParse("draft");
    expect(result.success).toBe(false);
  });

  it("should reject empty string", () => {
    const result = invoiceStatusEnum.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("paymentMethodEnum", () => {
  it("should accept all valid payment method values", () => {
    const methods = ["CASH", "CARD", "BANK_TRANSFER", "STRIPE", "OTHER"];

    for (const method of methods) {
      const result = paymentMethodEnum.safeParse(method);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid payment method values", () => {
    const result = paymentMethodEnum.safeParse("INVALID_METHOD");
    expect(result.success).toBe(false);
  });

  it("should reject lowercase values", () => {
    const result = paymentMethodEnum.safeParse("cash");
    expect(result.success).toBe(false);
  });

  it("should reject empty string", () => {
    const result = paymentMethodEnum.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("invoiceActivityTypeEnum", () => {
  it("should accept all valid activity type values", () => {
    const types = [
      "INVOICE_CREATED",
      "INVOICE_UPDATED",
      "INVOICE_STATUS_CHANGED",
      "INVOICE_SENT",
      "PAYMENT_RECORDED",
      "PAYMENT_DELETED",
      "LINE_ITEM_ADDED",
      "LINE_ITEM_UPDATED",
      "LINE_ITEM_DELETED",
    ];

    for (const type of types) {
      const result = invoiceActivityTypeEnum.safeParse(type);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid activity type values", () => {
    const result = invoiceActivityTypeEnum.safeParse("INVALID_TYPE");
    expect(result.success).toBe(false);
  });

  it("should reject lowercase activity type values", () => {
    const result = invoiceActivityTypeEnum.safeParse("invoice_created");
    expect(result.success).toBe(false);
  });

  it("should reject empty string", () => {
    const result = invoiceActivityTypeEnum.safeParse("");
    expect(result.success).toBe(false);
  });
});

// ============================================
// LINE ITEM SCHEMA TESTS
// ============================================

describe("createLineItemSchema", () => {
  describe("valid inputs", () => {
    it("should validate a complete valid line item", () => {
      const validLineItem = {
        description: "Test service",
        quantity: 2,
        unitPrice: 100.5,
        sortOrder: 1,
      };

      const result = createLineItemSchema.safeParse(validLineItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("Test service");
        expect(result.data.quantity).toBe(2);
        expect(result.data.unitPrice).toBe(100.5);
        expect(result.data.sortOrder).toBe(1);
      }
    });

    it("should validate with only required fields", () => {
      const minimalLineItem = {
        description: "Test service",
        unitPrice: 50,
      };

      const result = createLineItemSchema.safeParse(minimalLineItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(1);
        expect(result.data.sortOrder).toBe(0);
      }
    });

    it("should coerce string quantity to number", () => {
      const lineItem = {
        description: "Test",
        quantity: "5",
        unitPrice: 10,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(5);
      }
    });

    it("should coerce string unitPrice to number", () => {
      const lineItem = {
        description: "Test",
        unitPrice: "99.99",
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.unitPrice).toBe(99.99);
      }
    });

    it("should accept zero unit price", () => {
      const lineItem = {
        description: "Free item",
        unitPrice: 0,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(true);
    });

    it("should accept fractional quantity", () => {
      const lineItem = {
        description: "Hourly rate",
        quantity: 1.5,
        unitPrice: 50,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(1.5);
      }
    });
  });

  describe("invalid inputs", () => {
    it("should reject empty description", () => {
      const lineItem = {
        description: "",
        unitPrice: 50,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Description is required");
      }
    });

    it("should reject description over 500 characters", () => {
      const lineItem = {
        description: "a".repeat(501),
        unitPrice: 50,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Description is too long");
      }
    });

    it("should reject zero quantity", () => {
      const lineItem = {
        description: "Test",
        quantity: 0,
        unitPrice: 50,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Quantity must be greater than 0");
      }
    });

    it("should reject negative quantity", () => {
      const lineItem = {
        description: "Test",
        quantity: -1,
        unitPrice: 50,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(false);
    });

    it("should reject negative unit price", () => {
      const lineItem = {
        description: "Test",
        unitPrice: -10,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Unit price cannot be negative");
      }
    });

    it("should reject missing description", () => {
      const lineItem = {
        unitPrice: 50,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(false);
    });

    it("should reject missing unitPrice", () => {
      const lineItem = {
        description: "Test",
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(false);
    });

    it("should reject negative sortOrder", () => {
      const lineItem = {
        description: "Test",
        unitPrice: 50,
        sortOrder: -1,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should accept description at exactly 500 characters", () => {
      const lineItem = {
        description: "a".repeat(500),
        unitPrice: 50,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(true);
    });

    it("should accept minimum valid quantity (0.01)", () => {
      const lineItem = {
        description: "Test",
        quantity: 0.01,
        unitPrice: 100,
      };

      const result = createLineItemSchema.safeParse(lineItem);
      expect(result.success).toBe(true);
    });
  });
});

describe("updateLineItemSchema", () => {
  it("should allow partial updates", () => {
    const update = {
      description: "Updated description",
    };

    const result = updateLineItemSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("Updated description");
    }
  });

  it("should allow empty object", () => {
    const result = updateLineItemSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should still validate field values when provided", () => {
    const update = {
      description: "a".repeat(501),
    };

    const result = updateLineItemSchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it("should allow updating quantity", () => {
    const update = {
      quantity: 5,
    };

    const result = updateLineItemSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(5);
    }
  });

  it("should allow updating unitPrice", () => {
    const update = {
      unitPrice: 99.99,
    };

    const result = updateLineItemSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.unitPrice).toBe(99.99);
    }
  });
});

// ============================================
// PAYMENT SCHEMA TESTS
// ============================================

describe("createPaymentSchema", () => {
  describe("valid inputs", () => {
    it("should validate a complete valid payment", () => {
      const validPayment = {
        amount: 100.5,
        method: "CARD",
        reference: "REF-123",
        notes: "Paid via card",
        paidAt: "2025-01-15T10:00:00.000Z",
      };

      const result = createPaymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(100.5);
        expect(result.data.method).toBe("CARD");
        expect(result.data.reference).toBe("REF-123");
        expect(result.data.notes).toBe("Paid via card");
        expect(result.data.paidAt).toBeInstanceOf(Date);
      }
    });

    it("should validate with only required fields", () => {
      const minimalPayment = {
        amount: 50,
      };

      const result = createPaymentSchema.safeParse(minimalPayment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.method).toBe("OTHER");
        expect(result.data.reference).toBeNull();
        expect(result.data.notes).toBeNull();
        expect(result.data.paidAt).toBeInstanceOf(Date);
      }
    });

    it("should coerce string amount to number", () => {
      const payment = {
        amount: "75.50",
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(75.5);
      }
    });

    it("should accept all valid payment methods", () => {
      const methods = ["CASH", "CARD", "BANK_TRANSFER", "STRIPE", "OTHER"];

      for (const method of methods) {
        const payment = {
          amount: 50,
          method,
        };
        const result = createPaymentSchema.safeParse(payment);
        expect(result.success).toBe(true);
      }
    });

    it("should transform empty reference to null", () => {
      const payment = {
        amount: 50,
        reference: "",
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reference).toBeNull();
      }
    });

    it("should transform empty notes to null", () => {
      const payment = {
        amount: 50,
        notes: "",
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBeNull();
      }
    });

    it("should accept null reference", () => {
      const payment = {
        amount: 50,
        reference: null,
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reference).toBeNull();
      }
    });

    it("should accept null notes", () => {
      const payment = {
        amount: 50,
        notes: null,
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBeNull();
      }
    });
  });

  describe("invalid inputs", () => {
    it("should reject zero amount", () => {
      const payment = {
        amount: 0,
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Amount must be greater than 0");
      }
    });

    it("should reject negative amount", () => {
      const payment = {
        amount: -50,
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(false);
    });

    it("should reject missing amount", () => {
      const payment = {
        method: "CASH",
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(false);
    });

    it("should reject invalid payment method", () => {
      const payment = {
        amount: 50,
        method: "INVALID_METHOD",
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(false);
    });

    it("should reject reference over 200 characters", () => {
      const payment = {
        amount: 50,
        reference: "a".repeat(201),
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Reference is too long");
      }
    });

    it("should reject notes over 1000 characters", () => {
      const payment = {
        amount: 50,
        notes: "a".repeat(1001),
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Notes are too long");
      }
    });

    it("should reject invalid paidAt format", () => {
      const payment = {
        amount: 50,
        paidAt: "not-a-date",
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid date/time");
      }
    });
  });

  describe("edge cases", () => {
    it("should accept reference at exactly 200 characters", () => {
      const payment = {
        amount: 50,
        reference: "a".repeat(200),
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(true);
    });

    it("should accept notes at exactly 1000 characters", () => {
      const payment = {
        amount: 50,
        notes: "a".repeat(1000),
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(true);
    });

    it("should accept minimum valid amount (0.01)", () => {
      const payment = {
        amount: 0.01,
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(true);
    });
  });
});

// ============================================
// INVOICE SCHEMA TESTS
// ============================================

describe("createInvoiceSchema", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";
  const validUUID2 = "660e8400-e29b-41d4-a716-446655440001";
  const validDateTime = "2025-01-15T10:00:00.000Z";
  const validDueDate = "2025-01-30T23:59:59.000Z";

  describe("valid inputs", () => {
    it("should validate a complete valid invoice", () => {
      const validInvoice = {
        contactId: validUUID,
        bookingId: validUUID2,
        issueDate: validDateTime,
        dueDate: validDueDate,
        taxRate: 20,
        notes: "Test invoice notes",
        terms: "Payment due within 30 days",
        lineItems: [
          { description: "Service 1", quantity: 1, unitPrice: 100 },
          { description: "Service 2", quantity: 2, unitPrice: 50 },
        ],
      };

      const result = createInvoiceSchema.safeParse(validInvoice);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactId).toBe(validUUID);
        expect(result.data.bookingId).toBe(validUUID2);
        expect(result.data.issueDate).toBeInstanceOf(Date);
        expect(result.data.dueDate).toBeInstanceOf(Date);
        expect(result.data.taxRate).toBe(20);
        expect(result.data.notes).toBe("Test invoice notes");
        expect(result.data.terms).toBe("Payment due within 30 days");
        expect(result.data.lineItems).toHaveLength(2);
      }
    });

    it("should validate with only required fields", () => {
      const minimalInvoice = {
        contactId: validUUID,
        dueDate: validDueDate,
      };

      const result = createInvoiceSchema.safeParse(minimalInvoice);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactId).toBe(validUUID);
        expect(result.data.bookingId).toBeNull();
        expect(result.data.issueDate).toBeInstanceOf(Date);
        expect(result.data.taxRate).toBe(0);
        expect(result.data.notes).toBeNull();
        expect(result.data.terms).toBeNull();
        expect(result.data.lineItems).toEqual([]);
      }
    });

    it("should accept null bookingId", () => {
      const invoice = {
        contactId: validUUID,
        bookingId: null,
        dueDate: validDueDate,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bookingId).toBeNull();
      }
    });

    it("should reject empty string bookingId (fails UUID validation)", () => {
      const invoice = {
        contactId: validUUID,
        bookingId: "",
        dueDate: validDueDate,
      };

      // Empty string fails UUID validation before transform can apply
      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
    });

    it("should transform empty notes to null", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        notes: "",
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBeNull();
      }
    });

    it("should transform empty terms to null", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        terms: "",
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.terms).toBeNull();
      }
    });

    it("should coerce string taxRate to number", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        taxRate: "15",
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.taxRate).toBe(15);
      }
    });

    it("should accept zero tax rate", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        taxRate: 0,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
    });

    it("should default issueDate to current date when not provided", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.issueDate).toBeInstanceOf(Date);
      }
    });
  });

  describe("invalid inputs", () => {
    it("should reject invalid contactId (not UUID)", () => {
      const invoice = {
        contactId: "not-a-uuid",
        dueDate: validDueDate,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid contact ID");
      }
    });

    it("should reject empty contactId", () => {
      const invoice = {
        contactId: "",
        dueDate: validDueDate,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
    });

    it("should reject missing contactId", () => {
      const invoice = {
        dueDate: validDueDate,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
    });

    it("should reject invalid bookingId (not UUID)", () => {
      const invoice = {
        contactId: validUUID,
        bookingId: "not-a-uuid",
        dueDate: validDueDate,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid booking ID");
      }
    });

    it("should reject missing dueDate", () => {
      const invoice = {
        contactId: validUUID,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
    });

    it("should reject invalid issueDate format", () => {
      const invoice = {
        contactId: validUUID,
        issueDate: "not-a-date",
        dueDate: validDueDate,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid issue date");
      }
    });

    it("should reject invalid dueDate format", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: "not-a-date",
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid due date");
      }
    });

    it("should reject negative tax rate", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        taxRate: -5,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
    });

    it("should reject tax rate over 100", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        taxRate: 101,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
    });

    it("should reject notes over 2000 characters", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        notes: "a".repeat(2001),
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Notes are too long");
      }
    });

    it("should reject terms over 2000 characters", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        terms: "a".repeat(2001),
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Terms are too long");
      }
    });

    it("should reject invalid line item in array", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        lineItems: [{ description: "", unitPrice: 50 }],
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should accept notes at exactly 2000 characters", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        notes: "a".repeat(2000),
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
    });

    it("should accept terms at exactly 2000 characters", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        terms: "a".repeat(2000),
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
    });

    it("should accept tax rate at exactly 100", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        taxRate: 100,
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
    });

    it("should accept empty lineItems array", () => {
      const invoice = {
        contactId: validUUID,
        dueDate: validDueDate,
        lineItems: [],
      };

      const result = createInvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
    });
  });
});

describe("updateInvoiceSchema", () => {
  const validDateTime = "2025-01-15T10:00:00.000Z";

  it("should allow partial updates", () => {
    const update = {
      taxRate: 15,
    };

    const result = updateInvoiceSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.taxRate).toBe(15);
    }
  });

  it("should allow empty object", () => {
    const result = updateInvoiceSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should not contain contactId field", () => {
    const update = {
      taxRate: 15,
    };

    const result = updateInvoiceSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("contactId");
    }
  });

  it("should not contain bookingId field", () => {
    const update = {
      taxRate: 15,
    };

    const result = updateInvoiceSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("bookingId");
    }
  });

  it("should allow updating issueDate", () => {
    const update = {
      issueDate: validDateTime,
    };

    const result = updateInvoiceSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.issueDate).toBeInstanceOf(Date);
    }
  });

  it("should allow updating dueDate", () => {
    const update = {
      dueDate: validDateTime,
    };

    const result = updateInvoiceSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dueDate).toBeInstanceOf(Date);
    }
  });

  it("should allow updating notes", () => {
    const update = {
      notes: "Updated notes",
    };

    const result = updateInvoiceSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBe("Updated notes");
    }
  });

  it("should allow updating terms", () => {
    const update = {
      terms: "Updated terms",
    };

    const result = updateInvoiceSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.terms).toBe("Updated terms");
    }
  });

  it("should allow updating multiple fields", () => {
    const update = {
      taxRate: 20,
      notes: "Updated notes",
      terms: "Updated terms",
    };

    const result = updateInvoiceSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.taxRate).toBe(20);
      expect(result.data.notes).toBe("Updated notes");
      expect(result.data.terms).toBe("Updated terms");
    }
  });

  it("should still validate field values when provided", () => {
    const update = {
      notes: "a".repeat(2001),
    };

    const result = updateInvoiceSchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it("should transform empty notes to null", () => {
    const update = {
      notes: "",
    };

    const result = updateInvoiceSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeNull();
    }
  });
});

describe("updateInvoiceStatusSchema", () => {
  it("should accept valid status", () => {
    const update = {
      status: "SENT",
    };

    const result = updateInvoiceStatusSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("SENT");
    }
  });

  it("should accept all valid status values", () => {
    const statuses = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED", "PARTIALLY_PAID"];

    for (const status of statuses) {
      const update = { status };
      const result = updateInvoiceStatusSchema.safeParse(update);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid status", () => {
    const update = {
      status: "INVALID_STATUS",
    };

    const result = updateInvoiceStatusSchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it("should require status field", () => {
    const result = updateInvoiceStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject empty status", () => {
    const update = {
      status: "",
    };

    const result = updateInvoiceStatusSchema.safeParse(update);
    expect(result.success).toBe(false);
  });
});

// ============================================
// QUERY SCHEMA TESTS
// ============================================

describe("invoiceQuerySchema", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("should provide defaults for pagination", () => {
    const result = invoiceQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(100);
    }
  });

  it("should coerce string page to number", () => {
    const result = invoiceQuerySchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });

  it("should coerce string limit to number", () => {
    const result = invoiceQuerySchema.safeParse({ limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
    }
  });

  it("should reject page less than 1", () => {
    const result = invoiceQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject negative page", () => {
    const result = invoiceQuerySchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("should reject limit less than 1", () => {
    const result = invoiceQuerySchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject limit over 200", () => {
    const result = invoiceQuerySchema.safeParse({ limit: 201 });
    expect(result.success).toBe(false);
  });

  it("should accept limit at exactly 200", () => {
    const result = invoiceQuerySchema.safeParse({ limit: 200 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(200);
    }
  });

  it("should accept valid search string", () => {
    const result = invoiceQuerySchema.safeParse({ search: "INV-2025" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("INV-2025");
    }
  });

  it("should accept valid status filter", () => {
    const result = invoiceQuerySchema.safeParse({ status: "PAID" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("PAID");
    }
  });

  it("should reject invalid status filter", () => {
    const result = invoiceQuerySchema.safeParse({ status: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("should accept valid contactId filter", () => {
    const result = invoiceQuerySchema.safeParse({ contactId: validUUID });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactId).toBe(validUUID);
    }
  });

  it("should reject invalid contactId UUID", () => {
    const result = invoiceQuerySchema.safeParse({ contactId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid bookingId filter", () => {
    const result = invoiceQuerySchema.safeParse({ bookingId: validUUID });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bookingId).toBe(validUUID);
    }
  });

  it("should reject invalid bookingId UUID", () => {
    const result = invoiceQuerySchema.safeParse({ bookingId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid dateFrom filter", () => {
    const dateFrom = "2025-01-01T00:00:00.000Z";
    const result = invoiceQuerySchema.safeParse({ dateFrom });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateFrom).toBeInstanceOf(Date);
    }
  });

  it("should accept valid dateTo filter", () => {
    const dateTo = "2025-12-31T23:59:59.000Z";
    const result = invoiceQuerySchema.safeParse({ dateTo });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateTo).toBeInstanceOf(Date);
    }
  });

  it("should accept all valid filter values combined", () => {
    const query = {
      search: "INV-2025",
      status: "PAID",
      contactId: validUUID,
      bookingId: validUUID,
      dateFrom: "2025-01-01T00:00:00.000Z",
      dateTo: "2025-12-31T23:59:59.000Z",
      page: 2,
      limit: 25,
    };

    const result = invoiceQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("INV-2025");
      expect(result.data.status).toBe("PAID");
      expect(result.data.contactId).toBe(validUUID);
      expect(result.data.bookingId).toBe(validUUID);
      expect(result.data.dateFrom).toBeInstanceOf(Date);
      expect(result.data.dateTo).toBeInstanceOf(Date);
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });
});

// ============================================
// FORM SCHEMA TESTS
// ============================================

describe("invoiceFormSchema", () => {
  it("should validate a complete valid form", () => {
    const validForm = {
      contactId: "550e8400-e29b-41d4-a716-446655440000",
      bookingId: "660e8400-e29b-41d4-a716-446655440001",
      issueDate: "2025-01-15",
      dueDate: "2025-01-30",
      taxRate: "20",
      notes: "Test notes",
      terms: "Net 30",
    };

    const result = invoiceFormSchema.safeParse(validForm);
    expect(result.success).toBe(true);
  });

  it("should validate with minimal required fields", () => {
    const minimalForm = {
      contactId: "550e8400-e29b-41d4-a716-446655440000",
      bookingId: "",
      issueDate: "2025-01-15",
      dueDate: "2025-01-30",
      taxRate: "0",
      notes: "",
      terms: "",
    };

    const result = invoiceFormSchema.safeParse(minimalForm);
    expect(result.success).toBe(true);
  });

  it("should reject empty contactId", () => {
    const form = {
      contactId: "",
      bookingId: "",
      issueDate: "2025-01-15",
      dueDate: "2025-01-30",
      taxRate: "0",
      notes: "",
      terms: "",
    };

    const result = invoiceFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Contact is required");
    }
  });

  it("should reject empty issueDate", () => {
    const form = {
      contactId: "550e8400-e29b-41d4-a716-446655440000",
      bookingId: "",
      issueDate: "",
      dueDate: "2025-01-30",
      taxRate: "0",
      notes: "",
      terms: "",
    };

    const result = invoiceFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Issue date is required");
    }
  });

  it("should reject empty dueDate", () => {
    const form = {
      contactId: "550e8400-e29b-41d4-a716-446655440000",
      bookingId: "",
      issueDate: "2025-01-15",
      dueDate: "",
      taxRate: "0",
      notes: "",
      terms: "",
    };

    const result = invoiceFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Due date is required");
    }
  });

  it("should reject notes over 2000 characters", () => {
    const form = {
      contactId: "550e8400-e29b-41d4-a716-446655440000",
      bookingId: "",
      issueDate: "2025-01-15",
      dueDate: "2025-01-30",
      taxRate: "0",
      notes: "a".repeat(2001),
      terms: "",
    };

    const result = invoiceFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Notes are too long");
    }
  });

  it("should reject terms over 2000 characters", () => {
    const form = {
      contactId: "550e8400-e29b-41d4-a716-446655440000",
      bookingId: "",
      issueDate: "2025-01-15",
      dueDate: "2025-01-30",
      taxRate: "0",
      notes: "",
      terms: "a".repeat(2001),
    };

    const result = invoiceFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Terms are too long");
    }
  });
});

describe("lineItemFormSchema", () => {
  it("should validate a complete valid form", () => {
    const validForm = {
      description: "Test service",
      quantity: "2",
      unitPrice: "99.99",
    };

    const result = lineItemFormSchema.safeParse(validForm);
    expect(result.success).toBe(true);
  });

  it("should reject empty description", () => {
    const form = {
      description: "",
      quantity: "1",
      unitPrice: "50",
    };

    const result = lineItemFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Description is required");
    }
  });

  it("should reject description over 500 characters", () => {
    const form = {
      description: "a".repeat(501),
      quantity: "1",
      unitPrice: "50",
    };

    const result = lineItemFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Description is too long");
    }
  });

  it("should reject empty quantity", () => {
    const form = {
      description: "Test",
      quantity: "",
      unitPrice: "50",
    };

    const result = lineItemFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Quantity is required");
    }
  });

  it("should reject empty unitPrice", () => {
    const form = {
      description: "Test",
      quantity: "1",
      unitPrice: "",
    };

    const result = lineItemFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Unit price is required");
    }
  });
});

describe("paymentFormSchema", () => {
  it("should validate a complete valid form", () => {
    const validForm = {
      amount: "100.00",
      method: "CARD",
      reference: "REF-123",
      notes: "Test payment",
      paidAt: "2025-01-15T10:00:00.000Z",
    };

    const result = paymentFormSchema.safeParse(validForm);
    expect(result.success).toBe(true);
  });

  it("should validate with minimal required fields", () => {
    const minimalForm = {
      amount: "50",
      method: "OTHER",
      reference: "",
      notes: "",
      paidAt: "",
    };

    const result = paymentFormSchema.safeParse(minimalForm);
    expect(result.success).toBe(true);
  });

  it("should reject empty amount", () => {
    const form = {
      amount: "",
      method: "CASH",
      reference: "",
      notes: "",
      paidAt: "",
    };

    const result = paymentFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Amount is required");
    }
  });

  it("should accept all valid payment methods", () => {
    const methods = ["CASH", "CARD", "BANK_TRANSFER", "STRIPE", "OTHER"];

    for (const method of methods) {
      const form = {
        amount: "50",
        method,
        reference: "",
        notes: "",
        paidAt: "",
      };
      const result = paymentFormSchema.safeParse(form);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid payment method", () => {
    const form = {
      amount: "50",
      method: "INVALID",
      reference: "",
      notes: "",
      paidAt: "",
    };

    const result = paymentFormSchema.safeParse(form);
    expect(result.success).toBe(false);
  });

  it("should reject reference over 200 characters", () => {
    const form = {
      amount: "50",
      method: "CASH",
      reference: "a".repeat(201),
      notes: "",
      paidAt: "",
    };

    const result = paymentFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Reference is too long");
    }
  });

  it("should reject notes over 1000 characters", () => {
    const form = {
      amount: "50",
      method: "CASH",
      reference: "",
      notes: "a".repeat(1001),
      paidAt: "",
    };

    const result = paymentFormSchema.safeParse(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Notes are too long");
    }
  });
});
