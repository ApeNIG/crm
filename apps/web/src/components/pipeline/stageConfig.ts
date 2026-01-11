import type { EnquiryStage, StageConfig } from "@/types/enquiry";

export const STAGE_ORDER: EnquiryStage[] = [
  "NEW",
  "AUTO_RESPONDED",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "BOOKED_PAID",
  "LOST",
];

export const STAGE_CONFIG: Record<EnquiryStage, StageConfig> = {
  NEW: {
    key: "NEW",
    label: "New",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    dotColor: "#3B82F6", // blue-500
  },
  AUTO_RESPONDED: {
    key: "AUTO_RESPONDED",
    label: "Auto-Responded",
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    dotColor: "#0EA5E9", // sky-500
  },
  CONTACTED: {
    key: "CONTACTED",
    label: "Contacted",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    dotColor: "#F59E0B", // amber-500
  },
  QUALIFIED: {
    key: "QUALIFIED",
    label: "Qualified",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    dotColor: "#F97316", // orange-500
  },
  PROPOSAL_SENT: {
    key: "PROPOSAL_SENT",
    label: "Proposal Sent",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    dotColor: "#A855F7", // purple-500
  },
  BOOKED_PAID: {
    key: "BOOKED_PAID",
    label: "Booked/Paid",
    color: "text-green-700",
    bgColor: "bg-green-50",
    dotColor: "#81B29A", // sage (success color)
  },
  LOST: {
    key: "LOST",
    label: "Lost",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    dotColor: "#6B7280", // gray-500
  },
};

export function getStageLabel(stage: EnquiryStage): string {
  return STAGE_CONFIG[stage]?.label || stage;
}

export function getStageColor(stage: EnquiryStage): string {
  return STAGE_CONFIG[stage]?.color || "text-gray-700";
}

export function getStageBgColor(stage: EnquiryStage): string {
  return STAGE_CONFIG[stage]?.bgColor || "bg-gray-50";
}

export function getStageDotColor(stage: EnquiryStage): string {
  return STAGE_CONFIG[stage]?.dotColor || "#6B7280";
}
