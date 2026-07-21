import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/leaderboard")({
  head: () => ({ meta: [{ title: "User Leaderboard — Admin" }] }),
});
