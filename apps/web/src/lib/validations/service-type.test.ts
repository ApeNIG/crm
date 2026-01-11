import { describe, it, expect } from "vitest";
import {
  createServiceTypeSchema,
  updateServiceTypeSchema,
  serviceTypeQuerySchema,
} from "./service-type";

describe("createServiceTypeSchema", () => {
  it("should validate a complete valid service type", () => {
    const validServiceType = {
      name: "Hair Cut",
      description: "Standard hair cutting service",
      durationMinutes: 45,
      price: 25.00,
      isActive: true,
    };

    const result = createServiceTypeSchema.safeParse(validServiceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Hair Cut");
      expect(result.data.description).toBe("Standard hair cutting service");
      expect(result.data.durationMinutes).toBe(45);
      expect(result.data.price).toBe(25.00);
      expect(result.data.isActive).toBe(true);
    }
  });

  it("should require name", () => {
    const serviceType = {
      description: "Test description",
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(false);
  });

  it("should reject empty name", () => {
    const serviceType = {
      name: "",
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("should reject name over 100 characters", () => {
    const serviceType = {
      name: "a".repeat(101),
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is too long");
    }
  });

  it("should accept name at exactly 100 characters", () => {
    const serviceType = {
      name: "a".repeat(100),
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
  });

  it("should default durationMinutes to 60", () => {
    const serviceType = {
      name: "Test Service",
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationMinutes).toBe(60);
    }
  });

  it("should reject durationMinutes less than 5", () => {
    const serviceType = {
      name: "Test Service",
      durationMinutes: 4,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Duration must be at least 5 minutes");
    }
  });

  it("should accept durationMinutes at exactly 5", () => {
    const serviceType = {
      name: "Test Service",
      durationMinutes: 5,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationMinutes).toBe(5);
    }
  });

  it("should reject durationMinutes over 480 (8 hours)", () => {
    const serviceType = {
      name: "Test Service",
      durationMinutes: 481,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Duration cannot exceed 8 hours");
    }
  });

  it("should accept durationMinutes at exactly 480", () => {
    const serviceType = {
      name: "Test Service",
      durationMinutes: 480,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationMinutes).toBe(480);
    }
  });

  it("should reject non-integer durationMinutes", () => {
    const serviceType = {
      name: "Test Service",
      durationMinutes: 30.5,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Duration must be a whole number");
    }
  });

  it("should validate price as positive number", () => {
    const serviceType = {
      name: "Test Service",
      price: 50.00,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(50.00);
    }
  });

  it("should accept zero price", () => {
    const serviceType = {
      name: "Test Service",
      price: 0,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(0);
    }
  });

  it("should reject negative price", () => {
    const serviceType = {
      name: "Test Service",
      price: -10,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Price cannot be negative");
    }
  });

  it("should accept null price", () => {
    const serviceType = {
      name: "Test Service",
      price: null,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBeNull();
    }
  });

  it("should transform undefined price to null", () => {
    const serviceType = {
      name: "Test Service",
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBeNull();
    }
  });

  it("should default isActive to true", () => {
    const serviceType = {
      name: "Test Service",
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });

  it("should accept isActive false", () => {
    const serviceType = {
      name: "Test Service",
      isActive: false,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(false);
    }
  });

  it("should transform empty description to null", () => {
    const serviceType = {
      name: "Test Service",
      description: "",
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });

  it("should accept null description", () => {
    const serviceType = {
      name: "Test Service",
      description: null,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });

  it("should reject description over 1000 characters", () => {
    const serviceType = {
      name: "Test Service",
      description: "a".repeat(1001),
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Description is too long");
    }
  });

  it("should accept description at exactly 1000 characters", () => {
    const serviceType = {
      name: "Test Service",
      description: "a".repeat(1000),
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
  });

  it("should accept decimal price", () => {
    const serviceType = {
      name: "Test Service",
      price: 25.99,
    };

    const result = createServiceTypeSchema.safeParse(serviceType);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(25.99);
    }
  });
});

describe("updateServiceTypeSchema", () => {
  it("should allow partial updates", () => {
    const update = {
      name: "Updated Name",
    };

    const result = updateServiceTypeSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Updated Name");
    }
  });

  it("should allow empty object", () => {
    const result = updateServiceTypeSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should still validate field values when provided", () => {
    const update = {
      name: "",
    };

    const result = updateServiceTypeSchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it("should allow updating durationMinutes", () => {
    const update = {
      durationMinutes: 90,
    };

    const result = updateServiceTypeSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationMinutes).toBe(90);
    }
  });

  it("should allow updating price", () => {
    const update = {
      price: 75.00,
    };

    const result = updateServiceTypeSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(75.00);
    }
  });

  it("should allow updating isActive", () => {
    const update = {
      isActive: false,
    };

    const result = updateServiceTypeSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(false);
    }
  });

  it("should allow updating multiple fields", () => {
    const update = {
      name: "Updated Service",
      durationMinutes: 120,
      price: 100.00,
      isActive: false,
    };

    const result = updateServiceTypeSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Updated Service");
      expect(result.data.durationMinutes).toBe(120);
      expect(result.data.price).toBe(100.00);
      expect(result.data.isActive).toBe(false);
    }
  });

  it("should validate durationMinutes constraints on update", () => {
    const update = {
      durationMinutes: 3,
    };

    const result = updateServiceTypeSchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it("should validate price constraints on update", () => {
    const update = {
      price: -5,
    };

    const result = updateServiceTypeSchema.safeParse(update);
    expect(result.success).toBe(false);
  });
});

describe("serviceTypeQuerySchema", () => {
  it("should provide defaults for pagination", () => {
    const result = serviceTypeQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it("should coerce string page to number", () => {
    const result = serviceTypeQuerySchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });

  it("should coerce string limit to number", () => {
    const result = serviceTypeQuerySchema.safeParse({ limit: "25" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
    }
  });

  it("should reject page less than 1", () => {
    const result = serviceTypeQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject limit less than 1", () => {
    const result = serviceTypeQuerySchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject limit over 100", () => {
    const result = serviceTypeQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("should accept limit at exactly 100", () => {
    const result = serviceTypeQuerySchema.safeParse({ limit: 100 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(100);
    }
  });

  it("should transform isActive string 'true' to boolean true", () => {
    const result = serviceTypeQuerySchema.safeParse({ isActive: "true" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });

  it("should transform isActive string 'false' to boolean false", () => {
    const result = serviceTypeQuerySchema.safeParse({ isActive: "false" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(false);
    }
  });

  it("should leave isActive undefined when not provided", () => {
    const result = serviceTypeQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBeUndefined();
    }
  });

  it("should reject invalid isActive values", () => {
    const result = serviceTypeQuerySchema.safeParse({ isActive: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should accept all valid filter values", () => {
    const query = {
      isActive: "true",
      page: 2,
      limit: 25,
    };

    const result = serviceTypeQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });
});
