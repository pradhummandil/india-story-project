import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { supabase } from "@/lib/supabase-client";
import { json, sanitizeInput, checkRateLimit, getClientIp } from "@/routes/api/-_utils";

const db = prisma as any;

export const Route = createFileRoute("/api/auth/profile")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = getClientIp(request);
        const { allowed } = checkRateLimit(ip, 30, 60 * 1000); // 30 requests per minute limit
        if (!allowed) {
          return json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

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

          // Load existing profile from database to preserve its values
          const existingProfile = await db.profile.findUnique({
            where: { id: user.id },
          });
          const existingUserProfile = await db.userProfile.findUnique({
            where: { id: user.id },
          });

          const rawName =
            body.name ||
            existingProfile?.fullName ||
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            email.split("@")[0];
          const fullName = sanitizeInput(String(rawName)).substring(0, 100);

          const avatarUrl = body.avatarUrl !== undefined 
            ? (body.avatarUrl ? sanitizeInput(String(body.avatarUrl)).substring(0, 2048) : null)
            : (existingProfile?.avatarUrl || user.user_metadata?.avatar_url || null);

          const bio = body.bio !== undefined
            ? (body.bio ? sanitizeInput(String(body.bio)).substring(0, 500) : null)
            : (existingUserProfile?.bio || user.user_metadata?.bio || null);

          const website = body.website !== undefined
            ? (body.website ? sanitizeInput(String(body.website)).substring(0, 200) : null)
            : (existingUserProfile?.website || user.user_metadata?.website || null);

          const twitter = body.twitter !== undefined
            ? (body.twitter ? sanitizeInput(String(body.twitter)).substring(0, 100) : null)
            : (existingUserProfile?.twitter || user.user_metadata?.twitter || null);

          const instagram = body.instagram !== undefined
            ? (body.instagram ? sanitizeInput(String(body.instagram)).substring(0, 100) : null)
            : (existingUserProfile?.instagram || user.user_metadata?.instagram || null);

          const linkedin = body.linkedin !== undefined
            ? (body.linkedin ? sanitizeInput(String(body.linkedin)).substring(0, 100) : null)
            : (existingUserProfile?.linkedin || user.user_metadata?.linkedin || null);

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
