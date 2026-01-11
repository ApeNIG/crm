import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cn,
  formatDate,
  formatRelativeTime,
  formatDateTime,
  formatTime,
  calculateLineItemTotal,
  calculateSubtotal,
  calculateTaxAmount,
  calculateInvoiceTotals,
  formatInvoiceNumber,
  decimalToNumber,
  formatCurrency,
} from "./utils";

describe("cn", () => {
  it("should merge class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base", isActive && "active");
    expect(result).toBe("base active");
  });

  it("should handle false conditionals", () => {
    const isActive = false;
    const result = cn("base", isActive && "active");
    expect(result).toBe("base");
  });

  it("should merge tailwind classes correctly", () => {
    // tailwind-merge should handle conflicting classes
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("should handle arrays", () => {
    const result = cn(["foo", "bar"]);
    expect(result).toBe("foo bar");
  });

  it("should handle objects", () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toBe("foo baz");
  });
});

describe("formatDate", () => {
  it("should format a date string", () => {
    const result = formatDate("2025-01-15");
    expect(result).toMatch(/15.*Jan.*2025/);
  });

  it("should format a Date object", () => {
    const date = new Date("2025-06-20");
    const result = formatDate(date);
    expect(result).toMatch(/20.*Jun.*2025/);
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "just now" for very recent times', () => {
    const now = new Date("2025-01-10T12:00:00Z");
    vi.setSystemTime(now);

    const thirtySecondsAgo = new Date("2025-01-10T11:59:30Z");
    const result = formatRelativeTime(thirtySecondsAgo);
    expect(result).toBe("just now");
  });

  it("should return minutes for times less than an hour ago", () => {
    const now = new Date("2025-01-10T12:00:00Z");
    vi.setSystemTime(now);

    const thirtyMinsAgo = new Date("2025-01-10T11:30:00Z");
    const result = formatRelativeTime(thirtyMinsAgo);
    expect(result).toBe("30m ago");
  });

  it("should return hours for times less than a day ago", () => {
    const now = new Date("2025-01-10T12:00:00Z");
    vi.setSystemTime(now);

    const fiveHoursAgo = new Date("2025-01-10T07:00:00Z");
    const result = formatRelativeTime(fiveHoursAgo);
    expect(result).toBe("5h ago");
  });

  it("should return days for times less than a week ago", () => {
    const now = new Date("2025-01-10T12:00:00Z");
    vi.setSystemTime(now);

    const threeDaysAgo = new Date("2025-01-07T12:00:00Z");
    const result = formatRelativeTime(threeDaysAgo);
    expect(result).toBe("3d ago");
  });

  it("should return formatted date for times over a week ago", () => {
    const now = new Date("2025-01-10T12:00:00Z");
    vi.setSystemTime(now);

    const twoWeeksAgo = new Date("2024-12-25T12:00:00Z");
    const result = formatRelativeTime(twoWeeksAgo);
    // Should return a formatted date, not relative time
    expect(result).toMatch(/Dec.*2024/);
  });
});

describe("formatDateTime", () => {
  it("should format a date string with date and time", () => {
    const result = formatDateTime("2025-02-15T10:30:00Z");
    // Should include day, month, year, and time
    expect(result).toMatch(/15/);
    expect(result).toMatch(/Feb/);
    expect(result).toMatch(/2025/);
    expect(result).toMatch(/\d{1,2}:\d{2}/); // time format
  });

  it("should format a Date object", () => {
    const date = new Date("2025-06-20T14:45:00Z");
    const result = formatDateTime(date);
    expect(result).toMatch(/20/);
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/2025/);
  });

  it("should include am/pm indicator", () => {
    const morningDate = new Date("2025-02-15T09:00:00Z");
    const morningResult = formatDateTime(morningDate);
    // Should contain either am or pm (locale dependent)
    expect(morningResult.toLowerCase()).toMatch(/am|pm/);
  });

  it("should format time with hours and minutes", () => {
    const result = formatDateTime("2025-02-15T14:30:00Z");
    // Should contain time in format like 2:30 or 14:30
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("formatTime", () => {
  it("should format a date string to time only", () => {
    const result = formatTime("2025-02-15T10:30:00Z");
    // Should only include time, not date
    expect(result).toMatch(/\d{1,2}:\d{2}/);
    expect(result).not.toMatch(/Feb/);
    expect(result).not.toMatch(/2025/);
  });

  it("should format a Date object", () => {
    const date = new Date("2025-06-20T14:45:00Z");
    const result = formatTime(date);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("should include am/pm indicator", () => {
    const morningDate = new Date("2025-02-15T09:00:00Z");
    const morningResult = formatTime(morningDate);
    expect(morningResult.toLowerCase()).toMatch(/am|pm/);
  });

  it("should format minutes with leading zero", () => {
    const result = formatTime("2025-02-15T10:05:00Z");
    // Minutes should have leading zero: :05 not :5
    expect(result).toMatch(/:0\d/);
  });
});

// ============================================
// INVOICE CALCULATION UTILITY TESTS
// ============================================

describe("calculateLineItemTotal", () => {
  it("should calculate correct total for whole numbers", () => {
    const result = calculateLineItemTotal(2, 100);
    expect(result).toBe(200);
  });

  it("should calculate correct total for decimal quantities", () => {
    const result = calculateLineItemTotal(1.5, 100);
    expect(result).toBe(150);
  });

  it("should calculate correct total for decimal prices", () => {
    const result = calculateLineItemTotal(2, 99.99);
    expect(result).toBe(199.98);
  });

  it("should handle zero quantity", () => {
    const result = calculateLineItemTotal(0, 100);
    expect(result).toBe(0);
  });

  it("should handle zero price", () => {
    const result = calculateLineItemTotal(5, 0);
    expect(result).toBe(0);
  });

  it("should round to 2 decimal places", () => {
    // 3 * 33.333 = 99.999 should round to 100.00
    const result = calculateLineItemTotal(3, 33.333);
    expect(result).toBe(100);
  });

  it("should handle small quantities", () => {
    const result = calculateLineItemTotal(0.25, 100);
    expect(result).toBe(25);
  });

  it("should handle edge case with precision", () => {
    // 0.1 + 0.2 floating point issue test
    const result = calculateLineItemTotal(0.1, 10);
    expect(result).toBe(1);
  });
});

describe("calculateSubtotal", () => {
  it("should calculate correct subtotal for single item", () => {
    const lineItems = [{ quantity: 2, unitPrice: 100 }];
    const result = calculateSubtotal(lineItems);
    expect(result).toBe(200);
  });

  it("should calculate correct subtotal for multiple items", () => {
    const lineItems = [
      { quantity: 2, unitPrice: 100 },
      { quantity: 1, unitPrice: 50 },
      { quantity: 3, unitPrice: 25 },
    ];
    const result = calculateSubtotal(lineItems);
    expect(result).toBe(325); // 200 + 50 + 75
  });

  it("should return 0 for empty array", () => {
    const result = calculateSubtotal([]);
    expect(result).toBe(0);
  });

  it("should handle string values (coerced to numbers)", () => {
    const lineItems = [
      { quantity: "2", unitPrice: "100" },
    ] as unknown as Array<{ quantity: number; unitPrice: number }>;
    const result = calculateSubtotal(lineItems);
    expect(result).toBe(200);
  });

  it("should handle decimal values", () => {
    const lineItems = [
      { quantity: 1.5, unitPrice: 99.99 },
      { quantity: 2.5, unitPrice: 50 },
    ];
    const result = calculateSubtotal(lineItems);
    // 1.5 * 99.99 = 149.985, rounded to 149.99
    // 2.5 * 50 = 125.00
    // Total = 274.99, but with rounding may be 274.98
    expect(result).toBeCloseTo(274.98, 2);
  });
});

describe("calculateTaxAmount", () => {
  it("should calculate correct tax for 20% rate", () => {
    const result = calculateTaxAmount(100, 20);
    expect(result).toBe(20);
  });

  it("should calculate correct tax for 10% rate", () => {
    const result = calculateTaxAmount(250, 10);
    expect(result).toBe(25);
  });

  it("should return 0 for 0% tax rate", () => {
    const result = calculateTaxAmount(500, 0);
    expect(result).toBe(0);
  });

  it("should handle fractional tax rates", () => {
    const result = calculateTaxAmount(100, 7.5);
    expect(result).toBe(7.5);
  });

  it("should round to 2 decimal places", () => {
    // 333 * 0.2 = 66.6 should stay as 66.6
    const result = calculateTaxAmount(333, 20);
    expect(result).toBe(66.6);
  });

  it("should handle decimal subtotals", () => {
    const result = calculateTaxAmount(99.99, 20);
    expect(result).toBeCloseTo(20, 2);
  });

  it("should handle 100% tax rate", () => {
    const result = calculateTaxAmount(100, 100);
    expect(result).toBe(100);
  });
});

describe("calculateInvoiceTotals", () => {
  it("should calculate all totals correctly", () => {
    const lineItems = [
      { quantity: 2, unitPrice: 100 },
      { quantity: 1, unitPrice: 50 },
    ];
    const result = calculateInvoiceTotals(lineItems, 20, 0);

    expect(result.subtotal).toBe(250);
    expect(result.taxAmount).toBe(50);
    expect(result.total).toBe(300);
    expect(result.amountDue).toBe(300);
  });

  it("should calculate amount due with partial payment", () => {
    const lineItems = [{ quantity: 1, unitPrice: 100 }];
    const result = calculateInvoiceTotals(lineItems, 20, 50);

    expect(result.subtotal).toBe(100);
    expect(result.taxAmount).toBe(20);
    expect(result.total).toBe(120);
    expect(result.amountDue).toBe(70);
  });

  it("should handle zero amount due (fully paid)", () => {
    const lineItems = [{ quantity: 1, unitPrice: 100 }];
    const result = calculateInvoiceTotals(lineItems, 20, 120);

    expect(result.total).toBe(120);
    expect(result.amountDue).toBe(0);
  });

  it("should handle overpayment (negative amount due)", () => {
    const lineItems = [{ quantity: 1, unitPrice: 100 }];
    const result = calculateInvoiceTotals(lineItems, 0, 150);

    expect(result.total).toBe(100);
    expect(result.amountDue).toBe(-50);
  });

  it("should handle empty line items", () => {
    const result = calculateInvoiceTotals([], 20, 0);

    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(0);
    expect(result.amountDue).toBe(0);
  });

  it("should default amountPaid to 0", () => {
    const lineItems = [{ quantity: 1, unitPrice: 100 }];
    const result = calculateInvoiceTotals(lineItems, 0);

    expect(result.amountDue).toBe(100);
  });

  it("should handle zero tax rate", () => {
    const lineItems = [{ quantity: 2, unitPrice: 50 }];
    const result = calculateInvoiceTotals(lineItems, 0, 0);

    expect(result.subtotal).toBe(100);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(100);
    expect(result.amountDue).toBe(100);
  });
});

describe("formatInvoiceNumber", () => {
  it("should format invoice number with 4-digit sequence", () => {
    const result = formatInvoiceNumber(2025, 1);
    expect(result).toBe("INV-2025-0001");
  });

  it("should pad sequence numbers with leading zeros", () => {
    expect(formatInvoiceNumber(2025, 1)).toBe("INV-2025-0001");
    expect(formatInvoiceNumber(2025, 10)).toBe("INV-2025-0010");
    expect(formatInvoiceNumber(2025, 100)).toBe("INV-2025-0100");
    expect(formatInvoiceNumber(2025, 1000)).toBe("INV-2025-1000");
  });

  it("should handle sequence numbers over 9999", () => {
    const result = formatInvoiceNumber(2025, 10000);
    expect(result).toBe("INV-2025-10000");
  });

  it("should handle different years", () => {
    expect(formatInvoiceNumber(2024, 5)).toBe("INV-2024-0005");
    expect(formatInvoiceNumber(2026, 123)).toBe("INV-2026-0123");
  });

  it("should handle sequence 0", () => {
    const result = formatInvoiceNumber(2025, 0);
    expect(result).toBe("INV-2025-0000");
  });
});

describe("decimalToNumber", () => {
  it("should return number as-is", () => {
    const result = decimalToNumber(123.45);
    expect(result).toBe(123.45);
  });

  it("should convert string to number", () => {
    const result = decimalToNumber("99.99");
    expect(result).toBe(99.99);
  });

  it("should handle Prisma Decimal object", () => {
    const decimalObj = { toNumber: () => 50.25 };
    const result = decimalToNumber(decimalObj);
    expect(result).toBe(50.25);
  });

  it("should return 0 for null", () => {
    const result = decimalToNumber(null);
    expect(result).toBe(0);
  });

  it("should return 0 for undefined", () => {
    const result = decimalToNumber(undefined);
    expect(result).toBe(0);
  });

  it("should return 0 for empty object", () => {
    const result = decimalToNumber({});
    expect(result).toBe(0);
  });

  it("should handle integer strings", () => {
    const result = decimalToNumber("100");
    expect(result).toBe(100);
  });

  it("should handle zero", () => {
    expect(decimalToNumber(0)).toBe(0);
    expect(decimalToNumber("0")).toBe(0);
  });

  it("should handle negative numbers", () => {
    expect(decimalToNumber(-50)).toBe(-50);
    expect(decimalToNumber("-50")).toBe(-50);
  });
});

describe("formatCurrency", () => {
  it("should format GBP currency by default", () => {
    const result = formatCurrency(100);
    // GBP format
    expect(result).toMatch(/£100\.00/);
  });

  it("should format with specified currency", () => {
    const result = formatCurrency(100, "USD");
    // USD format
    expect(result).toMatch(/\$100\.00/);
  });

  it("should format with EUR currency", () => {
    const result = formatCurrency(100, "EUR");
    // EUR format
    expect(result).toMatch(/€100\.00/);
  });

  it("should handle decimal amounts", () => {
    const result = formatCurrency(99.99);
    expect(result).toMatch(/£99\.99/);
  });

  it("should handle zero", () => {
    const result = formatCurrency(0);
    expect(result).toMatch(/£0\.00/);
  });

  it("should handle large amounts with grouping", () => {
    const result = formatCurrency(1000000);
    // Should have thousand separator
    expect(result).toMatch(/£1,000,000\.00/);
  });

  it("should handle negative amounts", () => {
    const result = formatCurrency(-50);
    expect(result).toMatch(/-£50\.00/);
  });

  it("should round to 2 decimal places", () => {
    const result = formatCurrency(99.999);
    expect(result).toMatch(/£100\.00/);
  });
});
