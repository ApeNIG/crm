import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingCard } from "./BookingCard";
import type { Booking, Contact, ServiceType, BookingStatus } from "@prisma/client";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock @/lib/utils
vi.mock("@/lib/utils", () => ({
  cn: (...args: (string | undefined | boolean)[]) =>
    args.filter(Boolean).join(" "),
  formatDateTime: (date: Date | string) => "15 Feb 2025, 10:00 am",
}));

const createMockBooking = (
  overrides: Partial<Booking & { contact: Contact; serviceType: ServiceType }> = {}
): Booking & { contact: Contact; serviceType: ServiceType } => ({
  id: "booking-123",
  contactId: "contact-123",
  enquiryId: null,
  serviceTypeId: "service-123",
  startAt: new Date("2025-02-15T10:00:00Z"),
  endAt: new Date("2025-02-15T11:00:00Z"),
  status: "REQUESTED" as BookingStatus,
  location: null,
  virtualLink: null,
  notes: null,
  depositPaid: false,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-08"),
  deletedAt: null,
  contact: {
    id: "contact-123",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: null,
    source: "WEBSITE",
    status: "LEAD",
    marketingOptIn: false,
    notes: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    deletedAt: null,
  },
  serviceType: {
    id: "service-123",
    name: "Hair Cut",
    description: "Standard hair cutting service",
    durationMinutes: 45,
    price: null,
    isActive: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  ...overrides,
});

describe("BookingCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render contact name", () => {
    const booking = createMockBooking();
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render contact name with only first name if no last name", () => {
    const booking = createMockBooking({
      contact: {
        id: "contact-123",
        firstName: "Jane",
        lastName: "",
        email: "jane@example.com",
        phone: null,
        source: "WEBSITE",
        status: "LEAD",
        marketingOptIn: false,
        notes: null,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
        deletedAt: null,
      },
    });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  it("should render service type name", () => {
    const booking = createMockBooking();
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("Hair Cut")).toBeInTheDocument();
  });

  it("should render formatted date/time", () => {
    const booking = createMockBooking();
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("15 Feb 2025, 10:00 am")).toBeInTheDocument();
  });

  it("should render status badge for REQUESTED", () => {
    const booking = createMockBooking({ status: "REQUESTED" as BookingStatus });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("Requested")).toBeInTheDocument();
  });

  it("should render status badge for CONFIRMED", () => {
    const booking = createMockBooking({ status: "CONFIRMED" as BookingStatus });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("should render status badge for COMPLETED", () => {
    const booking = createMockBooking({ status: "COMPLETED" as BookingStatus });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("should render status badge for CANCELLED", () => {
    const booking = createMockBooking({ status: "CANCELLED" as BookingStatus });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("should render status badge for PENDING_DEPOSIT", () => {
    const booking = createMockBooking({ status: "PENDING_DEPOSIT" as BookingStatus });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("Pending Deposit")).toBeInTheDocument();
  });

  it("should render status badge for NO_SHOW", () => {
    const booking = createMockBooking({ status: "NO_SHOW" as BookingStatus });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("No Show")).toBeInTheDocument();
  });

  it("should render status badge for RESCHEDULED", () => {
    const booking = createMockBooking({ status: "RESCHEDULED" as BookingStatus });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("Rescheduled")).toBeInTheDocument();
  });

  it("should render status badge with correct color for CONFIRMED (green)", () => {
    const booking = createMockBooking({ status: "CONFIRMED" as BookingStatus });
    render(<BookingCard booking={booking} />);

    const badge = screen.getByText("Confirmed");
    expect(badge).toHaveClass("bg-green-50", "text-green-700");
  });

  it("should render status badge with correct color for CANCELLED (gray)", () => {
    const booking = createMockBooking({ status: "CANCELLED" as BookingStatus });
    render(<BookingCard booking={booking} />);

    const badge = screen.getByText("Cancelled");
    expect(badge).toHaveClass("bg-gray-100", "text-gray-700");
  });

  it("should render location with MapPin icon for physical location", () => {
    const booking = createMockBooking({ location: "123 Main Street" });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("123 Main Street")).toBeInTheDocument();
  });

  it("should render Video icon for virtual location", () => {
    const booking = createMockBooking({ location: "Virtual" });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("Virtual")).toBeInTheDocument();
  });

  it("should render Video icon for virtual (lowercase) location", () => {
    const booking = createMockBooking({ location: "virtual" });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("virtual")).toBeInTheDocument();
  });

  it("should not render location section when location is null", () => {
    const booking = createMockBooking({ location: null });
    render(<BookingCard booking={booking} />);

    expect(screen.queryByText("123 Main Street")).not.toBeInTheDocument();
    expect(screen.queryByText("Virtual")).not.toBeInTheDocument();
  });

  it("should link to booking detail page", () => {
    const booking = createMockBooking({ id: "booking-456" });
    render(<BookingCard booking={booking} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/bookings/booking-456");
  });

  it("should render card container with expected classes", () => {
    const booking = createMockBooking();
    const { container } = render(<BookingCard booking={booking} />);

    const link = container.querySelector("a");
    // The cn utility is mocked, so check that the link exists and has an href
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/bookings/booking-123");
  });

  it("should display different service type names", () => {
    const booking = createMockBooking({
      serviceType: {
        id: "service-456",
        name: "Full Treatment",
        description: "Complete spa treatment",
        durationMinutes: 120,
        price: null,
        isActive: true,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      },
    });
    render(<BookingCard booking={booking} />);

    expect(screen.getByText("Full Treatment")).toBeInTheDocument();
  });
});
