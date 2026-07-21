import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/analytics/")({
  head: () => ({ meta: [{ title: "Enterprise Analytics — Admin" }] }),
});
