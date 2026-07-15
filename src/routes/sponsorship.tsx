import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/sponsorship")({
  beforeLoad: () => {
    throw redirect({ to: "/advertise" });
  },
});
