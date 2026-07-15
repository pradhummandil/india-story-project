import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  FileText,
  Clock,
  Eye,
  AlertTriangle,
  Search,
  Globe2,
  Trash2,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Sliders,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/newsroom/")({
  head: () => ({
    meta: [{ title: "Newsroom CMS Console — India Story Project" }],
  }),
  component: NewsroomConsolePage,
});

type StoryItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  authorName: string;
  region: string;
  viewCount: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
};

type NewsroomData = {
  pendingReview: StoryItem[];
  needsFactCheck: StoryItem[];
  needsSEO: StoryItem[];
  scheduled: StoryItem[];
  publishedToday: number;
  topPerforming: StoryItem[];
  drafts: StoryItem[];
  archived: StoryItem[];
};

function NewsroomConsolePage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();
  const [data, setData] = useState<NewsroomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pending" | "factcheck" | "seo" | "scheduled" | "drafts" | "top"
  >("pending");

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Bulk State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkVal, setBulkVal] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");

  // Themes & States for Bulk Selection
  const [themesList, setThemesList] = useState<any[]>([]);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  const loadDashboard = () => {
    if (!user || !session) return;
    setLoading(true);
    fetch("/api/admin/newsroom/dashboard", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((res) => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();

    // Fetch themes list for bulk changes
    fetch("/api/themes")
      .then((r) => r.json())
      .then((d) => setThemesList(d.themes ?? []))
      .catch(console.error);
  }, [user, session]);

  // Bulk action submission
  const handleBulkSubmit = async () => {
    if (!session || selectedIds.length === 0 || !bulkAction) return;
    setBulkLoading(true);
    setBulkMsg("");

    let payload: any = {};
    if (bulkAction === "featured" || bulkAction === "slideshow") {
      payload = { value: bulkVal === "true" };
    } else if (bulkAction === "theme") {
      payload = { themeId: bulkVal };
    } else if (bulkAction === "seo") {
      payload = {
        seoTitle: "India Story — custom page title template",
        seoDescription: "Editorial dispatches and local stories from across India.",
        seoKeywords: "history,heritage,culture,india",
      };
    }

    try {
      const res = await fetch("/api/admin/newsroom/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          storyIds: selectedIds,
          action: bulkAction,
          payload,
        }),
      });

      const out = await res.json();
      if (out.success) {
        setBulkMsg(`Successfully updated ${out.updatedCount} stories!`);
        setSelectedIds([]);
        loadDashboard();
      } else {
        setBulkMsg(out.error || "Action failed.");
      }
    } catch {
      setBulkMsg("An error occurred during bulk update.");
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getStoriesForTab = () => {
    if (!data) return [];
    if (activeTab === "pending") return data.pendingReview;
    if (activeTab === "factcheck") return data.needsFactCheck;
    if (activeTab === "seo") return data.needsSEO;
    if (activeTab === "scheduled") return data.scheduled;
    if (activeTab === "drafts") return data.drafts;
    if (activeTab === "top") return data.topPerforming;
    return [];
  };

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding days for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const calendarDays = getDaysInMonth(currentDate);

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-white/30 font-sans text-xs uppercase tracking-widest animate-pulse">
          Loading Newsroom metrics…
        </div>
      </AdminLayout>
    );
  }

  const activeStories = getStoriesForTab();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">
            Enterprise Editorial Newsroom
          </h1>
          <p className="text-xs font-sans text-white/50 uppercase tracking-widest mt-1">
            Manage scheduled publication, revision history comparisons, workflow logs, locks, and
            bulk tasks
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#141414] border border-white/5 p-4 rounded flex flex-col justify-between">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-500">
              Pending Review
            </span>
            <h2 className="font-display text-3xl font-bold text-white mt-2">
              {data?.pendingReview.length ?? 0}
            </h2>
          </div>
          <div className="bg-[#141414] border border-white/5 p-4 rounded flex flex-col justify-between">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-indigo-400">
              Needs Fact Check
            </span>
            <h2 className="font-display text-3xl font-bold text-white mt-2">
              {data?.needsFactCheck.length ?? 0}
            </h2>
          </div>
          <div className="bg-[#141414] border border-white/5 p-4 rounded flex flex-col justify-between">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-teal-400">
              Needs SEO
            </span>
            <h2 className="font-display text-3xl font-bold text-white mt-2">
              {data?.needsSEO.length ?? 0}
            </h2>
          </div>
          <div className="bg-[#141414] border border-white/5 p-4 rounded flex flex-col justify-between">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-400">
              Scheduled Later
            </span>
            <h2 className="font-display text-3xl font-bold text-white mt-2">
              {data?.scheduled.length ?? 0}
            </h2>
          </div>
        </div>

        {/* Editorial Calendar Section */}
        <div className="bg-[#141414] border border-white/5 p-6 rounded">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-gold" />
              <h3 className="text-sm font-bold text-white font-sans uppercase tracking-widest">
                Editorial Calendar
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={prevMonth}
                className="p-1 text-white/50 hover:text-white transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-xs font-bold text-white font-sans uppercase tracking-widest">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 text-white/50 hover:text-white transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 font-sans">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="bg-transparent h-16" />;

              const formattedDate = day.toDateString();
              const scheduledStories =
                data?.scheduled.filter((s) => {
                  if (!s.scheduledAt) return false;
                  return new Date(s.scheduledAt).toDateString() === formattedDate;
                }) || [];

              return (
                <div
                  key={formattedDate}
                  className="bg-[#1a1a1a]/85 border border-white/5 h-16 p-1 text-left relative group"
                >
                  <span className="text-[10px] font-sans font-bold text-white/55">
                    {day.getDate()}
                  </span>
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-10">
                    {scheduledStories.map((story) => (
                      <Link
                        key={story.id}
                        to="/admin/newsroom/story/$id"
                        params={{ id: story.id }}
                        className="block text-[8px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-1 rounded truncate leading-tight hover:bg-emerald-900/60"
                        title={story.title}
                      >
                        {story.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Catalog Workflow Tables & Tabs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            {/* Tabs List */}
            <div className="flex border-b border-white/5 gap-2 overflow-x-auto pb-1 font-sans text-xs">
              <button
                onClick={() => setActiveTab("pending")}
                className={`pb-2 px-3 uppercase tracking-wider font-bold transition-all ${activeTab === "pending" ? "text-gold border-b-2 border-gold" : "text-white/40 hover:text-white"}`}
              >
                Pending Review ({data?.pendingReview.length ?? 0})
              </button>
              <button
                onClick={() => setActiveTab("factcheck")}
                className={`pb-2 px-3 uppercase tracking-wider font-bold transition-all ${activeTab === "factcheck" ? "text-gold border-b-2 border-gold" : "text-white/40 hover:text-white"}`}
              >
                Needs Fact Check ({data?.needsFactCheck.length ?? 0})
              </button>
              <button
                onClick={() => setActiveTab("seo")}
                className={`pb-2 px-3 uppercase tracking-wider font-bold transition-all ${activeTab === "seo" ? "text-gold border-b-2 border-gold" : "text-white/40 hover:text-white"}`}
              >
                Needs SEO ({data?.needsSEO.length ?? 0})
              </button>
              <button
                onClick={() => setActiveTab("scheduled")}
                className={`pb-2 px-3 uppercase tracking-wider font-bold transition-all ${activeTab === "scheduled" ? "text-gold border-b-2 border-gold" : "text-white/40 hover:text-white"}`}
              >
                Scheduled ({data?.scheduled.length ?? 0})
              </button>
              <button
                onClick={() => setActiveTab("drafts")}
                className={`pb-2 px-3 uppercase tracking-wider font-bold transition-all ${activeTab === "drafts" ? "text-gold border-b-2 border-gold" : "text-white/40 hover:text-white"}`}
              >
                Drafts ({data?.drafts.length ?? 0})
              </button>
              <button
                onClick={() => setActiveTab("top")}
                className={`pb-2 px-3 uppercase tracking-wider font-bold transition-all ${activeTab === "top" ? "text-gold border-b-2 border-gold" : "text-white/40 hover:text-white"}`}
              >
                Top Views
              </button>
            </div>

            {/* Stories List table */}
            <div className="bg-[#141414] border border-white/5 rounded overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 font-sans uppercase tracking-wider text-white/45 text-[10px]">
                    <th className="p-3 w-8">
                      <input
                        type="checkbox"
                        checked={
                          activeStories.length > 0 && selectedIds.length === activeStories.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(activeStories.map((s) => s.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Author</th>
                    <th className="p-3">State</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Views</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStories.length > 0 ? (
                    activeStories.map((story) => (
                      <tr
                        key={story.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(story.id)}
                            onChange={() => toggleSelect(story.id)}
                          />
                        </td>
                        <td className="p-3 font-semibold text-white truncate max-w-xs">
                          {story.title}
                        </td>
                        <td className="p-3 text-white/60">{story.authorName}</td>
                        <td className="p-3 text-white/60">{story.region}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold ${story.status === "Published" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20" : "bg-amber-950/60 text-amber-400 border border-amber-500/20"}`}
                          >
                            {story.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-sans font-bold text-white">
                          {story.viewCount}
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            to="/admin/newsroom/story/$id"
                            params={{ id: story.id }}
                            className="inline-flex items-center gap-1 text-[10px] text-gold uppercase tracking-wider font-bold hover:underline"
                          >
                            Open <ArrowRight className="size-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-white/30 italic font-sans">
                        No stories currently in this queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bulk Actions Panel */}
          <div className="bg-[#141414] border border-white/5 p-6 rounded space-y-4 h-fit">
            <div className="flex items-center gap-2">
              <Sliders className="size-4 text-gold" />
              <h3 className="text-sm font-bold text-white font-sans uppercase tracking-widest">
                Bulk Editorial Actions
              </h3>
            </div>
            <p className="text-xs text-white/55 font-sans leading-relaxed">
              Select multiple stories from the table lists on the left, select a batch utility, and
              apply change.
            </p>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <span className="block font-bold text-white/60 mb-1">Selected count</span>
                <span className="font-bold text-white bg-primary/20 border border-primary/45 px-2 py-0.5 rounded">
                  {selectedIds.length} stories selected
                </span>
              </div>

              <div>
                <label className="block font-bold text-white/60 mb-1">Select Action</label>
                <select
                  value={bulkAction}
                  onChange={(e) => {
                    setBulkAction(e.target.value);
                    setBulkVal("");
                  }}
                  className="w-full bg-[#1e1e1e] text-white border border-white/10 px-3 py-2 rounded focus:outline-none"
                >
                  <option value="">-- Choose operation --</option>
                  <option value="publish">Bulk Publish</option>
                  <option value="delete">Bulk Archive (Delete)</option>
                  <option value="featured">Set Featured Flag</option>
                  <option value="slideshow">Set Slideshow Flag</option>
                  <option value="hero">Set Hero of Day</option>
                  <option value="theme">Change Theme</option>
                  <option value="seo">Setup SEO Templates</option>
                  <option value="translate">Bulk Translating (Hindi)</option>
                </select>
              </div>

              {/* Action specific subfields */}
              {bulkAction === "featured" && (
                <div>
                  <label className="block font-bold text-white/60 mb-1">Featured Value</label>
                  <select
                    value={bulkVal}
                    onChange={(e) => setBulkVal(e.target.value)}
                    className="w-full bg-[#1e1e1e] text-white border border-white/10 px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="">-- Select value --</option>
                    <option value="true">Enable Featured</option>
                    <option value="false">Disable Featured</option>
                  </select>
                </div>
              )}

              {bulkAction === "slideshow" && (
                <div>
                  <label className="block font-bold text-white/60 mb-1">Slideshow Value</label>
                  <select
                    value={bulkVal}
                    onChange={(e) => setBulkVal(e.target.value)}
                    className="w-full bg-[#1e1e1e] text-white border border-white/10 px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="">-- Select value --</option>
                    <option value="true">Enable Slideshow</option>
                    <option value="false">Disable Slideshow</option>
                  </select>
                </div>
              )}

              {bulkAction === "theme" && (
                <div>
                  <label className="block font-bold text-white/60 mb-1">Select Theme</label>
                  <select
                    value={bulkVal}
                    onChange={(e) => setBulkVal(e.target.value)}
                    className="w-full bg-[#1e1e1e] text-white border border-white/10 px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="">-- Select category --</option>
                    {themesList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                onClick={handleBulkSubmit}
                disabled={bulkLoading || selectedIds.length === 0 || !bulkAction}
                className="w-full bg-primary hover:bg-primary/95 text-white font-sans text-xs uppercase tracking-widest font-bold py-2"
              >
                {bulkLoading ? "Applying changes..." : "Execute Batch Task"}
              </Button>

              {bulkMsg && <p className="mt-2 text-xs text-gold font-bold">{bulkMsg}</p>}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
