import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/infrastructure")({
  head: () => ({
    meta: [{ title: "Infrastructure Monitoring — Admin" }],
  }),
});
