import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function addSecurityHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  const headers = newResponse.headers;

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://*.vercel-scripts.com https://www.youtube.com https://s.ytimg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co https://i.ytimg.com https://img.youtube.com https://*.ytimg.com https://images.unsplash.com",
    "connect-src 'self' https://*.supabase.co https://va.vercel-insights.com https://va.vercel-scripts.com https://*.vercel-insights.com https://www.youtube.com",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://*.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; ");
  headers.set("Content-Security-Policy", csp);

  return newResponse;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const startTime = Date.now();
    const url = new URL(request.url);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";

    // Extract authorization payload to trace user context in requests
    let userId: string | undefined;
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const parsed = JSON.parse(jsonPayload);
        userId = parsed.sub;
      } catch {
        // Safe fail on bad payloads
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      const withHeaders = addSecurityHeaders(normalized);

      const duration = Date.now() - startTime;
      const resSize = withHeaders.headers.get("content-length")
        ? parseInt(withHeaders.headers.get("content-length")!, 10)
        : undefined;

      // Track metric stats
      try {
        const isApi = url.pathname.startsWith("/api");
        const { recordApiMetric, recordSsrMetric } = require("./lib/metrics");
        if (isApi) {
          recordApiMetric(url.pathname, duration, resSize);
        } else {
          recordSsrMetric(duration);
        }
      } catch {
        // Prevent metrics failures from interrupting response cycle
      }

      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: withHeaders.status >= 500 ? "error" : withHeaders.status >= 400 ? "warn" : "info",
          service: "http",
          route: url.pathname,
          duration,
          status: withHeaders.status,
          message: `${request.method} ${url.pathname} - ${withHeaders.status} in ${duration}ms`,
          meta: {
            method: request.method,
            ip,
            userAgent,
            responseSize: resSize,
            userId,
          },
        })
      );

      return withHeaders;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(error);

      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "error",
          service: "http",
          route: url.pathname,
          duration,
          status: 500,
          message: `Catastrophic request fail on ${request.method} ${url.pathname}`,
          error: error instanceof Error ? error.message : String(error),
          meta: {
            method: request.method,
            ip,
            userAgent,
            userId,
          },
        })
      );

      return addSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        })
      );
    }
  },
};
