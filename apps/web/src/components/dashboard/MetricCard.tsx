"use client";

import * as React from "react";
import Link from "next/link";
import { type LucideIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  href?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ icon: Icon, label, value, href, trend, className }, ref) => {
    const content = (
      <div
        ref={ref}
        className={cn(
          "card group relative",
          href && "card-interactive",
          className
        )}
      >
        {/* Header with icon and label */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-muted">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground-muted">
              {label}
            </span>
          </div>
          {href && (
            <ArrowUpRight
              className={cn(
                "h-4 w-4 text-foreground-subtle",
                "opacity-0 group-hover:opacity-100 transition-opacity"
              )}
            />
          )}
        </div>

        {/* Value */}
        <div className="flex items-end justify-between">
          <p className="text-display-md text-foreground">{value}</p>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                trend.isPositive
                  ? "bg-success-muted text-success"
                  : "bg-destructive-muted text-destructive"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="block">
          {content}
        </Link>
      );
    }

    return content;
  }
);
MetricCard.displayName = "MetricCard";

export { MetricCard };
