import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore, getCommonText } from "@/lib/i18n";
import { getStoryAuthor } from "@/lib/utils";
import { UniversalImage } from "@/components/common/UniversalImage";
import { TiltCard } from "@/components/site/TiltCard";

interface FeaturedStoryCardProps {
  story: Story;
}

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    setIsTouch(mq.matches);
  }, []);
  return isTouch;
}

export function FeaturedStoryCard({ story }: FeaturedStoryCardProps) {
  const lang = useI18nStore((s) => s.lang);
  const commonText = getCommonText(lang);
  const isTouch = useIsTouchDevice();
  const rawAuthor = story.authorName;
  const isRealAuthor = !!(
    rawAuthor &&
    rawAuthor.trim() !== "" &&
    rawAuthor.toLowerCase() !== "india story project" &&
    rawAuthor.toLowerCase() !== "not identifiable" &&
    rawAuthor.toLowerCase() !== "unknown"
  );
  const authorName = isRealAuthor ? rawAuthor : "India Story Project";

  return (
    <TiltCard intensity={5} disabled={isTouch} className="max-w-4xl mx-auto group">
      <div className="border border-border/80 bg-card/40 hover:border-gold/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shadow-xl hover:shadow-elegant flex flex-col md:flex-row items-stretch">
        {/* Image Section */}
        <div className="w-full md:w-1/2 aspect-[16/10] md:aspect-square lg:aspect-[4/3] overflow-hidden border-b md:border-b-0 md:border-r border-border/40 bg-muted relative shrink-0">
          <UniversalImage
            src={story.image}
            alt={story.imageAlt ?? story.title}
            width={1000}
            aspectRatio="aspect-full w-full h-full"
            className="filter saturate-[0.85] group-hover:scale-[1.05] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-12 flex flex-col justify-center space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase font-bold text-gold font-sans">
            <span className="bg-primary/5 px-2.5 py-0.5 border border-primary/15">
              {Array.isArray(story.themes) && story.themes.length > 0 ? story.themes[0] : ""}
            </span>
            <span>•</span>
            <span>{story.region}</span>
          </div>

          <h3 className="font-display text-2xl md:text-3xl lg:text-4xl leading-[1.15] font-bold text-foreground hover:text-primary dark:text-white dark:hover:text-gold transition-colors duration-300">
            <Link to="/stories/$slug" params={{ slug: story.slug }}>
              {story.title}
            </Link>
          </h3>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans font-medium">
            <span>
              {isRealAuthor && story.authorId ? (
                <Link
                  to="/authors/$id"
                  params={{ id: story.authorId }}
                  className="hover:text-gold hover:underline transition-colors font-bold text-foreground"
                >
                  {lang === "en" ? `By ${authorName}` : `लेखक: ${authorName}`}
                </Link>
              ) : (
                lang === "en" ? `By ${authorName}` : `लेखक: ${authorName}`
              )}
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
    </TiltCard>
  );
}
