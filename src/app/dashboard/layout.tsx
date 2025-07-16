import { Sidebar } from "@/src/components/Sidebar";
import ViewTransitionWrapper from "@/src/components/ViewTransitionWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      <Sidebar />
      <ViewTransitionWrapper>{children}</ViewTransitionWrapper>
    </div>
  );
}
