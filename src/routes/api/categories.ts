import { createFileRoute } from "@tanstack/react-router";

import { categoryService } from "@/lib/services/category-service.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/categories")({
  server: {
    handlers: {
      GET: async () => {
        const categories = await categoryService.getCategories();
        return json(categories);
      },
    },
  },
});
