import { createFileRoute } from "@tanstack/react-router";

// Phase 1: external scraper endpoints are removed.
// This legacy route is intentionally disabled.
// Phase 1 requirement: the local database is the single source of truth.

export const Route = createFileRoute("/api/stories-catalogue-data")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(JSON.stringify({ error: "stories-catalogue endpoint removed" }), {
          status: 410,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
