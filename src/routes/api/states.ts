import { createFileRoute } from "@tanstack/react-router";

import { stateService } from "@/lib/services/state-service.server";
import { json } from "@/routes/api/-_utils";

export const Route = createFileRoute("/api/states")({
  server: {
    handlers: {
      GET: async () => {
        const states = await stateService.getStates();
        return json(states);
      },
    },
  },
});
