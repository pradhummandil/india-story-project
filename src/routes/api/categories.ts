import { createFileRoute } from "@tanstack/react-router";

import { categoryService } from "@/lib/services/category-service.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/categories")({
  server: {
    handlers: {
      GET: async () => {
        const categories = await categoryService.getCategories();
        if (categories.length === 0) {
          try {
            const fallbackJson = (await import("@/../stories-backup.json")).default;
            const fallbackCategories = fallbackJson.categories || [
              "Heritage",
              "Innovation",
              "Sustainability",
              "Science",
              "Culture",
              "Environment",
            ];
            return json(fallbackCategories.map((name) => ({ name, slug: name.toLowerCase() })));
          } catch (e) {
            console.error("Failed to load fallback categories from JSON:", e);
          }
        }
        return json(categories);
      },
    },
  },
});
