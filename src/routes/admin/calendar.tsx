import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/calendar")({
  head: () => ({ meta: [{ title: "Editorial Calendar — India Story Project" }] }),
});
