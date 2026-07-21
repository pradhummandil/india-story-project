import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/stories/new")({
  head: () => ({ meta: [{ title: "New Story — Admin" }] }),
});
