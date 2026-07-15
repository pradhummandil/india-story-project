import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Award, MapPin, ArrowLeft, BookOpen, Eye, Play } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/authors/")({
  head: () => ({
    meta: [
      { title: "Authors — India Story Project" },
      {
        name: "description",
        content:
          "Meet our collective of writers, visual storytellers, and slow journalists documenting local change.",
      },
    ],
  }),
  component: AuthorsDirectoryPage,
});

type AuthorListItem = {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  storyCount: number;
  videoCount: number;
  totalViews: number;
  location: string;
  joinedAt: string;
};

function AuthorsDirectoryPage() {
  const [authors, setAuthors] = useState<AuthorListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/authors")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAuthors(data);
        }
      })
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
              <Users className="size-4" /> Storytellers
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-none tracking-tight">
              Meet our <span className="text-primary italic">Chroniclers.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium">
              The writers, journalists, and visual artists documenting transformational stories
              across India.
            </p>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="container mx-auto px-6 mb-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-white/5 rounded-none border border-border/30 animate-pulse"
                />
              ))}
            </div>
          ) : authors.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/50 text-muted-foreground text-xs uppercase tracking-widest font-sans font-bold">
              No authors found in directory.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {authors.map((author) => (
                <div
                  key={author.id}
                  className="border border-border/70 bg-card p-6 flex flex-col justify-between hover:border-gold/45 hover:shadow-elegant transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    {author.avatar ? (
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="size-16 rounded-full object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-gold uppercase shrink-0">
                        {author.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display text-lg font-bold hover:text-primary transition-colors">
                          <Link to="/authors/$id" params={{ id: author.id }}>
                            {author.name}
                          </Link>
                        </h3>
                        <span title="Verified Chronicler">
                          <Award className="size-4 text-gold shrink-0" />
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 font-sans">
                        <MapPin className="size-3 text-gold/75" /> {author.location}
                      </p>
                      <p className="text-xs text-muted-foreground/90 mt-2 line-clamp-2 leading-relaxed font-sans">
                        {author.bio ||
                          "Chronicling local change, culture, and innovations across the state."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/40 grid grid-cols-3 gap-2 text-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-sans">
                    <div className="border-r border-border/40">
                      <span className="text-white text-xs block font-mono">
                        {author.storyCount}
                      </span>
                      <span className="text-[8px] font-sans">Stories</span>
                    </div>
                    <div className="border-r border-border/40">
                      <span className="text-white text-xs block font-mono">
                        {author.videoCount}
                      </span>
                      <span className="text-[8px] font-sans">Videos</span>
                    </div>
                    <div>
                      <span className="text-white text-xs block font-mono">
                        {author.totalViews > 1000
                          ? `${(author.totalViews / 1000).toFixed(1)}k`
                          : author.totalViews}
                      </span>
                      <span className="text-[8px] font-sans">Views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
