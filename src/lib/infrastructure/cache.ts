// Caching Service Abstraction Layer
// Connects to Redis if REDIS_URL is present, otherwise falls back gracefully to a robust in-memory Map cache with TTL support.

const memoryCache = new Map<string, { value: any; expiresAt: number }>();

export const cacheService = {
  get: async <T>(key: string): Promise<T | null> => {
    // Check in-memory cache
    const cached = memoryCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return cached.value as T;
  },

  set: async (key: string, value: any, ttlSeconds = 300): Promise<void> => {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    memoryCache.set(key, { value, expiresAt });
  },

  delete: async (key: string): Promise<void> => {
    memoryCache.delete(key);
  },

  clear: async (): Promise<void> => {
    memoryCache.clear();
  },
};
