import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingStatusSummary } from "./BookingStatusSummary";
import type { BookingStatusBreakdown } from "@/types/dashboard";

// ============================================
// TEST DATA
// ============================================

const mockBreakdown: BookingStatusBreakdown[] = [
  { status: "CONFIRMED", todayCount: 5, weekCount: 20 },
  { status: "REQUESTED", todayCount: 3, weekCount: 10 },
  { status: "PENDING_DEPOSIT", todayCount: 2, weekCount: 8 },
  { status: "COMPLETED", todayCount: 1, weekCount: 15 },
  { status: "CANCELLED", todayCount: 0, weekCount: 2 },
  { status: "NO_SHOW", todayCount: 0, weekCount: 1 },
  { status: "RESCHEDULED", todayCount: 1, weekCount: 3 },
];

const emptyBreakdown: BookingStatusBreakdown[] = [];

const partialBreakdown: BookingStatusBreakdown[] = [
  { status: "CONFIRMED", todayCount: 3, weekCount: 10 },
  { status: "REQUESTED", todayCount: 2, weekCount: 5 },
];

const zeroCountBreakdown: BookingStatusBreakdown[] = [
  { status: "CONFIRMED", todayCount: 0, weekCount: 0 },
  { status: "REQUESTED", todayCount: 0, weekCount: 0 },
  { status: "PENDING_DEPOSIT", todayCount: 0, weekCount: 0 },
];

// ============================================
// BASIC RENDERING TESTS
// ============================================

describe("BookingStatusSummary", () => {
  describe("basic rendering", () => {
    it("should render the card title", () => {
      render(<BookingStatusSummary breakdown={mockBreakdown} />);

      expect(screen.getByText("Booking Schedule")).toBeInTheDocument();
    });

    it("should render Today and This Week summary sections", () => {
      render(<BookingStatusSummary breakdown={mockBreakdown} />);

      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("This Week")).toBeInTheDocument();
    });

    it("should calculate and display total for today", () => {
      render(<BookingStatusSummary breakdown={mockBreakdown} />);

      // Total today: 5 + 3 + 2 + 1 + 0 + 0 + 1 = 12
      expect(screen.getByText("12")).toBeInTheDocument();
    });

    it("should calculate and display total for this week", () => {
      render(<BookingStatusSummary breakdown={mockBreakdown} />);

      // Total week: 20 + 10 + 8 + 15 + 2 + 1 + 3 = 59
      expect(screen.getByText("59")).toBeInTheDocument();
    });
  });

  // ============================================
  // STATUS BREAKDOWN TESTS
  // ============================================

  describe("status breakdown", () => {
    it("should render status labels for statuses with counts", () => {
      render(<BookingStatusSummary breakdown={mockBreakdown} />);

      expect(screen.getByText("Confirmed")).toBeInTheDocument();
      expect(screen.getByText("Requested")).toBeInTheDocument();
      expect(screen.getByText("Pending Deposit")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.getByText("Rescheduled")).toBeInTheDocument();
    });

    it("should show today and week counts for each status", () => {
      render(<BookingStatusSummary breakdown={partialBreakdown} />);

      // CONFIRMED: 3 today, 10 week
      expect(screen.getByText("3 today")).toBeInTheDocument();
      expect(screen.getByText("10 week")).toBeInTheDocument();

      // REQUESTED: 2 today, 5 week
      expect(screen.getByText("2 today")).toBeInTheDocument();
      expect(screen.getByText("5 week")).toBeInTheDocument();
    });

    it("should not render statuses with zero counts in both today and week", () => {
      const zeroStatusBreakdown: BookingStatusBreakdown[] = [
        { status: "CONFIRMED", todayCount: 5, weekCount: 10 },
        { status: "CANCELLED", todayCount: 0, weekCount: 0 },
      ];

      render(<BookingStatusSummary breakdown={zeroStatusBreakdown} />);

      expect(screen.getByText("Confirmed")).toBeInTheDocument();
      expect(screen.queryByText("Cancelled")).not.toBeInTheDocument();
    });

    it("should render status even if only week count is non-zero", () => {
      const weekOnlyBreakdown: BookingStatusBreakdown[] = [
        { status: "CONFIRMED", todayCount: 0, weekCount: 5 },
      ];

      render(<BookingStatusSummary breakdown={weekOnlyBreakdown} />);

      expect(screen.getByText("Confirmed")).toBeInTheDocument();
      expect(screen.getByText("0 today")).toBeInTheDocument();
      expect(screen.getByText("5 week")).toBeInTheDocument();
    });
  });

  // ============================================
  // EMPTY STATE TESTS
  // ============================================

  describe("empty state", () => {
    it("should display 'No bookings scheduled' when breakdown is empty", () => {
      render(<BookingStatusSummary breakdown={emptyBreakdown} />);

      expect(screen.getByText("No bookings scheduled")).toBeInTheDocument();
    });

    it("should show zero totals when breakdown is empty", () => {
      render(<BookingStatusSummary breakdown={emptyBreakdown} />);

      // Both totals should be 0
      const zeros = screen.getAllByText("0");
      expect(zeros.length).toBeGreaterThanOrEqual(2);
    });

    it("should not show status breakdown when all counts are zero", () => {
      render(<BookingStatusSummary breakdown={zeroCountBreakdown} />);

      // Status labels should not appear
      expect(screen.queryByText("Confirmed")).not.toBeInTheDocument();
      expect(screen.queryByText("Requested")).not.toBeInTheDocument();
    });
  });

  // ============================================
  // LINK TESTS
  // ============================================

  describe("links", () => {
    it("should render Today summary as link to calendar", () => {
      render(<BookingStatusSummary breakdown={mockBreakdown} />);

      const links = screen.getAllByRole("link");
      const calendarLinks = links.filter(
        (link) => link.getAttribute("href") === "/calendar"
      );
      expect(calendarLinks.length).toBeGreaterThanOrEqual(2);
    });

    it("should render This Week summary as link to calendar", () => {
      render(<BookingStatusSummary breakdown={mockBreakdown} />);

      const links = screen.getAllByRole("link");
      expect(links.some((link) => link.getAttribute("href") === "/calendar")).toBe(true);
    });
  });

  // ============================================
  // STYLING TESTS
  // ============================================

  describe("styling", () => {
    it("should render inside a Card component", () => {
      const { container } = render(<BookingStatusSummary breakdown={mockBreakdown} />);

      const card = container.querySelector(".rounded-lg");
      expect(card).toBeInTheDocument();
    });

    it("should apply status-specific background colors", () => {
      const { container } = render(<BookingStatusSummary breakdown={mockBreakdown} />);

      // Check for status-specific background colors
      expect(container.querySelector(".bg-green-50")).toBeInTheDocument(); // CONFIRMED
      expect(container.querySelector(".bg-blue-50")).toBeInTheDocument(); // REQUESTED
      expect(container.querySelector(".bg-amber-50")).toBeInTheDocument(); // PENDING_DEPOSIT
    });

    it("should apply status-specific text colors", () => {
      const { container } = render(<BookingStatusSummary breakdown={mockBreakdown} />);

      // Check for status-specific text colors
      expect(container.querySelector(".text-green-700")).toBeInTheDocument(); // CONFIRMED
      expect(container.querySelector(".text-blue-700")).toBeInTheDocument(); // REQUESTED
    });

    it("should have correct summary section styling", () => {
      const { container } = render(<BookingStatusSummary breakdown={mockBreakdown} />);

      // Summary boxes should have gray background
      const summaryBoxes = container.querySelectorAll(".bg-gray-50");
      expect(summaryBoxes.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe("edge cases", () => {
    it("should handle single status with counts", () => {
      const singleBreakdown: BookingStatusBreakdown[] = [
        { status: "CONFIRMED", todayCount: 10, weekCount: 50 },
      ];

      render(<BookingStatusSummary breakdown={singleBreakdown} />);

      expect(screen.getByText("10")).toBeInTheDocument(); // Today total
      expect(screen.getByText("50")).toBeInTheDocument(); // Week total
      expect(screen.getByText("Confirmed")).toBeInTheDocument();
    });

    it("should handle very large counts", () => {
      const largeBreakdown: BookingStatusBreakdown[] = [
        { status: "CONFIRMED", todayCount: 1000, weekCount: 10000 },
      ];

      render(<BookingStatusSummary breakdown={largeBreakdown} />);

      expect(screen.getByText("1000")).toBeInTheDocument();
      expect(screen.getByText("10000")).toBeInTheDocument();
    });

    it("should display statuses in correct order", () => {
      render(<BookingStatusSummary breakdown={mockBreakdown} />);

      const { container } = render(<BookingStatusSummary breakdown={mockBreakdown} />);
      const statusLabels = container.querySelectorAll(".font-medium");
      const labelTexts = Array.from(statusLabels)
        .map((el) => el.textContent)
        .filter((text) => text !== "Booking Schedule");

      // CONFIRMED should come before REQUESTED (as per statusOrder)
      const confirmedIndex = labelTexts.indexOf("Confirmed");
      const requestedIndex = labelTexts.indexOf("Requested");

      if (confirmedIndex !== -1 && requestedIndex !== -1) {
        expect(confirmedIndex).toBeLessThan(requestedIndex);
      }
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe("accessibility", () => {
    it("should have accessible summary links", () => {
      render(<BookingStatusSummary breakdown={mockBreakdown} />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });

    it("should display counts as text content", () => {
      render(<BookingStatusSummary breakdown={mockBreakdown} />);

      // Counts should be accessible as text
      expect(screen.getByText("12")).toBeInTheDocument(); // Total today
      expect(screen.getByText("59")).toBeInTheDocument(); // Total week
    });
  });
});
