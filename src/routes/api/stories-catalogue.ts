import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stories-catalogue")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({ error: "stories-catalogue endpoint removed" }),
          {
            status: 410,
            headers: { "content-type": "application/json" },
          },
        );
      },
    },
  },
});

