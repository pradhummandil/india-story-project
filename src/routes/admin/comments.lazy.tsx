import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageSquare, Check, X, Trash2, ShieldAlert, User, AlertTriangle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

export const Route = createLazyFileRoute("/admin/comments")({
  component: AdminCommentsPage,
});

type Tab = "all" | "pending" | "approved" | "flagged";

export default function AdminCommentsPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [comments, setComments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  // Reset page when activeTab changes
  useEffect(() => {
    setPage(1);
    setErrorMsg(null);
  }, [activeTab]);

  const loadData = async () => {
    if (!session) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams({
        filter: activeTab,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/comments?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (activeTab === "flagged") {
          setReports(data.reports || []);
          setTotal(data.total ?? 0);
        } else {
          setComments(data.comments || []);
          setTotal(data.total ?? 0);
        }
      } else {
        throw new Error("Failed to load comments data.");
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Failed to load database comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void loadData();
    }
  }, [user, activeTab, page]);

  const handleAction = async (commentId: string | null, action: string, reportId?: string) => {
    if (!session) return;
    try {
      const res = await fetch("/api/admin/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ commentId, action, reportId }),
      });

      if (res.ok) {
        void loadData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Action execution failed.");
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Server connection failure.");
    }
  };

  const SkeletonRow = () => (
    <div className="h-16 bg-[#121212] border border-white/5 rounded-lg flex items-center justify-between px-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-white/5" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-white/5 rounded" />
          <div className="h-2.5 w-16 bg-white/5 rounded" />
        </div>
      </div>
      <div className="h-3 w-40 bg-white/5 rounded hidden md:block" />
      <div className="h-4 w-12 bg-white/5 rounded" />
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto select-none">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-white/5 pb-5 gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-wide">
              Reader Comments
            </h1>
            <p className="text-[10px] font-sans text-white/40 uppercase tracking-widest mt-1.5 font-bold">
              Review reader conversations, approve pending comments, and handle reports
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="size-5 text-red-400 shrink-0" />
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Moderation Error</h4>
              <p className="text-xs text-white/60 font-sans">{errorMsg}</p>
              <Button
                onClick={loadData}
                size="sm"
                className="h-7 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white mt-1 cursor-pointer"
              >
                Retry Request
              </Button>
            </div>
          </div>
        )}

        {/* Tab switchers */}
        <div className="flex bg-[#121212] border border-white/5 p-1 rounded-lg self-start max-w-lg gap-1">
          {(
            [
              { id: "all", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "flagged", label: "Reports" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-black shadow-md"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : activeTab === "flagged" ? (
          /* FLAGGED REPORTS CARD LIST */
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="bg-[#121212] border border-white/5 rounded-lg p-12 text-center flex flex-col items-center justify-center gap-3">
                <ShieldAlert className="size-8 text-white/20" />
                <p className="text-xs text-white/40 font-sans">
                  No flagged comment reports. All clear!
                </p>
              </div>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-[#121212] border border-white/5 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/40">
                      <span className="font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider text-[9px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                        <ShieldAlert className="size-3" /> Flagged
                      </span>
                      <span className="font-sans">
                        Reported by <span className="font-semibold text-white/70">{rep.reporterName}</span> · {rep.reporterEmail}
                      </span>
                    </div>
                    <div className="bg-black/30 border border-white/5 rounded-lg p-4 text-xs font-sans text-white/90 italic leading-relaxed">
                      "{rep.commentContent}"
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/40 font-bold uppercase tracking-wider">
                      <span>Author: <span className="text-white/60">{rep.commentAuthor}</span></span>
                      <span>Dispatch: <span className="text-white/60">{rep.storyTitle}</span></span>
                    </div>
                    <div className="bg-yellow-500/5 border border-yellow-500/15 text-yellow-400 text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-1 inline-flex items-center gap-1.5">
                      ⚠️ Reason: {rep.reason}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch md:items-start lg:items-center gap-2 shrink-0 justify-center">
                    <Button
                      size="sm"
                      className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer"
                      onClick={() => handleAction(rep.commentId, "approve", rep.id)}
                    >
                      Approve Comment
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-md cursor-pointer"
                      onClick={() => handleAction(rep.commentId, "delete", rep.id)}
                    >
                      Remove Comment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider border-white/10 text-white/60 hover:text-white rounded-md cursor-pointer"
                      onClick={() => handleAction(null, "dismissReport", rep.id)}
                    >
                      Dismiss Report
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* STANDARD COMMENTS LIST TABLE */
          <div className="bg-[#121212] border border-white/5 rounded-lg overflow-hidden">
            {comments.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <MessageSquare className="size-8 text-white/20" />
                <p className="text-xs text-white/40 font-sans">
                  No comments found in this queue.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2 text-white/40 uppercase tracking-wider text-[9px] font-bold">
                      <th className="p-4">Reader</th>
                      <th className="p-4">Comment</th>
                      <th className="p-4">Story Dispatch</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/70">
                    {comments.map((c) => (
                      <tr key={c.id} className="hover:bg-white/2 transition-colors duration-150">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {c.authorAvatar ? (
                              <img
                                src={c.authorAvatar}
                                className="size-7 rounded-full object-cover border border-white/10"
                                alt=""
                              />
                            ) : (
                              <div className="size-7 rounded-full bg-[#C8A96A]/10 border border-[#C8A96A]/20 flex items-center justify-center font-bold text-[10px] text-[#C8A96A]">
                                {c.authorName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white/90">{c.authorName}</p>
                              <p className="text-[10px] text-white/30">{c.authorEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 max-w-xs truncate text-white/90">{c.content}</td>
                        <td className="p-4 font-medium text-white/50 max-w-xs truncate">
                          {c.storyTitle}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold border ${
                              c.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                                : c.status === "rejected"
                                  ? "bg-red-500/10 text-red-400 border-red-500/15"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/15"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status !== "approved" && (
                              <button
                                onClick={() => handleAction(c.id, "approve")}
                                className="size-7 rounded-md border border-white/5 bg-white/2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors flex items-center justify-center cursor-pointer"
                                title="Approve Comment"
                              >
                                <Check className="size-3.5" />
                              </button>
                            )}
                            {c.status !== "rejected" && (
                              <button
                                onClick={() => handleAction(c.id, "reject")}
                                className="size-7 rounded-md border border-white/5 bg-white/2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center justify-center cursor-pointer"
                                title="Reject Comment"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleAction(c.id, "delete")}
                              className="size-7 rounded-md border border-white/5 bg-white/2 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center cursor-pointer"
                              title="Delete Comment Content"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && total > PAGE_SIZE && (
          <div className="flex items-center justify-between p-4 bg-[#121212] border border-white/5 rounded-lg font-sans text-[11px]">
            <span className="text-white/40">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} comments
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 text-white/40 hover:text-white disabled:opacity-20 transition-colors font-bold uppercase cursor-pointer"
              >
                Prev
              </button>
              <span className="text-white/50 px-2 font-mono">
                {page} / {Math.ceil(total / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / PAGE_SIZE)}
                className="px-2.5 py-1 text-white/40 hover:text-white disabled:opacity-20 transition-colors font-bold uppercase cursor-pointer"
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
