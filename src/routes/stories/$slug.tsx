import { createFileRoute, notFound } from "@tanstack/react-router";
import { StoryDetail } from "@/components/site/StoryDetail";
import { stories } from "@/lib/stories-data";

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
  const story = stories.find((s) => s.slug === slug);

  if (!story) {
    throw notFound();
  }

  return <StoryDetail story={story} />;
}
