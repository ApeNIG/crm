import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Users, DollarSign, Calendar } from "lucide-react";
import { MetricCard } from "./MetricCard";

// ============================================
// BASIC RENDERING TESTS
// ============================================

describe("MetricCard", () => {
  describe("basic rendering", () => {
    it("should render with icon, label, and value", () => {
      render(
        <MetricCard
          icon={Users}
          label="Total Contacts"
          value={100}
        />
      );

      expect(screen.getByText("Total Contacts")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("should render icon element", () => {
      const { container } = render(
        <MetricCard
          icon={Users}
          label="Total Contacts"
          value={100}
        />
      );

      // Check for SVG icon (lucide-react renders as SVG)
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should render string value correctly", () => {
      render(
        <MetricCard
          icon={DollarSign}
          label="Revenue"
          value="$5,000.00"
        />
      );

      expect(screen.getByText("Revenue")).toBeInTheDocument();
      expect(screen.getByText("$5,000.00")).toBeInTheDocument();
    });

    it("should render numeric value correctly", () => {
      render(
        <MetricCard
          icon={Calendar}
          label="Upcoming Bookings"
          value={25}
        />
      );

      expect(screen.getByText("25")).toBeInTheDocument();
    });
  });

  // ============================================
  // LINK RENDERING TESTS
  // ============================================

  describe("link behavior", () => {
    it("should render as a link when href is provided", () => {
      render(
        <MetricCard
          icon={Users}
          label="Total Contacts"
          value={100}
          href="/contacts"
        />
      );

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/contacts");
    });

    it("should not render as a link when href is not provided", () => {
      render(
        <MetricCard
          icon={Users}
          label="Total Contacts"
          value={100}
        />
      );

      const link = screen.queryByRole("link");
      expect(link).not.toBeInTheDocument();
    });

    it("should have hover styling when href is provided", () => {
      const { container } = render(
        <MetricCard
          icon={Users}
          label="Total Contacts"
          value={100}
          href="/contacts"
        />
      );

      // Check for interactive class on the card when it's a link
      const card = container.querySelector('[class*="card-interactive"]');
      expect(card).toBeInTheDocument();
    });

    it("should render different href values correctly", () => {
      const { rerender } = render(
        <MetricCard
          icon={Users}
          label="Contacts"
          value={50}
          href="/contacts"
        />
      );

      expect(screen.getByRole("link")).toHaveAttribute("href", "/contacts");

      rerender(
        <MetricCard
          icon={Calendar}
          label="Bookings"
          value={10}
          href="/bookings"
        />
      );

      expect(screen.getByRole("link")).toHaveAttribute("href", "/bookings");
    });
  });

  // ============================================
  // VALUE FORMAT TESTS
  // ============================================

  describe("value formats", () => {
    it("should handle currency formatted string value", () => {
      render(
        <MetricCard
          icon={DollarSign}
          label="Outstanding"
          value="$15,000.00"
        />
      );

      expect(screen.getByText("$15,000.00")).toBeInTheDocument();
    });

    it("should handle large number value", () => {
      render(
        <MetricCard
          icon={Users}
          label="Total Users"
          value="1,000,000"
        />
      );

      expect(screen.getByText("1,000,000")).toBeInTheDocument();
    });

    it("should handle zero value", () => {
      render(
        <MetricCard
          icon={Calendar}
          label="Pending"
          value={0}
        />
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle negative value", () => {
      render(
        <MetricCard
          icon={DollarSign}
          label="Balance"
          value="-$500.00"
        />
      );

      expect(screen.getByText("-$500.00")).toBeInTheDocument();
    });

    it("should handle decimal string value", () => {
      render(
        <MetricCard
          icon={DollarSign}
          label="Average"
          value="99.99"
        />
      );

      expect(screen.getByText("99.99")).toBeInTheDocument();
    });
  });

  // ============================================
  // STYLING TESTS
  // ============================================

  describe("styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <MetricCard
          icon={Users}
          label="Test"
          value={1}
          className="custom-class"
        />
      );

      const card = container.querySelector(".custom-class");
      expect(card).toBeInTheDocument();
    });

    it("should render label with correct styling", () => {
      render(
        <MetricCard
          icon={Users}
          label="Total Contacts"
          value={100}
        />
      );

      const label = screen.getByText("Total Contacts");
      expect(label).toHaveClass("text-sm", "font-medium");
    });

    it("should render value with correct styling", () => {
      render(
        <MetricCard
          icon={Users}
          label="Total Contacts"
          value={100}
        />
      );

      const value = screen.getByText("100");
      expect(value).toHaveClass("text-display-md");
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe("accessibility", () => {
    it("should have accessible text content", () => {
      render(
        <MetricCard
          icon={Users}
          label="Active Users"
          value={42}
        />
      );

      expect(screen.getByText("Active Users")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("should be keyboard accessible when rendered as link", () => {
      render(
        <MetricCard
          icon={Users}
          label="Contacts"
          value={100}
          href="/contacts"
        />
      );

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      // Links are inherently keyboard accessible
    });
  });
});
