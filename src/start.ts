import { createStart, createMiddleware } from "@tanstack/react-start";
import { renderErrorPage } from "./lib/error-page";
import { verifyAdmin, json } from "./routes/api/-_utils";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const authMiddleware = createMiddleware().server(async ({ request, next }) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/admin")) {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
  }
  return await next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, authMiddleware],
}));
