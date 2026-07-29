import { useState, useEffect } from "react";
import { Linkedin, ExternalLink, Play, AlertTriangle } from "lucide-react";

export interface LinkedInVideoItem {
  id: string;
  title?: string;
  subtitle?: string;
  embedUrl: string;
  linkedinUrl?: string;
  aspectRatio?: "16/9" | "compact" | "square";
}

export const LINKEDIN_PODCAST_VIDEOS: LinkedInVideoItem[] = [
  {
    id: "pod-1",
    title: "India Story Project Podcast — Ep 1",
    subtitle: "Conversations on culture & heritage",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6947372114651799552?compact=1",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6947372114651799552",
  },
  {
    id: "pod-2",
    title: "India Story Project Podcast — Ep 2",
    subtitle: "Grassroots innovation & changemakers",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6941623712496394240?compact=1",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6941623712496394240",
  },
  {
    id: "pod-3",
    title: "India Story Project Podcast — Ep 3",
    subtitle: "Preserving ancient traditions",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6937614206263255040?compact=1",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6937614206263255040",
  },
];

export const LINKEDIN_STORY_VIDEOS: LinkedInVideoItem[] = [
  {
    id: "story-vid-1",
    title: "Cdr Abhilash Tomy — Valour & Ocean Sailing",
    subtitle: "Ground Story Dispatch #1",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6932161045494927361?compact=1",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6932161045494927361",
  },
  {
    id: "story-vid-2",
    title: "Ground Story Dispatch #2",
    subtitle: "India Story Project Video",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6930844602346143745?collapsed=1",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6930844602346143745",
  },
  {
    id: "story-vid-3",
    title: "Ground Story Dispatch #3",
    subtitle: "India Story Project Video",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6929030595893170176?collapsed=1",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6929030595893170176",
  },
  {
    id: "story-vid-4",
    title: "Ground Story Dispatch #4",
    subtitle: "India Story Project Video",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928339676780974080?collapsed=1",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6928339676780974080",
  },
  {
    id: "story-vid-5",
    title: "Ground Story Dispatch #5",
    subtitle: "India Story Project Video",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928337525400834048?collapsed=1",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6928337525400834048",
  },
  {
    id: "story-vid-6",
    title: "Ground Story Dispatch #6",
    subtitle: "India Story Project Video",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928190533802618880?collapsed=1",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6928190533802618880",
  },
  {
    id: "story-vid-7",
    title: "Ground Story Dispatch #7",
    subtitle: "India Story Project Video",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6927464893264596992?collapsed=1",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6927464893264596992",
  },
  {
    id: "story-vid-8",
    title: "Ground Story Dispatch #8",
    subtitle: "India Story Project Video",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6926031915170889728?collapsed=1",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6926031915170889728",
  },
];

interface LinkedInVideoCardProps {
  video: LinkedInVideoItem;
  className?: string;
  showTitle?: boolean;
}

export function LinkedInVideoCard({ video, className = "", showTitle = false }: LinkedInVideoCardProps) {
  const [hasError, setHasError] = useState(false);
  const directUrl = video.linkedinUrl || video.embedUrl.replace("/embed/", "/");

  return (
    <div
      className={`group relative bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-gold/50 transition-all duration-300 flex flex-col h-[430px] ${className}`}
    >
      {hasError ? (
        /* Fallback rich card if browser or ad-blocker blocks third-party iframe */
        <div className="flex-1 p-6 bg-gradient-to-br from-card via-card to-blue-950/20 flex flex-col justify-between text-center items-center">
          <div className="space-y-3 my-auto">
            <div className="size-12 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto">
              <Linkedin className="size-6 text-blue-500 fill-blue-500/20" />
            </div>
            <h4 className="font-display text-base font-bold text-foreground">
              {video.title || "India Story Project Video"}
            </h4>
            <p className="text-xs text-muted-foreground font-sans line-clamp-2">
              {video.subtitle || "Watch this exclusive story video dispatch on LinkedIn."}
            </p>
          </div>

          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <span>Watch on LinkedIn</span>
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      ) : (
        /* Full height iframe matching LinkedIn official 400px specification */
        <div className="relative w-full h-[400px] bg-card overflow-hidden">
          <iframe
            src={video.embedUrl}
            title={video.title || "India Story Project LinkedIn Dispatch"}
            height="400"
            width="100%"
            frameBorder="0"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            onError={() => setHasError(true)}
            className="w-full h-[400px] border-0 rounded-t-2xl bg-card"
          />
        </div>
      )}

      {showTitle && video.title && (
        <div className="p-3 border-t border-border/40 bg-card flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <h4 className="text-xs font-sans font-bold text-foreground truncate">{video.title}</h4>
            {video.subtitle && (
              <p className="text-[10px] text-muted-foreground font-sans truncate mt-0.5">{video.subtitle}</p>
            )}
          </div>
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] px-2 py-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 font-bold uppercase shrink-0 ml-2 flex items-center gap-1 cursor-pointer"
          >
            LinkedIn
            <ExternalLink className="size-2.5" />
          </a>
        </div>
      )}
    </div>
  );
}
