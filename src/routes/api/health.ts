import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/repositories/prisma.server";
import { supabase } from "@/lib/supabase-client";
import { json } from "@/routes/api/-_utils";
import { getMetricsReport } from "@/lib/metrics";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const start = Date.now();
        let dbStatus = "healthy";
        let dbError: string | null = null;
        try {
          // Quick diagnostic check querying database
          await prisma.$queryRaw`SELECT 1`;
        } catch (e: any) {
          dbStatus = "unhealthy";
          dbError = e.message || String(e);
        }

        let supabaseStatus = "healthy";
        try {
          const { error } = await supabase.auth.getSession();
          if (error) {
            supabaseStatus = "degraded";
          }
        } catch {
          supabaseStatus = "unhealthy";
        }

        const mem = process.memoryUsage();

        return json({
          status: dbStatus === "healthy" && supabaseStatus === "healthy" ? "healthy" : "degraded",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: "1.0.0",
          memoryUsage: {
            rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(mem.external / 1024 / 1024)} MB`,
          },
          services: {
            database: {
              status: dbStatus,
              latency: `${Date.now() - start}ms`,
              ...(dbError ? { error: dbError } : {}),
            },
            supabase: {
              status: supabaseStatus,
            },
            storage: {
              status: "healthy",
            },
          },
          metrics: getMetricsReport(),
        });
      },
    },
  },
});
