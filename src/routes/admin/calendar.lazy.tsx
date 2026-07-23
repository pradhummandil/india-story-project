import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EditorialCalendar } from "@/components/admin/EditorialCalendar";
import { useAuthStore } from "@/lib/auth-store";
import { Loader2 } from "lucide-react";

export const Route = createLazyFileRoute("/admin/calendar")({
  component: AdminCalendarPage,
});

function AdminCalendarPage() {
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<any[]>([]);
  const [missingStates, setMissingStates] = useState<string[]>([]);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch("/api/admin/calendar", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStories(data.stories || []);
        setMissingStates(data.missingStates || []);
        setHeatmap(data.stateCoverageHeatmap || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <AdminLayout activeNav="calendar">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="min-h-96 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-xs font-mono text-muted-foreground animate-pulse">
              Loading Editorial Calendar & Regional Heatmaps…
            </p>
          </div>
        ) : (
          <EditorialCalendar
            stories={stories}
            missingStates={missingStates}
            stateCoverageHeatmap={heatmap}
          />
        )}
      </div>
    </AdminLayout>
  );
}
