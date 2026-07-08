import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Forbidden403 } from "@/components/site/Forbidden403";
import { SiteLayout } from "@/components/site/Layout";
import { BookOpen, Feather } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: AuthorDashboard,
});

function AuthorDashboard() {
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

  if (
    !user ||
    !profile ||
    (profile.role !== "admin" && profile.role !== "editor" && profile.role !== "author")
  ) {
    return <Forbidden403 />;
  }

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-12 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Feather className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">Author Dashboard</h1>
              <p className="text-sm font-sans text-muted-foreground">
                Draft and submit stories for publication.
              </p>
            </div>
          </div>
          <div className="border border-border bg-card p-8 text-center py-16">
            <BookOpen className="size-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">My Stories</h2>
            <p className="text-sm font-sans text-muted-foreground max-w-md mx-auto mb-6">
              You are signed in as an Author. In this workspace, you can draft, edit, and submit
              your personal stories to the editorial queue.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
