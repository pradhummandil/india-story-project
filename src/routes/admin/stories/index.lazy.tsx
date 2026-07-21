import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  CheckCircle,
  FileText,
  Archive,
  Copy,
  ChevronDown,
  ExternalLink,
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
  Published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Draft: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Archived: "bg-white/5 text-white/30 border-white/10",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border ${STATUS_STYLES[status] ?? "bg-white/5 text-white/30 border-white/10"}`}
    >
      {status}
    </span>
  );
}

export default function AdminStoriesPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();

  // State Lists
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [themesList, setThemesList] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  // Filtering / Sorting / Pagination States
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

  // Bulk Checklist State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Load Themes & States
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

  // Load Stories
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

  // Duplicate Story Action
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

  // Bulk Checklist Handlers
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

  return (
    <AdminLayout title="Stories Curation" subtitle={`${total.toLocaleString()} total stories`}>
      <div className="space-y-6">
        {/* Toolbar Controls */}
        <div className="flex flex-col gap-4 bg-[#161616]/60 border border-white/5 p-4 rounded-sm">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
              <Input
                id="admin-stories-search"
                type="text"
                placeholder="Search stories title/excerpt…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10 h-10 rounded-sm bg-white/5 border-white/10 text-white/80 placeholder:text-white/20 focus:border-primary/50 font-sans text-sm w-full"
              />
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-[10px] uppercase font-bold text-white/30 whitespace-nowrap font-sans">
                Sort By
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 bg-[#0F0F0F] border border-white/10 text-white/80 font-sans text-xs px-3 rounded focus:outline-none focus:border-primary/50 transition-colors w-full md:w-36"
              >
                <option value="date">Date Created</option>
                <option value="views">Total Views</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>

            <Link to="/admin/stories/new" className="w-full md:w-auto">
              <Button
                id="admin-create-story-btn"
                className="h-10 px-4 rounded-sm bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest gap-2 whitespace-nowrap w-full"
              >
                <Plus className="size-4" />
                New Story
              </Button>
            </Link>
          </div>

          {/* Filtering Sub-row */}
          <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-white/5 text-xs text-white/60">
            {/* Statuses */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-white/35 mr-1 font-sans">
                Status
              </span>
              {["all", "Published", "Draft", "Archived"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                    statusFilter === s
                      ? "bg-primary text-white"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>

            {/* Theme filter */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-bold text-white/35 font-sans">Theme</span>
              <select
                value={themeFilter}
                onChange={(e) => {
                  setThemeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#0F0F0F] border border-white/10 text-white/70 font-sans text-[11px] px-2 py-1 rounded focus:outline-none"
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
              <span className="text-[9px] uppercase font-bold text-white/35 font-sans">State</span>
              <select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#0F0F0F] border border-white/10 text-white/70 font-sans text-[11px] px-2 py-1 rounded focus:outline-none"
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

        {/* Table & Data List */}
        <div className="bg-[#161616] border border-white/10 rounded-sm overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-white/30 uppercase tracking-widest text-[9px]">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={stories.length > 0 && selectedIds.length === stories.length}
                      onChange={handleSelectAll}
                      className="cursor-pointer size-3.5 accent-primary"
                    />
                  </th>
                  <th className="p-4 font-bold">Title</th>
                  <th className="p-4 font-bold">Themes</th>
                  <th className="p-4 font-bold">State</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Views</th>
                  <th className="p-4 font-bold">Published</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="p-4">
                          <div className="h-4 bg-white/5 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : stories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-16 text-center text-white/20 font-sans">
                      No stories match current search or filters.
                    </td>
                  </tr>
                ) : (
                  stories.map((story) => {
                    const isSelected = selectedIds.includes(story.id);
                    return (
                      <motion.tr
                        key={story.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-white/3 transition-colors group ${isSelected ? "bg-primary/5" : ""}`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(story.id)}
                            className="cursor-pointer size-3.5 accent-primary"
                          />
                        </td>
                        <td className="p-4 font-medium max-w-xs truncate">
                          <div className="flex items-center gap-2">
                            {story.featured && (
                              <Star className="size-3.5 text-gold fill-gold shrink-0" />
                            )}
                            <span className="text-white hover:text-primary transition-colors text-sm">
                              {story.title}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-white/40">
                          {Array.isArray(story.themes)
                            ? story.themes.join(", ")
                            : ((story as any).category ?? "—")}
                        </td>
                        <td className="p-4 text-white/40">{story.region}</td>
                        <td className="p-4">
                          <StatusBadge status={story.status} />
                        </td>
                        <td className="p-4 font-mono text-white/50">
                          {story.viewCount.toLocaleString()}
                        </td>
                        <td className="p-4 text-white/30 whitespace-nowrap">
                          {story.publishedAt
                            ? new Date(story.publishedAt).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <a
                            href={`/stories/${story.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-white/30 hover:text-white transition-colors inline-block"
                            title="Preview story in live window"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                          <button
                            onClick={() => void handleDuplicate(story.id)}
                            className="p-1 text-white/30 hover:text-gold transition-colors inline-block"
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
                            className="p-1 text-white/30 hover:text-primary transition-colors inline-block"
                            title="Edit content details"
                          >
                            <Edit className="size-3.5" />
                          </Link>
                          <button
                            onClick={() => void handleDelete(story.id)}
                            className="p-1 text-white/30 hover:text-red-400 transition-colors inline-block"
                            title="Delete permanetly"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 font-sans text-xs">
              <span className="text-white/30">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                >
                  Prev
                </button>
                <span className="text-white/40">
                  {page} / {Math.ceil(total / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / PAGE_SIZE)}
                  className="px-3 py-1 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
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
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111] border border-primary/20 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 text-xs font-sans text-white"
            >
              <span className="font-bold text-gold">{selectedIds.length} stories selected</span>
              <span className="text-white/20">|</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs rounded-full h-8 px-4"
                  onClick={() => handleBulkAction("publish")}
                >
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-xs text-white/80 rounded-full h-8 px-4"
                  onClick={() => handleBulkAction("draft")}
                >
                  Draft
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-xs text-white/80 rounded-full h-8 px-4"
                  onClick={() => handleBulkAction("archive")}
                >
                  Archive
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs rounded-full h-8 px-4"
                  onClick={() => handleBulkAction("delete")}
                >
                  Delete
                </Button>
              </div>
              <button
                onClick={() => setSelectedIds([])}
                className="text-white/40 hover:text-white ml-2 text-sm"
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
