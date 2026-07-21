import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/media/")({
  head: () => ({ meta: [{ title: "Media Library — Admin" }] }),
});
