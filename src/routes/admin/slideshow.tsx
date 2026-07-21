import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/slideshow")({
  head: () => ({ meta: [{ title: "Slideshow Manager — Admin" }] }),
});
