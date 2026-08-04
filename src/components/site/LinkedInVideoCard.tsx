import { Linkedin, Play, ExternalLink } from "lucide-react";

export interface LinkedInVideoItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  embedUrl: string;
  linkedinUrl: string;
  duration?: string;
  isPodcast?: boolean;
}

export const LINKEDIN_PODCAST_VIDEOS: LinkedInVideoItem[] = [
  {
    id: "pod-1",
    title: "ISP Podcast Ep 1 — Culture & Heritage",
    subtitle: "Conversations with Grassroots Changemakers",
    description: "Deep dive into preserving tribal weaving, traditional crafts, and folk heritage across India.",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6947372114651799552",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6947372114651799552",
    duration: "28 mins",
    isPodcast: true,
  },
  {
    id: "pod-2",
    title: "ISP Podcast Ep 2 — Innovations from India",
    subtitle: "Grassroots Scientists & Innovators",
    description: "Extraordinary stories of rural inventors turning plastic waste into durable building materials.",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6941623712496394240",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6941623712496394240",
    duration: "34 mins",
    isPodcast: true,
  },
  {
    id: "pod-3",
    title: "ISP Podcast Ep 3 — Ancient Traditions",
    subtitle: "Sacred Groves & Botanical Wisdom",
    description: "Uncovering centuries-old conservation practices guarded by indigenous forest communities.",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6937614206263255040",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6937614206263255040",
    duration: "22 mins",
    isPodcast: true,
  },
];

export const LINKEDIN_STORY_VIDEOS: LinkedInVideoItem[] = [
  {
    id: "story-vid-1",
    title: "Cdr Abhilash Tomy — Valour & Ocean Sailing",
    subtitle: "India's Golden Boy of Adventure",
    description: "Decorated Naval Officer Cdr Abhilash Tomy's story of solo ocean circumnavigation and courage.",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6932161045494927361",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6932161045494927361",
    duration: "4 mins",
  },
  {
    id: "story-vid-2",
    title: "Wonder Woman of India — Dr. Seema Rao",
    subtitle: "India's Only Female Commando Trainer",
    description: "Over 20 years training elite special forces without taking compensation.",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6930844602346143745",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6930844602346143745",
    duration: "6 mins",
  },
  {
    id: "story-vid-3",
    title: "Plastic to Prosperity Innovation",
    subtitle: "Eco-Building Innovation",
    description: "Transforming single-use plastic bottles into earthquake-resistant school structures.",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6929030595893170176",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6929030595893170176",
    duration: "3 mins",
  },
  {
    id: "story-vid-4",
    title: "Reviving Bastar Tribal Weaving",
    subtitle: "Botanical Dyes & Heritage Weaves",
    description: "Artisans in Chhattisgarh forests safeguarding 1000-year-old natural dye formulas.",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928339676780974080",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6928339676780974080",
    duration: "5 mins",
  },
  {
    id: "story-vid-5",
    title: "Miyawaki Forests of Urban Mumbai",
    subtitle: "Dense Micro-Forest Movement",
    description: "Creating self-sustaining native urban forests in crowded metropolitan spaces.",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928337525400834048",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6928337525400834048",
    duration: "4 mins",
  },
  {
    id: "story-vid-6",
    title: "Water Warrior of Bundelkhand",
    subtitle: "Reviving Ancient Stepwells",
    description: "Mobilizing villagers to restore 50+ traditional water harvesting structures.",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6928190533802618880",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6928190533802618880",
    duration: "7 mins",
  },
  {
    id: "story-vid-7",
    title: "Solar Revolution in Himalayan Villages",
    subtitle: "Clean Energy at 12,000 Feet",
    description: "Powering remote mountain hamlets with indigenous solar microgrids.",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6927464893264596992",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6927464893264596992",
    duration: "5 mins",
  },
  {
    id: "story-vid-8",
    title: "Zero-Budget Farming Pioneer",
    subtitle: "Organic Soil Regeneration",
    description: "Transforming arid farmlands into fertile organic havens using traditional wisdom.",
    thumbnail: "/Logo-ISP.jpg",
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6926031915170889728",
    linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:ugcPost:6926031915170889728",
    duration: "6 mins",
  },
];

interface LinkedInVideoCardProps {
  video: LinkedInVideoItem;
  className?: string;
  showTitle?: boolean;
}

export function LinkedInVideoCard({ video, className = "", showTitle = false }: LinkedInVideoCardProps) {
  const openLinkedInPost = () => {
    window.open(video.linkedinUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`group relative bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-gold/50 transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      {/* High-Res Video Poster Box */}
      <div
        className="relative w-full aspect-video bg-black overflow-hidden rounded-t-2xl shrink-0 border-b border-border/40 cursor-pointer group"
        onClick={openLinkedInPost}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="size-full object-contain group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* LinkedIn Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-blue-600/90 text-white px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider shadow-md backdrop-blur-sm">
          <Linkedin className="size-3 fill-current" />
          <span>{video.isPodcast ? "LinkedIn Podcast" : "LinkedIn Video"}</span>
        </div>

        {/* Duration Tag */}
        {video.duration && (
          <div className="absolute top-3 right-3 z-10 bg-black/75 text-white/90 px-2 py-0.5 rounded text-[10px] font-mono font-semibold backdrop-blur-sm">
            {video.duration}
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="size-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
            <Play className="size-6 fill-white text-white ml-1" />
          </div>
        </div>

        {/* Title Overlay in Poster */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <h4 className="font-display text-sm font-bold text-white line-clamp-1 group-hover:text-gold transition-colors">
            {video.title}
          </h4>
        </div>
      </div>

      {/* Card Content & Action Bar */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-card">
        <div className="space-y-1">
          <h4 className="font-display text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {video.title}
          </h4>
          {video.subtitle && (
            <p className="text-xs text-muted-foreground font-sans line-clamp-2 leading-relaxed">
              {video.subtitle}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <button
            onClick={openLinkedInPost}
            className="text-[11px] font-bold font-sans uppercase tracking-wider text-primary hover:text-gold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="size-3 fill-current text-primary" />
            <span>Play Dispatch</span>
          </button>

          <a
            href={video.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold font-sans uppercase tracking-wider text-muted-foreground hover:text-blue-500 inline-flex items-center gap-1 transition-colors cursor-pointer"
            title="Open original LinkedIn post"
          >
            <span>LinkedIn</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
