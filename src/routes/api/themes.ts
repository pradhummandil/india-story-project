import { createFileRoute } from "@tanstack/react-router";

import { themeService } from "@/lib/services/theme-service.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/themes")({
  server: {
    handlers: {
      GET: async () => {
        const themes = await themeService.getThemes();
        return json(themes);
      },
    },
  },
});
