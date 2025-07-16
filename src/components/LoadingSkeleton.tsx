import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center">
      <div className="mb-6">
        <span className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent" />
      </div>
      <div className="w-full max-w-xl space-y-4">
        <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-6 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-6 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
