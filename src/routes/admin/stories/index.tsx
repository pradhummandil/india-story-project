import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/stories/")({
  head: () => ({ meta: [{ title: "Stories — Admin" }] }),
  component: AdminStoriesPage,
});

type StoryRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  featured: boolean;
  category: string;
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
      className={`text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border ${STATUS_STYLES[status] ?? "bg-white/5 text-white/30 border-white/10"}`}
    >
      {status}
    </span>
  );
}

export default function AdminStoriesPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      ...(query ? { query } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    });
    fetch(`/api/admin/stories?${params}`)
      .then((r) => r.json())
      .then((data: any) => {
        setStories(data.stories ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, page, query, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story? This cannot be undone.")) return;
    await fetch(`/api/admin/stories/${id}`, { method: "DELETE" });
    setStories((prev) => prev.filter((s) => s.id !== id));
    setTotal((t) => t - 1);
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await fetch(`/api/admin/stories/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ featured: !current }),
    });
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, featured: !current } : s)));
  };

  return (
    <AdminLayout title="Stories" subtitle={`${total.toLocaleString()} total stories`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input
            id="admin-stories-search"
            type="text"
            placeholder="Search stories…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-10 rounded-sm bg-white/5 border-white/10 text-white/80 placeholder:text-white/20 focus:border-primary/50 font-sans text-sm"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          {["all", "Published", "Draft", "Archived"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-sans font-semibold uppercase tracking-widest rounded-sm transition-colors ${
                statusFilter === s
                  ? "bg-primary text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        <Link to="/admin/stories/new">
          <Button
            id="admin-create-story-btn"
            className="h-10 px-4 rounded-sm bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest gap-2 whitespace-nowrap"
          >
            <Plus className="size-4" />
            New Story
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-[#161616] border border-white/10 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Title", "Category", "State", "Status", "Views", "Published", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-white/30"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : stories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-white/20 font-sans text-xs"
                  >
                    No stories found.
                  </td>
                </tr>
              ) : (
                stories.map((story) => (
                  <motion.tr
                    key={story.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/3 transition-colors group"
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        {story.featured && <Star className="size-3 text-gold flex-shrink-0" />}
                        <span className="text-white/80 font-sans text-sm truncate">
                          {story.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/40 font-sans text-xs whitespace-nowrap">
                      {story.category}
                    </td>
                    <td className="px-4 py-3 text-white/40 font-sans text-xs whitespace-nowrap">
                      {story.region}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={story.status} />
                    </td>
                    <td className="px-4 py-3 text-white/40 font-sans text-xs">
                      {story.viewCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-white/30 font-sans text-xs whitespace-nowrap">
                      {story.publishedAt
                        ? new Date(story.publishedAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`/stories/${story.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white/30 hover:text-white transition-colors"
                          title="View"
                        >
                          <Eye className="size-4" />
                        </a>
                        <button
                          onClick={() => void handleToggleFeatured(story.id, story.featured)}
                          className={`transition-colors ${story.featured ? "text-gold" : "text-white/30 hover:text-gold"}`}
                          title="Toggle featured"
                        >
                          <Star className="size-4" />
                        </button>
                        <Link
                          to="/admin/stories/$id/edit"
                          params={{ id: story.id }}
                          className="text-white/30 hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit className="size-4" />
                        </Link>
                        <button
                          onClick={() => void handleDelete(story.id)}
                          className="text-white/30 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-white/30 font-sans">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs font-sans text-white/40 hover:text-white disabled:opacity-20 transition-colors"
              >
                Prev
              </button>
              <span className="text-xs text-white/40 font-sans">
                {page} / {Math.ceil(total / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / PAGE_SIZE)}
                className="px-3 py-1 text-xs font-sans text-white/40 hover:text-white disabled:opacity-20 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
