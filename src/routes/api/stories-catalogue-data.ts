import { createFileRoute } from "@tanstack/react-router";

// The scraper route is implemented in: src/routes/api/stories-catalogue.ts
// This file exists because TanStack Router expects a module for the route.
// We forward to the real route by letting the client fetch /api/stories-catalogue.
//
// If you want /api/stories-catalogue-data to be the canonical endpoint,
// we can swap the implementations.

export const Route = createFileRoute("/api/stories-catalogue-data")({
  server: {
    handlers: {
      GET: async () => {
        return fetch("/api/stories-catalogue");
      },
    },
  },
});

