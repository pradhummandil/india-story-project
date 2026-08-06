import { useEffect, useMemo, useState } from "react";
import { useStoriesData } from "@/lib/stories-data";
import { DnaHeroBanner } from "./dna/DnaHeroBanner";
import { DnaFilterBar } from "./dna/DnaFilterBar";
import { DnaStoryGalaxy } from "./dna/DnaStoryGalaxy";
import { DnaRelationshipMatrix } from "./dna/DnaRelationshipMatrix";
import { DnaStoryTimeline } from "./dna/DnaStoryTimeline";
import { DnaMapExplorer } from "./dna/DnaMapExplorer";
import { DnaTrendingCarousel } from "./dna/DnaTrendingCarousel";
import { DnaStoryStats } from "./dna/DnaStoryStats";

export function StoryDNA() {
  const { stories, loading } = useStoriesData();

  const [selectedStoryId, setSelectedStoryId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Ensure an active story is selected once stories load
  useEffect(() => {
    if (stories.length > 0 && !selectedStoryId) {
      setSelectedStoryId(stories[0].id);
    }
  }, [stories, selectedStoryId]);

  // Filtered stories based on category & search query
  const filteredStories = useMemo(() => {
    let result = [...stories];

    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter((s) => {
        const themes = Array.isArray(s.themes) ? s.themes : [];
        return (
          themes.some((t) => t.toLowerCase() === selectedCategory.toLowerCase()) ||
          s.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.region?.toLowerCase().includes(q) ||
          s.excerpt?.toLowerCase().includes(q) ||
          s.authorName?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [stories, selectedCategory, searchQuery]);

  const activeStory = useMemo(() => {
    return stories.find((s) => s.id === selectedStoryId) || stories[0];
  }, [stories, selectedStoryId]);

  if (!stories.length && loading) {
    return (
      <div className="w-full py-24 bg-[#111111] text-center text-[#C89A3D] font-mono text-sm animate-pulse">
        Initializing Story Galaxy Network...
      </div>
    );
  }

  if (!stories.length) return null;

  return (
    <div className="w-full bg-[#111111] text-[#F8F6F1] font-sans selection:bg-[#C89A3D]/30 selection:text-[#F8F6F1]">
      {/* SECTION 1: Cinematic Hero Introduction */}
      <DnaHeroBanner
        onStartExploring={() => {
          const el = document.getElementById("galaxy-universe-section");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* SECTION 8: Floating Category Filter Bar */}
      <DnaFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCount={filteredStories.length}
        totalCount={stories.length}
      />

      {/* SECTION 2 & 3: Living Story Galaxy & Floating Hover Preview Card */}
      <DnaStoryGalaxy
        stories={filteredStories.length > 0 ? filteredStories : stories}
        activeStoryId={activeStory?.id || stories[0].id}
        onSelectStory={(id) => {
          setSelectedStoryId(id);
          const matrixEl = document.getElementById("dna-matrix-section");
          matrixEl?.scrollIntoView({ behavior: "smooth" });
        }}
        selectedCategory={selectedCategory}
      />

      {/* SECTION 4: DNA Relationships ("Because you liked this story...") */}
      <div id="dna-matrix-section">
        {activeStory && (
          <DnaRelationshipMatrix
            activeStory={activeStory}
            allStories={stories}
            onSelectStory={(id) => {
              setSelectedStoryId(id);
              const matrixEl = document.getElementById("dna-matrix-section");
              matrixEl?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        )}
      </div>

      {/* SECTION 5: Interactive Horizontal Story Timeline */}
      <DnaStoryTimeline
        stories={stories}
        onSelectStory={(id) => setSelectedStoryId(id)}
      />

      {/* SECTION 6: Map Integration (India Story Map) */}
      <DnaMapExplorer
        stories={stories}
        onSelectStory={(id) => setSelectedStoryId(id)}
      />

      {/* SECTION 7: Trending Story Carousel (Netflix/Apple style) */}
      <DnaTrendingCarousel
        stories={stories}
        onSelectStory={(id) => setSelectedStoryId(id)}
      />

      {/* SECTION 9: Story Impact Statistics Grid (Live Animated Counters) */}
      <DnaStoryStats />
    </div>
  );
}
