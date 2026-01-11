import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardSkeleton } from "./DashboardSkeleton";

// ============================================
// BASIC RENDERING TESTS
// ============================================

describe("DashboardSkeleton", () => {
  describe("rendering", () => {
    it("should render the skeleton container", () => {
      const { container } = render(<DashboardSkeleton />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("should render skeleton with animate-pulse class", () => {
      const { container } = render(<DashboardSkeleton />);

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // QUICK ACTIONS SKELETON TESTS
  // ============================================

  describe("quick actions skeleton", () => {
    it("should render 4 quick action skeletons", () => {
      const { container } = render(<DashboardSkeleton />);

      // Quick actions are the first row of skeletons
      const quickActionsRow = container.querySelector(".flex.gap-2");
      expect(quickActionsRow).toBeInTheDocument();

      const quickActionSkeletons = quickActionsRow?.querySelectorAll(".animate-pulse");
      expect(quickActionSkeletons?.length).toBe(4);
    });

    it("should have correct size for quick action skeletons", () => {
      const { container } = render(<DashboardSkeleton />);

      const quickActionsRow = container.querySelector(".flex.gap-2");
      const skeletons = quickActionsRow?.querySelectorAll(".h-8.w-28");
      expect(skeletons?.length).toBe(4);
    });
  });

  // ============================================
  // METRICS GRID SKELETON TESTS
  // ============================================

  describe("metrics grid skeleton", () => {
    it("should render 5 metric card skeletons", () => {
      const { container } = render(<DashboardSkeleton />);

      // Find the metrics grid (5 columns on large screens)
      const metricsGrid = container.querySelector(".lg\\:grid-cols-5");
      expect(metricsGrid).toBeInTheDocument();

      // Each metric card has a direct child rounded-lg container
      const metricCards = metricsGrid?.querySelectorAll(":scope > .rounded-lg");
      expect(metricCards?.length).toBe(5);
    });

    it("should have responsive grid classes for metrics", () => {
      const { container } = render(<DashboardSkeleton />);

      const metricsGrid = container.querySelector(".grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-5");
      expect(metricsGrid).toBeInTheDocument();
    });

    it("should render icon skeleton in each metric card", () => {
      const { container } = render(<DashboardSkeleton />);

      const metricsGrid = container.querySelector(".lg\\:grid-cols-5");
      const iconSkeletons = metricsGrid?.querySelectorAll(".h-12.w-12");
      expect(iconSkeletons?.length).toBe(5);
    });

    it("should render label and value skeletons in metric cards", () => {
      const { container } = render(<DashboardSkeleton />);

      const metricsGrid = container.querySelector(".lg\\:grid-cols-5");
      const labelSkeletons = metricsGrid?.querySelectorAll(".h-4.w-24");
      const valueSkeletons = metricsGrid?.querySelectorAll(".h-7.w-16");

      expect(labelSkeletons?.length).toBe(5);
      expect(valueSkeletons?.length).toBe(5);
    });
  });

  // ============================================
  // CHART SKELETONS TESTS
  // ============================================

  describe("chart skeletons", () => {
    it("should render 3 chart skeletons", () => {
      const { container } = render(<DashboardSkeleton />);

      // Charts are in a 3-column grid on large screens
      const chartsGrid = container.querySelector(".lg\\:grid-cols-3");
      expect(chartsGrid).toBeInTheDocument();

      const chartCards = chartsGrid?.querySelectorAll(".rounded-lg");
      expect(chartCards?.length).toBe(3);
    });

    it("should render header skeleton in each chart", () => {
      const { container } = render(<DashboardSkeleton />);

      const chartsGrid = container.querySelector(".lg\\:grid-cols-3");
      const headerSkeletons = chartsGrid?.querySelectorAll(".h-5.w-32");
      expect(headerSkeletons?.length).toBe(3);
    });

    it("should render 5 bar skeletons in each chart", () => {
      const { container } = render(<DashboardSkeleton />);

      const chartsGrid = container.querySelector(".lg\\:grid-cols-3");
      const charts = chartsGrid?.querySelectorAll(".rounded-lg");

      charts?.forEach((chart) => {
        const barSkeletons = chart.querySelectorAll(".h-2.w-full");
        expect(barSkeletons.length).toBe(5);
      });
    });
  });

  // ============================================
  // ACTIVITY SKELETON TESTS
  // ============================================

  describe("activity skeleton", () => {
    it("should render activity feed skeleton", () => {
      const { container } = render(<DashboardSkeleton />);

      // Activity skeleton has circular avatar placeholders
      const avatarSkeletons = container.querySelectorAll(".h-8.w-8.rounded-full");
      expect(avatarSkeletons.length).toBe(5);
    });

    it("should render 5 activity item skeletons", () => {
      const { container } = render(<DashboardSkeleton />);

      // Each activity item has an avatar and text content
      const avatarSkeletons = container.querySelectorAll(".h-8.w-8.rounded-full");
      expect(avatarSkeletons.length).toBe(5);
    });

    it("should render description and time skeletons for each activity", () => {
      const { container } = render(<DashboardSkeleton />);

      // Activity descriptions
      const descriptionSkeletons = container.querySelectorAll(".h-4.w-full.max-w-\\[250px\\]");
      expect(descriptionSkeletons.length).toBe(5);

      // Activity times
      const timeSkeletons = container.querySelectorAll(".h-3.w-16");
      expect(timeSkeletons.length).toBe(5);
    });

    it("should render activity header skeleton", () => {
      const { container } = render(<DashboardSkeleton />);

      // Activity section should have a header
      // The last section with h-5.w-32 after the charts grid is the activity header
      const headerSkeletons = container.querySelectorAll(".h-5.w-32");
      expect(headerSkeletons.length).toBeGreaterThan(3); // 3 from charts + 1 from activity
    });
  });

  // ============================================
  // LAYOUT TESTS
  // ============================================

  describe("layout", () => {
    it("should have correct spacing between sections", () => {
      const { container } = render(<DashboardSkeleton />);

      const mainContainer = container.querySelector(".space-y-6");
      expect(mainContainer).toBeInTheDocument();
    });

    it("should match dashboard layout structure", () => {
      const { container } = render(<DashboardSkeleton />);

      // Main container
      const mainContainer = container.querySelector(".space-y-6");
      expect(mainContainer).toBeInTheDocument();

      // Quick actions (flex row)
      const quickActions = container.querySelector(".flex.gap-2");
      expect(quickActions).toBeInTheDocument();

      // Metrics grid (5 columns)
      const metricsGrid = container.querySelector(".lg\\:grid-cols-5");
      expect(metricsGrid).toBeInTheDocument();

      // Charts grid (3 columns)
      const chartsGrid = container.querySelector(".lg\\:grid-cols-3");
      expect(chartsGrid).toBeInTheDocument();
    });
  });

  // ============================================
  // STYLING TESTS
  // ============================================

  describe("styling", () => {
    it("should apply gray background to skeleton elements", () => {
      const { container } = render(<DashboardSkeleton />);

      const graySkeletons = container.querySelectorAll(".bg-gray-200");
      expect(graySkeletons.length).toBeGreaterThan(0);
    });

    it("should apply rounded corners to skeleton elements", () => {
      const { container } = render(<DashboardSkeleton />);

      const roundedSkeletons = container.querySelectorAll(".rounded-md");
      expect(roundedSkeletons.length).toBeGreaterThan(0);
    });

    it("should render cards with shadow and border", () => {
      const { container } = render(<DashboardSkeleton />);

      // Cards use shadow-md with the Lore design system
      const cards = container.querySelectorAll(".rounded-lg.border");
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe("accessibility", () => {
    it("should not contain interactive elements", () => {
      render(<DashboardSkeleton />);

      expect(screen.queryAllByRole("button")).toHaveLength(0);
      expect(screen.queryAllByRole("link")).toHaveLength(0);
    });

    it("should be a purely visual placeholder", () => {
      const { container } = render(<DashboardSkeleton />);

      // Should not have any text content that a user would read
      const textContent = container.textContent;
      expect(textContent?.trim()).toBe("");
    });
  });

  // ============================================
  // CONSISTENCY TESTS
  // ============================================

  describe("consistency", () => {
    it("should render consistently on multiple renders", () => {
      const { rerender, container } = render(<DashboardSkeleton />);

      const initialSkeletonCount = container.querySelectorAll(".animate-pulse").length;

      rerender(<DashboardSkeleton />);

      const rerenderSkeletonCount = container.querySelectorAll(".animate-pulse").length;
      expect(rerenderSkeletonCount).toBe(initialSkeletonCount);
    });

    it("should maintain proper structure after rerender", () => {
      const { rerender, container } = render(<DashboardSkeleton />);

      expect(container.querySelector(".lg\\:grid-cols-5")).toBeInTheDocument();
      expect(container.querySelector(".lg\\:grid-cols-3")).toBeInTheDocument();

      rerender(<DashboardSkeleton />);

      expect(container.querySelector(".lg\\:grid-cols-5")).toBeInTheDocument();
      expect(container.querySelector(".lg\\:grid-cols-3")).toBeInTheDocument();
    });
  });
});
