import { createFileRoute } from "@tanstack/react-router";
import { stateService } from "@/lib/services/state-service.server";
import { json } from "@/routes/api/-_utils";

// Server-side in-memory cache
const cache = {
  states: null as any,
  expiry: 0,
};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache

const cacheHeaders = {
  headers: {
    "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=600",
  },
};

export const Route = createFileRoute("/api/states")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        if (cache.states && now < cache.expiry) {
          return json(cache.states, cacheHeaders);
        }

        const states = await stateService.getStates();
        cache.states = states;
        cache.expiry = now + CACHE_TTL;
        return json(states, cacheHeaders);
      },
    },
  },
});
