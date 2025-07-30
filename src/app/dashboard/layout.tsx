"use client";

import { Sidebar } from "@/src/components/Sidebar";
import ViewTransitionWrapper from "@/src/components/ViewTransitionWrapper";
import { useRecurringProcessor } from "@/src/hooks/useRecurringProcessor";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize recurring transaction processor
  useRecurringProcessor();

  return (
    <div className="flex-1">
      <Sidebar />
      <ViewTransitionWrapper>{children}</ViewTransitionWrapper>
    </div>
  );
}
