import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/contact")({
  head: () => ({ meta: [{ title: "Inbox — Admin" }] }),
});
