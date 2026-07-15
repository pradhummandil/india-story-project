// Local Keyword Search Indexing Engine
// Index densities of story contents to generate ultra-fast matching scores.

import type { Story } from "@/components/site/StoryCard";

export interface SearchIndexEntry {
  storyId: string;
  keywords: string[];
  density: Record<string, number>;
}

const localSearchIndex = new Map<string, SearchIndexEntry>();

export const searchIndexer = {
  indexStory: (story: Story) => {
    const text = `${story.title} ${story.excerpt} ${story.content || ""}`.toLowerCase();

    // Clean string to alphanumeric words
    const words = text.match(/\b[a-z]{3,}\b/g) || [];

    // Count frequencies
    const density: Record<string, number> = {};
    words.forEach((word) => {
      density[word] = (density[word] || 0) + 1;
    });

    // Take top 10 keywords
    const keywords = Object.entries(density)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    localSearchIndex.set(story.id || story.slug, {
      storyId: story.id || story.slug,
      keywords,
      density,
    });
  },

  search: (query: string): string[] => {
    const queryWords = query.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    if (queryWords.length === 0) return [];

    const scores: { storyId: string; score: number }[] = [];

    localSearchIndex.forEach((entry) => {
      let score = 0;
      queryWords.forEach((word) => {
        // Boost matches on primary keywords
        if (entry.keywords.includes(word)) {
          score += 5;
        }
        // Match word occurrences
        if (entry.density[word]) {
          score += entry.density[word];
        }
      });

      if (score > 0) {
        scores.push({ storyId: entry.storyId, score });
      }
    });

    return scores.sort((a, b) => b.score - a.score).map((item) => item.storyId);
  },

  clearIndex: () => {
    localSearchIndex.clear();
  },
};
