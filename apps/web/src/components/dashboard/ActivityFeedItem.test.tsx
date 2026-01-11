import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityFeedItem } from "./ActivityFeedItem";
import type { DashboardActivityItem } from "@/types/dashboard";

// ============================================
// TEST DATA
// ============================================

const mockContactActivity: DashboardActivityItem = {
  id: "1",
  entityType: "contact",
  entityId: "c1",
  type: "CREATED",
  description: "New contact John Doe was created",
  href: "/contacts/c1",
  createdAt: "2025-01-10T10:00:00.000Z",
};

const mockEnquiryActivity: DashboardActivityItem = {
  id: "2",
  entityType: "enquiry",
  entityId: "e1",
  type: "STAGE_CHANGED",
  description: "Enquiry moved to Contacted stage",
  href: "/pipeline?enquiry=e1",
  createdAt: "2025-01-10T09:30:00.000Z",
};

const mockBookingActivity: DashboardActivityItem = {
  id: "3",
  entityType: "booking",
  entityId: "b1",
  type: "CONFIRMED",
  description: "Booking confirmed for Jan 15, 2025",
  href: "/bookings/b1",
  createdAt: "2025-01-10T08:00:00.000Z",
};

const mockInvoiceActivity: DashboardActivityItem = {
  id: "4",
  entityType: "invoice",
  entityId: "i1",
  type: "PAYMENT_RECORDED",
  description: "Payment of $500 recorded",
  href: "/invoices/i1",
  createdAt: "2025-01-09T15:00:00.000Z",
};

// ============================================
// BASIC RENDERING TESTS
// ============================================

describe("ActivityFeedItem", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("basic rendering", () => {
    it("should render activity description", () => {
      render(<ActivityFeedItem activity={mockContactActivity} />);

      expect(screen.getByText("New contact John Doe was created")).toBeInTheDocument();
    });

    it("should render as a link to entity page", () => {
      render(<ActivityFeedItem activity={mockContactActivity} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/contacts/c1");
    });

    it("should render icon for entity type", () => {
      const { container } = render(<ActivityFeedItem activity={mockContactActivity} />);

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should render relative time", () => {
      render(<ActivityFeedItem activity={mockContactActivity} />);

      // 2 hours ago (10:00 -> 12:00)
      expect(screen.getByText("2h ago")).toBeInTheDocument();
    });
  });

  // ============================================
  // ENTITY TYPE TESTS
  // ============================================

  describe("entity types", () => {
    it("should render contact activity with correct icon color", () => {
      const { container } = render(<ActivityFeedItem activity={mockContactActivity} />);

      // Contact should have blue styling
      expect(container.querySelector(".text-blue-600")).toBeInTheDocument();
      expect(container.querySelector(".bg-blue-100")).toBeInTheDocument();
    });

    it("should render enquiry activity with correct icon color", () => {
      const { container } = render(<ActivityFeedItem activity={mockEnquiryActivity} />);

      // Enquiry should have purple styling
      expect(container.querySelector(".text-purple-600")).toBeInTheDocument();
      expect(container.querySelector(".bg-purple-100")).toBeInTheDocument();
    });

    it("should render booking activity with correct icon color", () => {
      const { container } = render(<ActivityFeedItem activity={mockBookingActivity} />);

      // Booking should have green styling
      expect(container.querySelector(".text-green-600")).toBeInTheDocument();
      expect(container.querySelector(".bg-green-100")).toBeInTheDocument();
    });

    it("should render invoice activity with correct icon color", () => {
      const { container } = render(<ActivityFeedItem activity={mockInvoiceActivity} />);

      // Invoice should have amber styling
      expect(container.querySelector(".text-amber-600")).toBeInTheDocument();
      expect(container.querySelector(".bg-amber-100")).toBeInTheDocument();
    });

    it("should link to correct entity page for contact", () => {
      render(<ActivityFeedItem activity={mockContactActivity} />);

      expect(screen.getByRole("link")).toHaveAttribute("href", "/contacts/c1");
    });

    it("should link to correct entity page for enquiry", () => {
      render(<ActivityFeedItem activity={mockEnquiryActivity} />);

      expect(screen.getByRole("link")).toHaveAttribute("href", "/pipeline?enquiry=e1");
    });

    it("should link to correct entity page for booking", () => {
      render(<ActivityFeedItem activity={mockBookingActivity} />);

      expect(screen.getByRole("link")).toHaveAttribute("href", "/bookings/b1");
    });

    it("should link to correct entity page for invoice", () => {
      render(<ActivityFeedItem activity={mockInvoiceActivity} />);

      expect(screen.getByRole("link")).toHaveAttribute("href", "/invoices/i1");
    });
  });

  // ============================================
  // CONNECTOR LINE TESTS
  // ============================================

  describe("connector line", () => {
    it("should show connector line when isLast is false", () => {
      const { container } = render(
        <ActivityFeedItem activity={mockContactActivity} isLast={false} />
      );

      const connectorLine = container.querySelector('[aria-hidden="true"]');
      expect(connectorLine).toBeInTheDocument();
    });

    it("should not show connector line when isLast is true", () => {
      const { container } = render(
        <ActivityFeedItem activity={mockContactActivity} isLast={true} />
      );

      // When isLast is true, the connector line (vertical bar) should not be present
      const connectorLine = container.querySelector(".h-full.w-0\\.5.bg-gray-200");
      expect(connectorLine).not.toBeInTheDocument();
    });

    it("should default to showing connector line when isLast is not provided", () => {
      const { container } = render(
        <ActivityFeedItem activity={mockContactActivity} />
      );

      // Default isLast is false, so connector should be visible
      const connectorLine = container.querySelector('[aria-hidden="true"]');
      expect(connectorLine).toBeInTheDocument();
    });
  });

  // ============================================
  // TIME FORMATTING TESTS
  // ============================================

  describe("time formatting", () => {
    it("should show 'just now' for very recent activities", () => {
      const recentActivity: DashboardActivityItem = {
        ...mockContactActivity,
        createdAt: "2025-01-10T11:59:30.000Z", // 30 seconds ago
      };

      render(<ActivityFeedItem activity={recentActivity} />);

      expect(screen.getByText("just now")).toBeInTheDocument();
    });

    it("should show minutes for activities less than an hour old", () => {
      const minutesAgoActivity: DashboardActivityItem = {
        ...mockContactActivity,
        createdAt: "2025-01-10T11:30:00.000Z", // 30 minutes ago
      };

      render(<ActivityFeedItem activity={minutesAgoActivity} />);

      expect(screen.getByText("30m ago")).toBeInTheDocument();
    });

    it("should show hours for activities less than a day old", () => {
      render(<ActivityFeedItem activity={mockContactActivity} />);

      // 2 hours ago
      expect(screen.getByText("2h ago")).toBeInTheDocument();
    });

    it("should show days for activities less than a week old", () => {
      const daysAgoActivity: DashboardActivityItem = {
        ...mockContactActivity,
        createdAt: "2025-01-08T10:00:00.000Z", // 2 days ago
      };

      render(<ActivityFeedItem activity={daysAgoActivity} />);

      expect(screen.getByText("2d ago")).toBeInTheDocument();
    });

    it("should show formatted date for older activities", () => {
      const oldActivity: DashboardActivityItem = {
        ...mockContactActivity,
        createdAt: "2024-12-25T10:00:00.000Z", // More than a week ago
      };

      render(<ActivityFeedItem activity={oldActivity} />);

      // Should show a formatted date, not relative time
      expect(screen.getByText(/Dec.*2024/)).toBeInTheDocument();
    });
  });

  // ============================================
  // STYLING TESTS
  // ============================================

  describe("styling", () => {
    it("should render as a list item", () => {
      render(<ActivityFeedItem activity={mockContactActivity} />);

      const listItem = screen.getByRole("listitem");
      expect(listItem).toBeInTheDocument();
    });

    it("should have hover styling on the link", () => {
      const { container } = render(<ActivityFeedItem activity={mockContactActivity} />);

      const link = container.querySelector("a.group");
      expect(link).toHaveClass("hover:bg-gray-50");
    });

    it("should have rounded icon container", () => {
      const { container } = render(<ActivityFeedItem activity={mockContactActivity} />);

      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should truncate long descriptions", () => {
      const longActivity: DashboardActivityItem = {
        ...mockContactActivity,
        description: "This is a very long activity description that should be truncated with line-clamp to prevent it from taking up too much vertical space in the activity feed",
      };

      const { container } = render(<ActivityFeedItem activity={longActivity} />);

      const description = container.querySelector(".line-clamp-2");
      expect(description).toBeInTheDocument();
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe("accessibility", () => {
    it("should render as an accessible list item", () => {
      render(<ActivityFeedItem activity={mockContactActivity} />);

      expect(screen.getByRole("listitem")).toBeInTheDocument();
    });

    it("should have accessible link to entity", () => {
      render(<ActivityFeedItem activity={mockContactActivity} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href");
    });

    it("should have aria-hidden on connector line", () => {
      const { container } = render(
        <ActivityFeedItem activity={mockContactActivity} isLast={false} />
      );

      const connectorLine = container.querySelector('[aria-hidden="true"]');
      expect(connectorLine).toBeInTheDocument();
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe("edge cases", () => {
    it("should handle empty description", () => {
      const emptyDescriptionActivity: DashboardActivityItem = {
        ...mockContactActivity,
        description: "",
      };

      render(<ActivityFeedItem activity={emptyDescriptionActivity} />);

      // Should still render without crashing
      expect(screen.getByRole("link")).toBeInTheDocument();
    });

    it("should handle special characters in description", () => {
      const specialCharsActivity: DashboardActivityItem = {
        ...mockContactActivity,
        description: 'Contact "John & Jane" <test@example.com> created',
      };

      render(<ActivityFeedItem activity={specialCharsActivity} />);

      expect(
        screen.getByText('Contact "John & Jane" <test@example.com> created')
      ).toBeInTheDocument();
    });

    it("should handle URL with query parameters in href", () => {
      const queryParamActivity: DashboardActivityItem = {
        ...mockEnquiryActivity,
        href: "/pipeline?enquiry=e1&tab=details",
      };

      render(<ActivityFeedItem activity={queryParamActivity} />);

      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        "/pipeline?enquiry=e1&tab=details"
      );
    });
  });
});
