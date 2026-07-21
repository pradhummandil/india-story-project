import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/themes/")({
  head: () => ({ meta: [{ title: "Themes CMS — Admin" }] }),
});
