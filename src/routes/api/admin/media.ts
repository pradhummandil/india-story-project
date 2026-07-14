import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/routes/api/-_utils";
import { supabase } from "@/lib/supabase-client";
import { uploadToCloudinary } from "@/lib/cloudinary.server";

export const Route = createFileRoute("/api/admin/media")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data, error } = await supabase.storage.from("media").list("", {
            limit: 100,
            sortBy: { column: "created_at", order: "desc" },
          });

          if (error) {
            // Self-healing: if bucket does not exist, try to create it
            if (error.message.includes("not found")) {
              await supabase.storage.createBucket("media", { public: true });
              return json({ files: [] });
            }
            return json({ error: error.message }, { status: 500 });
          }

          const files = (data || []).map((f) => {
            const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(f.name);
            return {
              name: f.name,
              url: publicUrl,
              size: f.metadata?.size ?? 0,
              created_at: f.created_at,
            };
          });

          return json({ files });
        } catch (e: any) {
          return json({ error: e.message || "Failed to list media" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          const formData = await request.formData();
          const uploadedFiles = formData.getAll("files") as File[];
          if (!uploadedFiles || uploadedFiles.length === 0) {
            return json({ error: "No files uploaded" }, { status: 400 });
          }

          const results = [];
          for (const file of uploadedFiles) {
            // Generate clean filename to avoid path traversal/characters issues
            const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Attempt Cloudinary upload first
            let url = await uploadToCloudinary(buffer, file.name, file.type).catch(() => null);
            let name = cleanName;

            if (!url) {
              // Fallback to Supabase storage
              const { error } = await supabase.storage.from("media").upload(cleanName, buffer, {
                contentType: file.type,
                upsert: true,
              });

              if (error) {
                return json({ error: `Upload error for ${file.name}: ${error.message}` }, { status: 500 });
              }

              const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(cleanName);
              url = publicUrl;
            } else {
              name = `cloudinary-${cleanName}`;
            }

            results.push({
              name,
              url,
              size: file.size,
              created_at: new Date().toISOString(),
            });
          }

          return json({ files: results });
        } catch (e: any) {
          return json({ error: e.message || "Failed to upload media" }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const name = url.searchParams.get("name");
          if (!name) return json({ error: "name is required" }, { status: 400 });

          const { error } = await supabase.storage.from("media").remove([name]);
          if (error) {
            return json({ error: error.message }, { status: 500 });
          }

          return json({ success: true, name });
        } catch (e: any) {
          return json({ error: e.message || "Failed to delete media" }, { status: 500 });
        }
      },
    },
  },
});
