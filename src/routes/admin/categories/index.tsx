import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

// Category concept has been removed. Redirect to Themes admin page.
function RedirectToThemes() {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to: "/admin/themes" as any });
  }, [navigate]);
  return null;
}

export const Route = createFileRoute("/admin/categories/")({
  component: RedirectToThemes,
} as any);
