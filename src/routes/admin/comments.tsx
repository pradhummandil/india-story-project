import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Check, X, Trash2, ShieldAlert, ArrowRight, User } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/comments")({
  head: () => ({ meta: [{ title: "Comments Moderation — Admin" }] }),
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
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  // Reset page when activeTab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const loadData = async () => {
    if (!session) return;
    setLoading(true);
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">
            Comment Moderation
          </h1>
          <p className="text-xs font-sans text-white/50 uppercase tracking-widest mt-1">
            Review reader comments and manage reports
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 overflow-x-auto pb-px">
          {(
            [
              { id: "all", label: "All Comments" },
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "flagged", label: "Flagged Reports" },
            ] as const
          ).map((tab) => (
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

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-[#161616] animate-pulse rounded border border-white/5"
              />
            ))}
          </div>
        ) : activeTab === "flagged" ? (
          /* FLAGGED REPORTS */
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="bg-[#161616] border border-white/10 rounded p-8 text-center text-sm text-white/40 font-sans">
                No flagged comment reports.
              </div>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-[#161616] border border-white/10 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-red-400 flex items-center gap-1">
                        <ShieldAlert className="size-3.5" /> Flagged
                      </span>
                      <span className="text-white/40 font-sans">
                        Reported by {rep.reporterName} ({rep.reporterEmail})
                      </span>
                    </div>
                    <div className="bg-black/20 border border-white/5 rounded p-3 text-xs font-sans text-white/80 italic">
                      " {rep.commentContent} "
                    </div>
                    <p className="text-[10px] text-white/40 font-sans">
                      Author:{" "}
                      <span className="text-white/70 font-semibold">{rep.commentAuthor}</span> ·
                      Story: <span className="text-white/70 font-semibold">{rep.storyTitle}</span>
                    </p>
                    <p className="text-xs text-yellow-400 font-sans bg-yellow-500/5 border border-yellow-500/10 rounded px-2.5 py-1 inline-block">
                      Reason: <span className="font-semibold">{rep.reason}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 md:self-center">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs rounded-sm text-white"
                      onClick={() => handleAction(rep.commentId, "approve", rep.id)}
                    >
                      Approve Comment
                    </Button>
                    <Button
                      size="sm"
                      className="bg-destructive hover:bg-destructive/90 text-xs rounded-sm text-white"
                      onClick={() => handleAction(rep.commentId, "delete", rep.id)}
                    >
                      Remove Comment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-xs rounded-sm text-white/60"
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
          /* STANDARD COMMENTS LIST */
          <div className="bg-[#161616] border border-white/10 rounded overflow-hidden">
            {comments.length === 0 ? (
              <div className="p-8 text-center text-sm font-sans text-white/40">
                No comments found.
              </div>
            ) : (
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-white/60 uppercase tracking-wider text-[10px]">
                    <th className="p-4 font-bold">Reader</th>
                    <th className="p-4 font-bold">Comment</th>
                    <th className="p-4 font-bold">Story</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {comments.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          {c.authorAvatar ? (
                            <img
                              src={c.authorAvatar}
                              className="size-6 rounded-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px] text-primary">
                              <User className="size-3" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{c.authorName}</p>
                            <p className="text-[10px] text-white/40">{c.authorEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-white/90">{c.content}</td>
                      <td className="p-4 font-semibold text-white/70 max-w-xs truncate">
                        {c.storyTitle}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                            c.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : c.status === "rejected"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        {c.status !== "approved" && (
                          <button
                            onClick={() => handleAction(c.id, "approve")}
                            className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors inline-block"
                            title="Approve"
                          >
                            <Check className="size-4" />
                          </button>
                        )}
                        {c.status !== "rejected" && (
                          <button
                            onClick={() => handleAction(c.id, "reject")}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors inline-block"
                            title="Reject"
                          >
                            <X className="size-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(c.id, "delete")}
                          className="p-1 text-white/30 hover:text-red-400 transition-colors inline-block"
                          title="Delete Content"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border border-white/10 bg-[#161616] rounded-sm font-sans text-xs">
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
    </AdminLayout>
  );
}
