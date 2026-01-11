import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingActivityTimeline } from "./BookingActivityTimeline";
import type { BookingActivity, BookingActivityType } from "@prisma/client";

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
  formatDateTime: (date: Date | string) => "15 Feb 2025, 10:00 am",
}));

const createMockActivity = (
  overrides: Partial<BookingActivity> = {}
): BookingActivity => ({
  id: "activity-123",
  bookingId: "booking-123",
  type: "BOOKING_CREATED" as BookingActivityType,
  payload: {},
  actorUserId: null,
  createdAt: new Date("2025-01-08T10:00:00Z"),
  ...overrides,
});

describe("BookingActivityTimeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty state when no activities", () => {
    render(<BookingActivityTimeline activities={[]} />);

    expect(screen.getByText("No activity recorded yet")).toBeInTheDocument();
  });

  it("should not render empty state when activities exist", () => {
    const activities = [createMockActivity()];
    render(<BookingActivityTimeline activities={activities} />);

    expect(
      screen.queryByText("No activity recorded yet")
    ).not.toBeInTheDocument();
  });

  it("should render BOOKING_CREATED activity", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_CREATED" as BookingActivityType,
        payload: { serviceTypeName: "Hair Cut" },
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText("Booking created for Hair Cut")).toBeInTheDocument();
  });

  it("should render BOOKING_CREATED without service type", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_CREATED" as BookingActivityType,
        payload: {},
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText("Booking created")).toBeInTheDocument();
  });

  it("should render BOOKING_UPDATED activity with single field change", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_UPDATED" as BookingActivityType,
        payload: {
          changes: {
            notes: { from: "Old notes", to: "New notes" },
          },
        },
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText("Updated notes")).toBeInTheDocument();
  });

  it("should render BOOKING_UPDATED activity with multiple field changes", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_UPDATED" as BookingActivityType,
        payload: {
          changes: {
            notes: { from: "Old", to: "New" },
            location: { from: "Old location", to: "New location" },
            depositPaid: { from: false, to: true },
          },
        },
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText("Updated 3 fields")).toBeInTheDocument();
  });

  it("should render BOOKING_UPDATED without changes payload", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_UPDATED" as BookingActivityType,
        payload: {},
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText("Booking updated")).toBeInTheDocument();
  });

  it("should render BOOKING_STATUS_CHANGED activity with from/to", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_STATUS_CHANGED" as BookingActivityType,
        payload: { from: "REQUESTED", to: "CONFIRMED" },
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(
      screen.getByText("Status changed from Requested to Confirmed")
    ).toBeInTheDocument();
  });

  it("should render BOOKING_STATUS_CHANGED activity without from/to", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_STATUS_CHANGED" as BookingActivityType,
        payload: {},
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText("Status changed")).toBeInTheDocument();
  });

  it("should render BOOKING_RESCHEDULED activity with new time", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_RESCHEDULED" as BookingActivityType,
        payload: {
          previousStartAt: "2025-02-14T10:00:00.000Z",
          newStartAt: "2025-02-15T10:00:00.000Z",
        },
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText(/Rescheduled to/)).toBeInTheDocument();
  });

  it("should render BOOKING_RESCHEDULED activity without new time", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_RESCHEDULED" as BookingActivityType,
        payload: {},
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText("Booking rescheduled")).toBeInTheDocument();
  });

  it("should render BOOKING_NOTE_ADDED activity with preview", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_NOTE_ADDED" as BookingActivityType,
        payload: { preview: "Customer requested" },
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText("Note: Customer requested")).toBeInTheDocument();
  });

  it("should truncate long note preview", () => {
    const longPreview = "This is a very long note that should be truncated to 50 characters maximum for display purposes";
    const activities = [
      createMockActivity({
        type: "BOOKING_NOTE_ADDED" as BookingActivityType,
        payload: { preview: longPreview },
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    // Should be truncated with ellipsis
    expect(screen.getByText(/Note:.*\.\.\./)).toBeInTheDocument();
  });

  it("should render BOOKING_NOTE_ADDED activity without preview", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_NOTE_ADDED" as BookingActivityType,
        payload: {},
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText("Note added")).toBeInTheDocument();
  });

  it("should render relative time for activities", () => {
    const activities = [
      createMockActivity({
        createdAt: new Date("2025-01-08T10:00:00Z"),
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText("2d ago")).toBeInTheDocument();
  });

  it("should render multiple activities in order", () => {
    const activities = [
      createMockActivity({
        id: "1",
        type: "BOOKING_CREATED" as BookingActivityType,
        createdAt: new Date("2025-01-10T10:00:00Z"),
      }),
      createMockActivity({
        id: "2",
        type: "BOOKING_STATUS_CHANGED" as BookingActivityType,
        payload: { from: "REQUESTED", to: "CONFIRMED" },
        createdAt: new Date("2025-01-09T10:00:00Z"),
      }),
      createMockActivity({
        id: "3",
        type: "BOOKING_NOTE_ADDED" as BookingActivityType,
        createdAt: new Date("2025-01-08T10:00:00Z"),
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(screen.getByText("Booking created")).toBeInTheDocument();
    expect(
      screen.getByText("Status changed from Requested to Confirmed")
    ).toBeInTheDocument();
    expect(screen.getByText("Note added")).toBeInTheDocument();
  });

  it("should apply correct colors for BOOKING_CREATED", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_CREATED" as BookingActivityType,
      }),
    ];
    const { container } = render(
      <BookingActivityTimeline activities={activities} />
    );

    const icon = container.querySelector(".bg-green-100");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-green-700");
  });

  it("should apply correct colors for BOOKING_UPDATED", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_UPDATED" as BookingActivityType,
      }),
    ];
    const { container } = render(
      <BookingActivityTimeline activities={activities} />
    );

    const icon = container.querySelector(".bg-blue-100");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-blue-700");
  });

  it("should apply correct colors for BOOKING_STATUS_CHANGED", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_STATUS_CHANGED" as BookingActivityType,
      }),
    ];
    const { container } = render(
      <BookingActivityTimeline activities={activities} />
    );

    const icon = container.querySelector(".bg-purple-100");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-purple-700");
  });

  it("should apply correct colors for BOOKING_RESCHEDULED", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_RESCHEDULED" as BookingActivityType,
      }),
    ];
    const { container } = render(
      <BookingActivityTimeline activities={activities} />
    );

    const icon = container.querySelector(".bg-amber-100");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-amber-700");
  });

  it("should apply correct colors for BOOKING_NOTE_ADDED", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_NOTE_ADDED" as BookingActivityType,
      }),
    ];
    const { container } = render(
      <BookingActivityTimeline activities={activities} />
    );

    const icon = container.querySelector(".bg-gray-100");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-gray-700");
  });

  it("should render timeline connector between activities", () => {
    const activities = [
      createMockActivity({ id: "1" }),
      createMockActivity({ id: "2" }),
    ];
    const { container } = render(
      <BookingActivityTimeline activities={activities} />
    );

    // Timeline connector is a vertical line with bg-gray-200
    const connectors = container.querySelectorAll(".bg-gray-200");
    expect(connectors.length).toBeGreaterThan(0);
  });

  it("should not render timeline connector after last activity", () => {
    const activities = [createMockActivity({ id: "1" })];
    const { container } = render(
      <BookingActivityTimeline activities={activities} />
    );

    // With only one activity, there should be no connector line
    const connectors = container.querySelectorAll(".w-0\\.5.flex-1.bg-gray-200");
    expect(connectors).toHaveLength(0);
  });

  it("should handle status change through booking flow", () => {
    const statusChanges = [
      { from: "REQUESTED", to: "PENDING_DEPOSIT" },
      { from: "PENDING_DEPOSIT", to: "CONFIRMED" },
      { from: "CONFIRMED", to: "COMPLETED" },
    ];

    const activities = statusChanges.map((change, i) =>
      createMockActivity({
        id: `${i}`,
        type: "BOOKING_STATUS_CHANGED" as BookingActivityType,
        payload: change,
      })
    );

    render(<BookingActivityTimeline activities={activities} />);

    expect(
      screen.getByText("Status changed from Requested to Pending Deposit")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Status changed from Pending Deposit to Confirmed")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Status changed from Confirmed to Completed")
    ).toBeInTheDocument();
  });

  it("should handle status change to CANCELLED", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_STATUS_CHANGED" as BookingActivityType,
        payload: { from: "CONFIRMED", to: "CANCELLED" },
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(
      screen.getByText("Status changed from Confirmed to Cancelled")
    ).toBeInTheDocument();
  });

  it("should handle status change to NO_SHOW", () => {
    const activities = [
      createMockActivity({
        type: "BOOKING_STATUS_CHANGED" as BookingActivityType,
        payload: { from: "CONFIRMED", to: "NO_SHOW" },
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    expect(
      screen.getByText("Status changed from Confirmed to No Show")
    ).toBeInTheDocument();
  });

  it("should display icons for activity types", () => {
    const activities = [
      createMockActivity({
        id: "1",
        type: "BOOKING_CREATED" as BookingActivityType,
      }),
      createMockActivity({
        id: "2",
        type: "BOOKING_UPDATED" as BookingActivityType,
      }),
      createMockActivity({
        id: "3",
        type: "BOOKING_STATUS_CHANGED" as BookingActivityType,
      }),
      createMockActivity({
        id: "4",
        type: "BOOKING_RESCHEDULED" as BookingActivityType,
      }),
      createMockActivity({
        id: "5",
        type: "BOOKING_NOTE_ADDED" as BookingActivityType,
      }),
    ];
    render(<BookingActivityTimeline activities={activities} />);

    // Icons are rendered inside rounded containers
    const iconElements = document.querySelectorAll(
      ".w-8.h-8.rounded-full"
    );
    expect(iconElements).toHaveLength(5);
  });
});
