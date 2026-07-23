import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Copy,
  ExternalLink,
  BookOpen,
  FolderOpen,
  MapPin,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createLazyFileRoute("/admin/stories/")({
  component: AdminStoriesPage,
});

type StoryRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  featured: boolean;
  themes: string[];
  region: string;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  Published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  Draft: "bg-amber-500/10 text-amber-400 border-amber-500/15",
  Archived: "bg-white/5 text-white/30 border-white/8",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`text-[9px] font-sans font-black uppercase tracking-wider px-2 py-0.5 border rounded-md ${STATUS_STYLES[status] ?? "bg-white/5 text-white/30 border-white/8"}`}
    >
      {status}
    </span>
  );
}

export default function AdminStoriesPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();

  const [stories, setStories] = useState<StoryRow[]>([]);
  const [themesList, setThemesList] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // "date", "views", "title"
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/themes")
      .then((r) => r.json())
      .then((d) => setThemesList(d.themes ?? []))
      .catch(console.error);

    fetch("/api/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(console.error);
  }, [user]);

  const loadStories = () => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      sortBy,
      ...(debouncedQuery ? { query: debouncedQuery } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(themeFilter !== "all" ? { theme: themeFilter } : {}),
      ...(stateFilter !== "all" ? { region: stateFilter } : {}),
    });

    fetch(`/api/admin/stories?${params}`)
      .then((r) => r.json())
      .then((data: any) => {
        setStories(data.stories ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void loadStories();
  }, [user, page, debouncedQuery, statusFilter, themeFilter, stateFilter, sortBy]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story permanently?")) return;
    await fetch(`/api/admin/stories/${id}`, {
      method: "DELETE",
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
    });
    new BroadcastChannel("isp-stories-updates").postMessage("update");
    void loadStories();
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await fetch(`/api/admin/stories/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        Authorization: session ? `Bearer ${session.access_token}` : "",
      },
      body: JSON.stringify({ featured: !current }),
    });
    new BroadcastChannel("isp-stories-updates").postMessage("update");
    void loadStories();
  };

  const handleDuplicate = async (id: string) => {
    if (!session) return;
    setDuplicatingId(id);
    try {
      const res = await fetch("/api/admin/stories/duplicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        new BroadcastChannel("isp-stories-updates").postMessage("update");
        void loadStories();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === stories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(stories.map((s) => s.id));
    }
  };

  const handleBulkAction = async (action: "publish" | "draft" | "archive" | "delete") => {
    if (selectedIds.length === 0 || !session) return;
    if (
      action === "delete" &&
      !confirm(`Delete all ${selectedIds.length} selected stories permanently?`)
    )
      return;

    try {
      const res = await fetch("/api/admin/stories/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      if (res.ok) {
        new BroadcastChannel("isp-stories-updates").postMessage("update");
        setSelectedIds([]);
        void loadStories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-white/5">
      <td className="p-4 w-12 text-center">
        <div className="size-3.5 bg-white/5 rounded mx-auto" />
      </td>
      <td className="p-4">
        <div className="h-4 w-48 bg-white/5 rounded" />
      </td>
      <td className="p-4">
        <div className="h-3.5 w-24 bg-white/5 rounded" />
      </td>
      <td className="p-4">
        <div className="h-3.5 w-16 bg-white/5 rounded" />
      </td>
      <td className="p-4">
        <div className="h-4 w-12 bg-white/5 rounded" />
      </td>
      <td className="p-4">
        <div className="h-3.5 w-8 bg-white/5 rounded" />
      </td>
      <td className="p-4">
        <div className="h-3.5 w-20 bg-white/5 rounded" />
      </td>
      <td className="p-4 text-right">
        <div className="h-7 w-24 bg-white/5 rounded ml-auto" />
      </td>
    </tr>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto select-none">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-border/60 pb-5 gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
              Stories Curation
            </h1>
            <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest mt-1.5 font-bold">
              Manage dispatches catalog, set featured stories, duplicate drafts, and run bulk operations
            </p>
          </div>
          <Link to="/admin/stories/new" className="self-start sm:self-center">
            <Button className="h-10 px-4 bg-primary hover:bg-primary/95 text-primary-foreground font-sans text-xs uppercase tracking-widest font-bold rounded-lg gap-2 cursor-pointer shadow-sm">
              <Plus className="size-4 shrink-0" /> New Dispatch
            </Button>
          </Link>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-card border border-border p-4 rounded-xl space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-4">
            
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="admin-stories-search"
                type="text"
                placeholder="Search dispatches by title or snippet..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10 h-10 bg-background border-border focus-visible:border-primary/45 rounded-lg text-xs placeholder:text-muted-foreground/60 w-full text-foreground"
              />
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <span className="text-[9px] uppercase font-bold text-muted-foreground whitespace-nowrap tracking-wider font-sans">
                Sort By
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 bg-background border border-border text-foreground font-sans text-xs px-3 rounded-lg focus:outline-none focus:border-primary/40 w-full md:w-36 cursor-pointer"
              >
                <option value="date">Date Created</option>
                <option value="views">Total Views</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center pt-3 border-t border-border/40 text-xs text-muted-foreground">
            
            {/* Status filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] uppercase font-bold text-muted-foreground mr-1 tracking-wider font-sans">
                Status
              </span>
              {["all", "Published", "Draft", "Archived"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>

            {/* Theme filter */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-sans">Theme</span>
              <select
                value={themeFilter}
                onChange={(e) => {
                  setThemeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-background border border-border text-foreground font-sans text-[11px] px-2 py-1 rounded-md focus:outline-none cursor-pointer"
              >
                <option value="all">All Themes</option>
                {themesList.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State filter */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-sans">State</span>
              <select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-background border border-border text-foreground font-sans text-[11px] px-2 py-1 rounded-md focus:outline-none cursor-pointer"
              >
                <option value="all">All States</option>
                {states.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stories list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground uppercase tracking-wider text-[9px] font-bold">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={stories.length > 0 && selectedIds.length === stories.length}
                      onChange={handleSelectAll}
                      className="cursor-pointer accent-primary"
                    />
                  </th>
                  <th className="p-4">Dispatch Title</th>
                  <th className="p-4">Themes</th>
                  <th className="p-4">State</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Published</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-foreground">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : stories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-16 text-center text-muted-foreground font-sans italic">
                      No story dispatches found matching current filters.
                    </td>
                  </tr>
                ) : (
                  stories.map((story) => {
                    const isSelected = selectedIds.includes(story.id);
                    return (
                      <tr
                        key={story.id}
                        className={`hover:bg-muted/40 transition-colors duration-150 group ${isSelected ? "bg-primary/5" : ""}`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(story.id)}
                            className="cursor-pointer accent-primary"
                          />
                        </td>
                        <td className="p-4 font-semibold text-foreground truncate max-w-xs">
                          <div className="flex items-center gap-2">
                            {story.featured && (
                              <Star className="size-3.5 text-primary fill-primary shrink-0" />
                            )}
                            <span className="text-foreground group-hover:text-primary transition-colors font-medium">
                              {story.title}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {Array.isArray(story.themes)
                            ? story.themes.join(", ")
                            : ((story as any).category ?? "—")}
                        </td>
                        <td className="p-4 text-muted-foreground">{story.region}</td>
                        <td className="p-4">
                          <StatusBadge status={story.status} />
                        </td>
                        <td className="p-4 font-mono font-bold text-foreground">
                          {story.viewCount.toLocaleString()}
                        </td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">
                          {story.publishedAt
                            ? new Date(story.publishedAt).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`/stories/${story.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-md border border-border bg-muted/80 text-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                              title="Preview story in live window"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                            <button
                              onClick={() => void handleDuplicate(story.id)}
                              className="p-1.5 rounded-md border border-border bg-muted/80 text-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                              title="Duplicate Story Draft"
                              disabled={duplicatingId === story.id}
                            >
                              <Copy
                                className={`size-3.5 ${duplicatingId === story.id ? "animate-spin" : ""}`}
                              />
                            </button>
                            <Link
                              to="/admin/stories/$id/edit"
                              params={{ id: story.id }}
                              className="px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1 text-xs font-bold shadow-sm cursor-pointer"
                              title="Edit content details"
                            >
                              <Edit className="size-3.5" />
                              <span>Edit</span>
                            </Link>
                            <button
                              onClick={() => void handleDelete(story.id)}
                              className="p-1.5 rounded-md border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                              title="Delete permanently"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && total > PAGE_SIZE && (
            <div className="flex items-center justify-between p-4 border-t border-black/5 font-sans text-[11px]">
              <span className="text-black/40 font-medium">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} stories
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 text-black/40 hover:text-black disabled:opacity-20 transition-colors font-bold uppercase cursor-pointer"
                >
                  Prev
                </button>
                <span className="text-black/50 px-2 font-mono">
                  {page} / {Math.ceil(total / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / PAGE_SIZE)}
                  className="px-2.5 py-1 text-black/40 hover:text-black disabled:opacity-20 transition-colors font-bold uppercase cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected rows Floating Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#121212]/95 border border-white/10 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 text-xs font-sans text-white backdrop-blur-md"
            >
              <span className="font-bold text-[#C8A96A] text-[10px] uppercase tracking-wider">{selectedIds.length} selected</span>
              <span className="text-white/10">|</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs rounded-full h-8 px-4 font-bold uppercase tracking-wider cursor-pointer"
                  onClick={() => handleBulkAction("publish")}
                >
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-xs text-white/80 rounded-full h-8 px-4 font-bold uppercase tracking-wider cursor-pointer"
                  onClick={() => handleBulkAction("draft")}
                >
                  Draft
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-xs text-white/80 rounded-full h-8 px-4 font-bold uppercase tracking-wider cursor-pointer"
                  onClick={() => handleBulkAction("archive")}
                >
                  Archive
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs rounded-full h-8 px-4 font-bold uppercase tracking-wider cursor-pointer"
                  onClick={() => handleBulkAction("delete")}
                >
                  Delete
                </Button>
              </div>
              <button
                onClick={() => setSelectedIds([])}
                className="text-white/40 hover:text-white ml-2 text-sm cursor-pointer"
              >
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
