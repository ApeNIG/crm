"use client";

import { UserMenu } from "@/components/auth";
import { Search, Bell, LayoutGrid, LayoutList } from "lucide-react";
import { useDensity } from "@/providers/DensityProvider";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { density, toggleDensity, isCompact } = useDensity();

  return (
    <header className="app-header">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Search */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
            <input
              type="search"
              placeholder="Search contacts, deals, invoices..."
              className={cn(
                "w-full h-9 pl-9 pr-4 text-sm",
                "bg-surface-inset border border-border-muted rounded-md",
                "placeholder:text-foreground-subtle",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "transition-colors"
              )}
            />
          </div>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-1">
          {/* Density Toggle */}
          <button
            onClick={toggleDensity}
            className={cn(
              "flex items-center justify-center gap-1.5 h-9 px-3 rounded-md",
              "text-foreground-muted hover:text-foreground",
              "hover:bg-surface-hover transition-colors",
              "text-xs font-medium"
            )}
            aria-label={`Switch to ${isCompact ? "comfortable" : "compact"} density`}
            title={`Current: ${density}. Click to toggle.`}
          >
            {isCompact ? (
              <>
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">Compact</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Comfortable</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-1" />

          {/* Notifications */}
          <button
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-md",
              "text-foreground-muted hover:text-foreground",
              "hover:bg-surface-hover transition-colors"
            )}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
