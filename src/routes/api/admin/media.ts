import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";

/**
 * Media API — placeholder for Supabase Storage integration.
 * When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured,
 * this will proxy uploads to the 'media' bucket in Supabase Storage.
 *
 * For now, it returns empty state so the media page renders without errors.
 */
export const Route = createFileRoute("/api/admin/media")({
  server: {
    handlers: {
      GET: async () => {
        // TODO: List files from Supabase Storage bucket when credentials are configured.
        return json({ files: [] });
      },

      POST: async () => {
        // TODO: Upload files to Supabase Storage bucket.
        return json(
          {
            files: [],
            message:
              "Supabase Storage not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable uploads.",
          },
          { status: 501 },
        );
      },

      DELETE: async ({ request }) => {
        // TODO: Delete file from Supabase Storage.
        const url = new URL(request.url);
        const name = url.searchParams.get("name");
        if (!name) return json({ error: "name is required" }, { status: 400 });
        return json({ success: true, name });
      },
    },
  },
});
