import { createFileRoute } from "@tanstack/react-router";

import { authorService } from "@/lib/services/author-service.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/authors")({
  server: {
    handlers: {
      GET: async () => {
        const authors = await authorService.getAuthors();
        return json(authors);
      },
    },
  },
});
