import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      { title: "Enterprise Business Portal — India Story Project" },
      {
        name: "description",
        content:
          "Advertiser panels, brand campaigns, media kits, sponsorships, CSR dashboards, and member donations.",
      },
    ],
  }),
});
