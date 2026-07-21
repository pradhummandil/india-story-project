import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/newsroom/story/$id")({
  head: () => ({
    meta: [{ title: "Story Workspace & Workflow — Newsroom CMS" }],
  }),
});
