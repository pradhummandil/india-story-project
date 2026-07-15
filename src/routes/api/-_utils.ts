import { supabase } from "@/lib/supabase-client";
import { prisma } from "@/lib/repositories/prisma.server";

export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export async function verifyUserRole(request: Request, allowedRoles: string[]) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    if (!profile || !allowedRoles.includes(profile.role.toLowerCase())) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function verifyAdmin(request: Request) {
  return verifyUserRole(request, ["admin"]);
}

export async function authenticate(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function readOptionalString(value: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function readPositiveInt(value: string | null, fallback: number, fieldName: string) {
  if (value == null) return fallback;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return parsed;
}

export function invalidQueryResponse(message: string) {
  return json({ error: message }, { status: 400 });
}

export function sanitizeInput(text: string): string {
  if (!text) return "";
  return text
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript\s*:\s*[^\s"']*/gi, "")
    .trim();
}

// Simple in-memory IP rate limiter
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  limit = 60,
  windowMs = 60 * 1000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now > record.resetAt) {
    const newRecord = { count: 1, resetAt: now + windowMs };
    ipRequestCounts.set(ip, newRecord);
    return { allowed: true, remaining: limit - 1, resetAt: newRecord.resetAt };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1";
}
