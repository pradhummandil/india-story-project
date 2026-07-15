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
  ShieldAlert,
  Pin,
  Trophy,
  AlertTriangle,
  FileText,
  Plus,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/community/")({
  head: () => ({ meta: [{ title: "Community Moderation — Admin" }] }),
  component: AdminCommunityPage,
});

type Tab = "reports" | "spam" | "pinned" | "challenges" | "pending" | "approved" | "rejected" | "published" | "hidden" | "archived";

export default function AdminCommunityPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("reports");
  
  // Existing submission/story states
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  
  // New community moderation states
  const [reports, setReports] = useState<any[]>([]);
  const [spamTopics, setSpamTopics] = useState<any[]>([]);
  const [spamPosts, setSpamPosts] = useState<any[]>([]);
  const [pinnedTopics, setPinnedTopics] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  
  // New Challenge creation form state
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDesc, setChallengeDesc] = useState("");
  const [challengeRules, setChallengeRules] = useState("");
  const [challengeTheme, setChallengeTheme] = useState("");
  const [challengePrize, setChallengePrize] = useState("");
  const [challengeStart, setChallengeStart] = useState("");
  const [challengeEnd, setChallengeEnd] = useState("");
  const [showChallengeForm, setShowChallengeForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [previewStory, setPreviewStory] = useState<any | null>(null);
  const [rejectNotesId, setRejectNotesId] = useState<string | null>(null);
  const [rejectNotesText, setRejectNotesText] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterTheme, setFilterTheme] = useState("");
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
      if (["reports", "spam", "pinned", "challenges"].includes(activeTab)) {
        // Fetch new community moderation items
        const res = await fetch(`/api/admin/community/moderate?type=${activeTab}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const d = await res.json();
          if (activeTab === "reports") setReports(d.reports ?? []);
          else if (activeTab === "spam") {
            setSpamTopics(d.spamTopics ?? []);
            setSpamPosts(d.spamPosts ?? []);
          } else if (activeTab === "pinned") setPinnedTopics(d.pinnedTopics ?? []);
          else if (activeTab === "challenges") setChallenges(d.challenges ?? []);
        }
      } else if (["pending", "approved", "rejected"].includes(activeTab)) {
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

  // Moderate action dispatcher
  const handleModerateAction = async (action: string, targetType: string, targetId: string) => {
    if (!session) return;
    try {
      const res = await fetch("/api/admin/community/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action, targetType, targetId }),
      });
      if (res.ok) {
        void loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Action failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      const res = await fetch("/api/community/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: challengeTitle,
          description: challengeDesc,
          rules: challengeRules,
          theme: challengeTheme || undefined,
          prize: challengePrize || undefined,
          startAt: new Date(challengeStart).toISOString(),
          endAt: new Date(challengeEnd).toISOString(),
        }),
      });

      if (res.ok) {
        setChallengeTitle("");
        setChallengeDesc("");
        setChallengeRules("");
        setChallengeTheme("");
        setChallengePrize("");
        setShowChallengeForm(false);
        void loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create challenge");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submissions Approve/Reject
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
    if (!session || !confirm("Are you sure you want to delete this story?")) return;
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
    const notes = prompt("Enter rejection reason:");
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
    if (!confirm("Are you sure you want to delete selected stories?")) return;
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

  const processedSubmissions = submissions.filter((s) => {
    const matchSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const processedStories = stories.filter((s) => {
    const matchSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.authorName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <AdminLayout title="Community & Moderation" subtitle="Moderate forums, comments, regional groups and competitions">
      <div className="space-y-6">
        {/* Tabs Bar */}
        <div className="flex border-b border-white/10 overflow-x-auto pb-px">
          {([
            { id: "reports", label: "Abuse Reports" },
            { id: "spam", label: "Spam Queue" },
            { id: "pinned", label: "Pinned Threads" },
            { id: "challenges", label: "Writing Challenges" },
            { id: "pending", label: "Pending Submissions" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
            { id: "published", label: "Published Stories" },
            { id: "hidden", label: "Hidden" },
            { id: "archived", label: "Archived" },
          ] as { id: Tab; label: string }[]).map((tab) => (
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

        {/* Dynamic Panels */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 animate-pulse rounded border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 font-sans text-xs">
            {/* 1. REPORTS TAB */}
            {activeTab === "reports" && (
              <div className="bg-[#141414] border border-white/8 rounded overflow-hidden">
                {reports.length === 0 ? (
                  <div className="p-8 text-center text-white/30 italic">No reported posts at this time.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-white/50 uppercase tracking-widest text-[9px]">
                        <th className="p-4 font-bold">Reporter</th>
                        <th className="p-4 font-bold">Post Author</th>
                        <th className="p-4 font-bold">Reason</th>
                        <th className="p-4 font-bold">Topic/Content Preview</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/85">
                      {reports.map((r) => (
                        <tr key={r.id} className="hover:bg-white/3">
                          <td className="p-4 font-bold text-white/60">{r.user?.name || "Member"}</td>
                          <td className="p-4 font-bold text-white/60">{r.post?.user?.name || "Member"}</td>
                          <td className="p-4">
                            <span className="bg-red-950/20 border border-red-500/20 text-red-400 font-bold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded-full">
                              {r.reason}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs truncate">
                            <p className="font-bold text-white/40 mb-0.5">Topic: {r.post?.topic?.title}</p>
                            <p className="italic text-white/70">"{r.post?.content}"</p>
                          </td>
                          <td className="p-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleModerateAction("mark_spam", "post", r.post?.id)}
                              className="bg-red-950 text-red-400 hover:bg-red-900 px-2 py-1 uppercase tracking-wider text-[8px] font-bold"
                            >
                              Mark Spam
                            </button>
                            <button
                              onClick={() => handleModerateAction("restore", "post", r.post?.id)}
                              className="bg-white/5 border border-white/8 px-2 py-1 uppercase tracking-wider text-[8px] font-bold text-white/60 hover:text-white"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleModerateAction("delete", "post", r.post?.id)}
                              className="bg-destructive text-white px-2 py-1 uppercase tracking-wider text-[8px] font-bold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* 2. SPAM QUEUE */}
            {activeTab === "spam" && (
              <div className="space-y-4">
                <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">Spam discussions & posts</h3>
                <div className="bg-[#141414] border border-white/8 rounded overflow-hidden">
                  {spamTopics.length === 0 && spamPosts.length === 0 ? (
                    <div className="p-8 text-center text-white/30 italic">Spam queue is empty.</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {spamTopics.map((t) => (
                        <div key={t.id} className="p-4 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold uppercase bg-red-950/20 text-red-400 border border-red-500/10 px-2 py-0.5">
                              Spam Topic
                            </span>
                            <h4 className="font-bold text-white/80">{t.title}</h4>
                            <p className="text-[10px] text-white/40">By {t.user?.name}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleModerateAction("restore", "topic", t.id)}
                              className="bg-emerald-700 text-white px-2 py-1 uppercase tracking-wider text-[8px] font-bold"
                            >
                              Clean / Restore
                            </button>
                            <button
                              onClick={() => handleModerateAction("delete", "topic", t.id)}
                              className="bg-destructive text-white px-2 py-1 uppercase tracking-wider text-[8px] font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      {spamPosts.map((p) => (
                        <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold uppercase bg-red-950/20 text-red-400 border border-red-500/10 px-2 py-0.5">
                              Spam Reply
                            </span>
                            <p className="italic text-white/70">"{p.content}"</p>
                            <p className="text-[10px] text-white/40">By {p.user?.name} in "{p.topic?.title}"</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleModerateAction("restore", "post", p.id)}
                              className="bg-emerald-700 text-white px-2 py-1 uppercase tracking-wider text-[8px] font-bold"
                            >
                              Clean / Restore
                            </button>
                            <button
                              onClick={() => handleModerateAction("delete", "post", p.id)}
                              className="bg-destructive text-white px-2 py-1 uppercase tracking-wider text-[8px] font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. PINNED THREADS */}
            {activeTab === "pinned" && (
              <div className="bg-[#141414] border border-white/8 rounded overflow-hidden">
                {pinnedTopics.length === 0 ? (
                  <div className="p-8 text-center text-white/30 italic">No pinned threads.</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {pinnedTopics.map((t) => (
                      <div key={t.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-white/80 flex items-center gap-1.5">
                            <Pin className="size-3.5 text-primary fill-primary" /> {t.title}
                          </h4>
                          <p className="text-[10px] text-white/40">
                            By {t.user?.name} • Category: {t.category?.name || "General"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleModerateAction("unpin", "topic", t.id)}
                          className="bg-white/5 border border-white/10 text-white/60 hover:text-white px-3 py-1.5 uppercase tracking-wider text-[9px] font-bold"
                        >
                          Unpin Topic
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. WRITING CHALLENGES */}
            {activeTab === "challenges" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">Competitions & Story Challenges</h3>
                  <button
                    onClick={() => setShowChallengeForm(!showChallengeForm)}
                    className="flex items-center gap-1.5 bg-primary text-white text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:bg-primary/95"
                  >
                    <Plus className="size-3.5" />
                    New Challenge
                  </button>
                </div>

                {showChallengeForm && (
                  <form onSubmit={handleCreateChallenge} className="bg-[#141414] border border-white/10 p-5 rounded space-y-4 max-w-xl">
                    <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-primary border-b border-white/5 pb-2">
                      Create Story Challenge
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] uppercase tracking-wider text-white/40">Challenge Title</label>
                        <input
                          type="text"
                          required
                          value={challengeTitle}
                          onChange={(e) => setChallengeTitle(e.target.value)}
                          className="bg-black border border-white/8 w-full p-2 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-white/40">Theme state/tag</label>
                        <input
                          type="text"
                          value={challengeTheme}
                          onChange={(e) => setChallengeTheme(e.target.value)}
                          className="bg-black border border-white/8 w-full p-2 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-white/40">Prize Details</label>
                        <input
                          type="text"
                          value={challengePrize}
                          onChange={(e) => setChallengePrize(e.target.value)}
                          className="bg-black border border-white/8 w-full p-2 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-white/40">Start Date</label>
                        <input
                          type="datetime-local"
                          required
                          value={challengeStart}
                          onChange={(e) => setChallengeStart(e.target.value)}
                          className="bg-black border border-white/8 w-full p-2 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-white/40">End Date / Deadline</label>
                        <input
                          type="datetime-local"
                          required
                          value={challengeEnd}
                          onChange={(e) => setChallengeEnd(e.target.value)}
                          className="bg-black border border-white/8 w-full p-2 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] uppercase tracking-wider text-white/40">Description Overview</label>
                        <textarea
                          required
                          rows={3}
                          value={challengeDesc}
                          onChange={(e) => setChallengeDesc(e.target.value)}
                          className="bg-black border border-white/8 w-full p-2 text-xs text-white resize-none"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] uppercase tracking-wider text-white/40">Detailed Rules</label>
                        <textarea
                          required
                          rows={3}
                          value={challengeRules}
                          onChange={(e) => setChallengeRules(e.target.value)}
                          className="bg-black border border-white/8 w-full p-2 text-xs text-white resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowChallengeForm(false)}
                        className="bg-white/5 border border-white/8 text-white/40 px-3 py-1.5 uppercase font-bold text-[9px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-white px-4 py-1.5 uppercase font-bold text-[9px]"
                      >
                        Launch Competition
                      </button>
                    </div>
                  </form>
                )}

                <div className="bg-[#141414] border border-white/8 rounded overflow-hidden">
                  {challenges.length === 0 ? (
                    <div className="p-8 text-center text-white/30 italic">No challenges launched yet.</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-white/50 uppercase tracking-widest text-[9px]">
                          <th className="p-4 font-bold">Challenge Title</th>
                          <th className="p-4 font-bold">Theme / State</th>
                          <th className="p-4 font-bold">Prize</th>
                          <th className="p-4 font-bold">Entries</th>
                          <th className="p-4 font-bold">Status</th>
                          <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/85">
                        {challenges.map((c) => {
                          const isEnded = new Date(c.endAt).getTime() < Date.now();
                          return (
                            <tr key={c.id}>
                              <td className="p-4 font-bold text-white">{c.title}</td>
                              <td className="p-4 text-primary font-bold">{c.theme || "—"}</td>
                              <td className="p-4">{c.prize || "Badge / XP"}</td>
                              <td className="p-4 font-mono">{c._count?.entries ?? 0}</td>
                              <td className="p-4">
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                                  isEnded ? "bg-red-950/20 text-red-400 border border-red-500/10" : "bg-emerald-950/20 text-emerald-400 border border-emerald-500/10"
                                }`}>
                                  {isEnded ? "Ended" : "Active"}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleModerateAction("delete", "challenge", c.id)}
                                  className="bg-destructive hover:bg-destructive/95 text-white px-2.5 py-1 uppercase font-bold text-[8px] tracking-wider"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── EXISTING: SUBMISSIONS LIST ── */}
            {(activeTab === "pending" || activeTab === "approved" || activeTab === "rejected") && (
              <div className="bg-[#141414] border border-white/8 rounded overflow-hidden">
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
                          <td className="p-4 text-right space-x-2">
                            <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 rounded-sm border-white/10 text-white" onClick={() => setPreviewStory(s)}>
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

            {/* ── EXISTING: STORIES LIST ── */}
            {(activeTab === "published" || activeTab === "hidden" || activeTab === "archived") && (
              <div className="bg-[#141414] border border-white/8 rounded overflow-hidden">
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
                          <td className="p-4 text-white/40">{st.viewCount || 0}</td>
                          <td className="p-4 text-right space-x-2">
                            {activeTab !== "published" && (
                              <Button size="sm" className="h-7 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm" onClick={() => handleStoryVisibility(st.id, "Published")}>
                                Publish
                              </Button>
                            )}
                            {activeTab !== "hidden" && (
                              <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 border-white/10 text-white" onClick={() => handleStoryVisibility(st.id, "Hidden")}>
                                Hide
                              </Button>
                            )}
                            {activeTab !== "archived" && (
                              <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 border-white/10 text-white/60" onClick={() => handleStoryVisibility(st.id, "Archived")}>
                                Archive
                              </Button>
                            )}
                            <Button size="sm" className="h-7 text-[10px] px-2 bg-destructive hover:bg-destructive/90 text-white rounded-sm animate-none" onClick={() => handleDeleteStory(st.id)}>
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

        {/* ── PREVIEW STORY MODAL ── */}
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
                  <Button variant="outline" className="border-white/10 rounded-sm text-white" onClick={() => setPreviewStory(null)}>Close</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── REJECT CONTRIBUTION FEEDBACK MODAL ── */}
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
                  <Button variant="outline" className="border-white/10 text-xs rounded-sm text-white" onClick={() => setRejectNotesId(null)}>Cancel</Button>
                  <Button className="bg-destructive hover:bg-destructive/90 text-xs rounded-sm text-white" onClick={() => handleSubAction(rejectNotesId, "Reject")}>Submit Rejection</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
