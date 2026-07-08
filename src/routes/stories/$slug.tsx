import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Story } from "@/components/site/StoryCard";
import { StoryDetail } from "@/components/site/StoryDetail";

export const Route = createFileRoute("/stories/$slug")({
  component: StoryDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Story Not Found</h1>
        <p className="text-muted-foreground mb-8">The story you're looking for doesn't exist.</p>
        <a href="/stories" className="text-gold hover:text-saffron transition-colors">
          Back to Stories
        </a>
      </div>
    </div>
  ),
});

function StoryDetailPage() {
  const { slug } = Route.useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStory = () => {
      fetch(`/api/stories/${slug}`)
        .then((r) => {
          if (!r.ok) {
            throw new Error("Story not found");
          }
          return r.json();
        })
        .then((data) => {
          setStory(data);
        })
        .catch((err) => {
          setError(err.message || "Failed to load story");
        })
        .finally(() => {
          setLoading(false);
        });
    };

    setLoading(true);
    setError(null);
    loadStory();

    // Listen for live updates from admin
    const channel = new BroadcastChannel("isp-stories-updates");
    channel.onmessage = () => {
      fetch(`/api/stories/${slug}`)
        .then((r) => {
          if (r.ok) return r.json();
          throw new Error();
        })
        .then((data) => setStory(data))
        .catch(console.error);
    };

    return () => channel.close();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground font-sans font-semibold uppercase tracking-widest text-xs animate-pulse">
          Loading story…
        </div>
      </div>
    );
  }

  if (error || !story) {
    throw notFound();
  }

  return <StoryDetail story={story} />;
}
