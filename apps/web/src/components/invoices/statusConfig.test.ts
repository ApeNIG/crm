import { describe, it, expect } from "vitest";
import {
  STATUS_ORDER,
  STATUS_CONFIG,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  PAYMENT_METHOD_ORDER,
  PAYMENT_METHOD_CONFIG,
  getPaymentMethodLabel,
} from "./statusConfig";
import type { InvoiceStatus, PaymentMethod } from "@/types/invoice";

// ============================================
// STATUS_ORDER TESTS
// ============================================

describe("STATUS_ORDER", () => {
  it("should contain all 6 statuses", () => {
    expect(STATUS_ORDER).toHaveLength(6);
  });

  it("should start with DRAFT status", () => {
    expect(STATUS_ORDER[0]).toBe("DRAFT");
  });

  it("should contain all expected statuses", () => {
    expect(STATUS_ORDER).toContain("DRAFT");
    expect(STATUS_ORDER).toContain("SENT");
    expect(STATUS_ORDER).toContain("PARTIALLY_PAID");
    expect(STATUS_ORDER).toContain("PAID");
    expect(STATUS_ORDER).toContain("OVERDUE");
    expect(STATUS_ORDER).toContain("CANCELLED");
  });

  it("should have DRAFT before SENT (logical progression)", () => {
    const draftIndex = STATUS_ORDER.indexOf("DRAFT");
    const sentIndex = STATUS_ORDER.indexOf("SENT");
    expect(draftIndex).toBeLessThan(sentIndex);
  });

  it("should have SENT before PAID", () => {
    const sentIndex = STATUS_ORDER.indexOf("SENT");
    const paidIndex = STATUS_ORDER.indexOf("PAID");
    expect(sentIndex).toBeLessThan(paidIndex);
  });

  it("should have PARTIALLY_PAID before PAID", () => {
    const partiallyPaidIndex = STATUS_ORDER.indexOf("PARTIALLY_PAID");
    const paidIndex = STATUS_ORDER.indexOf("PAID");
    expect(partiallyPaidIndex).toBeLessThan(paidIndex);
  });
});

// ============================================
// STATUS_CONFIG TESTS
// ============================================

describe("STATUS_CONFIG", () => {
  it("should have config for all statuses in STATUS_ORDER", () => {
    for (const status of STATUS_ORDER) {
      expect(STATUS_CONFIG[status]).toBeDefined();
    }
  });

  it("should have correct structure for each status config", () => {
    for (const status of STATUS_ORDER) {
      const config = STATUS_CONFIG[status];
      expect(config).toHaveProperty("key");
      expect(config).toHaveProperty("label");
      expect(config).toHaveProperty("color");
      expect(config).toHaveProperty("bgColor");
    }
  });

  it("should have matching key and status", () => {
    for (const status of STATUS_ORDER) {
      const config = STATUS_CONFIG[status];
      expect(config.key).toBe(status);
    }
  });

  it("should have human-readable labels", () => {
    expect(STATUS_CONFIG.DRAFT.label).toBe("Draft");
    expect(STATUS_CONFIG.SENT.label).toBe("Sent");
    expect(STATUS_CONFIG.PARTIALLY_PAID.label).toBe("Partially Paid");
    expect(STATUS_CONFIG.PAID.label).toBe("Paid");
    expect(STATUS_CONFIG.OVERDUE.label).toBe("Overdue");
    expect(STATUS_CONFIG.CANCELLED.label).toBe("Cancelled");
  });

  it("should have Tailwind text color classes", () => {
    for (const status of STATUS_ORDER) {
      const config = STATUS_CONFIG[status];
      expect(config.color).toMatch(/^text-\w+-\d+$/);
    }
  });

  it("should have Tailwind background color classes", () => {
    for (const status of STATUS_ORDER) {
      const config = STATUS_CONFIG[status];
      expect(config.bgColor).toMatch(/^bg-\w+-\d+$/);
    }
  });

  it("should have distinct colors for DRAFT (gray)", () => {
    expect(STATUS_CONFIG.DRAFT.color).toContain("gray");
    expect(STATUS_CONFIG.DRAFT.bgColor).toContain("gray");
  });

  it("should have distinct colors for SENT (blue)", () => {
    expect(STATUS_CONFIG.SENT.color).toContain("blue");
    expect(STATUS_CONFIG.SENT.bgColor).toContain("blue");
  });

  it("should have distinct colors for PARTIALLY_PAID (amber)", () => {
    expect(STATUS_CONFIG.PARTIALLY_PAID.color).toContain("amber");
    expect(STATUS_CONFIG.PARTIALLY_PAID.bgColor).toContain("amber");
  });

  it("should have distinct colors for PAID (green)", () => {
    expect(STATUS_CONFIG.PAID.color).toContain("green");
    expect(STATUS_CONFIG.PAID.bgColor).toContain("green");
  });

  it("should have distinct colors for OVERDUE (red)", () => {
    expect(STATUS_CONFIG.OVERDUE.color).toContain("red");
    expect(STATUS_CONFIG.OVERDUE.bgColor).toContain("red");
  });

  it("should have distinct colors for CANCELLED (gray)", () => {
    expect(STATUS_CONFIG.CANCELLED.color).toContain("gray");
    expect(STATUS_CONFIG.CANCELLED.bgColor).toContain("gray");
  });
});

// ============================================
// getStatusLabel TESTS
// ============================================

describe("getStatusLabel", () => {
  it("should return correct label for DRAFT", () => {
    expect(getStatusLabel("DRAFT")).toBe("Draft");
  });

  it("should return correct label for SENT", () => {
    expect(getStatusLabel("SENT")).toBe("Sent");
  });

  it("should return correct label for PARTIALLY_PAID", () => {
    expect(getStatusLabel("PARTIALLY_PAID")).toBe("Partially Paid");
  });

  it("should return correct label for PAID", () => {
    expect(getStatusLabel("PAID")).toBe("Paid");
  });

  it("should return correct label for OVERDUE", () => {
    expect(getStatusLabel("OVERDUE")).toBe("Overdue");
  });

  it("should return correct label for CANCELLED", () => {
    expect(getStatusLabel("CANCELLED")).toBe("Cancelled");
  });

  it("should return status as fallback for unknown status", () => {
    const unknownStatus = "UNKNOWN" as InvoiceStatus;
    expect(getStatusLabel(unknownStatus)).toBe("UNKNOWN");
  });
});

// ============================================
// getStatusColor TESTS
// ============================================

describe("getStatusColor", () => {
  it("should return correct color for DRAFT", () => {
    expect(getStatusColor("DRAFT")).toBe("text-gray-700");
  });

  it("should return correct color for SENT", () => {
    expect(getStatusColor("SENT")).toBe("text-blue-700");
  });

  it("should return correct color for PARTIALLY_PAID", () => {
    expect(getStatusColor("PARTIALLY_PAID")).toBe("text-amber-700");
  });

  it("should return correct color for PAID", () => {
    expect(getStatusColor("PAID")).toBe("text-green-700");
  });

  it("should return correct color for OVERDUE", () => {
    expect(getStatusColor("OVERDUE")).toBe("text-red-700");
  });

  it("should return correct color for CANCELLED", () => {
    expect(getStatusColor("CANCELLED")).toBe("text-gray-500");
  });

  it("should return default gray color for unknown status", () => {
    const unknownStatus = "UNKNOWN" as InvoiceStatus;
    expect(getStatusColor(unknownStatus)).toBe("text-gray-700");
  });
});

// ============================================
// getStatusBgColor TESTS
// ============================================

describe("getStatusBgColor", () => {
  it("should return correct background color for DRAFT", () => {
    expect(getStatusBgColor("DRAFT")).toBe("bg-gray-100");
  });

  it("should return correct background color for SENT", () => {
    expect(getStatusBgColor("SENT")).toBe("bg-blue-50");
  });

  it("should return correct background color for PARTIALLY_PAID", () => {
    expect(getStatusBgColor("PARTIALLY_PAID")).toBe("bg-amber-50");
  });

  it("should return correct background color for PAID", () => {
    expect(getStatusBgColor("PAID")).toBe("bg-green-50");
  });

  it("should return correct background color for OVERDUE", () => {
    expect(getStatusBgColor("OVERDUE")).toBe("bg-red-50");
  });

  it("should return correct background color for CANCELLED", () => {
    expect(getStatusBgColor("CANCELLED")).toBe("bg-gray-50");
  });

  it("should return default gray background for unknown status", () => {
    const unknownStatus = "UNKNOWN" as InvoiceStatus;
    expect(getStatusBgColor(unknownStatus)).toBe("bg-gray-50");
  });
});

// ============================================
// PAYMENT_METHOD_ORDER TESTS
// ============================================

describe("PAYMENT_METHOD_ORDER", () => {
  it("should contain all 5 payment methods", () => {
    expect(PAYMENT_METHOD_ORDER).toHaveLength(5);
  });

  it("should start with CASH", () => {
    expect(PAYMENT_METHOD_ORDER[0]).toBe("CASH");
  });

  it("should contain all expected payment methods", () => {
    expect(PAYMENT_METHOD_ORDER).toContain("CASH");
    expect(PAYMENT_METHOD_ORDER).toContain("CARD");
    expect(PAYMENT_METHOD_ORDER).toContain("BANK_TRANSFER");
    expect(PAYMENT_METHOD_ORDER).toContain("STRIPE");
    expect(PAYMENT_METHOD_ORDER).toContain("OTHER");
  });

  it("should end with OTHER (catch-all)", () => {
    expect(PAYMENT_METHOD_ORDER[PAYMENT_METHOD_ORDER.length - 1]).toBe("OTHER");
  });
});

// ============================================
// PAYMENT_METHOD_CONFIG TESTS
// ============================================

describe("PAYMENT_METHOD_CONFIG", () => {
  it("should have config for all payment methods in PAYMENT_METHOD_ORDER", () => {
    for (const method of PAYMENT_METHOD_ORDER) {
      expect(PAYMENT_METHOD_CONFIG[method]).toBeDefined();
    }
  });

  it("should have correct structure for each payment method config", () => {
    for (const method of PAYMENT_METHOD_ORDER) {
      const config = PAYMENT_METHOD_CONFIG[method];
      expect(config).toHaveProperty("key");
      expect(config).toHaveProperty("label");
    }
  });

  it("should have matching key and method", () => {
    for (const method of PAYMENT_METHOD_ORDER) {
      const config = PAYMENT_METHOD_CONFIG[method];
      expect(config.key).toBe(method);
    }
  });

  it("should have human-readable labels", () => {
    expect(PAYMENT_METHOD_CONFIG.CASH.label).toBe("Cash");
    expect(PAYMENT_METHOD_CONFIG.CARD.label).toBe("Card");
    expect(PAYMENT_METHOD_CONFIG.BANK_TRANSFER.label).toBe("Bank Transfer");
    expect(PAYMENT_METHOD_CONFIG.STRIPE.label).toBe("Stripe");
    expect(PAYMENT_METHOD_CONFIG.OTHER.label).toBe("Other");
  });
});

// ============================================
// getPaymentMethodLabel TESTS
// ============================================

describe("getPaymentMethodLabel", () => {
  it("should return correct label for CASH", () => {
    expect(getPaymentMethodLabel("CASH")).toBe("Cash");
  });

  it("should return correct label for CARD", () => {
    expect(getPaymentMethodLabel("CARD")).toBe("Card");
  });

  it("should return correct label for BANK_TRANSFER", () => {
    expect(getPaymentMethodLabel("BANK_TRANSFER")).toBe("Bank Transfer");
  });

  it("should return correct label for STRIPE", () => {
    expect(getPaymentMethodLabel("STRIPE")).toBe("Stripe");
  });

  it("should return correct label for OTHER", () => {
    expect(getPaymentMethodLabel("OTHER")).toBe("Other");
  });

  it("should return method as fallback for unknown payment method", () => {
    const unknownMethod = "UNKNOWN" as PaymentMethod;
    expect(getPaymentMethodLabel(unknownMethod)).toBe("UNKNOWN");
  });
});
