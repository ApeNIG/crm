"use client";

import { Button } from "@/components/ui/button";

/**
 * Error boundary for route segments.
 * This catches errors in child components and provides a fallback UI.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">
          An error occurred while loading this page.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-400 mb-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
