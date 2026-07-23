import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BookMarked, Heart, MessageSquare, Sparkles } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  entityTitle: string;
  user: { name: string };
  createdAt: string;
}

export function LiveActivityTicker() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch("/api/activity-feed");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.activities) && data.activities.length > 0) {
            setActivities(data.activities);
          }
        }
      } catch (err) {
        console.warn("Failed to load activity ticker:", err);
      }
    }
    void fetchActivities();
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activities.length]);

  if (activities.length === 0) return null;

  const current = activities[currentIndex];

  return (
    <div className="bg-amber-950/90 text-amber-100/90 border-y border-amber-800/40 py-2.5 px-4 text-xs font-sans">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold tracking-wider uppercase text-[10px] text-gold">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2 bg-gold"></span>
          </span>
          Live Activity
        </div>

        <div className="flex-1 overflow-hidden h-5 relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 truncate text-center"
            >
              <span className="font-semibold text-amber-200">{current.user?.name || "A reader"}</span>
              <span className="text-amber-300/80">
                {current.action === "BOOKMARK" && "bookmarked"}
                {current.action === "LIKE" && "liked"}
                {current.action === "COMMENT" && "commented on"}
                {current.action === "READING" && "is reading"}
              </span>
              <span className="font-medium italic truncate max-w-md">"{current.entityTitle}"</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-amber-300/70">
          <Sparkles className="size-3 text-gold" />
          <span>1,280 readers online</span>
        </div>
      </div>
    </div>
  );
}
