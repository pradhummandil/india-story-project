import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore, getCommonText } from "@/lib/i18n";
import { getStoryAuthor, getOptimizedImageUrl, getResponsiveSrcSet } from "@/lib/utils";

interface FeaturedStoryCardProps {
  story: Story;
}

export function FeaturedStoryCard({ story }: FeaturedStoryCardProps) {
  const lang = useI18nStore((s) => s.lang);
  const commonText = getCommonText(lang);
  const authorName = getStoryAuthor(story.slug);

  return (
    <div className="max-w-4xl mx-auto border border-border/80 bg-card/40 hover:border-gold/30 transition-all duration-500 overflow-hidden shadow-xl flex flex-col md:flex-row items-stretch">
      {/* Image Section */}
      <div className="w-full md:w-1/2 aspect-[16/10] md:aspect-square lg:aspect-[4/3] overflow-hidden border-b md:border-b-0 md:border-r border-border/40 bg-muted relative shrink-0">
        {story.image ? (
          <img
            src={getOptimizedImageUrl(story.image, 1000)}
            srcSet={getResponsiveSrcSet(story.image, [480, 800, 1200])}
            sizes="(max-width: 768px) 100vw, 50vw"
            alt={story.imageAlt ?? story.title}
            loading="lazy"
            decoding="async"
            width="800"
            height="500"
            className="w-full h-full object-cover filter saturate-[0.85] hover:scale-103 transition-transform duration-[1s] ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-950/40 to-stone-900 flex items-center justify-center">
            <span className="font-display italic text-3xl text-gold/30">ISP</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-12 flex flex-col justify-center space-y-4 md:space-y-6">
        <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase font-bold text-gold font-sans">
          <span className="bg-primary/5 px-2.5 py-0.5 border border-primary/15">
            {Array.isArray(story.themes) && story.themes.length > 0
              ? story.themes[0]
              : ""}
          </span>
          <span>•</span>
          <span>{story.region}</span>
        </div>

        <h3 className="font-display text-2xl md:text-3xl lg:text-4xl leading-[1.15] font-bold text-white hover:text-gold transition-colors duration-300">
          <Link to="/stories/$slug" params={{ slug: story.slug }}>
            {story.title}
          </Link>
        </h3>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans font-medium">
          <span>
            {lang === "en"
              ? `By ${authorName}`
              : `लेखक: ${authorName}`}
          </span>
          <span>•</span>
          <span>{story.readTime || "4 min read"}</span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed font-sans line-clamp-3 md:line-clamp-4">
          {story.excerpt}
        </p>

        <div className="pt-2">
          <Button
            asChild
            className="w-full md:w-auto bg-primary hover:bg-primary/95 text-primary-foreground font-sans uppercase tracking-[0.15em] text-xs h-11 px-6 rounded-none shadow-sm btn-premium"
          >
            <Link to="/stories/$slug" params={{ slug: story.slug }}>
              {commonText.readStory}
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
