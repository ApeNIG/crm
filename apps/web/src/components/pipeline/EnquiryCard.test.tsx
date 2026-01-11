import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnquiryCard } from "./EnquiryCard";
import type { EnquiryWithContact } from "@/types/enquiry";

// Mock @dnd-kit/sortable
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

// Mock @dnd-kit/utilities
vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => null,
    },
  },
}));

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
  formatCurrency: (amount: number) => `£${amount.toFixed(2)}`,
  formatRelativeTime: (date: Date | string) => "2d ago",
}));

const createMockEnquiry = (
  overrides: Partial<EnquiryWithContact> = {}
): EnquiryWithContact => ({
  id: "enquiry-123",
  contactId: "contact-123",
  enquiryType: "SERVICE",
  message: "I would like to book an appointment",
  preferredDate: null,
  preferredTime: null,
  estimatedValue: 500,
  stage: "NEW",
  nextActionAt: null,
  sourceUrl: null,
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
  ...overrides,
});

describe("EnquiryCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render contact name", () => {
    const enquiry = createMockEnquiry();
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render contact name with only first name if no last name", () => {
    const enquiry = createMockEnquiry({
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
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  it("should show enquiry type badge for SERVICE", () => {
    const enquiry = createMockEnquiry({ enquiryType: "SERVICE" });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.getByText("Service")).toBeInTheDocument();
  });

  it("should show enquiry type badge for GENERAL", () => {
    const enquiry = createMockEnquiry({ enquiryType: "GENERAL" });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.getByText("General")).toBeInTheDocument();
  });

  it("should show enquiry type badge for PRODUCT", () => {
    const enquiry = createMockEnquiry({ enquiryType: "PRODUCT" });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.getByText("Product")).toBeInTheDocument();
  });

  it("should show enquiry type badge for PARTNERSHIP", () => {
    const enquiry = createMockEnquiry({ enquiryType: "PARTNERSHIP" });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.getByText("Partnership")).toBeInTheDocument();
  });

  it("should display message preview when message exists", () => {
    const enquiry = createMockEnquiry({
      message: "I would like to book an appointment",
    });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(
      screen.getByText("I would like to book an appointment")
    ).toBeInTheDocument();
  });

  it("should not display message preview when message is null", () => {
    const enquiry = createMockEnquiry({ message: null });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(
      screen.queryByText("I would like to book an appointment")
    ).not.toBeInTheDocument();
  });

  it("should display estimated value when present", () => {
    const enquiry = createMockEnquiry({ estimatedValue: 500 });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.getByText("£500.00")).toBeInTheDocument();
  });

  it("should not display estimated value when null", () => {
    const enquiry = createMockEnquiry({ estimatedValue: null });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.queryByText(/£/)).not.toBeInTheDocument();
  });

  it("should display next action time when present", () => {
    const enquiry = createMockEnquiry({
      nextActionAt: new Date("2025-01-10T09:00:00Z"),
    });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.getByText(/Next:/)).toBeInTheDocument();
  });

  it("should display updated time when no next action", () => {
    const enquiry = createMockEnquiry({ nextActionAt: null });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.getByText("2d ago")).toBeInTheDocument();
  });

  it("should link to the enquiry detail page", () => {
    const enquiry = createMockEnquiry({ id: "enquiry-456" });
    render(<EnquiryCard enquiry={enquiry} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/pipeline/enquiry-456");
  });

  it("should apply correct styling for SERVICE type", () => {
    const enquiry = createMockEnquiry({ enquiryType: "SERVICE" });
    render(<EnquiryCard enquiry={enquiry} />);

    const badge = screen.getByText("Service");
    expect(badge).toHaveClass("bg-blue-100", "text-blue-700");
  });

  it("should apply correct styling for GENERAL type", () => {
    const enquiry = createMockEnquiry({ enquiryType: "GENERAL" });
    render(<EnquiryCard enquiry={enquiry} />);

    const badge = screen.getByText("General");
    expect(badge).toHaveClass("bg-gray-100", "text-gray-700");
  });

  it("should apply correct styling for PRODUCT type", () => {
    const enquiry = createMockEnquiry({ enquiryType: "PRODUCT" });
    render(<EnquiryCard enquiry={enquiry} />);

    const badge = screen.getByText("Product");
    expect(badge).toHaveClass("bg-green-100", "text-green-700");
  });

  it("should apply correct styling for PARTNERSHIP type", () => {
    const enquiry = createMockEnquiry({ enquiryType: "PARTNERSHIP" });
    render(<EnquiryCard enquiry={enquiry} />);

    const badge = screen.getByText("Partnership");
    expect(badge).toHaveClass("bg-purple-100", "text-purple-700");
  });

  it("should format estimated value as currency", () => {
    const enquiry = createMockEnquiry({ estimatedValue: 1250.5 });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.getByText("£1250.50")).toBeInTheDocument();
  });

  it("should display zero estimated value", () => {
    const enquiry = createMockEnquiry({ estimatedValue: 0 });
    render(<EnquiryCard enquiry={enquiry} />);

    expect(screen.getByText("£0.00")).toBeInTheDocument();
  });

  it("should render card container with expected classes", () => {
    const enquiry = createMockEnquiry();
    const { container } = render(<EnquiryCard enquiry={enquiry} />);

    const card = container.firstChild;
    expect(card).toHaveClass(
      "bg-white",
      "rounded-lg",
      "border",
      "border-gray-200"
    );
  });
});
