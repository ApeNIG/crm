import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnquiryColumn } from "./EnquiryColumn";
import type { EnquiryWithContact, EnquiryStage } from "@/types/enquiry";

// Mock @dnd-kit/core
vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
}));

// Mock @dnd-kit/sortable
vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  verticalListSortingStrategy: {},
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
  formatRelativeTime: () => "2d ago",
}));

const createMockEnquiry = (
  id: string,
  firstName: string = "John",
  lastName: string = "Doe"
): EnquiryWithContact => ({
  id,
  contactId: `contact-${id}`,
  enquiryType: "SERVICE",
  message: "Test message",
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
    id: `contact-${id}`,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}@example.com`,
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

describe("EnquiryColumn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render column header with stage label", () => {
    render(<EnquiryColumn stage="NEW" enquiries={[]} />);

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should render correct label for AUTO_RESPONDED stage", () => {
    render(<EnquiryColumn stage="AUTO_RESPONDED" enquiries={[]} />);

    expect(screen.getByText("Auto-Responded")).toBeInTheDocument();
  });

  it("should render correct label for CONTACTED stage", () => {
    render(<EnquiryColumn stage="CONTACTED" enquiries={[]} />);

    expect(screen.getByText("Contacted")).toBeInTheDocument();
  });

  it("should render correct label for QUALIFIED stage", () => {
    render(<EnquiryColumn stage="QUALIFIED" enquiries={[]} />);

    expect(screen.getByText("Qualified")).toBeInTheDocument();
  });

  it("should render correct label for PROPOSAL_SENT stage", () => {
    render(<EnquiryColumn stage="PROPOSAL_SENT" enquiries={[]} />);

    expect(screen.getByText("Proposal Sent")).toBeInTheDocument();
  });

  it("should render correct label for BOOKED_PAID stage", () => {
    render(<EnquiryColumn stage="BOOKED_PAID" enquiries={[]} />);

    expect(screen.getByText("Booked/Paid")).toBeInTheDocument();
  });

  it("should render correct label for LOST stage", () => {
    render(<EnquiryColumn stage="LOST" enquiries={[]} />);

    expect(screen.getByText("Lost")).toBeInTheDocument();
  });

  it("should display enquiry count badge", () => {
    const enquiries = [
      createMockEnquiry("1", "John", "Doe"),
      createMockEnquiry("2", "Jane", "Smith"),
      createMockEnquiry("3", "Bob", "Wilson"),
    ];
    render(<EnquiryColumn stage="NEW" enquiries={enquiries} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should display zero count for empty column", () => {
    render(<EnquiryColumn stage="NEW" enquiries={[]} />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should render empty state when no enquiries", () => {
    render(<EnquiryColumn stage="NEW" enquiries={[]} />);

    expect(screen.getByText("Drop here")).toBeInTheDocument();
  });

  it("should not render empty state when enquiries exist", () => {
    const enquiries = [createMockEnquiry("1")];
    render(<EnquiryColumn stage="NEW" enquiries={enquiries} />);

    expect(screen.queryByText("Drop here")).not.toBeInTheDocument();
  });

  it("should render all enquiry cards", () => {
    const enquiries = [
      createMockEnquiry("1", "John", "Doe"),
      createMockEnquiry("2", "Jane", "Smith"),
    ];
    render(<EnquiryColumn stage="NEW" enquiries={enquiries} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("should apply correct stage color indicator for NEW", () => {
    const { container } = render(
      <EnquiryColumn stage="NEW" enquiries={[]} />
    );

    // Check for the colored dot indicator
    const dot = container.querySelector('[class*="rounded-full"]');
    expect(dot).toBeInTheDocument();
  });

  it("should render stage label for NEW", () => {
    render(<EnquiryColumn stage="NEW" enquiries={[]} />);

    const label = screen.getByText("New");
    expect(label).toHaveClass("text-foreground");
  });

  it("should apply correct stage indicator for BOOKED_PAID", () => {
    const { container } = render(
      <EnquiryColumn stage="BOOKED_PAID" enquiries={[]} />
    );

    // Check for the colored dot indicator
    const dot = container.querySelector('[class*="rounded-full"]');
    expect(dot).toBeInTheDocument();

    const label = screen.getByText("Booked/Paid");
    expect(label).toBeInTheDocument();
  });

  it("should apply correct stage indicator for LOST", () => {
    const { container } = render(
      <EnquiryColumn stage="LOST" enquiries={[]} />
    );

    // Check for the colored dot indicator
    const dot = container.querySelector('[class*="rounded-full"]');
    expect(dot).toBeInTheDocument();

    const label = screen.getByText("Lost");
    expect(label).toBeInTheDocument();
  });

  it("should render column with fixed width", () => {
    const { container } = render(
      <EnquiryColumn stage="NEW" enquiries={[]} />
    );

    const column = container.firstChild;
    expect(column).toHaveClass("w-[280px]", "flex-shrink-0");
  });

  it("should render column with flex column layout", () => {
    const { container } = render(
      <EnquiryColumn stage="NEW" enquiries={[]} />
    );

    const column = container.firstChild;
    expect(column).toHaveClass("flex", "flex-col");
  });

  it("should render header with border bottom", () => {
    const { container } = render(
      <EnquiryColumn stage="NEW" enquiries={[]} />
    );

    const header = container.querySelector(".border-b");
    expect(header).toBeInTheDocument();
  });

  it("should handle large number of enquiries", () => {
    const enquiries = Array.from({ length: 20 }, (_, i) =>
      createMockEnquiry(`${i}`, `User${i}`, `Last${i}`)
    );
    render(<EnquiryColumn stage="NEW" enquiries={enquiries} />);

    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("User0 Last0")).toBeInTheDocument();
    expect(screen.getByText("User19 Last19")).toBeInTheDocument();
  });
});
