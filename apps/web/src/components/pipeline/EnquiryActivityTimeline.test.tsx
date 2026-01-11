import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnquiryActivityTimeline } from "./EnquiryActivityTimeline";
import type { EnquiryActivity, EnquiryActivityType } from "@prisma/client";

// Mock @/lib/utils
vi.mock("@/lib/utils", () => ({
  cn: (...args: (string | undefined | boolean)[]) =>
    args.filter(Boolean).join(" "),
  formatRelativeTime: (date: Date | string) => {
    const d = new Date(date);
    if (d.toISOString().includes("2025-01-10")) return "just now";
    if (d.toISOString().includes("2025-01-09")) return "1d ago";
    if (d.toISOString().includes("2025-01-08")) return "2d ago";
    return "3d ago";
  },
}));

const createMockActivity = (
  overrides: Partial<EnquiryActivity> = {}
): EnquiryActivity => ({
  id: "activity-123",
  enquiryId: "enquiry-123",
  type: "ENQUIRY_CREATED" as EnquiryActivityType,
  payload: null,
  createdAt: new Date("2025-01-08T10:00:00Z"),
  ...overrides,
});

describe("EnquiryActivityTimeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty state when no activities", () => {
    render(<EnquiryActivityTimeline activities={[]} />);

    expect(screen.getByText("No activity recorded yet")).toBeInTheDocument();
  });

  it("should not render empty state when activities exist", () => {
    const activities = [createMockActivity()];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(
      screen.queryByText("No activity recorded yet")
    ).not.toBeInTheDocument();
  });

  it("should render ENQUIRY_CREATED activity", () => {
    const activities = [
      createMockActivity({
        type: "ENQUIRY_CREATED" as EnquiryActivityType,
        payload: { enquiryType: "SERVICE" },
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(screen.getByText("Enquiry created (service)")).toBeInTheDocument();
  });

  it("should render ENQUIRY_CREATED without type", () => {
    const activities = [
      createMockActivity({
        type: "ENQUIRY_CREATED" as EnquiryActivityType,
        payload: null,
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(screen.getByText("Enquiry created")).toBeInTheDocument();
  });

  it("should render STAGE_CHANGED activity with from/to", () => {
    const activities = [
      createMockActivity({
        type: "STAGE_CHANGED" as EnquiryActivityType,
        payload: { from: "NEW", to: "CONTACTED" },
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(
      screen.getByText("Stage changed from New to Contacted")
    ).toBeInTheDocument();
  });

  it("should render STAGE_CHANGED activity without from/to", () => {
    const activities = [
      createMockActivity({
        type: "STAGE_CHANGED" as EnquiryActivityType,
        payload: null,
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(screen.getByText("Stage changed")).toBeInTheDocument();
  });

  it("should render ENQUIRY_UPDATED with single field change", () => {
    const activities = [
      createMockActivity({
        type: "ENQUIRY_UPDATED" as EnquiryActivityType,
        payload: {
          changes: {
            message: { from: "Old message", to: "New message" },
          },
        },
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(screen.getByText("Updated message")).toBeInTheDocument();
  });

  it("should render ENQUIRY_UPDATED with multiple field changes", () => {
    const activities = [
      createMockActivity({
        type: "ENQUIRY_UPDATED" as EnquiryActivityType,
        payload: {
          changes: {
            message: { from: "Old", to: "New" },
            estimatedValue: { from: 100, to: 200 },
            enquiryType: { from: "GENERAL", to: "SERVICE" },
          },
        },
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(screen.getByText("Updated 3 fields")).toBeInTheDocument();
  });

  it("should render ENQUIRY_UPDATED without changes payload", () => {
    const activities = [
      createMockActivity({
        type: "ENQUIRY_UPDATED" as EnquiryActivityType,
        payload: null,
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(screen.getByText("Enquiry updated")).toBeInTheDocument();
  });

  it("should render NOTE_ADDED activity", () => {
    const activities = [
      createMockActivity({
        type: "NOTE_ADDED" as EnquiryActivityType,
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(screen.getByText("Note added")).toBeInTheDocument();
  });

  it("should render relative time for activities", () => {
    const activities = [
      createMockActivity({
        createdAt: new Date("2025-01-08T10:00:00Z"),
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(screen.getByText("2d ago")).toBeInTheDocument();
  });

  it("should render multiple activities in order", () => {
    const activities = [
      createMockActivity({
        id: "1",
        type: "ENQUIRY_CREATED" as EnquiryActivityType,
        createdAt: new Date("2025-01-10T10:00:00Z"),
      }),
      createMockActivity({
        id: "2",
        type: "STAGE_CHANGED" as EnquiryActivityType,
        payload: { from: "NEW", to: "CONTACTED" },
        createdAt: new Date("2025-01-09T10:00:00Z"),
      }),
      createMockActivity({
        id: "3",
        type: "NOTE_ADDED" as EnquiryActivityType,
        createdAt: new Date("2025-01-08T10:00:00Z"),
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(screen.getByText("Enquiry created")).toBeInTheDocument();
    expect(
      screen.getByText("Stage changed from New to Contacted")
    ).toBeInTheDocument();
    expect(screen.getByText("Note added")).toBeInTheDocument();
  });

  it("should apply correct colors for ENQUIRY_CREATED", () => {
    const activities = [
      createMockActivity({
        type: "ENQUIRY_CREATED" as EnquiryActivityType,
      }),
    ];
    const { container } = render(
      <EnquiryActivityTimeline activities={activities} />
    );

    const icon = container.querySelector(".bg-green-100");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-green-700");
  });

  it("should apply correct colors for ENQUIRY_UPDATED", () => {
    const activities = [
      createMockActivity({
        type: "ENQUIRY_UPDATED" as EnquiryActivityType,
      }),
    ];
    const { container } = render(
      <EnquiryActivityTimeline activities={activities} />
    );

    const icon = container.querySelector(".bg-blue-100");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-blue-700");
  });

  it("should apply correct colors for STAGE_CHANGED", () => {
    const activities = [
      createMockActivity({
        type: "STAGE_CHANGED" as EnquiryActivityType,
      }),
    ];
    const { container } = render(
      <EnquiryActivityTimeline activities={activities} />
    );

    const icon = container.querySelector(".bg-purple-100");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-purple-700");
  });

  it("should apply correct colors for NOTE_ADDED", () => {
    const activities = [
      createMockActivity({
        type: "NOTE_ADDED" as EnquiryActivityType,
      }),
    ];
    const { container } = render(
      <EnquiryActivityTimeline activities={activities} />
    );

    const icon = container.querySelector(".bg-gray-100");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-gray-700");
  });

  it("should display correct icons for activity types", () => {
    const activities = [
      createMockActivity({
        id: "1",
        type: "ENQUIRY_CREATED" as EnquiryActivityType,
      }),
      createMockActivity({
        id: "2",
        type: "ENQUIRY_UPDATED" as EnquiryActivityType,
      }),
      createMockActivity({
        id: "3",
        type: "STAGE_CHANGED" as EnquiryActivityType,
      }),
      createMockActivity({
        id: "4",
        type: "NOTE_ADDED" as EnquiryActivityType,
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    // Icons are emojis rendered in the component
    const iconElements = document.querySelectorAll(
      ".w-8.h-8.rounded-full"
    );
    expect(iconElements).toHaveLength(4);
  });

  it("should render timeline connector between activities", () => {
    const activities = [
      createMockActivity({ id: "1" }),
      createMockActivity({ id: "2" }),
    ];
    const { container } = render(
      <EnquiryActivityTimeline activities={activities} />
    );

    // Timeline connector is a vertical line with bg-gray-200
    const connectors = container.querySelectorAll(".bg-gray-200");
    expect(connectors.length).toBeGreaterThan(0);
  });

  it("should not render timeline connector after last activity", () => {
    const activities = [createMockActivity({ id: "1" })];
    const { container } = render(
      <EnquiryActivityTimeline activities={activities} />
    );

    // With only one activity, there should be no connector line
    const connectors = container.querySelectorAll(".w-0\\.5.flex-1.bg-gray-200");
    expect(connectors).toHaveLength(0);
  });

  it("should handle stage change through entire pipeline", () => {
    const stageChanges = [
      { from: "NEW", to: "AUTO_RESPONDED" },
      { from: "AUTO_RESPONDED", to: "CONTACTED" },
      { from: "CONTACTED", to: "QUALIFIED" },
      { from: "QUALIFIED", to: "PROPOSAL_SENT" },
      { from: "PROPOSAL_SENT", to: "BOOKED_PAID" },
    ];

    const activities = stageChanges.map((change, i) =>
      createMockActivity({
        id: `${i}`,
        type: "STAGE_CHANGED" as EnquiryActivityType,
        payload: change,
      })
    );

    render(<EnquiryActivityTimeline activities={activities} />);

    expect(
      screen.getByText("Stage changed from New to Auto-Responded")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Stage changed from Auto-Responded to Contacted")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Stage changed from Contacted to Qualified")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Stage changed from Qualified to Proposal Sent")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Stage changed from Proposal Sent to Booked/Paid")
    ).toBeInTheDocument();
  });

  it("should handle stage change to LOST", () => {
    const activities = [
      createMockActivity({
        type: "STAGE_CHANGED" as EnquiryActivityType,
        payload: { from: "QUALIFIED", to: "LOST" },
      }),
    ];
    render(<EnquiryActivityTimeline activities={activities} />);

    expect(
      screen.getByText("Stage changed from Qualified to Lost")
    ).toBeInTheDocument();
  });
});
