import React from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, ArrowRight, CornerDownRight } from "lucide-react";

type StoryPayload = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  themes: string[];
  region: string;
  readTime: string;
  image: string;
};

interface StoryCardsProps {
  stories: StoryPayload[];
  isHindi: boolean;
  onStoryClick?: () => void;
}

export function StoryCards({ stories, isHindi, onStoryClick }: StoryCardsProps) {
  if (!stories || stories.length === 0) return null;

  return (
    <div className="w-full pt-1 space-y-2.5">
      <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 flex items-center gap-1">
        <CornerDownRight className="size-3.5 text-red-500" />
        {isHindi ? "अनुशंसित कहानियाँ:" : "Recommended Stories:"}
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden p-3.5 flex gap-3 hover:border-red-500/40 transition-all duration-300 shadow-md"
          >
            <div className="size-16 rounded-lg overflow-hidden shrink-0 bg-neutral-950 relative">
              <img
                src={story.image || "/Logo-ISP.jpg"}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-[9px] text-neutral-400 uppercase font-bold tracking-wider">
                  <span className="flex items-center gap-0.5 text-red-500">
                    <MapPin className="size-2.5" />
                    {story.region}
                  </span>
                  <span>•</span>
                  <span>{story.readTime}</span>
                </div>
                <h4 className="font-display font-bold text-xs text-white line-clamp-1">
                  {story.title}
                </h4>
              </div>
              <div className="flex justify-end">
                <Link
                  to="/stories/$slug"
                  params={{ slug: story.slug }}
                  onClick={onStoryClick}
                  className="inline-flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors uppercase font-bold tracking-wider text-[9px]"
                >
                  {isHindi ? "कहानी पढ़ें" : "Read Story"}
                  <ArrowRight className="size-2.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
