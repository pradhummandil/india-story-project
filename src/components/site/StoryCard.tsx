import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { TiltCard } from "@/components/site/TiltCard";
import { useJourney } from "@/lib/journey-store";

export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  region: string;
  readTime: string;
  image?: string;
  imageAlt?: string;
  url: string;
  content?: string;
  gradient?: string;
}

export function StoryCard({ story, index = 0 }: { story: Story; index?: number }) {
  const { trackView } = useJourney();
  const hoverStart = useRef<number | null>(null);
  const onEnter = () => { hoverStart.current = Date.now(); };
  const onLeave = () => {
    if (hoverStart.current && Date.now() - hoverStart.current > 1500) {
      trackView(story, Date.now() - hoverStart.current);
    }
    hoverStart.current = null;
  };
  const onClick = () => trackView(story, 6000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/stories/$slug"
        params={{ slug: story.slug }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClick}
        className="block"
      >
        <TiltCard className="group">
          <article className="glass rounded-2xl overflow-hidden hover-lift cursor-pointer flex flex-col h-full">
            <div className="aspect-[4/3] relative overflow-hidden bg-muted-foreground">
              {story.image ? (
                <img
                  src={story.image}
                  alt={story.imageAlt ?? story.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
              <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
              <span className="absolute top-4 left-4 text-xs uppercase tracking-widest px-3 py-1 rounded-full glass text-foreground/90 z-10">
                {story.category}
              </span>
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="absolute bottom-4 right-4 size-10 rounded-full glass grid place-items-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 shadow-glow"
              >
                <ArrowUpRight className="size-4 text-gold" />
              </motion.div>
            </div>
            <div className="p-6 flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{story.region}</span>
                <span className="size-1 rounded-full bg-muted-foreground/50" />
                <span>{story.readTime}</span>
              </div>
              <h3 className="font-display text-2xl leading-tight text-foreground group-hover:text-gradient-gold transition-all">
                {story.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {story.excerpt}
              </p>
            </div>
          </article>
        </TiltCard>
      </Link>
    </motion.div>
  );
}
