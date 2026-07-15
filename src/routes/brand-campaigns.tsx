import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/brand-campaigns")({
  beforeLoad: () => {
    throw redirect({ to: "/advertise" });
  },
});
