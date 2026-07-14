import { createFileRoute, redirect } from "@tanstack/react-router";

// Category concept has been removed. Redirect to Themes admin page.
export const Route = createFileRoute("/admin/categories/")(({
  beforeLoad: () => {
    throw redirect({ to: "/admin/themes" });
  },
  component: () => null,
} as any));
