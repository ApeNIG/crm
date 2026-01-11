import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnquiryStageChart } from "./EnquiryStageChart";
import type { EnquiryStageBreakdown } from "@/types/dashboard";

// ============================================
// TEST DATA
// ============================================

const mockBreakdown: EnquiryStageBreakdown[] = [
  { stage: "NEW", count: 5 },
  { stage: "AUTO_RESPONDED", count: 3 },
  { stage: "CONTACTED", count: 10 },
  { stage: "QUALIFIED", count: 7 },
  { stage: "PROPOSAL_SENT", count: 4 },
  { stage: "BOOKED_PAID", count: 15 },
  { stage: "LOST", count: 2 },
];

const emptyBreakdown: EnquiryStageBreakdown[] = [];

const partialBreakdown: EnquiryStageBreakdown[] = [
  { stage: "NEW", count: 5 },
  { stage: "CONTACTED", count: 10 },
];

const zeroCountBreakdown: EnquiryStageBreakdown[] = [
  { stage: "NEW", count: 0 },
  { stage: "AUTO_RESPONDED", count: 0 },
  { stage: "CONTACTED", count: 0 },
  { stage: "QUALIFIED", count: 0 },
  { stage: "PROPOSAL_SENT", count: 0 },
  { stage: "BOOKED_PAID", count: 0 },
  { stage: "LOST", count: 0 },
];

// ============================================
// RENDERING TESTS
// ============================================

describe("EnquiryStageChart", () => {
  describe("basic rendering", () => {
    it("should render the card title", () => {
      render(<EnquiryStageChart breakdown={mockBreakdown} />);

      expect(screen.getByText("Enquiries by Stage")).toBeInTheDocument();
    });

    it("should render all 7 stage labels", () => {
      render(<EnquiryStageChart breakdown={mockBreakdown} />);

      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("Auto Responded")).toBeInTheDocument();
      expect(screen.getByText("Contacted")).toBeInTheDocument();
      expect(screen.getByText("Qualified")).toBeInTheDocument();
      expect(screen.getByText("Proposal Sent")).toBeInTheDocument();
      expect(screen.getByText("Booked & Paid")).toBeInTheDocument();
      expect(screen.getByText("Lost")).toBeInTheDocument();
    });

    it("should render correct counts for each stage", () => {
      render(<EnquiryStageChart breakdown={mockBreakdown} />);

      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should render stages in correct order", () => {
      const { container } = render(<EnquiryStageChart breakdown={mockBreakdown} />);

      const labels = container.querySelectorAll(".text-gray-600");
      const labelTexts = Array.from(labels).map((el) => el.textContent);

      expect(labelTexts).toEqual([
        "New",
        "Auto Responded",
        "Contacted",
        "Qualified",
        "Proposal Sent",
        "Booked & Paid",
        "Lost",
      ]);
    });
  });

  // ============================================
  // PROGRESS BAR TESTS
  // ============================================

  describe("progress bars", () => {
    it("should render progress bars for each stage", () => {
      const { container } = render(<EnquiryStageChart breakdown={mockBreakdown} />);

      // Progress bar backgrounds
      const progressBars = container.querySelectorAll(".bg-gray-100");
      expect(progressBars.length).toBeGreaterThanOrEqual(7);
    });

    it("should have stage-specific colors for progress bars", () => {
      const { container } = render(<EnquiryStageChart breakdown={mockBreakdown} />);

      // Check for stage-specific color classes
      expect(container.querySelector(".bg-blue-500")).toBeInTheDocument();
      expect(container.querySelector(".bg-purple-500")).toBeInTheDocument();
      expect(container.querySelector(".bg-cyan-500")).toBeInTheDocument();
      expect(container.querySelector(".bg-amber-500")).toBeInTheDocument();
      expect(container.querySelector(".bg-orange-500")).toBeInTheDocument();
      expect(container.querySelector(".bg-green-500")).toBeInTheDocument();
      expect(container.querySelector(".bg-gray-400")).toBeInTheDocument();
    });

    it("should calculate progress bar width based on max count", () => {
      const { container } = render(<EnquiryStageChart breakdown={mockBreakdown} />);

      // The stage with max count (15 - BOOKED_PAID) should have 100% width
      const progressBars = container.querySelectorAll('[style*="width"]');
      const widths = Array.from(progressBars).map((el) =>
        (el as HTMLElement).style.width
      );

      // At least one should be 100%
      expect(widths.some((w) => w === "100%")).toBe(true);
    });
  });

  // ============================================
  // EMPTY DATA TESTS
  // ============================================

  describe("empty data handling", () => {
    it("should render all stages even with empty breakdown", () => {
      render(<EnquiryStageChart breakdown={emptyBreakdown} />);

      // All stages should still be displayed with 0 counts
      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("Auto Responded")).toBeInTheDocument();
      expect(screen.getByText("Contacted")).toBeInTheDocument();
      expect(screen.getByText("Qualified")).toBeInTheDocument();
      expect(screen.getByText("Proposal Sent")).toBeInTheDocument();
      expect(screen.getByText("Booked & Paid")).toBeInTheDocument();
      expect(screen.getByText("Lost")).toBeInTheDocument();
    });

    it("should show 0 counts for stages not in breakdown", () => {
      render(<EnquiryStageChart breakdown={partialBreakdown} />);

      // Stages not in breakdown should show 0
      const zeros = screen.getAllByText("0");
      expect(zeros.length).toBeGreaterThanOrEqual(5); // 7 total - 2 with data
    });

    it("should handle all zero counts", () => {
      render(<EnquiryStageChart breakdown={zeroCountBreakdown} />);

      const zeros = screen.getAllByText("0");
      expect(zeros).toHaveLength(7);
    });
  });

  // ============================================
  // PARTIAL DATA TESTS
  // ============================================

  describe("partial data", () => {
    it("should show correct counts for provided stages", () => {
      render(<EnquiryStageChart breakdown={partialBreakdown} />);

      expect(screen.getByText("5")).toBeInTheDocument(); // NEW
      expect(screen.getByText("10")).toBeInTheDocument(); // CONTACTED
    });

    it("should show 0 for missing stages", () => {
      render(<EnquiryStageChart breakdown={partialBreakdown} />);

      // Check that missing stages show 0
      // Get all count elements (font-medium text-gray-900)
      const countElements = screen.getAllByText(/^\d+$/);
      const counts = countElements.map((el) => parseInt(el.textContent || "0"));

      // Should have some zeros for missing stages
      expect(counts.filter((c) => c === 0).length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // STYLING TESTS
  // ============================================

  describe("styling", () => {
    it("should render inside a Card component", () => {
      const { container } = render(<EnquiryStageChart breakdown={mockBreakdown} />);

      const card = container.querySelector(".rounded-lg");
      expect(card).toBeInTheDocument();
    });

    it("should have correct header styling", () => {
      render(<EnquiryStageChart breakdown={mockBreakdown} />);

      const title = screen.getByText("Enquiries by Stage");
      expect(title).toHaveClass("text-base", "font-semibold");
    });

    it("should have rounded progress bars", () => {
      const { container } = render(<EnquiryStageChart breakdown={mockBreakdown} />);

      const progressBars = container.querySelectorAll(".rounded-full");
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe("edge cases", () => {
    it("should handle single stage with count", () => {
      const singleBreakdown: EnquiryStageBreakdown[] = [
        { stage: "NEW", count: 100 },
      ];

      render(<EnquiryStageChart breakdown={singleBreakdown} />);

      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("should handle very large counts", () => {
      const largeBreakdown: EnquiryStageBreakdown[] = [
        { stage: "NEW", count: 10000 },
        { stage: "CONTACTED", count: 5000 },
      ];

      render(<EnquiryStageChart breakdown={largeBreakdown} />);

      expect(screen.getByText("10000")).toBeInTheDocument();
      expect(screen.getByText("5000")).toBeInTheDocument();
    });

    it("should handle all stages having same count", () => {
      const equalBreakdown: EnquiryStageBreakdown[] = [
        { stage: "NEW", count: 10 },
        { stage: "AUTO_RESPONDED", count: 10 },
        { stage: "CONTACTED", count: 10 },
        { stage: "QUALIFIED", count: 10 },
        { stage: "PROPOSAL_SENT", count: 10 },
        { stage: "BOOKED_PAID", count: 10 },
        { stage: "LOST", count: 10 },
      ];

      render(<EnquiryStageChart breakdown={equalBreakdown} />);

      // All progress bars should have 100% width when counts are equal
      const tens = screen.getAllByText("10");
      expect(tens).toHaveLength(7);
    });
  });
});
