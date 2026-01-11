import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { UserMenu } from "./UserMenu";

// ============================================
// MOCKS
// ============================================

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock user data
const mockUser = {
  id: "123",
  email: "john.doe@example.com",
  name: "John Doe",
  role: "USER" as const,
};

const mockAdminUser = {
  id: "456",
  email: "admin@example.com",
  name: "Admin User",
  role: "ADMIN" as const,
};

// Mock variables for testing different states
let mockUserData: typeof mockUser | null = mockUser;
let mockIsLoading = false;
const mockLogoutMutateAsync = vi.fn();
let mockLogoutIsPending = false;

// Mock @tanstack/react-query hooks
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: mockUserData,
    isLoading: mockIsLoading,
  })),
  useMutation: vi.fn(() => ({
    mutateAsync: mockLogoutMutateAsync,
    isPending: mockLogoutIsPending,
  })),
  useQueryClient: vi.fn(() => ({
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    clear: vi.fn(),
  })),
}));

// ============================================
// TEST SETUP
// ============================================

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserData = mockUser;
    mockIsLoading = false;
    mockLogoutMutateAsync.mockReset();
    mockLogoutMutateAsync.mockResolvedValue({ success: true });
    mockLogoutIsPending = false;
  });

  // ============================================
  // LOADING STATE TESTS
  // ============================================

  describe("loading state", () => {
    it("should render loading skeleton when loading", () => {
      mockIsLoading = true;

      const { container } = render(<UserMenu />);

      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("should not render user info when loading", () => {
      mockIsLoading = true;

      render(<UserMenu />);

      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  // ============================================
  // NO USER STATE TESTS
  // ============================================

  describe("no user state", () => {
    it("should render nothing when no user", () => {
      mockUserData = null;

      const { container } = render(<UserMenu />);

      expect(container.firstChild).toBeNull();
    });
  });

  // ============================================
  // AVATAR RENDERING TESTS
  // ============================================

  describe("avatar rendering", () => {
    it("should render user initials in avatar", () => {
      render(<UserMenu />);

      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should render single initial for single name", () => {
      mockUserData = { ...mockUser, name: "John" };

      render(<UserMenu />);

      expect(screen.getByText("J")).toBeInTheDocument();
    });

    it("should render first two initials for multiple names", () => {
      mockUserData = { ...mockUser, name: "John Michael Doe" };

      render(<UserMenu />);

      expect(screen.getByText("JM")).toBeInTheDocument();
    });

    it("should uppercase initials", () => {
      mockUserData = { ...mockUser, name: "john doe" };

      render(<UserMenu />);

      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should render avatar as a button", () => {
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button");
      expect(avatarButton).toBeInTheDocument();
      expect(avatarButton).toHaveTextContent("JD");
    });
  });

  // ============================================
  // DROPDOWN MENU TESTS
  // ============================================

  describe("dropdown menu", () => {
    it("should not show dropdown initially", () => {
      render(<UserMenu />);

      expect(screen.queryByText("john.doe@example.com")).not.toBeInTheDocument();
    });

    it("should show dropdown on avatar click", async () => {
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      });
    });

    it("should display user name in dropdown", async () => {
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });
    });

    it("should display user email in dropdown", async () => {
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      });
    });

    it("should display user role in dropdown", async () => {
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("USER")).toBeInTheDocument();
      });
    });

    it("should display ADMIN role for admin users", async () => {
      mockUserData = mockAdminUser;
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "AU" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("ADMIN")).toBeInTheDocument();
      });
    });

    it("should toggle dropdown on multiple clicks", async () => {
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });

      // Open
      fireEvent.click(avatarButton);
      await waitFor(() => {
        expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      });

      // Close
      fireEvent.click(avatarButton);
      await waitFor(() => {
        expect(
          screen.queryByText("john.doe@example.com")
        ).not.toBeInTheDocument();
      });
    });

    it("should have aria-expanded attribute", async () => {
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      expect(avatarButton).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(avatarButton).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("should have aria-haspopup attribute", () => {
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      expect(avatarButton).toHaveAttribute("aria-haspopup", "true");
    });
  });

  // ============================================
  // LOGOUT BUTTON TESTS
  // ============================================

  describe("logout button", () => {
    it("should render logout button in dropdown", async () => {
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Sign out" })
        ).toBeInTheDocument();
      });
    });

    it("should call logout on logout button click", async () => {
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("Sign out")).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole("button", { name: "Sign out" });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogoutMutateAsync).toHaveBeenCalled();
      });
    });

    it("should show loading text during logout", async () => {
      mockLogoutIsPending = true;
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("Signing out...")).toBeInTheDocument();
      });
    });

    it("should disable logout button during logout", async () => {
      mockLogoutIsPending = true;
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        const logoutButton = screen.getByRole("button", {
          name: "Signing out...",
        });
        expect(logoutButton).toBeDisabled();
      });
    });
  });

  // ============================================
  // CLICK OUTSIDE TESTS
  // ============================================

  describe("click outside behavior", () => {
    it("should close dropdown when clicking outside", async () => {
      render(
        <div>
          <div data-testid="outside">Outside element</div>
          <UserMenu />
        </div>
      );

      // Open dropdown
      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      });

      // Click outside (simulate mousedown event which the component listens to)
      const outsideElement = screen.getByTestId("outside");
      fireEvent.mouseDown(outsideElement);

      await waitFor(() => {
        expect(
          screen.queryByText("john.doe@example.com")
        ).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // KEYBOARD NAVIGATION TESTS
  // ============================================

  describe("keyboard navigation", () => {
    it("should close dropdown on Escape key", async () => {
      render(<UserMenu />);

      // Open dropdown
      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      });

      // Press Escape
      fireEvent.keyDown(document, { key: "Escape" });

      await waitFor(() => {
        expect(
          screen.queryByText("john.doe@example.com")
        ).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // STYLING TESTS
  // ============================================

  describe("styling", () => {
    it("should have correct avatar styling", () => {
      render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      expect(avatarButton).toHaveClass("rounded-full");
      expect(avatarButton).toHaveClass("bg-gray-900");
      expect(avatarButton).toHaveClass("text-white");
    });

    it("should have correct dropdown positioning", async () => {
      const { container } = render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        const dropdown = container.querySelector(".absolute.right-0");
        expect(dropdown).toBeInTheDocument();
      });
    });

    it("should have z-index for dropdown", async () => {
      const { container } = render(<UserMenu />);

      const avatarButton = screen.getByRole("button", { name: "JD" });
      fireEvent.click(avatarButton);

      await waitFor(() => {
        const dropdown = container.querySelector(".z-50");
        expect(dropdown).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe("edge cases", () => {
    it("should handle empty name gracefully", () => {
      mockUserData = { ...mockUser, name: "" };

      render(<UserMenu />);

      // Should render empty or handle gracefully
      const avatarButton = screen.getByRole("button");
      expect(avatarButton).toBeInTheDocument();
    });

    it("should handle very long names", () => {
      mockUserData = {
        ...mockUser,
        name: "Johnathan Christopher Michael Doe Smith",
      };

      render(<UserMenu />);

      // Should only show first two initials
      expect(screen.getByText("JC")).toBeInTheDocument();
    });

    it("should handle names with special characters", () => {
      mockUserData = { ...mockUser, name: "Jean-Pierre O'Brien" };

      render(<UserMenu />);

      // Should show initials from first two words
      expect(screen.getByText("JO")).toBeInTheDocument();
    });

    it("should truncate long email in dropdown", async () => {
      mockUserData = {
        ...mockUser,
        email: "verylongemailaddress@verylongdomain.example.com",
      };
      const { container } = render(<UserMenu />);

      const avatarButton = screen.getByRole("button");
      fireEvent.click(avatarButton);

      await waitFor(() => {
        const emailElement = container.querySelector(".truncate");
        expect(emailElement).toBeInTheDocument();
      });
    });
  });
});
