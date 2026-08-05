import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, Clock, User, RefreshCw } from "lucide-react";

export const Route = createLazyFileRoute("/admin/stories/$id/revisions")({
  component: AdminRevisionsPage,
});

type Revision = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  titleHi?: string;
  excerptHi?: string;
  contentHi?: string;
  version: number;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  editorNote?: string;
  adminNote?: string;
  createdAt: string;
  editor: { id: string; name: string; email: string; avatarUrl?: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  changes_requested: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes Requested",
};

export default function AdminRevisionsPage() {
  const { id } = Route.useParams();
  const { session } = useAuthStore();
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Revision | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actioning, setActioning] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");

  const authHeader: Record<string, string> = session ? { Authorization: `Bearer ${session.access_token}` } : {};

  const fetchRevisions = useCallback(async () => {
    try {
      const [revisionsRes, storyRes] = await Promise.all([
        fetch(`/api/stories/${id}/revisions`, { headers: authHeader }),
        fetch(`/api/admin/stories/${id}`, { headers: authHeader }),
      ]);
      const revisionsData = await revisionsRes.json();
      const storyData = await storyRes.json();
      setRevisions(revisionsData.revisions ?? []);
      setStoryTitle(storyData.title ?? "Story");
    } catch (err) {
      toast.error("Failed to load revisions.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchRevisions(); }, [fetchRevisions]);

  // Lightweight realtime: poll for new revisions every 12s
  useEffect(() => {
    const interval = setInterval(() => void fetchRevisions(), 12000);
    return () => clearInterval(interval);
  }, [fetchRevisions]);

  const handleReview = async (action: "approve" | "reject" | "request_changes") => {
    if (!selected) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/stories/${id}/revisions/${selected.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ action, adminNote: adminNote.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Action failed.");
        return;
      }
      const messages: Record<string, string> = {
        approve: "✅ Revision approved and published!",
        reject: "❌ Revision rejected — editor notified.",
        request_changes: "📝 Changes requested — editor notified.",
      };
      toast.success(messages[action]);
      setSelected(null);
      setAdminNote("");
      await fetchRevisions();
    } catch {
      toast.error("Action failed. Check your connection.");
    } finally {
      setActioning(false);
    }
  };

  const diffHighlight = (original: string, revised: string) => {
    // Simple character count diff indicator
    const added = revised.length - original.length;
    return added > 0 ? `+${added} chars` : `${added} chars`;
  };

  return (
    <AdminLayout title="Story Revisions" subtitle={storyTitle}>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/admin/stories/$id/edit"
            params={{ id }}
            className="flex items-center gap-2 text-black/60 hover:text-black text-sm font-sans transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to Edit Story
          </Link>
          <button
            onClick={() => void fetchRevisions()}
            className="flex items-center gap-2 text-xs font-sans text-white/40 hover:text-white/60 transition-colors"
          >
            <RefreshCw className="size-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-white/20 font-sans text-xs animate-pulse">Loading revisions…</div>
        ) : revisions.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-sm py-16 text-center">
            <p className="text-white/30 font-sans text-sm">No revisions submitted yet.</p>
            <p className="text-white/20 font-sans text-xs mt-2">The assigned editor must submit a revision before you can review here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revision list */}
            <div className="space-y-3">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-4">
                {revisions.length} Revision{revisions.length !== 1 ? "s" : ""}
              </h2>
              {revisions.map((rev) => (
                <button
                  key={rev.id}
                  onClick={() => { setSelected(rev); setAdminNote(rev.adminNote || ""); }}
                  className={`w-full text-left p-4 rounded-sm border transition-all ${
                    selected?.id === rev.id
                      ? "border-primary/50 bg-primary/5"
                      : "border-white/10 bg-[#161616] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-sm font-sans font-semibold text-white/80 line-clamp-2">{rev.title}</span>
                    <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-sans font-bold uppercase tracking-wider ${STATUS_COLORS[rev.status] ?? "bg-white/5 text-white/30 border-white/10"}`}>
                      {STATUS_LABELS[rev.status] ?? rev.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/30 font-sans">
                    <span className="flex items-center gap-1"><User className="size-3" />{rev.editor?.name ?? "Unknown editor"}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" />{new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    <span>v{rev.version}</span>
                  </div>
                  {rev.editorNote && (
                    <p className="mt-2 text-[11px] text-amber-400/70 font-sans italic">
                      Editor note: {rev.editorNote}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Review panel */}
            {selected ? (
              <div className="bg-[#161616] border border-white/10 rounded-sm p-6 space-y-5 sticky top-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">Reviewing Revision v{selected.version}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-sans font-bold uppercase tracking-wider ${STATUS_COLORS[selected.status]}`}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                </div>

                {/* Content diff */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-sans font-bold mb-1">Title</p>
                    <p className="text-sm text-white/80 font-sans leading-relaxed">{selected.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-sans font-bold mb-1">Excerpt</p>
                    <p className="text-xs text-white/60 font-sans leading-relaxed">{selected.excerpt}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-sans font-bold mb-1">
                      Content
                      <span className="ml-2 text-emerald-400 font-mono">{diffHighlight("", selected.content)}</span>
                    </p>
                    <div className="bg-black/30 rounded-sm p-3 max-h-48 overflow-y-auto">
                      <p className="text-[11px] text-white/50 font-mono leading-relaxed whitespace-pre-wrap">{selected.content.substring(0, 800)}{selected.content.length > 800 ? "…" : ""}</p>
                    </div>
                  </div>
                </div>

                {/* Editor note */}
                {selected.editorNote && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-sm px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-amber-400/70 font-sans font-bold mb-1">Editor Note</p>
                    <p className="text-xs text-amber-300/80 font-sans">{selected.editorNote}</p>
                  </div>
                )}

                {/* Admin note */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/30 font-sans font-bold mb-2">
                    Admin Note (sent to editor with your decision)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    placeholder="Optional — reason for rejection, feedback, etc."
                    className="w-full bg-black/30 border border-white/10 rounded-sm text-white/70 text-xs font-sans px-3 py-2 resize-none focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>

                {/* Actions */}
                {selected.status === "pending" || selected.status === "changes_requested" ? (
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      id="approve-revision-btn"
                      disabled={actioning}
                      onClick={() => void handleReview("approve")}
                      className="flex items-center justify-center gap-1.5 h-9 text-[10px] uppercase tracking-widest font-sans bg-emerald-700 hover:bg-emerald-600 text-white rounded-sm"
                    >
                      <CheckCircle className="size-3.5" /> Approve
                    </Button>
                    <Button
                      id="request-changes-btn"
                      disabled={actioning}
                      onClick={() => void handleReview("request_changes")}
                      className="flex items-center justify-center gap-1.5 h-9 text-[10px] uppercase tracking-widest font-sans bg-blue-700 hover:bg-blue-600 text-white rounded-sm"
                    >
                      <MessageSquare className="size-3.5" /> Request Changes
                    </Button>
                    <Button
                      id="reject-revision-btn"
                      disabled={actioning}
                      onClick={() => void handleReview("reject")}
                      className="flex items-center justify-center gap-1.5 h-9 text-[10px] uppercase tracking-widest font-sans bg-red-800 hover:bg-red-700 text-white rounded-sm"
                    >
                      <XCircle className="size-3.5" /> Reject
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-[11px] text-white/30 font-sans py-2">
                    This revision has already been {STATUS_LABELS[selected.status]?.toLowerCase()}.
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-white/10 rounded-sm flex items-center justify-center text-white/20 font-sans text-sm">
                Select a revision to review
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
