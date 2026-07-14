import { createServerFn } from "@tanstack/react-start";
import { storyService } from "../services/story-service.server";
import { themeService } from "../services/theme-service.server";

export const getInitialStoriesAndCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const storiesResult = await storyService.getPublishedStories({ pageSize: 1000 });
      const themesResult = await themeService.getAllThemeNames();
      return {
        stories: storiesResult.stories,
        themes: themesResult,
        // backward compat alias
        categories: themesResult,
      };
    } catch (err) {
      console.error("Failed to load initial stories in server function:", err);
      return { stories: [], themes: ["All", "Heritage"], categories: ["All", "Heritage"] };
    }
  },
);
