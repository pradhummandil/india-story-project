import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Forbidden403 } from "@/components/site/Forbidden403";

export const Route = createFileRoute("/admin")({
  component: AdminRootLayout,
});

function AdminRootLayout() {
  const navigate = useNavigate();
  const { user, profile, loading, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized && !user) {
      void navigate({ to: "/login" });
    }
  }, [user, initialized, navigate]);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-muted-foreground font-sans text-xs uppercase tracking-widest animate-pulse">
          Verifying credentials…
        </div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== "admin") {
    return <Forbidden403 />;
  }

  return <Outlet />;
}
