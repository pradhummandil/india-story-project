import { createFileRoute } from "@tanstack/react-router";
import { json, verifyAdmin } from "@/routes/api/-_utils";
import { flagService } from "@/lib/infrastructure/flags";

export const Route = createFileRoute("/api/admin/infrastructure/flags")({
  server: {
    handlers: {
      // Get all flags state
      GET: async ({ request }) => {
        const adminUser = await verifyAdmin(request);
        if (!adminUser) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const mMode = await flagService.isEnabled("maintenanceMode");
          const bAudio = await flagService.isEnabled("betaAudioEnabled");
          const satellite = await flagService.isEnabled("interactiveMapSatellite");
          const premium = await flagService.isEnabled("premiumStoryRestriction");

          return json({
            maintenanceMode: mMode,
            betaAudioEnabled: bAudio,
            interactiveMapSatellite: satellite,
            premiumStoryRestriction: premium,
          });
        } catch (err: any) {
          return json({ error: err.message }, { status: 500 });
        }
      },

      // Update flag value
      POST: async ({ request }) => {
        const adminUser = await verifyAdmin(request);
        if (!adminUser) return json({ error: "Unauthorized" }, { status: 401 });

        try {
          const body: any = await request.json();
          const { name, value } = body;
          if (typeof name !== "string" || typeof value !== "boolean") {
            return json({ error: "Invalid parameters" }, { status: 400 });
          }

          await flagService.setFlag(name, value);
          return json({ success: true });
        } catch (err: any) {
          return json({ error: err.message }, { status: 500 });
        }
      },
    },
  },
});
