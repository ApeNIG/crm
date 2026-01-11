import { describe, it, expect } from "vitest";
import {
  STATUS_ORDER,
  STATUS_CONFIG,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
} from "./statusConfig";
import type { BookingStatus } from "@/types/booking";

describe("STATUS_ORDER", () => {
  it("should contain all 7 statuses", () => {
    expect(STATUS_ORDER).toHaveLength(7);
  });

  it("should start with REQUESTED status", () => {
    expect(STATUS_ORDER[0]).toBe("REQUESTED");
  });

  it("should contain all expected statuses", () => {
    expect(STATUS_ORDER).toContain("REQUESTED");
    expect(STATUS_ORDER).toContain("PENDING_DEPOSIT");
    expect(STATUS_ORDER).toContain("CONFIRMED");
    expect(STATUS_ORDER).toContain("COMPLETED");
    expect(STATUS_ORDER).toContain("CANCELLED");
    expect(STATUS_ORDER).toContain("NO_SHOW");
    expect(STATUS_ORDER).toContain("RESCHEDULED");
  });

  it("should have CONFIRMED before COMPLETED (logical progression)", () => {
    const confirmedIndex = STATUS_ORDER.indexOf("CONFIRMED");
    const completedIndex = STATUS_ORDER.indexOf("COMPLETED");
    expect(confirmedIndex).toBeLessThan(completedIndex);
  });

  it("should have PENDING_DEPOSIT before CONFIRMED", () => {
    const pendingIndex = STATUS_ORDER.indexOf("PENDING_DEPOSIT");
    const confirmedIndex = STATUS_ORDER.indexOf("CONFIRMED");
    expect(pendingIndex).toBeLessThan(confirmedIndex);
  });
});

describe("STATUS_CONFIG", () => {
  it("should have config for all statuses in STATUS_ORDER", () => {
    for (const status of STATUS_ORDER) {
      expect(STATUS_CONFIG[status]).toBeDefined();
    }
  });

  it("should have correct structure for each status config", () => {
    for (const status of STATUS_ORDER) {
      const config = STATUS_CONFIG[status];
      expect(config).toHaveProperty("key");
      expect(config).toHaveProperty("label");
      expect(config).toHaveProperty("color");
      expect(config).toHaveProperty("bgColor");
    }
  });

  it("should have matching key and status", () => {
    for (const status of STATUS_ORDER) {
      const config = STATUS_CONFIG[status];
      expect(config.key).toBe(status);
    }
  });

  it("should have human-readable labels", () => {
    expect(STATUS_CONFIG.REQUESTED.label).toBe("Requested");
    expect(STATUS_CONFIG.PENDING_DEPOSIT.label).toBe("Pending Deposit");
    expect(STATUS_CONFIG.CONFIRMED.label).toBe("Confirmed");
    expect(STATUS_CONFIG.COMPLETED.label).toBe("Completed");
    expect(STATUS_CONFIG.CANCELLED.label).toBe("Cancelled");
    expect(STATUS_CONFIG.NO_SHOW.label).toBe("No Show");
    expect(STATUS_CONFIG.RESCHEDULED.label).toBe("Rescheduled");
  });

  it("should have Tailwind text color classes", () => {
    for (const status of STATUS_ORDER) {
      const config = STATUS_CONFIG[status];
      expect(config.color).toMatch(/^text-\w+-\d+$/);
    }
  });

  it("should have Tailwind background color classes", () => {
    for (const status of STATUS_ORDER) {
      const config = STATUS_CONFIG[status];
      expect(config.bgColor).toMatch(/^bg-\w+-\d+$/);
    }
  });

  it("should have distinct colors for REQUESTED (blue)", () => {
    expect(STATUS_CONFIG.REQUESTED.color).toContain("blue");
    expect(STATUS_CONFIG.REQUESTED.bgColor).toContain("blue");
  });

  it("should have distinct colors for PENDING_DEPOSIT (amber)", () => {
    expect(STATUS_CONFIG.PENDING_DEPOSIT.color).toContain("amber");
    expect(STATUS_CONFIG.PENDING_DEPOSIT.bgColor).toContain("amber");
  });

  it("should have distinct colors for CONFIRMED (green)", () => {
    expect(STATUS_CONFIG.CONFIRMED.color).toContain("green");
    expect(STATUS_CONFIG.CONFIRMED.bgColor).toContain("green");
  });

  it("should have distinct colors for COMPLETED (emerald)", () => {
    expect(STATUS_CONFIG.COMPLETED.color).toContain("emerald");
    expect(STATUS_CONFIG.COMPLETED.bgColor).toContain("emerald");
  });

  it("should have distinct colors for CANCELLED (gray)", () => {
    expect(STATUS_CONFIG.CANCELLED.color).toContain("gray");
    expect(STATUS_CONFIG.CANCELLED.bgColor).toContain("gray");
  });

  it("should have distinct colors for NO_SHOW (red)", () => {
    expect(STATUS_CONFIG.NO_SHOW.color).toContain("red");
    expect(STATUS_CONFIG.NO_SHOW.bgColor).toContain("red");
  });

  it("should have distinct colors for RESCHEDULED (purple)", () => {
    expect(STATUS_CONFIG.RESCHEDULED.color).toContain("purple");
    expect(STATUS_CONFIG.RESCHEDULED.bgColor).toContain("purple");
  });
});

describe("getStatusLabel", () => {
  it("should return correct label for REQUESTED", () => {
    expect(getStatusLabel("REQUESTED")).toBe("Requested");
  });

  it("should return correct label for PENDING_DEPOSIT", () => {
    expect(getStatusLabel("PENDING_DEPOSIT")).toBe("Pending Deposit");
  });

  it("should return correct label for CONFIRMED", () => {
    expect(getStatusLabel("CONFIRMED")).toBe("Confirmed");
  });

  it("should return correct label for COMPLETED", () => {
    expect(getStatusLabel("COMPLETED")).toBe("Completed");
  });

  it("should return correct label for CANCELLED", () => {
    expect(getStatusLabel("CANCELLED")).toBe("Cancelled");
  });

  it("should return correct label for NO_SHOW", () => {
    expect(getStatusLabel("NO_SHOW")).toBe("No Show");
  });

  it("should return correct label for RESCHEDULED", () => {
    expect(getStatusLabel("RESCHEDULED")).toBe("Rescheduled");
  });

  it("should return status as fallback for unknown status", () => {
    const unknownStatus = "UNKNOWN" as BookingStatus;
    expect(getStatusLabel(unknownStatus)).toBe("UNKNOWN");
  });
});

describe("getStatusColor", () => {
  it("should return correct color for REQUESTED", () => {
    expect(getStatusColor("REQUESTED")).toBe("text-blue-700");
  });

  it("should return correct color for PENDING_DEPOSIT", () => {
    expect(getStatusColor("PENDING_DEPOSIT")).toBe("text-amber-700");
  });

  it("should return correct color for CONFIRMED", () => {
    expect(getStatusColor("CONFIRMED")).toBe("text-green-700");
  });

  it("should return correct color for COMPLETED", () => {
    expect(getStatusColor("COMPLETED")).toBe("text-emerald-700");
  });

  it("should return correct color for CANCELLED", () => {
    expect(getStatusColor("CANCELLED")).toBe("text-gray-700");
  });

  it("should return correct color for NO_SHOW", () => {
    expect(getStatusColor("NO_SHOW")).toBe("text-red-700");
  });

  it("should return correct color for RESCHEDULED", () => {
    expect(getStatusColor("RESCHEDULED")).toBe("text-purple-700");
  });

  it("should return default gray color for unknown status", () => {
    const unknownStatus = "UNKNOWN" as BookingStatus;
    expect(getStatusColor(unknownStatus)).toBe("text-gray-700");
  });
});

describe("getStatusBgColor", () => {
  it("should return correct background color for REQUESTED", () => {
    expect(getStatusBgColor("REQUESTED")).toBe("bg-blue-50");
  });

  it("should return correct background color for PENDING_DEPOSIT", () => {
    expect(getStatusBgColor("PENDING_DEPOSIT")).toBe("bg-amber-50");
  });

  it("should return correct background color for CONFIRMED", () => {
    expect(getStatusBgColor("CONFIRMED")).toBe("bg-green-50");
  });

  it("should return correct background color for COMPLETED", () => {
    expect(getStatusBgColor("COMPLETED")).toBe("bg-emerald-50");
  });

  it("should return correct background color for CANCELLED", () => {
    expect(getStatusBgColor("CANCELLED")).toBe("bg-gray-100");
  });

  it("should return correct background color for NO_SHOW", () => {
    expect(getStatusBgColor("NO_SHOW")).toBe("bg-red-50");
  });

  it("should return correct background color for RESCHEDULED", () => {
    expect(getStatusBgColor("RESCHEDULED")).toBe("bg-purple-50");
  });

  it("should return default gray background for unknown status", () => {
    const unknownStatus = "UNKNOWN" as BookingStatus;
    expect(getStatusBgColor(unknownStatus)).toBe("bg-gray-50");
  });
});
