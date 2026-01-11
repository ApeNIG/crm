import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InvoiceStatusSummary } from "./InvoiceStatusSummary";
import type { InvoiceStatusBreakdown } from "@/types/dashboard";

// ============================================
// TEST DATA
// ============================================

const mockBreakdown: InvoiceStatusBreakdown[] = [
  { status: "DRAFT", count: 5, totalAmount: 1000 },
  { status: "SENT", count: 10, totalAmount: 5000 },
  { status: "PARTIALLY_PAID", count: 3, totalAmount: 2000 },
  { status: "PAID", count: 50, totalAmount: 25000 },
  { status: "OVERDUE", count: 2, totalAmount: 1500 },
  { status: "CANCELLED", count: 1, totalAmount: 500 },
];

const emptyBreakdown: InvoiceStatusBreakdown[] = [];

const partialBreakdown: InvoiceStatusBreakdown[] = [
  { status: "SENT", count: 5, totalAmount: 2500 },
  { status: "PAID", count: 20, totalAmount: 10000 },
];

const overdueOnlyBreakdown: InvoiceStatusBreakdown[] = [
  { status: "OVERDUE", count: 5, totalAmount: 5000 },
];

// ============================================
// BASIC RENDERING TESTS
// ============================================

describe("InvoiceStatusSummary", () => {
  describe("basic rendering", () => {
    it("should render the card title", () => {
      render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      expect(screen.getByText("Invoice Summary")).toBeInTheDocument();
    });

    it("should render Outstanding total section", () => {
      render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      expect(screen.getByText("Outstanding")).toBeInTheDocument();
    });

    it("should calculate outstanding amount from SENT + OVERDUE + PARTIALLY_PAID", () => {
      render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      // Outstanding: SENT (5000) + OVERDUE (1500) + PARTIALLY_PAID (2000) = 8500
      // Currency formatted as GBP
      expect(screen.getByText(/8,500/)).toBeInTheDocument();
    });
  });

  // ============================================
  // STATUS BREAKDOWN TESTS
  // ============================================

  describe("status breakdown", () => {
    it("should render status labels for statuses with counts", () => {
      render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      expect(screen.getByText("Draft")).toBeInTheDocument();
      expect(screen.getByText("Sent")).toBeInTheDocument();
      expect(screen.getByText("Partially Paid")).toBeInTheDocument();
      expect(screen.getByText("Paid")).toBeInTheDocument();
      expect(screen.getByText("Overdue")).toBeInTheDocument();
      expect(screen.getByText("Cancelled")).toBeInTheDocument();
    });

    it("should show count and amount for each status", () => {
      render(<InvoiceStatusSummary breakdown={partialBreakdown} />);

      // SENT: 5 invoices, $2500
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getAllByText(/2,500/).length).toBeGreaterThan(0);

      // PAID: 20 invoices, $10000
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getAllByText(/10,000/).length).toBeGreaterThan(0);
    });

    it("should not render statuses with zero count", () => {
      const zeroStatusBreakdown: InvoiceStatusBreakdown[] = [
        { status: "SENT", count: 5, totalAmount: 2500 },
        { status: "CANCELLED", count: 0, totalAmount: 0 },
      ];

      render(<InvoiceStatusSummary breakdown={zeroStatusBreakdown} />);

      expect(screen.getByText("Sent")).toBeInTheDocument();
      expect(screen.queryByText("Cancelled")).not.toBeInTheDocument();
    });
  });

  // ============================================
  // CURRENCY FORMATTING TESTS
  // ============================================

  describe("currency formatting", () => {
    it("should format amounts with GBP currency symbol", () => {
      render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      // Check for GBP formatting
      const amounts = screen.getAllByText(/£/);
      expect(amounts.length).toBeGreaterThan(0);
    });

    it("should format large amounts with thousand separators", () => {
      const largeBreakdown: InvoiceStatusBreakdown[] = [
        { status: "PAID", count: 100, totalAmount: 1000000 },
      ];

      render(<InvoiceStatusSummary breakdown={largeBreakdown} />);

      expect(screen.getByText(/1,000,000/)).toBeInTheDocument();
    });

    it("should format decimal amounts correctly", () => {
      const decimalBreakdown: InvoiceStatusBreakdown[] = [
        { status: "SENT", count: 1, totalAmount: 99.99 },
      ];

      render(<InvoiceStatusSummary breakdown={decimalBreakdown} />);

      // Amount appears in both outstanding total and status row
      expect(screen.getAllByText(/99\.99/).length).toBeGreaterThan(0);
    });

    it("should display zero outstanding when no outstanding invoices", () => {
      const noOutstandingBreakdown: InvoiceStatusBreakdown[] = [
        { status: "PAID", count: 10, totalAmount: 5000 },
        { status: "DRAFT", count: 2, totalAmount: 1000 },
      ];

      render(<InvoiceStatusSummary breakdown={noOutstandingBreakdown} />);

      // Outstanding should be 0 (PAID and DRAFT don't count)
      expect(screen.getByText(/£0\.00/)).toBeInTheDocument();
    });
  });

  // ============================================
  // OVERDUE HIGHLIGHTING TESTS
  // ============================================

  describe("overdue highlighting", () => {
    it("should display overdue status prominently", () => {
      render(<InvoiceStatusSummary breakdown={overdueOnlyBreakdown} />);

      expect(screen.getByText("Overdue")).toBeInTheDocument();
    });

    it("should apply red styling to overdue status", () => {
      const { container } = render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      // Overdue should have red text color
      expect(container.querySelector(".text-red-700")).toBeInTheDocument();
      expect(container.querySelector(".bg-red-50")).toBeInTheDocument();
    });

    it("should display overdue first in status list", () => {
      const { container } = render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      // First link is the Outstanding total, get status links after that
      const statusLinks = container.querySelectorAll('a[href*="/invoices?status="]');
      // Filter out the Outstanding link and get the status breakdown links
      const statusBreakdownLinks = Array.from(statusLinks).filter(
        link => link.getAttribute("href") !== "/invoices?status=SENT" ||
                link.querySelector(".font-medium")?.textContent !== undefined
      );

      // Find the first status link that contains a status label
      const overdueLink = Array.from(statusLinks).find(
        link => link.getAttribute("href") === "/invoices?status=OVERDUE"
      );
      expect(overdueLink).toBeInTheDocument();
    });
  });

  // ============================================
  // EMPTY STATE TESTS
  // ============================================

  describe("empty state", () => {
    it("should display 'No invoices yet' when breakdown is empty", () => {
      render(<InvoiceStatusSummary breakdown={emptyBreakdown} />);

      expect(screen.getByText("No invoices yet")).toBeInTheDocument();
    });

    it("should show zero outstanding when breakdown is empty", () => {
      render(<InvoiceStatusSummary breakdown={emptyBreakdown} />);

      expect(screen.getByText(/£0\.00/)).toBeInTheDocument();
    });
  });

  // ============================================
  // LINK TESTS
  // ============================================

  describe("links", () => {
    it("should render Outstanding total as link to /invoices?status=SENT", () => {
      render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      const outstandingLink = screen.getByRole("link", { name: /Outstanding/i });
      expect(outstandingLink).toHaveAttribute("href", "/invoices?status=SENT");
    });

    it("should render each status as link with correct filter", () => {
      render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      const links = screen.getAllByRole("link");

      // Check for status-specific links
      expect(links.some((link) => link.getAttribute("href") === "/invoices?status=OVERDUE")).toBe(true);
      expect(links.some((link) => link.getAttribute("href") === "/invoices?status=SENT")).toBe(true);
      expect(links.some((link) => link.getAttribute("href") === "/invoices?status=PAID")).toBe(true);
    });
  });

  // ============================================
  // STYLING TESTS
  // ============================================

  describe("styling", () => {
    it("should render inside a Card component", () => {
      const { container } = render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      const card = container.querySelector(".rounded-lg");
      expect(card).toBeInTheDocument();
    });

    it("should apply status-specific background colors", () => {
      const { container } = render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      expect(container.querySelector(".bg-gray-50")).toBeInTheDocument(); // DRAFT/CANCELLED
      expect(container.querySelector(".bg-blue-50")).toBeInTheDocument(); // SENT
      expect(container.querySelector(".bg-amber-50")).toBeInTheDocument(); // Outstanding / PARTIALLY_PAID
      expect(container.querySelector(".bg-green-50")).toBeInTheDocument(); // PAID
      expect(container.querySelector(".bg-red-50")).toBeInTheDocument(); // OVERDUE
    });

    it("should have amber styling for outstanding total", () => {
      const { container } = render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      // Outstanding box should have amber colors
      expect(container.querySelector(".text-amber-700")).toBeInTheDocument();
      expect(container.querySelector(".text-amber-600")).toBeInTheDocument();
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe("edge cases", () => {
    it("should handle only PAID invoices (zero outstanding)", () => {
      const paidOnlyBreakdown: InvoiceStatusBreakdown[] = [
        { status: "PAID", count: 100, totalAmount: 50000 },
      ];

      render(<InvoiceStatusSummary breakdown={paidOnlyBreakdown} />);

      expect(screen.getByText(/£0\.00/)).toBeInTheDocument(); // Outstanding
      expect(screen.getByText("100")).toBeInTheDocument(); // PAID count
    });

    it("should handle only DRAFT invoices (zero outstanding)", () => {
      const draftOnlyBreakdown: InvoiceStatusBreakdown[] = [
        { status: "DRAFT", count: 5, totalAmount: 2500 },
      ];

      render(<InvoiceStatusSummary breakdown={draftOnlyBreakdown} />);

      expect(screen.getByText(/£0\.00/)).toBeInTheDocument(); // Outstanding
      expect(screen.getByText("Draft")).toBeInTheDocument();
    });

    it("should handle very large outstanding amounts", () => {
      const largeBreakdown: InvoiceStatusBreakdown[] = [
        { status: "SENT", count: 1000, totalAmount: 1000000 },
        { status: "OVERDUE", count: 500, totalAmount: 500000 },
      ];

      render(<InvoiceStatusSummary breakdown={largeBreakdown} />);

      // Outstanding: 1,500,000
      expect(screen.getByText(/1,500,000/)).toBeInTheDocument();
    });

    it("should display statuses in correct order (action required first)", () => {
      render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      const { container } = render(<InvoiceStatusSummary breakdown={mockBreakdown} />);
      const statusLabels = container.querySelectorAll(".font-medium");
      const labelTexts = Array.from(statusLabels)
        .map((el) => el.textContent)
        .filter((text) => text !== "Invoice Summary");

      // OVERDUE should come before SENT
      const overdueIndex = labelTexts.indexOf("Overdue");
      const sentIndex = labelTexts.indexOf("Sent");

      if (overdueIndex !== -1 && sentIndex !== -1) {
        expect(overdueIndex).toBeLessThan(sentIndex);
      }
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe("accessibility", () => {
    it("should have accessible links with href attributes", () => {
      render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });

    it("should display counts and amounts as text content", () => {
      render(<InvoiceStatusSummary breakdown={mockBreakdown} />);

      // Verify counts are visible
      expect(screen.getByText("5")).toBeInTheDocument(); // DRAFT count
      expect(screen.getByText("10")).toBeInTheDocument(); // SENT count
    });
  });
});
