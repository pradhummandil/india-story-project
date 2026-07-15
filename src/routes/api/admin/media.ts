import { createFileRoute } from "@tanstack/react-router";
import { json, authenticate } from "@/routes/api/-_utils";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary.server";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const Route = createFileRoute("/api/admin/media")({
  server: {
    handlers: {
      /**
       * GET /api/admin/media
       * Fetches resources from Cloudinary folder 'india_story_project'.
       */
      GET: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
        const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
        const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

        if (!cloudName || !apiKey || !apiSecret) {
          return json(
            {
              files: [],
              warning:
                "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
            },
            { status: 200 },
          );
        }

        try {
          const url = new URL(request.url);
          const nextCursor = url.searchParams.get("nextCursor") || undefined;

          let cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?prefix=india_story_project/&type=upload&max_results=100`;
          if (nextCursor) {
            cloudinaryUrl += `&next_cursor=${encodeURIComponent(nextCursor)}`;
          }

          const authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
          const res = await fetch(cloudinaryUrl, {
            headers: {
              Authorization: authHeader,
            },
          });

          if (!res.ok) {
            const err = await res.text();
            return json({ error: `Cloudinary API Error: ${err}` }, { status: 500 });
          }

          const data = await res.json();
          const files = (data.resources || []).map((r: any) => ({
            name: r.public_id,
            url: r.secure_url,
            size: r.bytes,
            created_at: r.created_at,
          }));

          return json({
            files,
            nextCursor: data.next_cursor || null,
          });
        } catch (e: any) {
          return json(
            { error: e.message || "Failed to fetch media from Cloudinary" },
            { status: 500 },
          );
        }
      },

      /**
       * POST /api/admin/media
       * Uploads one or more files to Cloudinary. Returns array of { name, url, size, created_at }.
       */
      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        if (!isCloudinaryConfigured()) {
          return json(
            {
              error:
                "Cloudinary is not configured on this server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
            },
            { status: 503 },
          );
        }

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch (e: any) {
          return json({ error: `Failed to parse form data: ${e.message}` }, { status: 400 });
        }

        const uploadedFiles = formData.getAll("files") as File[];
        if (!uploadedFiles || uploadedFiles.length === 0) {
          return json(
            { error: "No files provided. Attach files under the 'files' field." },
            { status: 400 },
          );
        }

        const results: Array<{ name: string; url: string; size: number; created_at: string }> = [];
        const errors: string[] = [];

        for (const file of uploadedFiles) {
          // Validate type
          if (!ALLOWED_TYPES.includes(file.type)) {
            errors.push(
              `"${file.name}" has unsupported type "${file.type}". Allowed: ${ALLOWED_TYPES.join(", ")}.`,
            );
            continue;
          }

          // Validate size
          if (file.size > MAX_SIZE_BYTES) {
            errors.push(
              `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 10 MB.`,
            );
            continue;
          }

          try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const url = await uploadToCloudinary(buffer, file.name, file.type);

            results.push({
              name: file.name,
              url,
              size: file.size,
              created_at: new Date().toISOString(),
            });
          } catch (e: any) {
            // Surface the actual Cloudinary error
            errors.push(`Upload failed for "${file.name}": ${e.message}`);
          }
        }

        if (results.length === 0 && errors.length > 0) {
          // All uploads failed
          return json({ error: errors.join(" | ") }, { status: 500 });
        }

        return json({
          files: results,
          ...(errors.length > 0 ? { warnings: errors } : {}),
        });
      },

      /**
       * DELETE /api/admin/media
       * Cloudinary deletion requires the public_id.
       * Pass ?publicId=xxx or ?name=xxx to delete.
       */
      DELETE: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) return json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const publicId = url.searchParams.get("publicId") || url.searchParams.get("name");
        if (!publicId) {
          return json({ error: "publicId or name query param is required" }, { status: 400 });
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
        const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
        const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

        if (!cloudName || !apiKey || !apiSecret) {
          return json({ error: "Cloudinary credentials not configured." }, { status: 503 });
        }

        try {
          const { createHash } = await import("crypto");
          const timestamp = Math.round(Date.now() / 1000).toString();
          const signatureInput = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
          const signature = createHash("sha1").update(signatureInput).digest("hex");

          const form = new FormData();
          form.append("public_id", publicId);
          form.append("api_key", apiKey);
          form.append("timestamp", timestamp);
          form.append("signature", signature);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: "POST",
            body: form,
          });

          if (!res.ok) {
            const err = await res.text();
            return json({ error: `Cloudinary delete failed: ${err}` }, { status: 500 });
          }

          const data = await res.json();
          return json({ success: true, result: data.result });
        } catch (e: any) {
          return json({ error: `Delete error: ${e.message}` }, { status: 500 });
        }
      },
    },
  },
});
