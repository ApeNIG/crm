"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EnquiryStageBreakdown } from "@/types/dashboard";
import type { EnquiryStage } from "@prisma/client";

interface EnquiryStageChartProps {
  breakdown: EnquiryStageBreakdown[];
}

// Stage configuration matching pipeline/stageConfig pattern
const stageConfig: Record<EnquiryStage, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-blue-500" },
  AUTO_RESPONDED: { label: "Auto Responded", color: "bg-purple-500" },
  CONTACTED: { label: "Contacted", color: "bg-cyan-500" },
  QUALIFIED: { label: "Qualified", color: "bg-amber-500" },
  PROPOSAL_SENT: { label: "Proposal Sent", color: "bg-orange-500" },
  BOOKED_PAID: { label: "Booked & Paid", color: "bg-green-500" },
  LOST: { label: "Lost", color: "bg-gray-400" },
};

// Ordered stages for display
const stageOrder: EnquiryStage[] = [
  "NEW",
  "AUTO_RESPONDED",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "BOOKED_PAID",
  "LOST",
];

export function EnquiryStageChart({ breakdown }: EnquiryStageChartProps) {
  // Create a map for quick lookup
  const countMap = new Map(breakdown.map((b) => [b.stage, b.count]));
  const maxCount = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Enquiries by Stage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stageOrder.map((stage) => {
          const config = stageConfig[stage];
          const count = countMap.get(stage) || 0;
          const percentage = (count / maxCount) * 100;

          return (
            <div key={stage} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{config.label}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn("h-full rounded-full transition-all", config.color)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
