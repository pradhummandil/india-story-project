import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/join")({
  beforeLoad: () => {
    throw redirect({ to: "/share-story", replace: true });
  },
  component: () => null,
});
