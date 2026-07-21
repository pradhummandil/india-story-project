import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/newsroom/")({
  head: () => ({
    meta: [{ title: "Newsroom CMS Console — India Story Project" }],
  }),
});
