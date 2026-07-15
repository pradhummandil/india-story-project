import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { supabase } from "@/lib/supabase-client";
import { json } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/auth/profile")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return json({ error: "Unauthorized: Missing token" }, { status: 401 });
        }
        const token = authHeader.substring(7);

        try {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser(token);
          if (error || !user) {
            return json({ error: "Unauthorized: Invalid token" }, { status: 401 });
          }

          const email = user.email!;
          let body: any = {};
          try {
            body = await request.json();
          } catch {
            // ignore empty body
          }

          const fullName =
            body.name || user.user_metadata?.name || user.user_metadata?.full_name || email.split("@")[0];
          const avatarUrl = body.avatarUrl || user.user_metadata?.avatar_url || null;
          const bio = body.bio || user.user_metadata?.bio || null;
          const website = body.website || user.user_metadata?.website || null;
          const twitter = body.twitter || user.user_metadata?.twitter || null;
          const instagram = body.instagram || user.user_metadata?.instagram || null;
          const linkedin = body.linkedin || user.user_metadata?.linkedin || null;

          // Support theme & language/accessibility preferences directly in columns
          const favoriteTheme = body.favoriteTheme || null;
          const favoriteState = body.favoriteState || null;

          // Determine if we should set admin role
          let roleToAssign = "user";
          if (email.toLowerCase() === "indiastoryprojectmanager21@gmail.com") {
            roleToAssign = "admin";
          }

          // Upsert profile in database
          const profile = await db.profile.upsert({
            where: { id: user.id },
            update: {
              email,
              fullName,
              avatarUrl,
              ...(roleToAssign === "admin" ? { role: "admin" } : {}),
            },
            create: {
              id: user.id,
              email,
              fullName,
              avatarUrl,
              role: roleToAssign,
            },
          });

          // Also upsert/update UserProfile
          const userProfile = await db.userProfile.upsert({
            where: { id: user.id },
            update: {
              name: fullName,
              avatarUrl,
              bio,
              website,
              twitter,
              instagram,
              linkedin,
              favoriteTheme,
              favoriteState,
            },
            create: {
              id: user.id,
              email,
              name: fullName,
              avatarUrl,
              bio,
              website,
              twitter,
              instagram,
              linkedin,
              favoriteTheme,
              favoriteState,
            },
          });

          return json({ profile, userProfile });
        } catch (e: any) {
          console.error("Profile POST endpoint error:", e);
          return json({ error: e.message || "Server Error" }, { status: 500 });
        }
      },

      GET: async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.substring(7);

        try {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser(token);
          if (error || !user) {
            return json({ error: "Unauthorized" }, { status: 401 });
          }

          const profile = await db.profile.findUnique({
            where: { id: user.id },
          });

          const userProfile = await db.userProfile.findUnique({
            where: { id: user.id },
          });

          if (!profile) {
            return json({ error: "Profile not found" }, { status: 404 });
          }

          return json({ profile, userProfile });
        } catch (e: any) {
          return json({ error: e.message }, { status: 500 });
        }
      },
    },
  },
});
