import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { supabase } from "@/lib/supabase-client";
import { json } from "@/routes/api/-_utils";

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
          const fullName =
            user.user_metadata?.name || user.user_metadata?.full_name || email.split("@")[0];
          const avatarUrl = user.user_metadata?.avatar_url || null;

          // Determine if we should set admin role
          let roleToAssign = "user";
          if (email.toLowerCase() === "indiastoryprojectmanager21@gmail.com") {
            roleToAssign = "admin";
          }

          // Upsert profile in database
          const profile = await prisma.profile.upsert({
            where: { id: user.id },
            update: {
              email,
              fullName,
              avatarUrl,
              // Only overwrite role to admin if we mapped it, otherwise keep current role
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

          return json({ profile });
        } catch (e: any) {
          console.error("Profile endpoint error:", e);
          return json({ error: e.message || "Server Error" }, { status: 500 });
        }
      },
      GET: async ({ request }) => {
        // Retrieve current profile
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

          const profile = await prisma.profile.findUnique({
            where: { id: user.id },
          });

          if (!profile) {
            return json({ error: "Profile not found" }, { status: 404 });
          }

          return json({ profile });
        } catch (e: any) {
          return json({ error: e.message }, { status: 500 });
        }
      },
    },
  },
});
