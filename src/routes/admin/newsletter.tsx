import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/newsletter")({
  head: () => ({ meta: [{ title: "Newsletter Subscribers — Admin" }] }),
});
