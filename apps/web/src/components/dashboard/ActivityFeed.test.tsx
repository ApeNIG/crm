import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { ActivityFeed } from "./ActivityFeed";

// ============================================
// TEST SETUP
// ============================================

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

// ============================================
// MOCK DATA
// ============================================

const mockActivities = [
  {
    id: "1",
    entityType: "contact" as const,
    entityId: "c1",
    type: "CREATED",
    description: "New contact John Doe was created",
    href: "/contacts/c1",
    createdAt: "2025-01-10T10:00:00.000Z",
  },
  {
    id: "2",
    entityType: "enquiry" as const,
    entityId: "e1",
    type: "STAGE_CHANGED",
    description: "Enquiry moved to Contacted stage",
    href: "/pipeline?enquiry=e1",
    createdAt: "2025-01-10T09:30:00.000Z",
  },
  {
    id: "3",
    entityType: "booking" as const,
    entityId: "b1",
    type: "CONFIRMED",
    description: "Booking confirmed for Jan 15, 2025",
    href: "/bookings/b1",
    createdAt: "2025-01-10T08:00:00.000Z",
  },
];

const mockActivityResponse = {
  activities: mockActivities,
  total: 20,
  page: 1,
  limit: 10,
  hasMore: true,
};

// ============================================
// BASIC RENDERING TESTS
// ============================================

describe("ActivityFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use real timers for async operations but set system time
    vi.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("basic rendering", () => {
    it("should render the card title", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityResponse),
      });

      render(<ActivityFeed />, { wrapper: createWrapper() });

      expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    });

    it("should render activity items when data is loaded", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityResponse),
      });

      render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText("New contact John Doe was created")).toBeInTheDocument();
      });

      expect(screen.getByText("Enquiry moved to Contacted stage")).toBeInTheDocument();
      expect(screen.getByText("Booking confirmed for Jan 15, 2025")).toBeInTheDocument();
    });

    it("should render activity items as links", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityResponse),
      });

      render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        const links = screen.getAllByRole("link");
        expect(links.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  // ============================================
  // INITIAL ACTIVITIES TESTS
  // ============================================

  describe("initial activities", () => {
    it("should render initial activities immediately", () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<ActivityFeed initialActivities={mockActivities} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText("New contact John Doe was created")).toBeInTheDocument();
      expect(screen.getByText("Enquiry moved to Contacted stage")).toBeInTheDocument();
    });

    it("should replace initial activities with fetched data", async () => {
      const newActivity = {
        ...mockActivities[0],
        id: "new-1",
        description: "Fetched activity description",
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            activities: [newActivity],
            total: 1,
            page: 1,
            limit: 10,
            hasMore: false,
          }),
      });

      render(<ActivityFeed initialActivities={mockActivities} />, {
        wrapper: createWrapper(),
      });

      // Initial activities should be shown immediately
      expect(screen.getByText("New contact John Doe was created")).toBeInTheDocument();

      // Wait for fetched data to replace initial
      await waitFor(() => {
        expect(screen.getByText("Fetched activity description")).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // LOADING STATE TESTS
  // ============================================

  describe("loading state", () => {
    it("should show loading spinner when no initial activities and loading", () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = render(<ActivityFeed />, { wrapper: createWrapper() });

      // Should show loading spinner
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should not show loading spinner when initial activities provided", () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = render(
        <ActivityFeed initialActivities={mockActivities} />,
        { wrapper: createWrapper() }
      );

      // Should not show loading spinner when initial activities are provided
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).not.toBeInTheDocument();
    });
  });

  // ============================================
  // ERROR STATE TESTS
  // ============================================

  describe("error state", () => {
    it("should show error message when fetch fails", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText("Failed to load activity feed")).toBeInTheDocument();
      });
    });

    it("should display error in red text", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { container } = render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        const errorText = container.querySelector(".text-red-500");
        expect(errorText).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // EMPTY STATE TESTS
  // ============================================

  describe("empty state", () => {
    it("should show empty message when no activities", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            activities: [],
            total: 0,
            page: 1,
            limit: 10,
            hasMore: false,
          }),
      });

      render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText("No recent activity")).toBeInTheDocument();
      });
    });

    it("should show empty message when initial activities is empty array", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            activities: [],
            total: 0,
            page: 1,
            limit: 10,
            hasMore: false,
          }),
      });

      render(<ActivityFeed initialActivities={[]} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText("No recent activity")).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // LOAD MORE TESTS
  // ============================================

  describe("load more functionality", () => {
    it("should show Load More button when hasNextPage is true", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityResponse),
      });

      render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Load More" })).toBeInTheDocument();
      });
    });

    it("should not show Load More button when hasNextPage is false", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockActivityResponse,
            hasMore: false,
          }),
      });

      render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText("New contact John Doe was created")).toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: "Load More" })).not.toBeInTheDocument();
    });

    it("should fetch more activities when Load More is clicked", async () => {
      const page2Activities = [
        {
          id: "4",
          entityType: "invoice" as const,
          entityId: "i1",
          type: "PAID",
          description: "Invoice paid",
          href: "/invoices/i1",
          createdAt: "2025-01-10T07:00:00.000Z",
        },
      ];

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockActivityResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              activities: page2Activities,
              total: 20,
              page: 2,
              limit: 10,
              hasMore: false,
            }),
        });

      render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Load More" })).toBeInTheDocument();
      });

      // Click Load More
      fireEvent.click(screen.getByRole("button", { name: "Load More" }));

      await waitFor(() => {
        expect(screen.getByText("Invoice paid")).toBeInTheDocument();
      });
    });

    it("should show loading state while fetching more", async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockActivityResponse),
        })
        .mockImplementationOnce(
          () => new Promise(() => {}) // Never resolves for second call
        );

      const { container } = render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Load More" })).toBeInTheDocument();
      });

      // Click Load More
      fireEvent.click(screen.getByRole("button", { name: "Load More" }));

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText("Loading...")).toBeInTheDocument();
        const spinner = container.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
      });
    });

    it("should disable button while fetching more", async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockActivityResponse),
        })
        .mockImplementationOnce(
          () => new Promise(() => {}) // Never resolves
        );

      render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Load More" })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "Load More" }));

      await waitFor(() => {
        const button = screen.getByRole("button", { name: /Loading/i });
        expect(button).toBeDisabled();
      });
    });
  });

  // ============================================
  // STYLING TESTS
  // ============================================

  describe("styling", () => {
    it("should render inside a Card component", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityResponse),
      });

      const { container } = render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText("Recent Activity")).toBeInTheDocument();
      });

      const card = container.querySelector(".rounded-lg");
      expect(card).toBeInTheDocument();
    });

    it("should render activities in a list", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityResponse),
      });

      render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        const list = screen.getByRole("list");
        expect(list).toBeInTheDocument();
      });
    });

    it("should render list items for each activity", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityResponse),
      });

      render(<ActivityFeed />, { wrapper: createWrapper() });

      await waitFor(() => {
        const listItems = screen.getAllByRole("listitem");
        expect(listItems).toHaveLength(3);
      });
    });
  });
});
