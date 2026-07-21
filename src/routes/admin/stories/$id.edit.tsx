import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/stories/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Story — Admin" }] }),
});
