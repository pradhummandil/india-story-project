import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/stories/$id/revisions")({
  component: () => null,
});
