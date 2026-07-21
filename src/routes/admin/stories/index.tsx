import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/stories/")({
  head: () => ({ meta: [{ title: "Stories Curation — Admin" }] }),
});
