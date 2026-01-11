import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ServiceTypeCard } from "./ServiceTypeCard";
import type { ServiceType } from "@/types/service-type";

// Mock the UI components
vi.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <div data-testid="card" className={className} onClick={onClick}>
      {children}
    </div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

const createMockServiceType = (
  overrides: Partial<ServiceType> = {}
): ServiceType => ({
  id: "service-123",
  name: "Hair Cut",
  description: "Standard hair cutting service",
  durationMinutes: 45,
  price: 25.0,
  isActive: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  ...overrides,
});

describe("ServiceTypeCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render service name", () => {
    const serviceType = createMockServiceType();
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("Hair Cut")).toBeInTheDocument();
  });

  it("should render different service names", () => {
    const serviceType = createMockServiceType({ name: "Full Spa Treatment" });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("Full Spa Treatment")).toBeInTheDocument();
  });

  it("should render duration in minutes for short durations", () => {
    const serviceType = createMockServiceType({ durationMinutes: 30 });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("30 minutes")).toBeInTheDocument();
  });

  it("should render duration in hours for 60 minutes", () => {
    const serviceType = createMockServiceType({ durationMinutes: 60 });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("1 hour")).toBeInTheDocument();
  });

  it("should render duration in hours (plural) for 120 minutes", () => {
    const serviceType = createMockServiceType({ durationMinutes: 120 });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("2 hours")).toBeInTheDocument();
  });

  it("should render mixed hours and minutes", () => {
    const serviceType = createMockServiceType({ durationMinutes: 90 });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("1h 30m")).toBeInTheDocument();
  });

  it("should render price when present", () => {
    const serviceType = createMockServiceType({ price: 50.0 });
    render(<ServiceTypeCard serviceType={serviceType} />);

    // Price should be formatted as currency
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it("should handle null price as Free", () => {
    const serviceType = createMockServiceType({ price: null });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("should handle undefined price as Free", () => {
    const serviceType = createMockServiceType();
    // @ts-expect-error - Testing undefined case
    delete serviceType.price;
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("should render description when present", () => {
    const serviceType = createMockServiceType({
      description: "A great service for everyone",
    });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("A great service for everyone")).toBeInTheDocument();
  });

  it("should not render description when null", () => {
    const serviceType = createMockServiceType({ description: null });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(
      screen.queryByText("Standard hair cutting service")
    ).not.toBeInTheDocument();
  });

  it("should show Inactive badge when not active", () => {
    const serviceType = createMockServiceType({ isActive: false });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should not show Inactive badge when active", () => {
    const serviceType = createMockServiceType({ isActive: true });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.queryByText("Inactive")).not.toBeInTheDocument();
  });

  it("should apply opacity styling when inactive", () => {
    const serviceType = createMockServiceType({ isActive: false });
    render(<ServiceTypeCard serviceType={serviceType} />);

    const card = screen.getByTestId("card");
    expect(card.className).toContain("opacity-60");
  });

  it("should not apply opacity styling when active", () => {
    const serviceType = createMockServiceType({ isActive: true });
    render(<ServiceTypeCard serviceType={serviceType} />);

    const card = screen.getByTestId("card");
    expect(card.className).not.toContain("opacity-60");
  });

  it("should call onClick when clicked", () => {
    const onClick = vi.fn();
    const serviceType = createMockServiceType();
    render(<ServiceTypeCard serviceType={serviceType} onClick={onClick} />);

    const card = screen.getByTestId("card");
    fireEvent.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should apply selected styling when selected", () => {
    const serviceType = createMockServiceType();
    render(<ServiceTypeCard serviceType={serviceType} selected={true} />);

    const card = screen.getByTestId("card");
    expect(card.className).toContain("ring-2");
    expect(card.className).toContain("ring-blue-500");
    expect(card.className).toContain("bg-blue-50");
  });

  it("should not apply selected styling when not selected", () => {
    const serviceType = createMockServiceType();
    render(<ServiceTypeCard serviceType={serviceType} selected={false} />);

    const card = screen.getByTestId("card");
    expect(card.className).not.toContain("ring-2");
    expect(card.className).not.toContain("bg-blue-50");
  });

  it("should format decimal prices correctly", () => {
    const serviceType = createMockServiceType({ price: 25.99 });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText(/25.99/)).toBeInTheDocument();
  });

  it("should handle zero price", () => {
    const serviceType = createMockServiceType({ price: 0 });
    render(<ServiceTypeCard serviceType={serviceType} />);

    // Zero should display as 0.00 not Free
    expect(screen.getByText(/0.00/)).toBeInTheDocument();
  });

  it("should render card with cursor-pointer class", () => {
    const serviceType = createMockServiceType();
    render(<ServiceTypeCard serviceType={serviceType} />);

    const card = screen.getByTestId("card");
    expect(card.className).toContain("cursor-pointer");
  });

  it("should render short duration (5 minutes)", () => {
    const serviceType = createMockServiceType({ durationMinutes: 5 });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("5 minutes")).toBeInTheDocument();
  });

  it("should render long duration (8 hours)", () => {
    const serviceType = createMockServiceType({ durationMinutes: 480 });
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText("8 hours")).toBeInTheDocument();
  });

  it("should handle Prisma Decimal type for price", () => {
    // Prisma Decimal has a toNumber method
    const priceDecimal = { toNumber: () => 75.5 };
    const serviceType = createMockServiceType();
    // @ts-expect-error - Testing Prisma Decimal compatibility
    serviceType.price = priceDecimal;
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText(/75.50/)).toBeInTheDocument();
  });

  it("should handle string price", () => {
    const serviceType = createMockServiceType();
    // @ts-expect-error - Testing string price compatibility
    serviceType.price = "49.99";
    render(<ServiceTypeCard serviceType={serviceType} />);

    expect(screen.getByText(/49.99/)).toBeInTheDocument();
  });
});
