import { describe, it, expect } from "vitest";
import {
  bookingStatusEnum,
  bookingActivityTypeEnum,
  createBookingSchema,
  updateBookingSchema,
  updateBookingStatusSchema,
  bookingQuerySchema,
  calendarQuerySchema,
} from "./booking";

describe("bookingStatusEnum", () => {
  it("should accept all valid status values", () => {
    const statuses = [
      "REQUESTED",
      "PENDING_DEPOSIT",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
      "RESCHEDULED",
    ];

    for (const status of statuses) {
      const result = bookingStatusEnum.safeParse(status);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid status values", () => {
    const result = bookingStatusEnum.safeParse("INVALID_STATUS");
    expect(result.success).toBe(false);
  });

  it("should reject lowercase status values", () => {
    const result = bookingStatusEnum.safeParse("requested");
    expect(result.success).toBe(false);
  });

  it("should reject empty string", () => {
    const result = bookingStatusEnum.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("bookingActivityTypeEnum", () => {
  it("should accept all valid activity type values", () => {
    const types = [
      "BOOKING_CREATED",
      "BOOKING_UPDATED",
      "BOOKING_STATUS_CHANGED",
      "BOOKING_RESCHEDULED",
      "BOOKING_NOTE_ADDED",
    ];

    for (const type of types) {
      const result = bookingActivityTypeEnum.safeParse(type);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid activity type values", () => {
    const result = bookingActivityTypeEnum.safeParse("INVALID_TYPE");
    expect(result.success).toBe(false);
  });

  it("should reject lowercase activity type values", () => {
    const result = bookingActivityTypeEnum.safeParse("booking_created");
    expect(result.success).toBe(false);
  });
});

describe("createBookingSchema", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";
  const validUUID2 = "660e8400-e29b-41d4-a716-446655440001";
  const validDateTime = "2025-02-15T10:00:00.000Z";
  const validEndTime = "2025-02-15T11:00:00.000Z";

  it("should validate a complete valid booking", () => {
    const validBooking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      enquiryId: validUUID,
      startAt: validDateTime,
      endAt: validEndTime,
      status: "CONFIRMED",
      location: "123 Main Street",
      virtualLink: "https://zoom.us/j/123456",
      notes: "Test booking notes",
      depositPaid: true,
    };

    const result = createBookingSchema.safeParse(validBooking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactId).toBe(validUUID);
      expect(result.data.serviceTypeId).toBe(validUUID2);
      expect(result.data.enquiryId).toBe(validUUID);
      expect(result.data.startAt).toBeInstanceOf(Date);
      expect(result.data.endAt).toBeInstanceOf(Date);
      expect(result.data.status).toBe("CONFIRMED");
      expect(result.data.location).toBe("123 Main Street");
      expect(result.data.virtualLink).toBe("https://zoom.us/j/123456");
      expect(result.data.notes).toBe("Test booking notes");
      expect(result.data.depositPaid).toBe(true);
    }
  });

  it("should validate with only required fields", () => {
    const minimalBooking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
    };

    const result = createBookingSchema.safeParse(minimalBooking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactId).toBe(validUUID);
      expect(result.data.serviceTypeId).toBe(validUUID2);
      expect(result.data.startAt).toBeInstanceOf(Date);
      expect(result.data.endAt).toBeInstanceOf(Date);
      expect(result.data.status).toBe("REQUESTED");
      expect(result.data.enquiryId).toBeNull();
      expect(result.data.location).toBeNull();
      expect(result.data.virtualLink).toBeNull();
      expect(result.data.notes).toBeNull();
      expect(result.data.depositPaid).toBe(false);
    }
  });

  it("should reject invalid contactId (not UUID)", () => {
    const booking = {
      contactId: "not-a-uuid",
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid contact ID");
    }
  });

  it("should reject empty contactId", () => {
    const booking = {
      contactId: "",
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
  });

  it("should reject missing contactId", () => {
    const booking = {
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
  });

  it("should reject invalid serviceTypeId (not UUID)", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: "not-a-uuid",
      startAt: validDateTime,
      endAt: validEndTime,
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid service type ID");
    }
  });

  it("should reject invalid enquiryId (not UUID)", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      enquiryId: "not-a-uuid",
      startAt: validDateTime,
      endAt: validEndTime,
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid enquiry ID");
    }
  });

  it("should accept null enquiryId", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      enquiryId: null,
      startAt: validDateTime,
      endAt: validEndTime,
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enquiryId).toBeNull();
    }
  });

  it("should reject empty string enquiryId (fails UUID validation)", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      enquiryId: "",
      startAt: validDateTime,
      endAt: validEndTime,
    };

    // Empty string fails UUID validation before transform can apply
    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
  });

  it("should parse and transform valid startAt to Date", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: "2025-02-15T10:00:00.000Z",
      endAt: validEndTime,
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startAt).toBeInstanceOf(Date);
      expect(result.data.startAt.toISOString()).toBe("2025-02-15T10:00:00.000Z");
    }
  });

  it("should reject invalid startAt format", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: "not-a-date",
      endAt: validEndTime,
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid start date/time");
    }
  });

  it("should reject invalid endAt format", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: "not-a-date",
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid end date/time");
    }
  });

  it("should accept all valid status values", () => {
    const statuses = [
      "REQUESTED",
      "PENDING_DEPOSIT",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
      "RESCHEDULED",
    ];

    for (const status of statuses) {
      const booking = {
        contactId: validUUID,
        serviceTypeId: validUUID2,
        startAt: validDateTime,
        endAt: validEndTime,
        status,
      };
      const result = createBookingSchema.safeParse(booking);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid status value", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      status: "INVALID_STATUS",
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
  });

  it("should transform empty location to null", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      location: "",
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.location).toBeNull();
    }
  });

  it("should reject location over 500 characters", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      location: "a".repeat(501),
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Location is too long");
    }
  });

  it("should accept location at exactly 500 characters", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      location: "a".repeat(500),
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(true);
  });

  it("should accept valid virtualLink URL", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      virtualLink: "https://zoom.us/j/123456",
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.virtualLink).toBe("https://zoom.us/j/123456");
    }
  });

  it("should reject invalid virtualLink URL format", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      virtualLink: "not-a-url",
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid URL format");
    }
  });

  it("should reject empty string virtualLink (fails URL validation)", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      virtualLink: "",
    };

    // Empty string fails URL validation before transform can apply
    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
  });

  it("should accept null virtualLink", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      virtualLink: null,
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.virtualLink).toBeNull();
    }
  });

  it("should reject virtualLink over 500 characters", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      virtualLink: "https://zoom.us/" + "a".repeat(490),
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Virtual link is too long");
    }
  });

  it("should accept valid notes", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      notes: "Test notes content",
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBe("Test notes content");
    }
  });

  it("should transform empty notes to null", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      notes: "",
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeNull();
    }
  });

  it("should reject notes over 5000 characters", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      notes: "a".repeat(5001),
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Notes are too long");
    }
  });

  it("should accept notes at exactly 5000 characters", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      notes: "a".repeat(5000),
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(true);
  });

  it("should default depositPaid to false", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.depositPaid).toBe(false);
    }
  });

  it("should accept true depositPaid", () => {
    const booking = {
      contactId: validUUID,
      serviceTypeId: validUUID2,
      startAt: validDateTime,
      endAt: validEndTime,
      depositPaid: true,
    };

    const result = createBookingSchema.safeParse(booking);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.depositPaid).toBe(true);
    }
  });
});

describe("updateBookingSchema", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";
  const validDateTime = "2025-02-15T10:00:00.000Z";

  it("should allow partial updates", () => {
    const update = {
      status: "CONFIRMED",
    };

    const result = updateBookingSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("CONFIRMED");
    }
  });

  it("should allow empty object", () => {
    const result = updateBookingSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should not allow contactId to be updated", () => {
    const update = {
      contactId: validUUID,
    };

    const result = updateBookingSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("contactId");
    }
  });

  it("should still validate field values when provided", () => {
    const update = {
      location: "a".repeat(501),
    };

    const result = updateBookingSchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it("should allow updating startAt", () => {
    const update = {
      startAt: validDateTime,
    };

    const result = updateBookingSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startAt).toBeInstanceOf(Date);
    }
  });

  it("should allow updating status", () => {
    const update = {
      status: "COMPLETED",
    };

    const result = updateBookingSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("COMPLETED");
    }
  });

  it("should allow updating notes", () => {
    const update = {
      notes: "Updated notes",
    };

    const result = updateBookingSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBe("Updated notes");
    }
  });

  it("should allow updating multiple fields", () => {
    const update = {
      status: "CONFIRMED",
      notes: "Updated notes",
      depositPaid: true,
    };

    const result = updateBookingSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("CONFIRMED");
      expect(result.data.notes).toBe("Updated notes");
      expect(result.data.depositPaid).toBe(true);
    }
  });
});

describe("updateBookingStatusSchema", () => {
  it("should accept valid status", () => {
    const update = {
      status: "CONFIRMED",
    };

    const result = updateBookingStatusSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("CONFIRMED");
    }
  });

  it("should accept all valid status values", () => {
    const statuses = [
      "REQUESTED",
      "PENDING_DEPOSIT",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
      "RESCHEDULED",
    ];

    for (const status of statuses) {
      const update = { status };
      const result = updateBookingStatusSchema.safeParse(update);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid status", () => {
    const update = {
      status: "INVALID_STATUS",
    };

    const result = updateBookingStatusSchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it("should require status field", () => {
    const result = updateBookingStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject empty status", () => {
    const update = {
      status: "",
    };

    const result = updateBookingStatusSchema.safeParse(update);
    expect(result.success).toBe(false);
  });
});

describe("bookingQuerySchema", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("should provide defaults for pagination", () => {
    const result = bookingQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(100);
    }
  });

  it("should coerce string page to number", () => {
    const result = bookingQuerySchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });

  it("should coerce string limit to number", () => {
    const result = bookingQuerySchema.safeParse({ limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
    }
  });

  it("should reject page less than 1", () => {
    const result = bookingQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject negative page", () => {
    const result = bookingQuerySchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("should reject limit less than 1", () => {
    const result = bookingQuerySchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject limit over 200", () => {
    const result = bookingQuerySchema.safeParse({ limit: 201 });
    expect(result.success).toBe(false);
  });

  it("should accept limit at exactly 200", () => {
    const result = bookingQuerySchema.safeParse({ limit: 200 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(200);
    }
  });

  it("should accept valid search string", () => {
    const result = bookingQuerySchema.safeParse({ search: "john" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("john");
    }
  });

  it("should accept valid status filter", () => {
    const result = bookingQuerySchema.safeParse({ status: "CONFIRMED" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("CONFIRMED");
    }
  });

  it("should reject invalid status filter", () => {
    const result = bookingQuerySchema.safeParse({ status: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("should accept valid contactId filter", () => {
    const result = bookingQuerySchema.safeParse({ contactId: validUUID });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactId).toBe(validUUID);
    }
  });

  it("should reject invalid contactId UUID", () => {
    const result = bookingQuerySchema.safeParse({ contactId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid serviceTypeId filter", () => {
    const result = bookingQuerySchema.safeParse({ serviceTypeId: validUUID });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.serviceTypeId).toBe(validUUID);
    }
  });

  it("should reject invalid serviceTypeId UUID", () => {
    const result = bookingQuerySchema.safeParse({ serviceTypeId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid dateFrom filter", () => {
    const dateFrom = "2025-02-01T00:00:00.000Z";
    const result = bookingQuerySchema.safeParse({ dateFrom });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateFrom).toBeInstanceOf(Date);
    }
  });

  it("should accept valid dateTo filter", () => {
    const dateTo = "2025-02-28T23:59:59.000Z";
    const result = bookingQuerySchema.safeParse({ dateTo });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateTo).toBeInstanceOf(Date);
    }
  });

  it("should accept all valid filter values", () => {
    const query = {
      search: "john",
      status: "CONFIRMED",
      contactId: validUUID,
      serviceTypeId: validUUID,
      dateFrom: "2025-02-01T00:00:00.000Z",
      dateTo: "2025-02-28T23:59:59.000Z",
      page: 2,
      limit: 25,
    };

    const result = bookingQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("john");
      expect(result.data.status).toBe("CONFIRMED");
      expect(result.data.contactId).toBe(validUUID);
      expect(result.data.serviceTypeId).toBe(validUUID);
      expect(result.data.dateFrom).toBeInstanceOf(Date);
      expect(result.data.dateTo).toBeInstanceOf(Date);
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });
});

describe("calendarQuerySchema", () => {
  it("should require startDate", () => {
    const result = calendarQuerySchema.safeParse({
      endDate: "2025-02-28T23:59:59.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("should require endDate", () => {
    const result = calendarQuerySchema.safeParse({
      startDate: "2025-02-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("should require both startDate and endDate", () => {
    const result = calendarQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should transform valid dates to Date objects", () => {
    const query = {
      startDate: "2025-02-01T00:00:00.000Z",
      endDate: "2025-02-28T23:59:59.000Z",
    };

    const result = calendarQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBeInstanceOf(Date);
      expect(result.data.endDate).toBeInstanceOf(Date);
    }
  });

  it("should reject invalid startDate format", () => {
    const query = {
      startDate: "not-a-date",
      endDate: "2025-02-28T23:59:59.000Z",
    };

    const result = calendarQuerySchema.safeParse(query);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid start date");
    }
  });

  it("should reject invalid endDate format", () => {
    const query = {
      startDate: "2025-02-01T00:00:00.000Z",
      endDate: "not-a-date",
    };

    const result = calendarQuerySchema.safeParse(query);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid end date");
    }
  });
});
