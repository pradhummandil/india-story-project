import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Pin,
  Lock,
  Eye,
  Plus,
  MessageCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/community/forums")({
  component: ForumsPage,
});

export default function ForumsPage() {
  const navigate = useNavigate();
  const { user, session } = useAuthStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // New Topic Form state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // Fetch categories
    fetch("/api/community/forums")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(console.error);
  }, []);

  const loadTopics = () => {
    setLoading(true);
    const catQuery = selectedCategory ? `&categoryId=${selectedCategory}` : "";
    const searchQuery = search ? `&q=${encodeURIComponent(search)}` : "";
    fetch(`/api/community/topics?sort=${sort}&page=${page}&limit=15${catQuery}${searchQuery}`)
      .then((r) => r.json())
      .then((d) => {
        setTopics(d.topics ?? []);
        setTotalPages(d.totalPages ?? 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTopics();
  }, [selectedCategory, sort, page]);

  // Debounced/Submit handler for search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTopics();
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!title || !content || !categoryId) {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/community/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title, content, categoryId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create discussion");
      }

      const d = await res.json();
      setShowModal(false);
      setTitle("");
      setContent("");
      setCategoryId("");
      // Navigate to the newly created topic page
      void navigate({ to: `/community/topics/${d.topic.id}` });
    } catch (err: any) {
      setFormError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Forum Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Community Discussion Forums
          </h1>
          <p className="text-xs text-white/40 font-sans mt-1">
            Browse through categories, engage in Q&A, and collaborate on stories.
          </p>
        </div>
        {user ? (
          <button
            onClick={() => {
              setShowModal(true);
              if (categories.length > 0) setCategoryId(categories[0].id);
            }}
            className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-sans font-bold uppercase tracking-widest px-4 py-2 hover:bg-primary/95 transition-colors"
          >
            <Plus className="size-3.5" />
            New Topic
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-white/5 border border-white/10 text-[10px] font-sans font-bold uppercase tracking-widest px-4 py-2 text-white/50 hover:text-white transition-colors"
          >
            Sign in to Post
          </Link>
        )}
      </div>

      {/* ── Category Select Chips ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setPage(1);
          }}
          className={`px-3 py-1.5 text-[10px] font-sans font-bold uppercase tracking-widest border transition-colors flex-shrink-0 ${
            selectedCategory === null
              ? "bg-primary/10 border-primary text-primary"
              : "bg-white/5 border-white/8 text-white/40 hover:text-white/70"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-[10px] font-sans font-bold uppercase tracking-widest border transition-colors flex-shrink-0 flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? "bg-primary/10 border-primary text-primary"
                : "bg-white/5 border-white/8 text-white/40 hover:text-white/70"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <span className="text-[8px] bg-white/5 px-1 py-0.2 rounded-full text-white/30">
              {cat._count?.topics ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* ── Controls: Sort & Search ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#121212] border border-white/5 p-4 rounded-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "latest", label: "Latest" },
            { id: "hot", label: "Hot & Active" },
            { id: "top", label: "Top Views" },
            { id: "unanswered", label: "Unanswered" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSort(s.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-[9px] font-sans font-bold uppercase tracking-widest transition-colors ${
                sort === s.id ? "bg-white/8 text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-3.5 text-white/30 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black border border-white/8 pl-9 pr-4 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/20 w-full sm:w-60 font-sans"
            />
          </div>
          <button
            type="submit"
            className="bg-white/5 border border-white/8 px-3 py-1.5 text-[9px] font-sans font-bold uppercase tracking-widest text-white/55 hover:text-white hover:bg-white/8 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* ── Topics List ── */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-sm animate-pulse" />
          ))
        ) : topics.length === 0 ? (
          <div className="text-center py-12 bg-[#121212] border border-white/5 rounded-sm text-white/20 text-xs font-sans">
            No discussion topics found. Be the first to start a discussion!
          </div>
        ) : (
          topics.map((t) => (
            <div
              key={t.id}
              className="bg-[#121212] border border-white/5 hover:border-white/10 p-4 transition-colors rounded-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                {t.user?.avatarUrl ? (
                  <img
                    src={t.user.avatarUrl}
                    alt={t.user.name}
                    className="size-8 rounded-full object-cover mt-0.5"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 mt-0.5">
                    {t.user?.name?.[0] || "M"}
                  </div>
                )}
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {t.isPinned && (
                      <Pin className="size-3 text-primary fill-primary flex-shrink-0" />
                    )}
                    {t.isLocked && <Lock className="size-3 text-white/30 flex-shrink-0" />}
                    <Link
                      to={`/community/topics/${t.id}` as any}
                      className="text-xs font-sans font-bold text-white/80 hover:text-white transition-colors truncate max-w-md sm:max-w-xl"
                    >
                      {t.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-white/30 font-sans flex-wrap">
                    <span
                      className="font-bold uppercase tracking-wider"
                      style={{ color: t.category?.color || "#C8A96A" }}
                    >
                      {t.category?.name || "General"}
                    </span>
                    <span>•</span>
                    <span>By {t.user?.name || "Member"}</span>
                    <span>•</span>
                    <span>Active {new Date(t.lastActivityAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right text-[10px] text-white/30 font-sans flex-shrink-0">
                <div>
                  <p className="font-bold text-white/50 flex items-center justify-end gap-1">
                    <MessageCircle className="size-3" /> {t.replyCount}
                  </p>
                  <p className="uppercase tracking-widest text-[8px]">Replies</p>
                </div>
                <div className="hidden sm:block">
                  <p className="font-bold text-white/40 flex items-center justify-end gap-1">
                    <Eye className="size-3" /> {t.viewCount}
                  </p>
                  <p className="uppercase tracking-widest text-[8px]">Views</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination controls ── */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-[#121212] border border-white/5 p-4 rounded-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="bg-white/5 border border-white/8 px-4 py-2 text-[10px] font-sans font-bold uppercase tracking-widest text-white/50 hover:text-white disabled:opacity-30 disabled:hover:text-white/50 transition-colors"
          >
            Previous
          </button>
          <span className="text-[10px] text-white/30 font-sans">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="bg-white/5 border border-white/8 px-4 py-2 text-[10px] font-sans font-bold uppercase tracking-widest text-white/50 hover:text-white disabled:opacity-30 disabled:hover:text-white/50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* ── New Topic Modal Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 p-6 rounded-sm w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/80">
                Create New Topic
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs text-white/30 hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <p className="text-red-500 text-[10px] font-sans uppercase tracking-widest bg-red-950/20 border border-red-500/20 p-2 text-center">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreateTopic} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="block text-white/40 uppercase tracking-wider text-[9px] font-bold">
                  Discussion Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. History of local stepwells in Bundi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black border border-white/8 w-full p-2.5 text-white focus:outline-none focus:border-white/20 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-white/40 uppercase tracking-wider text-[9px] font-bold">
                    Category Portal
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="bg-black border border-white/8 w-full p-2.5 text-white focus:outline-none focus:border-white/20 text-xs"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-white/40 uppercase tracking-wider text-[9px] font-bold">
                  Topic Content
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Describe your discussion topic or research details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-black border border-white/8 w-full p-2.5 text-white focus:outline-none focus:border-white/20 text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white/5 border border-white/8 px-4 py-2 text-[10px] font-sans font-bold uppercase tracking-widest text-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white px-5 py-2 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-primary/95 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
