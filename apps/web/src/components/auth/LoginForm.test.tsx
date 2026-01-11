import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

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

// Mock variables for testing different mutation states
const mockMutateAsync = vi.fn();
let mockIsPending = false;
let mockIsError = false;
let mockError: Error | null = null;

// Mock @tanstack/react-query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: mockIsPending,
    isError: mockIsError,
    error: mockError,
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

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockReset();
    mockIsPending = false;
    mockIsError = false;
    mockError = null;
  });

  // ============================================
  // BASIC RENDERING TESTS
  // ============================================

  describe("basic rendering", () => {
    it("should render the login form with title", () => {
      render(<LoginForm />);

      expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
      expect(
        screen.getByText("Enter your email and password to access your account")
      ).toBeInTheDocument();
    });

    it("should render email field with label", () => {
      render(<LoginForm />);

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("you@example.com")
      ).toBeInTheDocument();
    });

    it("should render password field with label", () => {
      render(<LoginForm />);

      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your password")
      ).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<LoginForm />);

      expect(
        screen.getByRole("button", { name: "Sign in" })
      ).toBeInTheDocument();
    });

    it("should have correct input types", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should have correct autocomplete attributes", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toHaveAttribute("autocomplete", "email");
      expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
    });
  });

  // ============================================
  // VALIDATION TESTS
  // ============================================

  describe("validation", () => {
    it("should show validation error for empty email on submit", async () => {
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      const submitButton = screen.getByRole("button", { name: "Sign in" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      });
    });

    it("should show validation error for invalid email format", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      // Trigger blur to ensure validation runs
      fireEvent.blur(emailInput);

      const form = document.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      });
    });

    it("should show validation error for empty password on submit", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      fireEvent.change(emailInput, { target: { value: "user@example.com" } });

      const submitButton = screen.getByRole("button", { name: "Sign in" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });
    });

    it("should show validation errors for all empty fields", async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: "Sign in" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // FORM SUBMISSION TESTS
  // ============================================

  describe("form submission", () => {
    it("should call mutateAsync with form data on valid submission", async () => {
      mockMutateAsync.mockResolvedValue({ success: true, user: {} });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      const submitButton = screen.getByRole("button", { name: "Sign in" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          email: "user@example.com",
          password: "password123",
        });
      });
    });

    it("should not call mutateAsync when validation fails", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.blur(emailInput);

      const form = document.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      });

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("should handle submission errors gracefully", async () => {
      mockMutateAsync.mockRejectedValue(new Error("Login failed"));

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      const submitButton = screen.getByRole("button", { name: "Sign in" });
      fireEvent.click(submitButton);

      // Should not throw, error is handled by mutation
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // ERROR DISPLAY TESTS
  // ============================================

  describe("error display", () => {
    it("should display login error message when mutation fails", () => {
      mockIsError = true;
      mockError = new Error("Invalid credentials");

      render(<LoginForm />);

      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    it("should display error in styled error container", () => {
      mockIsError = true;
      mockError = new Error("Invalid credentials");

      const { container } = render(<LoginForm />);

      const errorDiv = container.querySelector(".bg-red-50");
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv).toHaveClass("text-red-600");
    });

    it("should not display error container when no error", () => {
      mockIsError = false;
      mockError = null;

      const { container } = render(<LoginForm />);

      const errorDiv = container.querySelector(".bg-red-50");
      expect(errorDiv).not.toBeInTheDocument();
    });
  });

  // ============================================
  // LOADING STATE TESTS
  // ============================================

  describe("loading state", () => {
    it("should show loading text on button during submission", () => {
      mockIsPending = true;

      render(<LoginForm />);

      expect(
        screen.getByRole("button", { name: "Signing in..." })
      ).toBeInTheDocument();
    });

    it("should disable submit button during submission", () => {
      mockIsPending = true;

      render(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: "Signing in..." });
      expect(submitButton).toBeDisabled();
    });

    it("should disable email input during submission", () => {
      mockIsPending = true;

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      expect(emailInput).toBeDisabled();
    });

    it("should disable password input during submission", () => {
      mockIsPending = true;

      render(<LoginForm />);

      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toBeDisabled();
    });

    it("should enable all fields when not submitting", () => {
      mockIsPending = false;

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign in" });

      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe("accessibility", () => {
    it("should have accessible form labels", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
    });

    it("should render form with proper structure", () => {
      render(<LoginForm />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("should associate validation errors with inputs", async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: "Sign in" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/required|Invalid/);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  // ============================================
  // INPUT INTERACTION TESTS
  // ============================================

  describe("input interactions", () => {
    it("should allow typing in email field", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should allow typing in password field", () => {
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "secret123" } });

      expect(passwordInput).toHaveValue("secret123");
    });

    it("should clear validation errors when user fixes input", async () => {
      render(<LoginForm />);

      // Trigger validation error
      const submitButton = screen.getByRole("button", { name: "Sign in" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      });

      // Fix the email
      const emailInput = screen.getByLabelText("Email");
      fireEvent.change(emailInput, { target: { value: "valid@example.com" } });

      // Add password
      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "password" } });

      // Submit again
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Invalid email address")
        ).not.toBeInTheDocument();
      });
    });
  });
});
