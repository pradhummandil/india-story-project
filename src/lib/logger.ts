export type LogLevel = "info" | "warn" | "error" | "debug";

export type LogPayload = {
  timestamp: string;
  level: LogLevel;
  service: string;
  route?: string;
  duration?: number;
  status?: number;
  message: string;
  error?: string;
  meta?: any;
};

// Adapter Points for Observability Integrations
export const adapters = {
  sentry: (level: LogLevel, message: string, error?: string, meta?: any) => {
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(message, {
        level,
        extra: { error, ...meta },
      });
    }
  },
  betterStack: (level: LogLevel, message: string, error?: string, meta?: any) => {
    // BetterStack Logtail integration hook
    // Example: logtail.log(message, { level, error, ...meta });
  },
  vercel: {
    trackSpeed: (name: string, duration: number) => {
      // Vercel Speed Insights metric reporting hook
    },
  },
};

export function logMessage(
  level: LogLevel,
  service: string,
  message: string,
  extra?: Partial<LogPayload>,
) {
  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    ...extra,
  };

  // Structured Logging output
  console.log(JSON.stringify(payload));

  // Trigger APM adapters
  try {
    adapters.sentry(level, message, payload.error, payload.meta);
    adapters.betterStack(level, message, payload.error, payload.meta);
  } catch (err) {
    // Prevent logger crashes from disrupting execution
  }
}
