import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { StoryMap } from "@/components/site/StoryMap";
import { getInitialStoriesAndCategories } from "@/lib/api/stories.functions";

export const Route = createFileRoute("/map")({
  loader: () => getInitialStoriesAndCategories(),
  head: () => ({
    meta: [
      { title: "Stories by State — India Story Project" },
      {
        name: "description",
        content:
          "Explore India's cultural landscape in 3D. Discover stories of changemakers, innovators, and heritage across every state and union territory.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const loaderData = Route.useLoaderData() as any;
  const stateCounts: Record<string, number> = loaderData?.stateCounts || {};

  return (
    <SiteLayout>
      <div className="min-h-[calc(100vh-70px)] bg-background text-foreground pt-14 pb-4 flex flex-col justify-center overflow-hidden">
        {/* Single Viewport View: Interactive India 3D Story Map */}
        <StoryMap stateCounts={stateCounts} compact />
      </div>
    </SiteLayout>
  );
}
