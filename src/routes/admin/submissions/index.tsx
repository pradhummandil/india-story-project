import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/submissions/")({
  component: AdminSubmissionsIndexPage,
});

function AdminSubmissionsIndexPage() {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to: "/editor", search: { tab: "pipeline" } as any });
  }, [navigate]);

  return (
    <div className="p-12 text-center text-muted-foreground text-xs uppercase tracking-widest animate-pulse">
      Redirecting to Newsroom Story Pipeline...
    </div>
  );
}
