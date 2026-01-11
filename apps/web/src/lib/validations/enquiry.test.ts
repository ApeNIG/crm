import { describe, it, expect } from "vitest";
import {
  createEnquirySchema,
  updateEnquirySchema,
  updateEnquiryStageSchema,
  enquiryQuerySchema,
  enquiryStageEnum,
  enquiryTypeEnum,
} from "./enquiry";

describe("enquiryStageEnum", () => {
  it("should accept all valid stage values", () => {
    const stages = [
      "NEW",
      "AUTO_RESPONDED",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL_SENT",
      "BOOKED_PAID",
      "LOST",
    ];

    for (const stage of stages) {
      const result = enquiryStageEnum.safeParse(stage);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid stage values", () => {
    const result = enquiryStageEnum.safeParse("INVALID_STAGE");
    expect(result.success).toBe(false);
  });

  it("should reject lowercase stage values", () => {
    const result = enquiryStageEnum.safeParse("new");
    expect(result.success).toBe(false);
  });

  it("should reject empty string", () => {
    const result = enquiryStageEnum.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("enquiryTypeEnum", () => {
  it("should accept all valid type values", () => {
    const types = ["GENERAL", "SERVICE", "PRODUCT", "PARTNERSHIP"];

    for (const type of types) {
      const result = enquiryTypeEnum.safeParse(type);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid type values", () => {
    const result = enquiryTypeEnum.safeParse("INVALID_TYPE");
    expect(result.success).toBe(false);
  });

  it("should reject lowercase type values", () => {
    const result = enquiryTypeEnum.safeParse("general");
    expect(result.success).toBe(false);
  });
});

describe("createEnquirySchema", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("should validate a complete valid enquiry", () => {
    const validEnquiry = {
      contactId: validUUID,
      enquiryType: "SERVICE",
      message: "I would like to book an appointment",
      preferredDate: "2025-02-15T10:00:00.000Z",
      preferredTime: "Morning",
      estimatedValue: 500,
      stage: "NEW",
      nextActionAt: "2025-02-10T09:00:00.000Z",
      sourceUrl: "https://example.com/contact",
    };

    const result = createEnquirySchema.safeParse(validEnquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactId).toBe(validUUID);
      expect(result.data.enquiryType).toBe("SERVICE");
      expect(result.data.estimatedValue).toBe(500);
      expect(result.data.preferredDate).toBeInstanceOf(Date);
      expect(result.data.nextActionAt).toBeInstanceOf(Date);
    }
  });

  it("should validate with only required fields", () => {
    const minimalEnquiry = {
      contactId: validUUID,
    };

    const result = createEnquirySchema.safeParse(minimalEnquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactId).toBe(validUUID);
      expect(result.data.enquiryType).toBe("GENERAL");
      expect(result.data.stage).toBe("NEW");
      expect(result.data.message).toBeNull();
      expect(result.data.preferredDate).toBeNull();
      expect(result.data.preferredTime).toBeNull();
      expect(result.data.estimatedValue).toBeUndefined();
      expect(result.data.nextActionAt).toBeNull();
      expect(result.data.sourceUrl).toBeNull();
    }
  });

  it("should reject invalid contactId UUID", () => {
    const enquiry = {
      contactId: "not-a-uuid",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid contact ID");
    }
  });

  it("should reject empty contactId", () => {
    const enquiry = {
      contactId: "",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
  });

  it("should reject missing contactId", () => {
    const enquiry = {};

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
  });

  it("should reject invalid enquiryType", () => {
    const enquiry = {
      contactId: validUUID,
      enquiryType: "INVALID_TYPE",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
  });

  it("should accept all valid enquiryType values", () => {
    const types = ["GENERAL", "SERVICE", "PRODUCT", "PARTNERSHIP"];

    for (const type of types) {
      const enquiry = {
        contactId: validUUID,
        enquiryType: type,
      };
      const result = createEnquirySchema.safeParse(enquiry);
      expect(result.success).toBe(true);
    }
  });

  it("should transform empty message to null", () => {
    const enquiry = {
      contactId: validUUID,
      message: "",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBeNull();
    }
  });

  it("should accept valid message", () => {
    const enquiry = {
      contactId: validUUID,
      message: "Test message content",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe("Test message content");
    }
  });

  it("should reject message over 5000 characters", () => {
    const enquiry = {
      contactId: validUUID,
      message: "a".repeat(5001),
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Message is too long");
    }
  });

  it("should accept message at exactly 5000 characters", () => {
    const enquiry = {
      contactId: validUUID,
      message: "a".repeat(5000),
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
  });

  it("should parse and transform valid preferredDate to Date", () => {
    const enquiry = {
      contactId: validUUID,
      preferredDate: "2025-02-15T10:00:00.000Z",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredDate).toBeInstanceOf(Date);
      expect(result.data.preferredDate?.toISOString()).toBe(
        "2025-02-15T10:00:00.000Z"
      );
    }
  });

  it("should reject invalid preferredDate format", () => {
    const enquiry = {
      contactId: validUUID,
      preferredDate: "not-a-date",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
  });

  it("should accept null preferredDate", () => {
    const enquiry = {
      contactId: validUUID,
      preferredDate: null,
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredDate).toBeNull();
    }
  });

  it("should transform empty preferredTime to null", () => {
    const enquiry = {
      contactId: validUUID,
      preferredTime: "",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredTime).toBeNull();
    }
  });

  it("should reject preferredTime over 20 characters", () => {
    const enquiry = {
      contactId: validUUID,
      preferredTime: "a".repeat(21),
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Time format too long");
    }
  });

  it("should accept preferredTime at exactly 20 characters", () => {
    const enquiry = {
      contactId: validUUID,
      preferredTime: "a".repeat(20),
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
  });

  it("should accept zero estimatedValue", () => {
    const enquiry = {
      contactId: validUUID,
      estimatedValue: 0,
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimatedValue).toBe(0);
    }
  });

  it("should accept positive estimatedValue", () => {
    const enquiry = {
      contactId: validUUID,
      estimatedValue: 1000.50,
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimatedValue).toBe(1000.50);
    }
  });

  it("should reject negative estimatedValue", () => {
    const enquiry = {
      contactId: validUUID,
      estimatedValue: -100,
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Value cannot be negative");
    }
  });

  it("should accept null estimatedValue", () => {
    const enquiry = {
      contactId: validUUID,
      estimatedValue: null,
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimatedValue).toBeNull();
    }
  });

  it("should accept all valid stage values", () => {
    const stages = [
      "NEW",
      "AUTO_RESPONDED",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL_SENT",
      "BOOKED_PAID",
      "LOST",
    ];

    for (const stage of stages) {
      const enquiry = {
        contactId: validUUID,
        stage,
      };
      const result = createEnquirySchema.safeParse(enquiry);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid stage value", () => {
    const enquiry = {
      contactId: validUUID,
      stage: "INVALID_STAGE",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
  });

  it("should parse and transform valid nextActionAt to Date", () => {
    const enquiry = {
      contactId: validUUID,
      nextActionAt: "2025-02-10T09:00:00.000Z",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nextActionAt).toBeInstanceOf(Date);
      expect(result.data.nextActionAt?.toISOString()).toBe(
        "2025-02-10T09:00:00.000Z"
      );
    }
  });

  it("should reject invalid nextActionAt format", () => {
    const enquiry = {
      contactId: validUUID,
      nextActionAt: "invalid-date",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
  });

  it("should accept valid sourceUrl", () => {
    const enquiry = {
      contactId: validUUID,
      sourceUrl: "https://example.com/contact-form",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sourceUrl).toBe("https://example.com/contact-form");
    }
  });

  it("should reject empty sourceUrl as invalid URL", () => {
    const enquiry = {
      contactId: validUUID,
      sourceUrl: "",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    // Empty string fails URL validation before transform
    expect(result.success).toBe(false);
  });

  it("should accept null sourceUrl", () => {
    const enquiry = {
      contactId: validUUID,
      sourceUrl: null,
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sourceUrl).toBeNull();
    }
  });

  it("should accept undefined sourceUrl", () => {
    const enquiry = {
      contactId: validUUID,
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sourceUrl).toBeNull();
    }
  });

  it("should reject invalid sourceUrl format", () => {
    const enquiry = {
      contactId: validUUID,
      sourceUrl: "not-a-url",
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid URL");
    }
  });

  it("should reject sourceUrl over 500 characters", () => {
    const enquiry = {
      contactId: validUUID,
      sourceUrl: "https://example.com/" + "a".repeat(500),
    };

    const result = createEnquirySchema.safeParse(enquiry);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("URL is too long");
    }
  });
});

describe("updateEnquirySchema", () => {
  it("should allow partial updates", () => {
    const update = {
      enquiryType: "SERVICE",
    };

    const result = updateEnquirySchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enquiryType).toBe("SERVICE");
    }
  });

  it("should allow empty object", () => {
    const result = updateEnquirySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should not allow contactId to be updated", () => {
    const update = {
      contactId: "550e8400-e29b-41d4-a716-446655440000",
    };

    const result = updateEnquirySchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("contactId");
    }
  });

  it("should still validate field values when provided", () => {
    const update = {
      estimatedValue: -100,
    };

    const result = updateEnquirySchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it("should allow updating message", () => {
    const update = {
      message: "Updated message content",
    };

    const result = updateEnquirySchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe("Updated message content");
    }
  });

  it("should allow updating stage", () => {
    const update = {
      stage: "QUALIFIED",
    };

    const result = updateEnquirySchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stage).toBe("QUALIFIED");
    }
  });

  it("should allow updating estimatedValue", () => {
    const update = {
      estimatedValue: 2500,
    };

    const result = updateEnquirySchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimatedValue).toBe(2500);
    }
  });

  it("should validate sourceUrl format on update", () => {
    const update = {
      sourceUrl: "not-a-url",
    };

    const result = updateEnquirySchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it("should allow multiple fields to be updated", () => {
    const update = {
      enquiryType: "PRODUCT",
      message: "Updated message",
      estimatedValue: 750,
      stage: "CONTACTED",
    };

    const result = updateEnquirySchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enquiryType).toBe("PRODUCT");
      expect(result.data.message).toBe("Updated message");
      expect(result.data.estimatedValue).toBe(750);
      expect(result.data.stage).toBe("CONTACTED");
    }
  });
});

describe("updateEnquiryStageSchema", () => {
  it("should accept valid stage", () => {
    const update = {
      stage: "QUALIFIED",
    };

    const result = updateEnquiryStageSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stage).toBe("QUALIFIED");
    }
  });

  it("should accept all valid stage values", () => {
    const stages = [
      "NEW",
      "AUTO_RESPONDED",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL_SENT",
      "BOOKED_PAID",
      "LOST",
    ];

    for (const stage of stages) {
      const update = { stage };
      const result = updateEnquiryStageSchema.safeParse(update);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid stage", () => {
    const update = {
      stage: "INVALID_STAGE",
    };

    const result = updateEnquiryStageSchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it("should require stage field", () => {
    const result = updateEnquiryStageSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject empty stage", () => {
    const update = {
      stage: "",
    };

    const result = updateEnquiryStageSchema.safeParse(update);
    expect(result.success).toBe(false);
  });
});

describe("enquiryQuerySchema", () => {
  it("should provide defaults for pagination", () => {
    const result = enquiryQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(100);
    }
  });

  it("should coerce string page to number", () => {
    const result = enquiryQuerySchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });

  it("should coerce string limit to number", () => {
    const result = enquiryQuerySchema.safeParse({ limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
    }
  });

  it("should reject page less than 1", () => {
    const result = enquiryQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject negative page", () => {
    const result = enquiryQuerySchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("should reject limit less than 1", () => {
    const result = enquiryQuerySchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject limit over 200", () => {
    const result = enquiryQuerySchema.safeParse({ limit: 201 });
    expect(result.success).toBe(false);
  });

  it("should accept limit at exactly 200", () => {
    const result = enquiryQuerySchema.safeParse({ limit: 200 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(200);
    }
  });

  it("should accept valid search string", () => {
    const result = enquiryQuerySchema.safeParse({ search: "john" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("john");
    }
  });

  it("should accept valid stage filter", () => {
    const result = enquiryQuerySchema.safeParse({ stage: "NEW" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stage).toBe("NEW");
    }
  });

  it("should reject invalid stage filter", () => {
    const result = enquiryQuerySchema.safeParse({ stage: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("should accept valid contactId filter", () => {
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";
    const result = enquiryQuerySchema.safeParse({ contactId: validUUID });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactId).toBe(validUUID);
    }
  });

  it("should reject invalid contactId UUID", () => {
    const result = enquiryQuerySchema.safeParse({ contactId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid enquiryType filter", () => {
    const result = enquiryQuerySchema.safeParse({ enquiryType: "SERVICE" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enquiryType).toBe("SERVICE");
    }
  });

  it("should reject invalid enquiryType filter", () => {
    const result = enquiryQuerySchema.safeParse({ enquiryType: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("should accept all valid filter values", () => {
    const query = {
      search: "john",
      stage: "QUALIFIED",
      contactId: "550e8400-e29b-41d4-a716-446655440000",
      enquiryType: "SERVICE",
      page: 2,
      limit: 25,
    };

    const result = enquiryQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("john");
      expect(result.data.stage).toBe("QUALIFIED");
      expect(result.data.contactId).toBe(
        "550e8400-e29b-41d4-a716-446655440000"
      );
      expect(result.data.enquiryType).toBe("SERVICE");
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });
});
