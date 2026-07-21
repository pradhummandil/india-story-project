import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { authenticate, json } from "@/routes/api/-_utils";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary.server";
import { supabase } from "@/lib/supabase-client";

const db = prisma as any;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const Route = createFileRoute("/api/profile/avatar")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch (e: any) {
          return json({ error: `Failed to parse form data: ${e.message}` }, { status: 400 });
        }

        const file = formData.get("file") as File | null;
        if (!file) {
          return json({ error: "No file provided under the 'file' field." }, { status: 400 });
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return json(
            { error: "Invalid file type. Only JPG, JPEG, PNG, and WEBP are supported." },
            { status: 400 }
          );
        }

        if (file.size > MAX_FILE_SIZE) {
          return json({ error: "Image is too large. Max size is 5MB." }, { status: 400 });
        }

        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Get existing profile to check for old publicId
          const profile = await db.profile.findUnique({
            where: { id: user.id },
            select: { avatarPublicId: true },
          });

          const userProfile = await db.userProfile.findUnique({
            where: { id: user.id },
            select: { avatarPublicId: true },
          });

          const oldPublicId = profile?.avatarPublicId || userProfile?.avatarPublicId;

          // Delete old image if it exists
          if (oldPublicId) {
            try {
              await deleteFromCloudinary(oldPublicId);
            } catch (delError) {
              console.error("[Avatar Upload] Failed to delete old avatar from Cloudinary:", delError);
            }
          }

          // Upload new image with custom unique filename in folder
          const uniqueId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
          const sanitizedFilename = `avatar_${user.id}_${uniqueId}`;
          
          const uploadResult = await uploadToCloudinary(
            buffer,
            sanitizedFilename,
            file.type,
            "india-story-project/profile-images"
          );

          // Generate optimized URL with face centering, square sizing, auto-format/WebP, and auto-quality
          let optimizedUrl = uploadResult.url;
          if (optimizedUrl.includes("/image/upload/")) {
            optimizedUrl = optimizedUrl.replace("/image/upload/", "/image/upload/c_fill,g_face,w_300,h_300,q_auto,f_auto/");
          } else if (optimizedUrl.includes("/upload/")) {
            optimizedUrl = optimizedUrl.replace("/upload/", "/upload/c_fill,g_face,w_300,h_300,q_auto,f_auto/");
          }

          // Update database
          await db.profile.update({
            where: { id: user.id },
            data: {
              avatarUrl: optimizedUrl,
              avatarPublicId: uploadResult.publicId,
            },
          });

          await db.userProfile.update({
            where: { id: user.id },
            data: {
              avatarUrl: optimizedUrl,
              avatarPublicId: uploadResult.publicId,
            },
          });

          // Update Supabase auth user metadata
          try {
            await supabase.auth.updateUser({
              data: { avatar_url: optimizedUrl },
            });
          } catch (metaError) {
            console.error("[Avatar Upload] Failed to update user metadata in Supabase:", metaError);
          }

          return json({
            avatarUrl: optimizedUrl,
            avatarPublicId: uploadResult.publicId,
            success: true,
          });
        } catch (e: any) {
          console.error("Avatar upload API error:", e);
          return json({ error: e.message || "Upload failed due to server error" }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        const user = await authenticate(request);
        if (!user) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const profile = await db.profile.findUnique({
            where: { id: user.id },
            select: { avatarPublicId: true },
          });

          const userProfile = await db.userProfile.findUnique({
            where: { id: user.id },
            select: { avatarPublicId: true },
          });

          const publicId = profile?.avatarPublicId || userProfile?.avatarPublicId;

          if (publicId) {
            await deleteFromCloudinary(publicId);
          }

          // Clear DB entries
          await db.profile.update({
            where: { id: user.id },
            data: {
              avatarUrl: null,
              avatarPublicId: null,
            },
          });

          await db.userProfile.update({
            where: { id: user.id },
            data: {
              avatarUrl: null,
              avatarPublicId: null,
            },
          });

          // Reset Supabase user metadata avatar_url
          try {
            await supabase.auth.updateUser({
              data: { avatar_url: null },
            });
          } catch (metaError) {
            console.error("[Avatar Delete] Failed to clear user metadata:", metaError);
          }

          return json({ success: true });
        } catch (e: any) {
          console.error("Avatar delete API error:", e);
          return json({ error: e.message || "Delete failed due to server error" }, { status: 500 });
        }
      },
    },
  },
});
