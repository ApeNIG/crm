import { describe, it, expect } from "vitest";
import {
  userRoleEnum,
  loginSchema,
  loginFormSchema,
  registerSchema,
  registerFormSchema,
  changePasswordSchema,
  changePasswordFormSchema,
} from "./auth";

// ============================================
// USER ROLE ENUM TESTS
// ============================================

describe("userRoleEnum", () => {
  it("should accept ADMIN role", () => {
    const result = userRoleEnum.safeParse("ADMIN");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("ADMIN");
    }
  });

  it("should accept USER role", () => {
    const result = userRoleEnum.safeParse("USER");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("USER");
    }
  });

  it("should reject invalid role values", () => {
    const result = userRoleEnum.safeParse("INVALID_ROLE");
    expect(result.success).toBe(false);
  });

  it("should reject lowercase role values", () => {
    const result = userRoleEnum.safeParse("admin");
    expect(result.success).toBe(false);
  });

  it("should reject empty string", () => {
    const result = userRoleEnum.safeParse("");
    expect(result.success).toBe(false);
  });
});

// ============================================
// LOGIN SCHEMA TESTS
// ============================================

describe("loginSchema", () => {
  describe("valid inputs", () => {
    it("should validate a complete valid login", () => {
      const validLogin = {
        email: "user@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
        expect(result.data.password).toBe("password123");
      }
    });

    it("should accept valid email formats", () => {
      const emails = [
        "user@example.com",
        "user.name@example.com",
        "user+tag@example.co.uk",
        "user123@subdomain.example.org",
      ];

      for (const email of emails) {
        const result = loginSchema.safeParse({ email, password: "pass" });
        expect(result.success).toBe(true);
      }
    });

    it("should accept password with only 1 character (login is lenient)", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "a",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("should reject invalid email format", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("should reject email without domain", () => {
      const result = loginSchema.safeParse({
        email: "user@",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject email without @ symbol", () => {
      const result = loginSchema.safeParse({
        email: "userexample.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty email", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password is required");
      }
    });

    it("should reject missing email", () => {
      const result = loginSchema.safeParse({
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty object", () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("loginFormSchema", () => {
  it("should be equivalent to loginSchema", () => {
    const validLogin = {
      email: "user@example.com",
      password: "password123",
    };

    const loginResult = loginSchema.safeParse(validLogin);
    const formResult = loginFormSchema.safeParse(validLogin);

    expect(loginResult.success).toBe(formResult.success);
  });
});

// ============================================
// REGISTER SCHEMA TESTS
// ============================================

describe("registerSchema", () => {
  describe("valid inputs", () => {
    it("should validate a complete valid registration", () => {
      const validRegister = {
        email: "user@example.com",
        password: "Password1",
        name: "John Doe",
        role: "USER",
      };

      const result = registerSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
        expect(result.data.password).toBe("Password1");
        expect(result.data.name).toBe("John Doe");
        expect(result.data.role).toBe("USER");
      }
    });

    it("should validate with minimal required fields (role defaults to USER)", () => {
      const minimalRegister = {
        email: "user@example.com",
        password: "Password1",
        name: "John",
      };

      const result = registerSchema.safeParse(minimalRegister);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("USER");
      }
    });

    it("should accept ADMIN role", () => {
      const result = registerSchema.safeParse({
        email: "admin@example.com",
        password: "AdminPass1",
        name: "Admin User",
        role: "ADMIN",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("ADMIN");
      }
    });
  });

  describe("password validation", () => {
    it("should accept password with minimum 8 characters, uppercase, lowercase, and number", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Abcdefg1",
        name: "User",
      });
      expect(result.success).toBe(true);
    });

    it("should reject password shorter than 8 characters", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Pass1",
        name: "User",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must be at least 8 characters"
        );
      }
    });

    it("should reject password without uppercase letter", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "password1",
        name: "User",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must contain at least one uppercase letter"
        );
      }
    });

    it("should reject password without lowercase letter", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "PASSWORD1",
        name: "User",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must contain at least one lowercase letter"
        );
      }
    });

    it("should reject password without number", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Password",
        name: "User",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must contain at least one number"
        );
      }
    });

    it("should accept password with special characters", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Password1!@#",
        name: "User",
      });
      expect(result.success).toBe(true);
    });

    it("should accept long complex password", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "MyVeryLongAndSecurePassword123!@#",
        name: "User",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("name validation", () => {
    it("should accept single character name", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
        name: "J",
      });
      expect(result.success).toBe(true);
    });

    it("should accept name at exactly 100 characters", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
        name: "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
        name: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Name is required");
      }
    });

    it("should reject name over 100 characters", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
        name: "a".repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Name is too long");
      }
    });
  });

  describe("invalid inputs", () => {
    it("should reject invalid email format", () => {
      const result = registerSchema.safeParse({
        email: "not-an-email",
        password: "Password1",
        name: "User",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("should reject invalid role", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
        name: "User",
        role: "SUPERADMIN",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing email", () => {
      const result = registerSchema.safeParse({
        password: "Password1",
        name: "User",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing password", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        name: "User",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing name", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("registerFormSchema", () => {
  describe("password confirmation", () => {
    it("should validate when passwords match", () => {
      const result = registerFormSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
        confirmPassword: "Password1",
        name: "User",
      });
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const result = registerFormSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
        confirmPassword: "Password2",
        name: "User",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find(
          (i) => i.path.includes("confirmPassword")
        );
        expect(confirmError?.message).toBe("Passwords do not match");
      }
    });

    it("should reject empty confirmPassword", () => {
      const result = registerFormSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
        confirmPassword: "",
        name: "User",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please confirm your password"
        );
      }
    });
  });
});

// ============================================
// CHANGE PASSWORD SCHEMA TESTS
// ============================================

describe("changePasswordSchema", () => {
  describe("valid inputs", () => {
    it("should validate a complete valid change password request", () => {
      const validChange = {
        currentPassword: "oldpassword",
        newPassword: "NewPassword1",
      };

      const result = changePasswordSchema.safeParse(validChange);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentPassword).toBe("oldpassword");
        expect(result.data.newPassword).toBe("NewPassword1");
      }
    });

    it("should accept any currentPassword (no strength requirements)", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "a",
        newPassword: "NewPassword1",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("newPassword validation", () => {
    it("should accept newPassword with minimum 8 characters, uppercase, lowercase, and number", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldpass",
        newPassword: "NewPass1",
      });
      expect(result.success).toBe(true);
    });

    it("should reject newPassword shorter than 8 characters", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldpass",
        newPassword: "New1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must be at least 8 characters"
        );
      }
    });

    it("should reject newPassword without uppercase letter", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldpass",
        newPassword: "newpassword1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must contain at least one uppercase letter"
        );
      }
    });

    it("should reject newPassword without lowercase letter", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldpass",
        newPassword: "NEWPASSWORD1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must contain at least one lowercase letter"
        );
      }
    });

    it("should reject newPassword without number", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldpass",
        newPassword: "NewPassword",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must contain at least one number"
        );
      }
    });
  });

  describe("invalid inputs", () => {
    it("should reject empty currentPassword", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "",
        newPassword: "NewPassword1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Current password is required"
        );
      }
    });

    it("should reject missing currentPassword", () => {
      const result = changePasswordSchema.safeParse({
        newPassword: "NewPassword1",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing newPassword", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldpass",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty object", () => {
      const result = changePasswordSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("changePasswordFormSchema", () => {
  describe("password confirmation", () => {
    it("should validate when new passwords match", () => {
      const result = changePasswordFormSchema.safeParse({
        currentPassword: "oldpass",
        newPassword: "NewPassword1",
        confirmNewPassword: "NewPassword1",
      });
      expect(result.success).toBe(true);
    });

    it("should reject when new passwords do not match", () => {
      const result = changePasswordFormSchema.safeParse({
        currentPassword: "oldpass",
        newPassword: "NewPassword1",
        confirmNewPassword: "NewPassword2",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find(
          (i) => i.path.includes("confirmNewPassword")
        );
        expect(confirmError?.message).toBe("Passwords do not match");
      }
    });

    it("should reject empty confirmNewPassword", () => {
      const result = changePasswordFormSchema.safeParse({
        currentPassword: "oldpass",
        newPassword: "NewPassword1",
        confirmNewPassword: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please confirm your new password"
        );
      }
    });
  });
});

// ============================================
// EDGE CASES
// ============================================

describe("edge cases", () => {
  describe("loginSchema edge cases", () => {
    it("should accept email with subdomain", () => {
      const result = loginSchema.safeParse({
        email: "user@mail.example.com",
        password: "pass",
      });
      expect(result.success).toBe(true);
    });

    it("should accept email with plus sign", () => {
      const result = loginSchema.safeParse({
        email: "user+tag@example.com",
        password: "pass",
      });
      expect(result.success).toBe(true);
    });

    it("should accept email with dots in local part", () => {
      const result = loginSchema.safeParse({
        email: "first.last@example.com",
        password: "pass",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("registerSchema edge cases", () => {
    it("should accept password with exactly 8 characters meeting all requirements", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Abcdefg1",
        name: "User",
      });
      expect(result.success).toBe(true);
    });

    it("should accept name with spaces", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
        name: "John Michael Doe",
      });
      expect(result.success).toBe(true);
    });

    it("should accept name with unicode characters", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Password1",
        name: "Jean-Pierre",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("password complexity edge cases", () => {
    it("should accept password with multiple numbers", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Password123",
        name: "User",
      });
      expect(result.success).toBe(true);
    });

    it("should accept password with numbers in different positions", () => {
      const passwords = ["1Password", "Pass1word", "Password1"];
      for (const password of passwords) {
        const result = registerSchema.safeParse({
          email: "user@example.com",
          password,
          name: "User",
        });
        expect(result.success).toBe(true);
      }
    });

    it("should accept password with mixed case throughout", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "PaSsWoRd1",
        name: "User",
      });
      expect(result.success).toBe(true);
    });
  });
});
