import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useDashboard, useDashboardActivity } from "./useDashboard";

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

const mockDashboardData = {
  metrics: {
    totalContacts: 100,
    activeEnquiries: 25,
    upcomingBookings: 10,
    outstandingAmount: 5000,
    revenueThisMonth: 15000,
  },
  enquiryBreakdown: [
    { stage: "NEW", count: 5 },
    { stage: "CONTACTED", count: 10 },
  ],
  bookingBreakdown: [
    { status: "CONFIRMED", todayCount: 3, weekCount: 10 },
  ],
  invoiceBreakdown: [
    { status: "SENT", count: 5, totalAmount: 2500 },
  ],
  recentActivity: [
    {
      id: "1",
      entityType: "contact",
      entityId: "c1",
      type: "CREATED",
      description: "New contact created",
      href: "/contacts/c1",
      createdAt: "2025-01-10T10:00:00.000Z",
    },
  ],
};

const mockActivityResponse = {
  activities: [
    {
      id: "1",
      entityType: "contact",
      entityId: "c1",
      type: "CREATED",
      description: "New contact created",
      href: "/contacts/c1",
      createdAt: "2025-01-10T10:00:00.000Z",
    },
  ],
  total: 20,
  page: 1,
  limit: 10,
  hasMore: true,
};

// ============================================
// useDashboard TESTS
// ============================================

describe("useDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should use correct query key", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify the fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith("/api/dashboard");
  });

  it("should fetch dashboard data successfully", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDashboardData);
    expect(result.current.data?.metrics.totalContacts).toBe(100);
  });

  it("should handle fetch error", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Failed to fetch dashboard data");
  });

  it("should have correct staleTime configuration (30 seconds)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Data should not be stale immediately
    expect(result.current.isStale).toBe(false);
  });

  it("should return loading state initially", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});

// ============================================
// useDashboardActivity TESTS
// ============================================

describe("useDashboardActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should use correct query key with no filters", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockActivityResponse),
    });

    const { result } = renderHook(() => useDashboardActivity(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify fetch was called with correct URL (no filters)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/dashboard\/activity\?page=1/)
    );
  });

  it("should use correct query key with entityType filter", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockActivityResponse),
    });

    const { result } = renderHook(
      () => useDashboardActivity({ entityType: "contact" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify fetch was called with entityType filter
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/entityType=contact/)
    );
  });

  it("should fetch activity data successfully", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockActivityResponse),
    });

    const { result } = renderHook(() => useDashboardActivity(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0]).toEqual(mockActivityResponse);
    expect(result.current.data?.pages[0].activities).toHaveLength(1);
  });

  it("should handle hasNextPage correctly when more pages exist", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockActivityResponse, hasMore: true }),
    });

    const { result } = renderHook(() => useDashboardActivity(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(true);
  });

  it("should handle hasNextPage correctly when no more pages", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockActivityResponse, hasMore: false }),
    });

    const { result } = renderHook(() => useDashboardActivity(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(false);
  });

  it("should handle fetch error", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useDashboardActivity(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Failed to fetch activity feed");
  });

  it("should support fetchNextPage for pagination", async () => {
    const page1Response = { ...mockActivityResponse, page: 1, hasMore: true };
    const page2Response = {
      ...mockActivityResponse,
      page: 2,
      hasMore: false,
      activities: [
        {
          id: "2",
          entityType: "booking",
          entityId: "b1",
          type: "CREATED",
          description: "New booking created",
          href: "/bookings/b1",
          createdAt: "2025-01-10T11:00:00.000Z",
        },
      ],
    };

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(page1Response),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(page2Response),
      });

    const { result } = renderHook(() => useDashboardActivity(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Fetch next page
    result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
    });

    expect(result.current.data?.pages[0].activities[0].id).toBe("1");
    expect(result.current.data?.pages[1].activities[0].id).toBe("2");
  });

  it("should include limit parameter when provided", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockActivityResponse),
    });

    const { result } = renderHook(
      () => useDashboardActivity({ limit: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/limit=20/)
    );
  });

  it("should return loading state initially", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useDashboardActivity(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
