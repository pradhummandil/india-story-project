import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/share-story")({
  head: () => ({
    meta: [
      { title: "Share Your Story — India Story Project" },
      {
        name: "description",
        content:
          "Your story can inspire millions. Submit your story of change, unsung heroes, or cultural heritage to India's most trusted storytelling platform.",
      },
    ],
  }),
});
