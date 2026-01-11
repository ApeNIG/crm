import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricsGrid } from "./MetricsGrid";
import type { DashboardMetrics } from "@/types/dashboard";

// ============================================
// TEST DATA
// ============================================

const mockMetrics: DashboardMetrics = {
  totalContacts: 150,
  activeEnquiries: 25,
  upcomingBookings: 10,
  outstandingAmount: 5000.5,
  revenueThisMonth: 15000.75,
};

const zeroMetrics: DashboardMetrics = {
  totalContacts: 0,
  activeEnquiries: 0,
  upcomingBookings: 0,
  outstandingAmount: 0,
  revenueThisMonth: 0,
};

const largeMetrics: DashboardMetrics = {
  totalContacts: 1000000,
  activeEnquiries: 50000,
  upcomingBookings: 10000,
  outstandingAmount: 1000000.99,
  revenueThisMonth: 5000000.5,
};

// ============================================
// BASIC RENDERING TESTS
// ============================================

describe("MetricsGrid", () => {
  describe("rendering", () => {
    it("should render all 5 metric cards", () => {
      render(<MetricsGrid metrics={mockMetrics} />);

      expect(screen.getByText("Total Contacts")).toBeInTheDocument();
      expect(screen.getByText("Active Enquiries")).toBeInTheDocument();
      expect(screen.getByText("Upcoming Bookings")).toBeInTheDocument();
      expect(screen.getByText("Outstanding")).toBeInTheDocument();
      expect(screen.getByText("Revenue This Month")).toBeInTheDocument();
    });

    it("should render correct values for each metric", () => {
      render(<MetricsGrid metrics={mockMetrics} />);

      expect(screen.getByText("150")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("should format currency values correctly", () => {
      render(<MetricsGrid metrics={mockMetrics} />);

      // Currency should be formatted with GBP symbol
      expect(screen.getByText(/5,000\.50/)).toBeInTheDocument();
      expect(screen.getByText(/15,000\.75/)).toBeInTheDocument();
    });
  });

  // ============================================
  // LINK TESTS
  // ============================================

  describe("links", () => {
    it("should render Total Contacts as link to /contacts", () => {
      render(<MetricsGrid metrics={mockMetrics} />);

      const links = screen.getAllByRole("link");
      const contactsLink = links.find(
        (link) => link.getAttribute("href") === "/contacts"
      );
      expect(contactsLink).toBeInTheDocument();
    });

    it("should render Active Enquiries as link to /pipeline", () => {
      render(<MetricsGrid metrics={mockMetrics} />);

      const links = screen.getAllByRole("link");
      const pipelineLink = links.find(
        (link) => link.getAttribute("href") === "/pipeline"
      );
      expect(pipelineLink).toBeInTheDocument();
    });

    it("should render Upcoming Bookings as link to /calendar", () => {
      render(<MetricsGrid metrics={mockMetrics} />);

      const links = screen.getAllByRole("link");
      const calendarLink = links.find(
        (link) => link.getAttribute("href") === "/calendar"
      );
      expect(calendarLink).toBeInTheDocument();
    });

    it("should render Outstanding as link to /invoices?status=SENT", () => {
      render(<MetricsGrid metrics={mockMetrics} />);

      const links = screen.getAllByRole("link");
      const invoicesLink = links.find(
        (link) => link.getAttribute("href") === "/invoices?status=SENT"
      );
      expect(invoicesLink).toBeInTheDocument();
    });

    it("should render Revenue This Month without link", () => {
      render(<MetricsGrid metrics={mockMetrics} />);

      // Revenue This Month should not be a link (no href)
      const links = screen.getAllByRole("link");
      // Total 4 links: contacts, pipeline, calendar, invoices
      expect(links).toHaveLength(4);
    });
  });

  // ============================================
  // RESPONSIVE GRID TESTS
  // ============================================

  describe("grid layout", () => {
    it("should have responsive grid classes", () => {
      const { container } = render(<MetricsGrid metrics={mockMetrics} />);

      const grid = container.querySelector(".grid");
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass("grid-cols-2");
      expect(grid).toHaveClass("md:grid-cols-3");
      expect(grid).toHaveClass("lg:grid-cols-5");
    });

    it("should have gap between cards", () => {
      const { container } = render(<MetricsGrid metrics={mockMetrics} />);

      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("gap-4");
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe("edge cases", () => {
    it("should handle zero values", () => {
      render(<MetricsGrid metrics={zeroMetrics} />);

      // Check for zero values (formatted with locale)
      const zeros = screen.getAllByText("0");
      expect(zeros.length).toBeGreaterThanOrEqual(3);
    });

    it("should handle large numbers with locale formatting", () => {
      render(<MetricsGrid metrics={largeMetrics} />);

      // Large numbers should be formatted with commas
      expect(screen.getByText("1,000,000")).toBeInTheDocument();
      expect(screen.getByText("50,000")).toBeInTheDocument();
      expect(screen.getByText("10,000")).toBeInTheDocument();
    });

    it("should handle decimal currency amounts", () => {
      const decimalMetrics: DashboardMetrics = {
        ...mockMetrics,
        outstandingAmount: 99.99,
        revenueThisMonth: 1234.56,
      };

      render(<MetricsGrid metrics={decimalMetrics} />);

      expect(screen.getByText(/99\.99/)).toBeInTheDocument();
      expect(screen.getByText(/1,234\.56/)).toBeInTheDocument();
    });
  });

  // ============================================
  // ICON TESTS
  // ============================================

  describe("icons", () => {
    it("should render icons for each metric card", () => {
      const { container } = render(<MetricsGrid metrics={mockMetrics} />);

      // Each card should have at least the main metric icon (plus optional arrow icons for links)
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThanOrEqual(5);
    });
  });
});
