import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Compass, ChevronRight, User, TrendingUp, Sparkles, Mail, Rss, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { StoryCard } from "@/components/site/StoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/theme/$slug")({
  component: ThemePortalPage,
});

type ThemeDetail = {
  theme: { id: string; name: string; slug: string };
  heroStory: any;
  trendingStories: any[];
  latestStories: any[];
  editorsPicks: any[];
  popularAuthors: any[];
  relatedThemes: string[];
  totalStoriesCount: number;
};

function ThemePortalPage() {
  const { slug } = Route.useParams();
  const [data, setData] = useState<ThemeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/themes/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Theme not found or failed to load");
        return r.json();
      })
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Failed to load theme portal"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubscribeMsg(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), theme: data?.theme.name }),
      });
      const resData = await res.json();
      if (res.ok) {
        setSubscribeMsg("Thank you! Please check your email to verify.");
        setEmail("");
      } else {
        setSubscribeMsg(resData.error || "Subscription failed.");
      }
    } catch {
      setSubscribeMsg("An error occurred. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-background">
          <div className="text-muted-foreground font-sans font-semibold uppercase tracking-widest text-xs animate-pulse">
            Loading Topic Portal…
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error || !data) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background text-center px-6">
          <h1 className="font-display text-4xl font-bold mb-4">Topic Portal Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            The topic "{slug}" could not be loaded or doesn't have stories yet.
          </p>
          <Link
            to="/stories"
            className="flex items-center gap-2 text-gold hover:text-saffron font-semibold font-sans transition-colors uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="size-4" /> Back to Archive
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const { theme, heroStory, trendingStories, latestStories, editorsPicks, popularAuthors, relatedThemes } = data;

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        {/* Topic Header Banner */}
        <div className="container mx-auto px-6 border-b border-border/40 pb-10 mb-12">
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors mb-6 font-sans"
          >
            <ArrowLeft className="size-3.5" /> Back to All Topics
          </Link>
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans font-bold mb-3 flex items-center gap-2">
              <Compass className="size-4" /> Topic Portal
            </p>
            <h1 className="font-display text-5xl md:text-8xl font-bold leading-none tracking-tight capitalize">
              {theme.name}
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed font-sans font-medium">
              Curated articles, interviews, and deep-dives exploring the essence of {theme.name.toLowerCase()} across India.
            </p>
          </div>
        </div>

        {/* Hero & Side Block */}
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Main Hero Story */}
          <div className="lg:col-span-2 space-y-6">
            {heroStory ? (
              <div className="border border-border/70 bg-card p-6 md:p-8 hover:border-gold/40 transition-all duration-500 flex flex-col justify-between group h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] tracking-widest uppercase font-bold text-gold font-sans">
                    <span>Featured Story</span>
                    <span>{heroStory.region}</span>
                  </div>
                  {heroStory.image && (
                    <div className="aspect-video w-full overflow-hidden border border-border/30 bg-muted">
                      <img
                        src={heroStory.image}
                        alt={heroStory.title}
                        className="w-full h-full object-cover filter saturate-75 brightness-90 group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    </div>
                  )}
                  <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight group-hover:text-primary transition-colors">
                    <Link to="/stories/$slug" params={{ slug: heroStory.slug }}>
                      {heroStory.title}
                    </Link>
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                    {heroStory.excerpt}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold tracking-widest uppercase text-primary font-sans">
                  <Link to="/stories/$slug" params={{ slug: heroStory.slug }} className="hover:text-gold transition-colors">
                    Read Full Story
                  </Link>
                  <span className="text-muted-foreground/60 font-normal flex items-center gap-1">
                    <Clock className="size-3.5" /> {heroStory.readingTime}
                  </span>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-border/50 py-20 text-center text-muted-foreground font-sans text-xs uppercase tracking-widest">
                No hero story designated.
              </div>
            )}
          </div>

          {/* Trending Panel */}
          <div className="space-y-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2 border-b border-border/40 pb-3 font-sans">
              <TrendingUp className="size-4 text-gold" /> Trending Stories
            </h3>
            {trendingStories.length > 0 ? (
              <div className="space-y-4">
                {trendingStories.map((story, i) => (
                  <div key={story.id} className="border-b border-border/30 pb-4 last:border-0">
                    <span className="text-[10px] uppercase tracking-widest text-gold/80 font-bold block mb-1 font-sans">
                      0{i + 1}. {story.region}
                    </span>
                    <h4 className="font-display text-md font-bold leading-snug hover:text-primary transition-colors">
                      <Link to="/stories/$slug" params={{ slug: story.slug }}>
                        {story.title}
                      </Link>
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-sans mt-1.5 inline-block">{story.readingTime}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-sans italic">No trending records found.</p>
            )}
          </div>
        </div>

        {/* Editor's Picks & Sibling Topics */}
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2 border-b border-border/40 pb-3 font-sans">
              <Sparkles className="size-4 text-gold" /> Editor's Choice
            </h3>
            {editorsPicks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {editorsPicks.map((s, idx) => (
                  <StoryCard key={s.id} story={s} index={idx} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-sans italic">No editor selections yet.</p>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2 border-b border-border/40 pb-3 font-sans">
              Related Themes
            </h3>
            {relatedThemes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {relatedThemes.map((t) => (
                  <Link
                    key={t}
                    to="/theme/$slug"
                    params={{ slug: t.toLowerCase().replace(/\s+/g, "-") }}
                    className="px-3 py-1.5 border border-border/50 bg-card/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-white hover:border-gold/50 transition-colors"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-sans italic">No related themes found.</p>
            )}

            {/* Popular Authors in this Theme */}
            <div className="pt-6 space-y-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2 border-b border-border/40 pb-3 font-sans">
                Featured Authors
              </h3>
              {popularAuthors.length > 0 ? (
                <div className="space-y-4">
                  {popularAuthors.map((author) => (
                    <div key={author.name} className="flex items-center gap-3">
                      {author.avatar ? (
                        <img src={author.avatar} alt={author.name} className="size-10 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gold uppercase">{author.name[0]}</div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white font-sans">{author.name}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{author.bio || "India Story Contributor"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-sans italic">No author records.</p>
              )}
            </div>
          </div>
        </div>

        {/* Latest Stories Grid */}
        <div className="container mx-auto px-6 mb-16 space-y-8">
          <h3 className="text-xs uppercase tracking-widest font-bold text-white border-b border-border/40 pb-3 font-sans">
            Latest Dispatches
          </h3>
          {latestStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestStories.map((s, idx) => (
                <StoryCard key={s.id} story={s} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border/50 text-xs text-muted-foreground uppercase tracking-widest">
              No latest dispatches in this topic.
            </div>
          )}
        </div>

        {/* Newsletter subscription section */}
        <div className="container mx-auto px-6">
          <div className="border border-border/80 bg-card/45 p-8 md:p-12 text-center max-w-4xl mx-auto shadow-elegant">
            <Mail className="size-8 text-gold mx-auto mb-4" />
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">Subscribe to our {theme.name} newsletter</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Get the best articles and updates about {theme.name.toLowerCase()} delivered directly to your inbox weekly.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="h-10 bg-background border-border rounded-none focus-visible:ring-primary/45 font-sans"
              />
              <Button
                type="submit"
                disabled={subscribing}
                className="h-10 px-6 bg-primary hover:bg-primary/90 text-white rounded-none font-sans text-xs uppercase tracking-widest"
              >
                {subscribing ? "Subscribing..." : "Join Digest"}
              </Button>
            </form>
            {subscribeMsg && <p className="mt-4 text-xs text-gold font-sans font-medium">{subscribeMsg}</p>}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
