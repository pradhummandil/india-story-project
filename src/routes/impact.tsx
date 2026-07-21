import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Our Impact — India Story Project" },
      {
        name: "description",
        content:
          "See the tangible social, environmental, and cultural impact driven by stories on the India Story Project.",
      },
    ],
  }),
});
