import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/grievance")({
  beforeLoad: () => {
    throw redirect({ to: "/privacy" });
  },
});
