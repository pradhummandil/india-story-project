import { useState } from "react";
import { Play, Linkedin } from "lucide-react";

export interface LinkedInVideoItem {
  id: string;
  title?: string;
  subtitle?: string;
  embedUrl: string;
  aspectRatio?: "16/9" | "compact" | "square";
}

export const LINKEDIN_PODCAST_VIDEOS: LinkedInVideoItem[] = [
  {
    id: "pod-1",
    title: "India Story Project Podcast — Ep 1",
    subtitle: "Conversations on culture & heritage",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6947372114651799552?compact=1",
  },
  {
    id: "pod-2",
    title: "India Story Project Podcast — Ep 2",
    subtitle: "Grassroots innovation & changemakers",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6941623712496394240?compact=1",
  },
  {
    id: "pod-3",
    title: "India Story Project Podcast — Ep 3",
    subtitle: "Preserving ancient traditions",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6937614206263255040?compact=1",
  },
];

export const LINKEDIN_STORY_VIDEOS: LinkedInVideoItem[] = [
  {
    id: "story-vid-1",
    title: "Ground Story Dispatch #1",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6932161045494927361?compact=1",
  },
  {
    id: "story-vid-2",
    title: "Ground Story Dispatch #2",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6930844602346143745?collapsed=1",
  },
  {
    id: "story-vid-3",
    title: "Ground Story Dispatch #3",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6929030595893170176?collapsed=1",
  },
  {
    id: "story-vid-4",
    title: "Ground Story Dispatch #4",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928339676780974080?collapsed=1",
  },
  {
    id: "story-vid-5",
    title: "Ground Story Dispatch #5",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928337525400834048?collapsed=1",
  },
  {
    id: "story-vid-6",
    title: "Ground Story Dispatch #6",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928190533802618880?collapsed=1",
  },
  {
    id: "story-vid-7",
    title: "Ground Story Dispatch #7",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6927464893264596992?collapsed=1",
  },
  {
    id: "story-vid-8",
    title: "Ground Story Dispatch #8",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6926031915170889728?collapsed=1",
  },
];

interface LinkedInVideoCardProps {
  video: LinkedInVideoItem;
  className?: string;
  showTitle?: boolean;
}

export function LinkedInVideoCard({ video, className = "", showTitle = false }: LinkedInVideoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`group relative bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-gold/50 transition-all duration-300 flex flex-col ${className}`}
    >
      {/* 16:9 Container */}
      <div className="relative w-full aspect-video bg-muted/60 overflow-hidden flex items-center justify-center">
        {/* Loading skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Linkedin className="size-5 text-blue-500 fill-blue-500/20" />
            </div>
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted-foreground">
              Loading Video…
            </span>
          </div>
        )}

        {/* Embedded Iframe */}
        <iframe
          src={video.embedUrl}
          title={video.title || "LinkedIn Video Dispatch"}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full border-0 rounded-t-2xl object-contain transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          allowFullScreen
        />
      </div>

      {showTitle && video.title && (
        <div className="p-3.5 border-t border-border/40 bg-card/60 flex items-center justify-between">
          <div className="min-w-0">
            <h4 className="text-xs font-sans font-bold text-foreground truncate">{video.title}</h4>
            {video.subtitle && (
              <p className="text-[10px] text-muted-foreground font-sans truncate mt-0.5">{video.subtitle}</p>
            )}
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold uppercase shrink-0 ml-2">
            LinkedIn
          </span>
        </div>
      )}
    </div>
  );
}
