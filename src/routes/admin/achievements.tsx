import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/achievements")({
  head: () => ({ meta: [{ title: "System Achievements — Admin" }] }),
});
