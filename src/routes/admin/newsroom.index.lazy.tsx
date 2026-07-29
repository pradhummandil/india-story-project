import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  FileText,
  Clock,
  Eye,
  AlertTriangle,
  Search,
  Trash2,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Sliders,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

export const Route = createLazyFileRoute("/admin/newsroom/")({
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

  const activeStories = getStoriesForTab();

  // Skeleton UI components
  const SkeletonKpi = () => (
    <div className="bg-card border border-border p-4 rounded-xl h-24 flex flex-col justify-between animate-pulse shadow-sm">
      <div className="h-3 w-20 bg-muted/40 rounded" />
      <div className="h-7 w-12 bg-muted/40 rounded mt-2" />
    </div>
  );

  const SkeletonCalendar = () => (
    <div className="bg-card border border-border p-6 rounded-xl space-y-4 animate-pulse shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 bg-muted/40 rounded" />
        <div className="h-4 w-28 bg-muted/40 rounded" />
      </div>
      <div className="grid grid-cols-7 gap-1 h-32 bg-muted/20 rounded" />
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto select-none">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-border/60 pb-5 gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
              Enterprise Editorial Newsroom
            </h1>
            <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest mt-1.5 font-bold">
              Manage dispatches review stages, scheduled releases, and editorial revisions logs
            </p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading && !data ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} />)
          ) : (
            <>
              <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24 hover:border-primary/40 transition-colors shadow-sm">
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Pending Review
                </span>
                <h2 className="font-display text-3xl font-bold text-foreground mt-auto">
                  {data?.pendingReview.length ?? 0}
                </h2>
              </div>
              <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24 hover:border-primary/40 transition-colors shadow-sm">
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Needs Fact Check
                </span>
                <h2 className="font-display text-3xl font-bold text-foreground mt-auto">
                  {data?.needsFactCheck.length ?? 0}
                </h2>
              </div>
              <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24 hover:border-primary/40 transition-colors shadow-sm">
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Needs SEO
                </span>
                <h2 className="font-display text-3xl font-bold text-foreground mt-auto">
                  {data?.needsSEO.length ?? 0}
                </h2>
              </div>
              <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24 hover:border-primary/40 transition-colors shadow-sm">
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Scheduled Later
                </span>
                <h2 className="font-display text-3xl font-bold text-foreground mt-auto">
                  {data?.scheduled.length ?? 0}
                </h2>
              </div>
            </>
          )}
        </div>

        {/* Editorial Calendar Section */}
        {loading && !data ? (
          <SkeletonCalendar />
        ) : (
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-primary" />
                <h3 className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest">
                  Editorial Calendar
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={prevMonth}
                  className="size-7 rounded-md bg-muted/30 hover:bg-muted border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <span className="text-xs font-bold text-foreground font-sans uppercase tracking-widest">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <button
                  onClick={nextMonth}
                  className="size-7 rounded-md bg-muted/30 hover:bg-muted border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-3 font-sans">
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
                    className="bg-muted/30 border border-border/50 h-16 p-1.5 text-left relative hover:border-primary/40 transition-colors group rounded-lg"
                  >
                    <span className="text-[9px] font-sans font-bold text-muted-foreground">
                      {day.getDate()}
                    </span>
                    <div className="space-y-1 mt-1 overflow-y-auto max-h-9 scrollbar-none">
                      {scheduledStories.map((story) => (
                        <Link
                          key={story.id}
                          to="/admin/newsroom/story/$id"
                          params={{ id: story.id }}
                          className="block text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded truncate leading-tight hover:bg-emerald-500/20 font-sans font-semibold cursor-pointer"
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
        )}

        {/* Workflow lists & action triggers */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main workflow block */}
          <div className="xl:col-span-2 space-y-4">
            
            {/* Sub-tabs List */}
            <div className="flex bg-muted/40 border border-border/60 p-1 rounded-xl gap-1 overflow-x-auto">
              {(
                [
                  { id: "pending", label: "Review", count: data?.pendingReview.length },
                  { id: "factcheck", label: "Factcheck", count: data?.needsFactCheck.length },
                  { id: "seo", label: "SEO", count: data?.needsSEO.length },
                  { id: "scheduled", label: "Scheduled", count: data?.scheduled.length },
                  { id: "drafts", label: "Drafts", count: data?.drafts.length },
                  { id: "top", label: "Top Views" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-primary text-white font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {tab.label}
                  {("count" in tab && tab.count !== undefined) && (
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground uppercase tracking-wider text-[9px] font-bold">
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
                          className="cursor-pointer rounded border-border"
                        />
                      </th>
                      <th className="p-3">Dispatch Title</th>
                      <th className="p-3">Author</th>
                      <th className="p-3">Region</th>
                      <th className="p-3">Workflow State</th>
                      <th className="p-3 text-right">Views</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-foreground">
                    {activeStories.length > 0 ? (
                      activeStories.map((story) => (
                        <tr
                          key={story.id}
                          className="hover:bg-muted/30 transition-colors duration-150"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(story.id)}
                              onChange={() => toggleSelect(story.id)}
                              className="cursor-pointer rounded border-border"
                            />
                          </td>
                          <td className="p-3 font-semibold text-foreground truncate max-w-xs">
                            {story.title}
                          </td>
                          <td className="p-3 text-muted-foreground font-medium">{story.authorName}</td>
                          <td className="p-3 text-muted-foreground">{story.region}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold border ${
                                story.status === "Published"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {story.status}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-foreground">
                            {story.viewCount.toLocaleString()}
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              to="/admin/newsroom/story/$id"
                              params={{ id: story.id }}
                              className="inline-flex items-center gap-1 text-[9px] font-bold text-primary uppercase tracking-wider hover:underline cursor-pointer"
                            >
                              Workspace <ArrowRight className="size-3 shrink-0" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-muted-foreground italic font-sans">
                          No stories currently in this review queue.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bulk operation box */}
          <div className="bg-card border border-border/80 p-6 rounded-xl space-y-4 h-fit shadow-sm">
            <div className="flex items-center gap-2">
              <Sliders className="size-4 text-primary" />
              <h3 className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-wider">
                Bulk Operations
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              Select multiple stories from the review queues, pick a workflow operation, and apply.
            </p>

            <div className="space-y-4 font-sans text-xs pt-2">
              <div className="flex items-center justify-between bg-muted/40 border border-border/60 rounded-lg p-3">
                <span className="font-bold text-foreground">Selections</span>
                <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded text-[10px] uppercase">
                  {selectedIds.length} dispatches
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Select Batch Task</label>
                <select
                  value={bulkAction}
                  onChange={(e) => {
                    setBulkAction(e.target.value);
                    setBulkVal("");
                  }}
                  className="w-full bg-[#161616] text-white border border-white/10 px-3 py-2.5 rounded-lg text-xs focus:outline-none focus:border-[#C8A96A]/40"
                >
                  <option value="">-- Select operation --</option>
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

              {/* Action specific configurations */}
              {bulkAction === "featured" && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block font-bold text-white/50 uppercase tracking-wider text-[9px]">Featured Status</label>
                  <select
                    value={bulkVal}
                    onChange={(e) => setBulkVal(e.target.value)}
                    className="w-full bg-[#161616] text-white border border-white/10 px-3 py-2.5 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="">-- Choose status --</option>
                    <option value="true">Enable Featured</option>
                    <option value="false">Disable Featured</option>
                  </select>
                </div>
              )}

              {bulkAction === "slideshow" && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block font-bold text-white/50 uppercase tracking-wider text-[9px]">Slideshow Status</label>
                  <select
                    value={bulkVal}
                    onChange={(e) => setBulkVal(e.target.value)}
                    className="w-full bg-[#161616] text-white border border-white/10 px-3 py-2.5 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="">-- Choose status --</option>
                    <option value="true">Enable Slideshow</option>
                    <option value="false">Disable Slideshow</option>
                  </select>
                </div>
              )}

              {bulkAction === "theme" && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block font-bold text-white/50 uppercase tracking-wider text-[9px]">Change Theme Mapping</label>
                  <select
                    value={bulkVal}
                    onChange={(e) => setBulkVal(e.target.value)}
                    className="w-full bg-[#161616] text-white border border-white/10 px-3 py-2.5 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="">-- Select category theme --</option>
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
                className="w-full h-10 bg-[#C8A96A] hover:bg-[#C8A96A]/95 text-black font-sans text-xs uppercase tracking-widest font-black rounded-lg cursor-pointer disabled:opacity-50"
              >
                {bulkLoading ? "Applying batch updates..." : "Execute Batch Task"}
              </Button>

              {bulkMsg && (
                <div className="bg-white/5 border border-white/5 text-xs text-[#C8A96A] font-bold p-3 rounded-lg text-center animate-fadeIn">
                  ✓ {bulkMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
