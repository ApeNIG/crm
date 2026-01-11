import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md text-sm font-medium",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary action - terracotta, high emphasis
        default: [
          "bg-primary text-primary-foreground",
          "shadow-sm hover:bg-primary-hover hover:shadow-md",
          "active:bg-primary-active",
        ].join(" "),

        // Secondary action - slate, medium emphasis
        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-sm hover:bg-secondary-hover",
          "active:bg-secondary-active",
        ].join(" "),

        // Outline - bordered, low emphasis
        outline: [
          "border border-border bg-transparent text-foreground",
          "hover:bg-surface-hover hover:border-border",
          "active:bg-surface-active",
        ].join(" "),

        // Ghost - minimal, lowest emphasis
        ghost: [
          "text-foreground-muted",
          "hover:bg-muted hover:text-foreground",
          "active:bg-surface-active",
        ].join(" "),

        // Destructive - danger action
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-sm hover:opacity-90",
          "active:opacity-80",
        ].join(" "),

        // Success - positive action
        success: [
          "bg-success text-success-foreground",
          "shadow-sm hover:opacity-90",
          "active:opacity-80",
        ].join(" "),

        // Link style
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
        ].join(" "),
      },
      size: {
        default: "h-[var(--size-button-h)] px-4 py-2",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-11 px-6 text-base rounded-lg",
        icon: "h-[var(--size-button-h)] w-[var(--size-button-h)]",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
