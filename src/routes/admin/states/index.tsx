import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/states/")({
  head: () => ({ meta: [{ title: "States — Admin" }] }),
});
