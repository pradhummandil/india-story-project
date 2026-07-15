import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Rss, ArrowLeft, Heart, Play } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/web-stories/")({
  head: () => ({
    meta: [
      { title: "Web Stories — India Story Project" },
      { name: "description", content: "Swipe through visual-first web stories celebrating culture, innovations, and local heroes in India." },
    ],
  }),
  component: WebStoriesListPage,
});

type WebStoryItem = {
  id: string;
  title: string;
  titleHi?: string;
  slug: string;
  coverImage: string;
  excerpt?: string;
  viewCount: number;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
};

function WebStoriesListPage() {
  const [stories, setStories] = useState<WebStoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/web-stories")
      .then((r) => r.json())
      .then((data: any) => setStories(data.webStories ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        {/* Header */}
        <div className="container mx-auto px-6 border-b border-border/40 pb-10 mb-12">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans font-bold mb-3 flex items-center gap-2">
              <Sparkles className="size-4" /> Tap Stories
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-none tracking-tight">
              Visual dispatches, <span className="text-primary italic">at a tap.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium">
              Explore bite-sized, visual-first narratives and Google Web Stories celebrating the unsung heroes across India.
            </p>
          </div>
        </div>

        {/* Stories Listing */}
        <div className="container mx-auto px-6 mb-16">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[9/16] bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/50 text-muted-foreground text-xs uppercase tracking-widest font-sans font-bold">
              No web stories have been published yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  to="/web-stories/$slug"
                  params={{ slug: story.slug }}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-border/70 bg-[#0c0c0c] hover:border-gold/50 shadow-sm hover:shadow-elegant transition-all duration-300 flex flex-col justify-end p-4"
                >
                  {/* Background Cover Image */}
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] group-hover:scale-105 transition-transform duration-[0.8s] ease-out"
                  />
                  {/* Glass Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10 opacity-80 pointer-events-none" />

                  {/* Icon tap bubble */}
                  <div className="absolute top-4 right-4 size-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                    <Play className="size-3 fill-white text-white ml-0.5" />
                  </div>

                  {/* Story Card Content */}
                  <div className="relative z-10 space-y-2">
                    <h3 className="font-display text-sm md:text-base font-bold leading-tight text-white line-clamp-3">
                      {story.title}
                    </h3>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/15 text-[9px] text-white/60 font-sans font-medium">
                      <span>{story.authorName}</span>
                      <span>•</span>
                      <span>{story.viewCount} taps</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
