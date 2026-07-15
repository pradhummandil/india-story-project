import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, Trash2, Plus, Search, Check, Save } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/slideshow")({
  head: () => ({ meta: [{ title: "Slideshow Manager — Admin" }] }),
  component: AdminSlideshowPage,
});

type SlideItem = {
  id: string;
  title: string;
  slug: string;
  slideshowOrder: number;
  images?: Array<{ imageUrl: string }>;
};

type StoryItem = {
  id: string;
  title: string;
  slug: string;
  homepageSlideshow: boolean;
};

export default function AdminSlideshowPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();

  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & add new slides state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StoryItem[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/admin/slideshow", {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch slideshow stories");
      const data = await res.json();
      setSlides(data.slides || []);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while loading slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSlides();
    }
  }, [user]);

  // Search stories to add to slideshow
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await fetch(
          `/api/admin/stories?limit=10&query=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              Authorization: `Bearer ${session?.access_token || ""}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          // Filter out stories already in slides
          const currentIds = new Set(slides.map((s) => s.id));
          const filtered = (data.stories || []).filter((s: any) => !currentIds.has(s.id));
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, slides, session]);

  const handleMove = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[nextIndex];
    newSlides[nextIndex] = temp;

    // Update order values
    const ordered = newSlides.map((item, idx) => ({
      ...item,
      slideshowOrder: idx,
    }));
    setSlides(ordered);
  };

  const handleRemove = async (storyId: string) => {
    try {
      setErrorMsg(null);
      // Remove via API update to story
      const res = await fetch(`/api/admin/stories/${storyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ homepageSlideshow: false }),
      });
      if (!res.ok) throw new Error("Failed to remove story from slideshow");

      // Broadcast changes
      try {
        const bc = new BroadcastChannel("isp-stories-updates");
        bc.postMessage("update");
        bc.close();
      } catch (e) {
        console.error("BroadcastChannel failed", e);
      }

      setSlides((prev) => prev.filter((s) => s.id !== storyId));
      setSuccessMsg("Story removed from slideshow successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to remove story from slideshow");
    }
  };

  const handleAdd = async (story: StoryItem) => {
    try {
      setErrorMsg(null);
      const nextOrder = slides.length;
      const res = await fetch(`/api/admin/stories/${story.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ homepageSlideshow: true, slideshowOrder: nextOrder }),
      });
      if (!res.ok) throw new Error("Failed to add story to slideshow");

      // Broadcast changes
      try {
        const bc = new BroadcastChannel("isp-stories-updates");
        bc.postMessage("update");
        bc.close();
      } catch (e) {
        console.error("BroadcastChannel failed", e);
      }

      setSearchQuery("");
      setSearchResults([]);
      await fetchSlides();
      setSuccessMsg("Story added to slideshow!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add story to slideshow");
    }
  };

  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);
      const res = await fetch("/api/admin/slideshow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ storyIds: slides.map((s) => s.id) }),
      });
      if (!res.ok) throw new Error("Failed to save slideshow order");

      // Broadcast changes
      try {
        const bc = new BroadcastChannel("isp-stories-updates");
        bc.postMessage("update");
        bc.close();
      } catch (e) {
        console.error("BroadcastChannel failed", e);
      }

      setSuccessMsg("Slideshow order saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save slideshow order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Homepage Slideshow Manager"
      subtitle="Manage and reorder the main featured homepage slideshow."
    >
      <div className="max-w-4xl space-y-8">
        {/* Messages */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm"
            >
              {errorMsg}
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-sm text-sm"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add New Slide Search Section */}
        <div className="bg-[#161616] border border-white/10 p-6 rounded-sm space-y-4">
          <h2 className="text-base font-sans font-semibold text-white">Add Story to Slideshow</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-white/30" />
            <Input
              type="text"
              placeholder="Search stories by title or slug to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-white/30 text-sm"
            />
          </div>

          {searching && <p className="text-xs text-white/40">Searching...</p>}

          {searchResults.length > 0 && (
            <div className="border border-white/10 rounded-sm divide-y divide-white/5 max-h-60 overflow-y-auto bg-black/20">
              {searchResults.map((story) => (
                <div
                  key={story.id}
                  className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-sans text-white/80 font-medium truncate pr-4">
                    {story.title}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleAdd(story)}
                    className="h-8 gap-1 text-xs bg-primary/20 text-primary hover:bg-primary/30"
                  >
                    <Plus className="size-3" /> Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Slideshow Manager List */}
        <div className="bg-[#161616] border border-white/10 p-6 rounded-sm space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-base font-sans font-semibold text-white">Current Slides</h2>
            <Button
              disabled={saving || slides.length === 0}
              onClick={handleSaveOrder}
              className="h-9 px-4 gap-2 text-sm bg-primary hover:bg-primary/90 text-white font-medium"
            >
              <Save className="size-4" /> {saving ? "Saving..." : "Save Order"}
            </Button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <span className="text-sm text-white/40 animate-pulse">Loading slideshow...</span>
            </div>
          ) : slides.length === 0 ? (
            <div className="py-12 border border-dashed border-white/10 rounded-sm text-center">
              <p className="text-sm text-white/40">No stories added to the slideshow yet.</p>
              <p className="text-xs text-white/20 mt-1">
                Use the search above to add stories to the homepage slideshow.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {slides.map((slide, index) => {
                const imageUrl =
                  slide.images?.[0]?.imageUrl ||
                  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=300&q=80";
                return (
                  <div
                    key={slide.id}
                    className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-sm p-3 hover:border-white/10 transition-colors"
                  >
                    <div className="text-center font-mono text-sm text-white/40 w-8">
                      #{index + 1}
                    </div>
                    <img
                      src={imageUrl}
                      alt={slide.title}
                      className="size-12 rounded-sm object-cover border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{slide.title}</h4>
                      <p className="text-xs text-white/40 truncate font-mono">/{slide.slug}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={index === 0}
                        onClick={() => handleMove(index, "up")}
                        className="size-8 text-white/40 hover:text-white hover:bg-white/5"
                        title="Move Up"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={index === slides.length - 1}
                        onClick={() => handleMove(index, "down")}
                        className="size-8 text-white/40 hover:text-white hover:bg-white/5"
                        title="Move Down"
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <span className="w-px h-6 bg-white/10 mx-1" />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemove(slide.id)}
                        className="size-8 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                        title="Remove from Slideshow"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
