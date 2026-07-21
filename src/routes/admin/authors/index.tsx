import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/authors/")({
  head: () => ({ meta: [{ title: "Authors — Admin" }] }),
});
