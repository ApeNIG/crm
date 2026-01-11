import { describe, it, expect } from "vitest";
import {
  STAGE_ORDER,
  STAGE_CONFIG,
  getStageLabel,
  getStageColor,
  getStageBgColor,
} from "./stageConfig";
import type { EnquiryStage } from "@/types/enquiry";

describe("STAGE_ORDER", () => {
  it("should contain all 7 stages", () => {
    expect(STAGE_ORDER).toHaveLength(7);
  });

  it("should start with NEW stage", () => {
    expect(STAGE_ORDER[0]).toBe("NEW");
  });

  it("should end with LOST stage", () => {
    expect(STAGE_ORDER[STAGE_ORDER.length - 1]).toBe("LOST");
  });

  it("should contain all expected stages in order", () => {
    expect(STAGE_ORDER).toEqual([
      "NEW",
      "AUTO_RESPONDED",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL_SENT",
      "BOOKED_PAID",
      "LOST",
    ]);
  });

  it("should have BOOKED_PAID before LOST (success before failure)", () => {
    const bookedIndex = STAGE_ORDER.indexOf("BOOKED_PAID");
    const lostIndex = STAGE_ORDER.indexOf("LOST");
    expect(bookedIndex).toBeLessThan(lostIndex);
  });

  it("should have logical progression from NEW to BOOKED_PAID", () => {
    const newIndex = STAGE_ORDER.indexOf("NEW");
    const contactedIndex = STAGE_ORDER.indexOf("CONTACTED");
    const qualifiedIndex = STAGE_ORDER.indexOf("QUALIFIED");
    const proposalIndex = STAGE_ORDER.indexOf("PROPOSAL_SENT");
    const bookedIndex = STAGE_ORDER.indexOf("BOOKED_PAID");

    expect(newIndex).toBeLessThan(contactedIndex);
    expect(contactedIndex).toBeLessThan(qualifiedIndex);
    expect(qualifiedIndex).toBeLessThan(proposalIndex);
    expect(proposalIndex).toBeLessThan(bookedIndex);
  });
});

describe("STAGE_CONFIG", () => {
  it("should have config for all stages in STAGE_ORDER", () => {
    for (const stage of STAGE_ORDER) {
      expect(STAGE_CONFIG[stage]).toBeDefined();
    }
  });

  it("should have correct structure for each stage config", () => {
    for (const stage of STAGE_ORDER) {
      const config = STAGE_CONFIG[stage];
      expect(config).toHaveProperty("key");
      expect(config).toHaveProperty("label");
      expect(config).toHaveProperty("color");
      expect(config).toHaveProperty("bgColor");
    }
  });

  it("should have matching key and stage", () => {
    for (const stage of STAGE_ORDER) {
      const config = STAGE_CONFIG[stage];
      expect(config.key).toBe(stage);
    }
  });

  it("should have human-readable labels", () => {
    expect(STAGE_CONFIG.NEW.label).toBe("New");
    expect(STAGE_CONFIG.AUTO_RESPONDED.label).toBe("Auto-Responded");
    expect(STAGE_CONFIG.CONTACTED.label).toBe("Contacted");
    expect(STAGE_CONFIG.QUALIFIED.label).toBe("Qualified");
    expect(STAGE_CONFIG.PROPOSAL_SENT.label).toBe("Proposal Sent");
    expect(STAGE_CONFIG.BOOKED_PAID.label).toBe("Booked/Paid");
    expect(STAGE_CONFIG.LOST.label).toBe("Lost");
  });

  it("should have Tailwind text color classes", () => {
    for (const stage of STAGE_ORDER) {
      const config = STAGE_CONFIG[stage];
      expect(config.color).toMatch(/^text-\w+-\d+$/);
    }
  });

  it("should have Tailwind background color classes", () => {
    for (const stage of STAGE_ORDER) {
      const config = STAGE_CONFIG[stage];
      expect(config.bgColor).toMatch(/^bg-\w+-\d+$/);
    }
  });

  it("should have distinct colors for NEW (blue)", () => {
    expect(STAGE_CONFIG.NEW.color).toContain("blue");
    expect(STAGE_CONFIG.NEW.bgColor).toContain("blue");
  });

  it("should have distinct colors for BOOKED_PAID (green)", () => {
    expect(STAGE_CONFIG.BOOKED_PAID.color).toContain("green");
    expect(STAGE_CONFIG.BOOKED_PAID.bgColor).toContain("green");
  });

  it("should have distinct colors for LOST (gray)", () => {
    expect(STAGE_CONFIG.LOST.color).toContain("gray");
    expect(STAGE_CONFIG.LOST.bgColor).toContain("gray");
  });
});

describe("getStageLabel", () => {
  it("should return correct label for NEW", () => {
    expect(getStageLabel("NEW")).toBe("New");
  });

  it("should return correct label for AUTO_RESPONDED", () => {
    expect(getStageLabel("AUTO_RESPONDED")).toBe("Auto-Responded");
  });

  it("should return correct label for CONTACTED", () => {
    expect(getStageLabel("CONTACTED")).toBe("Contacted");
  });

  it("should return correct label for QUALIFIED", () => {
    expect(getStageLabel("QUALIFIED")).toBe("Qualified");
  });

  it("should return correct label for PROPOSAL_SENT", () => {
    expect(getStageLabel("PROPOSAL_SENT")).toBe("Proposal Sent");
  });

  it("should return correct label for BOOKED_PAID", () => {
    expect(getStageLabel("BOOKED_PAID")).toBe("Booked/Paid");
  });

  it("should return correct label for LOST", () => {
    expect(getStageLabel("LOST")).toBe("Lost");
  });

  it("should return stage as fallback for unknown stage", () => {
    const unknownStage = "UNKNOWN" as EnquiryStage;
    expect(getStageLabel(unknownStage)).toBe("UNKNOWN");
  });
});

describe("getStageColor", () => {
  it("should return correct color for NEW", () => {
    expect(getStageColor("NEW")).toBe("text-blue-700");
  });

  it("should return correct color for AUTO_RESPONDED", () => {
    expect(getStageColor("AUTO_RESPONDED")).toBe("text-sky-700");
  });

  it("should return correct color for CONTACTED", () => {
    expect(getStageColor("CONTACTED")).toBe("text-amber-700");
  });

  it("should return correct color for QUALIFIED", () => {
    expect(getStageColor("QUALIFIED")).toBe("text-orange-700");
  });

  it("should return correct color for PROPOSAL_SENT", () => {
    expect(getStageColor("PROPOSAL_SENT")).toBe("text-purple-700");
  });

  it("should return correct color for BOOKED_PAID", () => {
    expect(getStageColor("BOOKED_PAID")).toBe("text-green-700");
  });

  it("should return correct color for LOST", () => {
    expect(getStageColor("LOST")).toBe("text-gray-700");
  });

  it("should return default gray color for unknown stage", () => {
    const unknownStage = "UNKNOWN" as EnquiryStage;
    expect(getStageColor(unknownStage)).toBe("text-gray-700");
  });
});

describe("getStageBgColor", () => {
  it("should return correct background color for NEW", () => {
    expect(getStageBgColor("NEW")).toBe("bg-blue-50");
  });

  it("should return correct background color for AUTO_RESPONDED", () => {
    expect(getStageBgColor("AUTO_RESPONDED")).toBe("bg-sky-50");
  });

  it("should return correct background color for CONTACTED", () => {
    expect(getStageBgColor("CONTACTED")).toBe("bg-amber-50");
  });

  it("should return correct background color for QUALIFIED", () => {
    expect(getStageBgColor("QUALIFIED")).toBe("bg-orange-50");
  });

  it("should return correct background color for PROPOSAL_SENT", () => {
    expect(getStageBgColor("PROPOSAL_SENT")).toBe("bg-purple-50");
  });

  it("should return correct background color for BOOKED_PAID", () => {
    expect(getStageBgColor("BOOKED_PAID")).toBe("bg-green-50");
  });

  it("should return correct background color for LOST", () => {
    expect(getStageBgColor("LOST")).toBe("bg-gray-100");
  });

  it("should return default gray background for unknown stage", () => {
    const unknownStage = "UNKNOWN" as EnquiryStage;
    expect(getStageBgColor(unknownStage)).toBe("bg-gray-50");
  });
});
