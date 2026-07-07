export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
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
