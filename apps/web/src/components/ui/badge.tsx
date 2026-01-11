import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-full border font-medium",
    "transition-colors duration-150",
  ].join(" "),
  {
    variants: {
      variant: {
        // Solid variants
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",

        // Muted/subtle variants (preferred for status indicators)
        "primary-muted": "border-transparent bg-primary-muted text-primary",
        "destructive-muted": "border-transparent bg-destructive-muted text-destructive",
        "success-muted": "border-transparent bg-success-muted text-success",
        "warning-muted": "border-transparent bg-warning-muted text-foreground",
        "info-muted": "border-transparent bg-info-muted text-info",

        // Outline
        outline: "border-border bg-transparent text-foreground",
        muted: "border-transparent bg-muted text-foreground-muted",
      },
      size: {
        default: "h-[var(--size-badge-h)] px-2.5 text-xs",
        sm: "h-5 px-2 text-xs",
        lg: "h-7 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
