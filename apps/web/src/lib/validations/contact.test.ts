import { describe, it, expect } from "vitest";
import {
  createContactSchema,
  updateContactSchema,
  contactQuerySchema,
} from "./contact";

describe("createContactSchema", () => {
  it("should validate a complete valid contact", () => {
    const validContact = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+44 7700 900000",
      source: "WEBSITE",
      status: "LEAD",
      marketingOptIn: true,
      notes: "Test notes",
      tagIds: ["550e8400-e29b-41d4-a716-446655440000"],
    };

    const result = createContactSchema.safeParse(validContact);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe("John");
      expect(result.data.lastName).toBe("Doe");
      expect(result.data.email).toBe("john@example.com");
    }
  });

  it("should validate with only required fields", () => {
    const minimalContact = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    };

    const result = createContactSchema.safeParse(minimalContact);
    expect(result.success).toBe(true);
    if (result.success) {
      // Check defaults are applied
      expect(result.data.source).toBe("OTHER");
      expect(result.data.status).toBe("LEAD");
      expect(result.data.marketingOptIn).toBe(false);
      expect(result.data.tagIds).toEqual([]);
    }
  });

  it("should reject empty first name", () => {
    const contact = {
      firstName: "",
      lastName: "Doe",
      email: "john@example.com",
    };

    const result = createContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it("should reject empty last name", () => {
    const contact = {
      firstName: "John",
      lastName: "",
      email: "john@example.com",
    };

    const result = createContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const contact = {
      firstName: "John",
      lastName: "Doe",
      email: "not-an-email",
    };

    const result = createContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it("should reject email without domain", () => {
    const contact = {
      firstName: "John",
      lastName: "Doe",
      email: "john@",
    };

    const result = createContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it("should transform empty phone to null", () => {
    const contact = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "",
    };

    const result = createContactSchema.safeParse(contact);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
    }
  });

  it("should transform empty notes to null", () => {
    const contact = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      notes: "",
    };

    const result = createContactSchema.safeParse(contact);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeNull();
    }
  });

  it("should reject invalid source enum", () => {
    const contact = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      source: "INVALID_SOURCE",
    };

    const result = createContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it("should reject invalid status enum", () => {
    const contact = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      status: "INVALID_STATUS",
    };

    const result = createContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it("should reject first name over 100 characters", () => {
    const contact = {
      firstName: "a".repeat(101),
      lastName: "Doe",
      email: "john@example.com",
    };

    const result = createContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it("should reject email over 255 characters", () => {
    const contact = {
      firstName: "John",
      lastName: "Doe",
      email: "a".repeat(250) + "@example.com",
    };

    const result = createContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it("should reject invalid UUID in tagIds", () => {
    const contact = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      tagIds: ["not-a-uuid"],
    };

    const result = createContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it("should accept all valid source values", () => {
    const sources = ["INSTAGRAM", "WEBSITE", "REFERRAL", "WALK_IN", "OTHER"];

    for (const source of sources) {
      const contact = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        source,
      };
      const result = createContactSchema.safeParse(contact);
      expect(result.success).toBe(true);
    }
  });

  it("should accept all valid status values", () => {
    const statuses = ["LEAD", "CUSTOMER", "PAST_CUSTOMER", "COLD", "DO_NOT_CONTACT"];

    for (const status of statuses) {
      const contact = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        status,
      };
      const result = createContactSchema.safeParse(contact);
      expect(result.success).toBe(true);
    }
  });
});

describe("updateContactSchema", () => {
  it("should allow partial updates", () => {
    const update = {
      firstName: "Jane",
    };

    const result = updateContactSchema.safeParse(update);
    expect(result.success).toBe(true);
  });

  it("should allow empty object", () => {
    const result = updateContactSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should still validate field values when provided", () => {
    const update = {
      email: "not-an-email",
    };

    const result = updateContactSchema.safeParse(update);
    expect(result.success).toBe(false);
  });
});

describe("contactQuerySchema", () => {
  it("should provide defaults for pagination", () => {
    const result = contactQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it("should coerce string page to number", () => {
    const result = contactQuerySchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });

  it("should reject page less than 1", () => {
    const result = contactQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject limit over 100", () => {
    const result = contactQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("should accept valid filter values", () => {
    const query = {
      search: "john",
      status: "LEAD",
      source: "WEBSITE",
      tagId: "550e8400-e29b-41d4-a716-446655440000",
      page: 1,
      limit: 25,
    };

    const result = contactQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
  });
});
