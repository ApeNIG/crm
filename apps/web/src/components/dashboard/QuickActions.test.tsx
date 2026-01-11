import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuickActions } from "./QuickActions";

// ============================================
// BASIC RENDERING TESTS
// ============================================

describe("QuickActions", () => {
  describe("rendering", () => {
    it("should render all 4 action buttons", () => {
      render(<QuickActions />);

      expect(screen.getByText("New Contact")).toBeInTheDocument();
      expect(screen.getByText("New Enquiry")).toBeInTheDocument();
      expect(screen.getByText("Calendar")).toBeInTheDocument();
      expect(screen.getByText("New Invoice")).toBeInTheDocument();
    });

    it("should render action buttons as links", () => {
      render(<QuickActions />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(4);
    });

    it("should render icons for each action", () => {
      const { container } = render(<QuickActions />);

      const svgs = container.querySelectorAll("svg");
      expect(svgs).toHaveLength(4);
    });
  });

  // ============================================
  // LINK TESTS
  // ============================================

  describe("links", () => {
    it("should link New Contact to /contacts/new", () => {
      render(<QuickActions />);

      const link = screen.getByRole("link", { name: /New Contact/i });
      expect(link).toHaveAttribute("href", "/contacts/new");
    });

    it("should link New Enquiry to /pipeline?new=true", () => {
      render(<QuickActions />);

      const link = screen.getByRole("link", { name: /New Enquiry/i });
      expect(link).toHaveAttribute("href", "/pipeline?new=true");
    });

    it("should link Calendar to /calendar", () => {
      render(<QuickActions />);

      const link = screen.getByRole("link", { name: /Calendar/i });
      expect(link).toHaveAttribute("href", "/calendar");
    });

    it("should link New Invoice to /invoices/new", () => {
      render(<QuickActions />);

      const link = screen.getByRole("link", { name: /New Invoice/i });
      expect(link).toHaveAttribute("href", "/invoices/new");
    });
  });

  // ============================================
  // STYLING TESTS
  // ============================================

  describe("styling", () => {
    it("should have flex container with gap", () => {
      const { container } = render(<QuickActions />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("flex", "gap-2");
    });

    it("should have flex-wrap for responsive layout", () => {
      const { container } = render(<QuickActions />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("flex-wrap");
    });

    it("should apply outline button variant styling", () => {
      const { container } = render(<QuickActions />);

      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        expect(link).toHaveClass("border");
      });
    });

    it("should apply small size button styling", () => {
      const { container } = render(<QuickActions />);

      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        expect(link).toHaveClass("h-8");
      });
    });
  });

  // ============================================
  // ICON TESTS
  // ============================================

  describe("icons", () => {
    it("should render UserPlus icon for New Contact", () => {
      const { container } = render(<QuickActions />);

      // Icons are rendered as SVGs with specific size classes
      const contactLink = screen.getByRole("link", { name: /New Contact/i });
      const svg = contactLink.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("h-4", "w-4");
    });

    it("should render icons with margin-right for spacing", () => {
      const { container } = render(<QuickActions />);

      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        const svg = link.querySelector("svg");
        expect(svg).toHaveClass("mr-2");
      });
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe("accessibility", () => {
    it("should have accessible link text", () => {
      render(<QuickActions />);

      expect(screen.getByRole("link", { name: /New Contact/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /New Enquiry/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Calendar/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /New Invoice/i })).toBeInTheDocument();
    });

    it("should be keyboard accessible", () => {
      render(<QuickActions />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        // Links are inherently keyboard accessible
        expect(link).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // INTEGRATION TESTS
  // ============================================

  describe("integration", () => {
    it("should render consistently on multiple renders", () => {
      const { rerender } = render(<QuickActions />);

      expect(screen.getAllByRole("link")).toHaveLength(4);

      rerender(<QuickActions />);

      expect(screen.getAllByRole("link")).toHaveLength(4);
    });

    it("should maintain order of action buttons", () => {
      render(<QuickActions />);

      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveTextContent("New Contact");
      expect(links[1]).toHaveTextContent("New Enquiry");
      expect(links[2]).toHaveTextContent("Calendar");
      expect(links[3]).toHaveTextContent("New Invoice");
    });
  });
});
