import { createFileRoute } from "@tanstack/react-router";
import { getInitialExploreFeedData } from "@/lib/api/stories.functions";

export const Route = createFileRoute("/explore")({
  loader: async () => {
    return getInitialExploreFeedData();
  },
  validateSearch: (search: Record<string, unknown> = {}) => {
    const clean = (v: unknown) => (typeof v === "string" && v.trim() !== "" && v !== "null" && v !== "undefined" ? v.trim() : undefined);
    const q = clean(search?.q) || clean(search?.query);
    const state = clean(search?.state) || clean(search?.region);
    const theme = clean(search?.theme) || clean(search?.category);
    const era = clean(search?.era);
    const collection = clean(search?.collection);
    return { q, state, theme, era, collection };
  },
  head: () => ({
    meta: [
      { title: "Explore India — Discover Heritage, History & Culture | India Story Project" },
      {
        name: "description",
        content:
          "Discover stories, cultures, traditions, people, history, food, festivals, heritage and hidden places across India through our dynamic discovery engine.",
      },
    ],
  }),
});
