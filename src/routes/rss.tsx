import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/rss")({
  component: RedirectRSS,
});

function RedirectRSS() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/api/podcast.feed.xml";
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF]">
      <div className="text-muted-foreground font-sans text-xs uppercase tracking-widest animate-pulse">
        Redirecting to RSS feed…
      </div>
    </div>
  );
}
