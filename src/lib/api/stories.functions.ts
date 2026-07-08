import { createServerFn } from "@tanstack/react-start";
import { storyService } from "../services/story-service.server";
import { categoryService } from "../services/category-service.server";

export const getInitialStoriesAndCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const storiesResult = await storyService.getPublishedStories({ pageSize: 1000 });
      const categoriesResult = await categoryService.getPublishedCategoryNames();
      return {
        stories: storiesResult.stories,
        categories: categoriesResult,
      };
    } catch (err) {
      console.error("Failed to load initial stories in server function:", err);
      return { stories: [], categories: ["All", "कहानी"] };
    }
  },
);
