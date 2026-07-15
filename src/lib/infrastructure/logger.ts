// Audit Logging & Application Monitoring
// Standardized structure formatting logs, reporting errors, and persisting to Database AuditLogs.

import { prisma } from "@/lib/repositories/prisma.server";

export const logger = {
  info: (message: string, context: any = {}) => {
    const logOutput = {
      level: "INFO",
      timestamp: new Date().toISOString(),
      message,
      context,
    };
    console.log(JSON.stringify(logOutput));
  },

  error: (message: string, errorObject: any = {}, context: any = {}) => {
    const logOutput = {
      level: "ERROR",
      timestamp: new Date().toISOString(),
      message,
      error: errorObject.message || errorObject,
      stack: errorObject.stack,
      context,
    };
    console.error(JSON.stringify(logOutput));

    // Trigger simulated error reporting (Sentry/Logflare mock interface)
    logger.info("[Monitoring] Error reported to telemetry alert pipeline.");
  },

  audit: async (userId: string, action: string, details: string): Promise<void> => {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          details,
        },
      });
      logger.info(`[Audit Log] Success for user ${userId}: ${action}`);
    } catch (err: any) {
      logger.error("Failed to persist database audit log:", err);
    }
  },
};
