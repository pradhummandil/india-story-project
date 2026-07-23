import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "My Profile — India Story Project" }],
  }),
});
