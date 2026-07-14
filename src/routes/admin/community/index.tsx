import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Lock,
  ChevronRight,
  FolderOpen,
  MapPin,
  Clock,
  Archive,
  User,
  ExternalLink,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/community/")({
  head: () => ({ meta: [{ title: "Community Reviews — Admin" }] }),
  component: AdminCommunityPage,
});

type Tab = "pending" | "approved" | "rejected" | "published" | "hidden" | "archived";

export default function AdminCommunityPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewStory, setPreviewStory] = useState<any | null>(null);
  const [rejectNotesId, setRejectNotesId] = useState<string | null>(null);
  const [rejectNotesText, setRejectNotesText] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterState, setFilterState] = useState("");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  const loadData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      if (activeTab === "pending" || activeTab === "approved" || activeTab === "rejected") {
        // Fetch submissions
        const res = await fetch("/api/admin/submissions", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const filtered = (data.submissions || []).filter((s: any) => {
            if (activeTab === "pending") return s.status === "Pending";
            if (activeTab === "approved") return s.status === "Approved";
            return s.status === "Rejected";
          });
          setSubmissions(filtered);
        }
      } else {
        // Fetch published, hidden, archived stories
        const statusMap = { published: "Published", hidden: "Hidden", archived: "Archived" };
        const res = await fetch(`/api/admin/stories?status=${statusMap[activeTab as "published" | "hidden" | "archived"]}&pageSize=100`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStories(data.stories || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void loadData();
    }
  }, [user, activeTab]);

  const handleSubAction = async (submissionId: string, action: "Approve" | "Reject") => {
    if (!session) return;
    try {
      const res = await fetch("/api/admin/submissions/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          submissionId,
          action,
          adminNotes: action === "Reject" ? rejectNotesText : undefined,
        }),
      });

      if (res.ok) {
        setRejectNotesId(null);
        setRejectNotesText("");
        setPreviewStory(null);
        void loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStoryVisibility = async (storyId: string, status: "Published" | "Hidden" | "Archived") => {
    if (!session) return;
    try {
      const res = await fetch("/api/admin/stories/visibility", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ storyId, status }),
      });

      if (res.ok) {
        void loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!session) return;
    if (!confirm("Are you sure you want to delete this story? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/stories/${storyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        void loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkApprove = async () => {
    if (!session || selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to approve ${selectedIds.length} submissions?`)) return;
    setBulkActionLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch("/api/admin/submissions/action", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ submissionId: id, action: "Approve" }),
          })
        )
      );
      setSelectedIds([]);
      void loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (!session || selectedIds.length === 0) return;
    const notes = prompt("Enter rejection reason for selected submissions:");
    if (notes === null) return;
    setBulkActionLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch("/api/admin/submissions/action", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ submissionId: id, action: "Reject", adminNotes: notes }),
          })
        )
      );
      setSelectedIds([]);
      void loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!session || selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} stories? This cannot be undone.`)) return;
    setBulkActionLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/admin/stories/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
        )
      );
      setSelectedIds([]);
      void loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const processedSubmissions = submissions
    .filter((s) => {
      const matchSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = !filterCategory || s.categoryName === filterCategory;
      const matchSt = !filterState || s.stateName === filterState;
      return matchSearch && matchCat && matchSt;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "author") return (a.user?.name || "").localeCompare(b.user?.name || "");
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const processedStories = stories
    .filter((s) => {
      const matchSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.authorName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = !filterCategory || s.category === filterCategory;
      const matchSt = !filterState || s.region === filterState;
      return matchSearch && matchCat && matchSt;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "author") return (a.authorName || "").localeCompare(b.authorName || "");
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const categoryOptions = Array.from(
    new Set(
      activeTab === "pending" || activeTab === "approved" || activeTab === "rejected"
        ? submissions.map((s) => s.categoryName).filter(Boolean)
        : stories.map((s) => s.category).filter(Boolean)
    )
  ) as string[];

  const stateOptions = Array.from(
    new Set(
      activeTab === "pending" || activeTab === "approved" || activeTab === "rejected"
        ? submissions.map((s) => s.stateName).filter(Boolean)
        : stories.map((s) => s.region).filter(Boolean)
    )
  ) as string[];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (allIds: string[]) => {
    if (selectedIds.length === allIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">Community & Moderation</h1>
          <p className="text-xs font-sans text-white/50 uppercase tracking-widest mt-1">Review guest contributions and moderate comments/stories</p>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-white/10 overflow-x-auto pb-px">
          {([
            { id: "pending", label: "Pending Submissions" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
            { id: "published", label: "Published Stories" },
            { id: "hidden", label: "Hidden" },
            { id: "archived", label: "Archived" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs uppercase tracking-widest font-sans font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-white bg-primary/5"
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Filter, Sort and Bulk Actions Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-zinc-950/40 p-4 border border-white/10 rounded">
          {/* Left: Search, Filter, Sort */}
          <div className="flex flex-wrap gap-2 items-center flex-1 max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, contributor..."
              className="bg-zinc-900 border border-white/10 text-white text-xs px-3 h-9 rounded focus:outline-none focus:border-primary/50 w-full sm:w-[200px]"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-zinc-900 border border-white/10 text-white/70 text-xs px-2 h-9 rounded outline-none"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="bg-zinc-900 border border-white/10 text-white/70 text-xs px-2 h-9 rounded outline-none"
            >
              <option value="">All States</option>
              {stateOptions.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-white/10 text-white/70 text-xs px-2 h-9 rounded outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="author">Author (A-Z)</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* Right: Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                {selectedIds.length} selected
              </span>
              {bulkActionLoading ? (
                <span className="text-[10px] text-white/50 animate-pulse font-sans">Processing...</span>
              ) : (
                <div className="flex gap-1.5">
                  {(activeTab === "pending" || activeTab === "approved" || activeTab === "rejected") ? (
                    <>
                      {activeTab === "pending" && (
                        <button
                          onClick={handleBulkApprove}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-[9px] uppercase tracking-wider h-6 px-2.5 rounded cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={handleBulkReject}
                        className="bg-destructive hover:bg-destructive/95 text-white font-sans font-bold text-[9px] uppercase tracking-wider h-6 px-2.5 rounded cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleBulkDelete}
                      className="bg-destructive hover:bg-destructive/95 text-white font-sans font-bold text-[9px] uppercase tracking-wider h-6 px-2.5 rounded cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedIds([])}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 font-sans text-[9px] uppercase tracking-wider h-6 px-2 rounded cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Listing */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#161616] animate-pulse rounded border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* SUBMISSIONS LIST */}
            {(activeTab === "pending" || activeTab === "approved" || activeTab === "rejected") && (
              <div className="bg-[#161616] border border-white/10 rounded overflow-hidden">
                {processedSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-sm font-sans text-white/40">No contributions found matching your filters.</div>
                ) : (
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-white/60 uppercase tracking-wider text-[10px]">
                        <th className="p-4 w-10">
                          <input
                            type="checkbox"
                            checked={selectedIds.length > 0 && selectedIds.length === processedSubmissions.length}
                            onChange={() => toggleSelectAll(processedSubmissions.map((s) => s.id))}
                            className="rounded bg-zinc-900 border-white/10 cursor-pointer"
                          />
                        </th>
                        <th className="p-4 font-bold">Contributor</th>
                        <th className="p-4 font-bold">Title</th>
                        <th className="p-4 font-bold">Category/Region</th>
                        <th className="p-4 font-bold">Submitted Date</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {processedSubmissions.map((s) => (
                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 w-10">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(s.id)}
                              onChange={() => toggleSelect(s.id)}
                              className="rounded bg-zinc-900 border-white/10 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 font-medium">
                            <div className="flex items-center gap-2">
                              {s.user?.avatarUrl ? (
                                <img src={s.user.avatarUrl} className="size-6 rounded-full object-cover" alt="" />
                              ) : (
                                <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px] text-primary">
                                  {s.user?.name?.slice(0, 1) || "C"}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-white">{s.user?.name || "Anonymous"}</p>
                                <p className="text-[10px] text-white/40">{s.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 max-w-xs font-semibold text-white truncate">{s.title}</td>
                          <td className="p-4">
                            <p className="text-primary font-bold">{s.categoryName}</p>
                            <p className="text-white/40">{s.stateName}</p>
                          </td>
                          <td className="p-4 text-white/40">{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                          <td className="p-4 text-right space-x-2">
                            <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 rounded-sm border-white/10" onClick={() => setPreviewStory(s)}>
                              <Eye className="size-3 mr-1" /> Preview
                            </Button>
                            {activeTab === "pending" && (
                              <>
                                <Button size="sm" className="h-7 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm" onClick={() => handleSubAction(s.id, "Approve")}>
                                  Approve
                                </Button>
                                <Button size="sm" className="h-7 text-[10px] px-2 bg-destructive hover:bg-destructive/90 text-white rounded-sm" onClick={() => { setRejectNotesId(s.id); setRejectNotesText(""); }}>
                                  Reject
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* SYSTEM STORIES LIST */}
            {(activeTab === "published" || activeTab === "hidden" || activeTab === "archived") && (
              <div className="bg-[#161616] border border-white/10 rounded overflow-hidden">
                {processedStories.length === 0 ? (
                  <div className="p-8 text-center text-sm font-sans text-white/40">No stories found matching your filters.</div>
                ) : (
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-white/60 uppercase tracking-wider text-[10px]">
                        <th className="p-4 w-10">
                          <input
                            type="checkbox"
                            checked={selectedIds.length > 0 && selectedIds.length === processedStories.length}
                            onChange={() => toggleSelectAll(processedStories.map((s) => s.id))}
                            className="rounded bg-zinc-900 border-white/10 cursor-pointer"
                          />
                        </th>
                        <th className="p-4 font-bold">Title</th>
                        <th className="p-4 font-bold">Author</th>
                        <th className="p-4 font-bold">Category/Region</th>
                        <th className="p-4 font-bold">Views</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {processedStories.map((st) => (
                        <tr key={st.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 w-10">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(st.id)}
                              onChange={() => toggleSelect(st.id)}
                              className="rounded bg-zinc-900 border-white/10 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 max-w-sm font-semibold text-white truncate">{st.title}</td>
                          <td className="p-4 font-semibold text-white/70">{st.authorName || "Staff"}</td>
                          <td className="p-4">
                            <p className="text-primary font-bold">{st.category}</p>
                            <p className="text-white/40">{st.region}</p>
                          </td>
                          <td className="p-4 text-white/40">{st.viewCount || 0}</td>
                          <td className="p-4 text-right space-x-2">
                            {activeTab !== "published" && (
                              <Button size="sm" className="h-7 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm" onClick={() => handleStoryVisibility(st.id, "Published")}>
                                Publish
                              </Button>
                            )}
                            {activeTab !== "hidden" && (
                              <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 border-white/10" onClick={() => handleStoryVisibility(st.id, "Hidden")}>
                                Hide
                              </Button>
                            )}
                            {activeTab !== "archived" && (
                              <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 border-white/10 text-white/60" onClick={() => handleStoryVisibility(st.id, "Archived")}>
                                Archive
                              </Button>
                            )}
                            <Button size="sm" className="h-7 text-[10px] px-2 bg-destructive hover:bg-destructive/90 text-white rounded-sm" onClick={() => handleDeleteStory(st.id)}>
                              <Trash2 className="size-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* PREVIEW MODAL */}
        <AnimatePresence>
          {previewStory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#161616] border border-white/10 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col"
              >
                <div className="p-6 border-b border-white/10 flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-primary font-bold">{previewStory.categoryName}</span>
                    <h2 className="font-display text-xl font-bold text-white mt-1">{previewStory.title}</h2>
                    <p className="text-[10px] text-white/40 font-sans mt-0.5">By {previewStory.authorName} ({previewStory.stateName})</p>
                  </div>
                  <button onClick={() => setPreviewStory(null)} className="text-white/40 hover:text-white">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4 text-sm font-sans text-white/80 leading-relaxed whitespace-pre-wrap">
                  {previewStory.imageUrl && (
                    <img src={previewStory.imageUrl} className="w-full h-48 object-cover rounded-lg mb-4" alt="" />
                  )}
                  <strong>Excerpt:</strong>
                  <p className="italic text-white/60 pl-3 border-l-2 border-primary">{previewStory.excerpt}</p>
                  <hr className="border-white/10" />
                  <strong>Story Body:</strong>
                  <p>{previewStory.content}</p>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-2">
                  <Button variant="outline" className="border-white/10 rounded-sm" onClick={() => setPreviewStory(null)}>Close</Button>
                  {previewStory.status === "Pending" && (
                    <>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm" onClick={() => handleSubAction(previewStory.id, "Approve")}>Approve Submission</Button>
                      <Button className="bg-destructive hover:bg-destructive/95 text-white rounded-sm" onClick={() => { setRejectNotesId(previewStory.id); setRejectNotesText(""); }}>Reject</Button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* REJECT NOTES MODAL */}
        <AnimatePresence>
          {rejectNotesId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-[#161616] border border-white/10 rounded p-6 max-w-sm w-full space-y-4"
              >
                <h3 className="font-display text-lg font-bold text-white">Reject Contribution</h3>
                <textarea
                  placeholder="Enter feedback or reasons for rejection..."
                  value={rejectNotesText}
                  onChange={(e) => setRejectNotesText(e.target.value)}
                  className="w-full min-h-[100px] border border-white/10 bg-transparent rounded p-2 text-xs font-sans text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="border-white/10 text-xs rounded-sm" onClick={() => setRejectNotesId(null)}>Cancel</Button>
                  <Button className="bg-destructive hover:bg-destructive/90 text-xs rounded-sm" onClick={() => handleSubAction(rejectNotesId, "Reject")}>Submit Rejection</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
