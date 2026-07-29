import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { SiteLayout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Save, Send, Bell, CheckCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/editor/stories/$storyId")({
  component: EditorStoryWorkspace,
});

// ─── Field component — declared outside to prevent remount on every render ────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-sans font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

type StoryData = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  titleHi?: string;
  excerptHi?: string;
  contentHi?: string;
  status: string;
  assignedEditorId?: string;
  slug: string;
};

type Revision = {
  id: string;
  title: string;
  version: number;
  status: string;
  editorNote?: string;
  adminNote?: string;
  createdAt: string;
};

function EditorStoryWorkspace() {
  const { storyId } = Route.useParams();
  const { user, session, initialized } = useAuthStore();
  const navigate = useNavigate();

  const [story, setStory] = useState<StoryData | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable form — initialized once from story, never overwritten by refetch
  const [form, setForm] = useState<{
    title: string; excerpt: string; content: string;
    titleHi: string; excerptHi: string; contentHi: string;
    editorNote: string;
  } | null>(null);
  const initializedRef = useRef(false);
  const authHeader = session ? { Authorization: `Bearer ${session.access_token}` } : {};

  // ─── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [initialized, user, navigate]);

  // ─── Fetch story data once ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [storyRes, revisionsRes] = await Promise.all([
        fetch(`/api/admin/stories/${storyId}`, { headers: authHeader }),
        fetch(`/api/stories/${storyId}/revisions`, { headers: authHeader }),
      ]);
      const storyData = await storyRes.json();
      const revisionsData = await revisionsRes.json();

      setStory(storyData);
      setRevisions(revisionsData.revisions ?? []);

      // Initialize form ONCE from story data — never overwrite after user starts editing
      if (!initializedRef.current && storyData?.id) {
        initializedRef.current = true;
        setForm({
          title: storyData.title ?? "",
          excerpt: storyData.excerpt ?? "",
          content: storyData.content ?? "",
          titleHi: storyData.titleHi ?? "",
          excerptHi: storyData.excerptHi ?? "",
          contentHi: storyData.contentHi ?? "",
          editorNote: "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load story.");
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // Lightweight realtime: poll revisions every 10s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/stories/${storyId}/revisions`, { headers: authHeader });
        const data = await res.json();
        setRevisions(data.revisions ?? []);
      } catch { /* ignore poll errors */ }
    }, 10000);
    return () => clearInterval(interval);
  }, [storyId]);

  const setField = useCallback(<K extends keyof NonNullable<typeof form>>(key: K, value: string) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);
  }, []);

  const handleSubmitRevision = async () => {
    if (!form || !story) return;
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast.error("Title, Excerpt, and Content are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      toast.success("✅ Revision submitted to Admin for review!");
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Submission failed.");
      toast.error(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full h-10 px-3 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 bg-background";
  const textareaCls = "w-full px-3 py-2 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 bg-background resize-none";

  const STATUS_BADGE: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    changes_requested: "bg-blue-100 text-blue-700 border-blue-200",
  };
  const STATUS_LABEL: Record<string, string> = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    changes_requested: "Changes Requested",
  };

  const latestRevision = revisions[0] ?? null;
  const hasChangesRequested = latestRevision?.status === "changes_requested";
  const hasPending = latestRevision?.status === "pending";

  if (!initialized || loading) {
    return (
      <SiteLayout>
        <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground font-sans text-xs animate-pulse">
          Loading your workspace…
        </div>
      </SiteLayout>
    );
  }

  if (!story || !form) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-6 py-24 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Story Not Found</h2>
          <p className="text-muted-foreground mb-6">This story doesn't exist or you don't have access.</p>
          <Link to="/editor" className="text-primary underline font-sans text-sm">← Back to Editor Workspace</Link>
        </div>
      </SiteLayout>
    );
  }

  // Guard: editor must be the assigned editor
  if (story.assignedEditorId && story.assignedEditorId !== user?.id) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-6 py-24 text-center">
          <AlertTriangle className="size-10 text-amber-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-4">Not Assigned to You</h2>
          <p className="text-muted-foreground mb-6">You are not the assigned editor for this story.</p>
          <Link to="/editor" className="text-primary underline font-sans text-sm">← Back to Editor Workspace</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 md:px-6 py-24 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/40">
          <div>
            <Link
              to="/editor"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-sans mb-2 transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Back to Editor Workspace
            </Link>
            <h1 className="font-display text-2xl font-bold">My Assignment</h1>
            <p className="text-muted-foreground text-sm font-sans mt-1 line-clamp-1">{story.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => void fetchData()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-sans transition-colors"
            >
              <RefreshCw className="size-3.5" /> Refresh
            </button>
            <Button
              id="submit-revision-btn"
              disabled={submitting || hasPending}
              onClick={() => void handleSubmitRevision()}
              className="flex items-center gap-2 h-9 px-5 bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest rounded-sm"
            >
              <Send className="size-3.5" />
              {submitting ? "Submitting…" : hasPending ? "Awaiting Admin Review" : "Submit to Admin"}
            </Button>
          </div>
        </div>

        {/* Admin feedback banner */}
        {hasChangesRequested && latestRevision?.adminNote && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-sm px-4 py-3 flex items-start gap-3">
            <Bell className="size-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-700 font-sans uppercase tracking-wider mb-0.5">Admin requested changes</p>
              <p className="text-sm text-blue-600 font-sans">{latestRevision.adminNote}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-sm px-4 py-3 text-sm text-red-600 font-sans flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main editing area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border/50 rounded-sm p-6 space-y-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-muted-foreground">English Content</h2>
              <Field label="Title">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className={inputCls}
                  id="editor-title"
                  autoComplete="off"
                />
              </Field>
              <Field label="Excerpt">
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setField("excerpt", e.target.value)}
                  rows={3}
                  className={textareaCls}
                  id="editor-excerpt"
                />
              </Field>
              <Field label="Content">
                <textarea
                  value={form.content}
                  onChange={(e) => setField("content", e.target.value)}
                  rows={18}
                  className={textareaCls}
                  id="editor-content"
                />
              </Field>
            </div>

            <div className="bg-card border border-border/50 rounded-sm p-6 space-y-5">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-muted-foreground">Hindi Translation (Optional)</h2>
              <Field label="शीर्षक">
                <input type="text" value={form.titleHi} onChange={(e) => setField("titleHi", e.target.value)} className={inputCls} id="editor-title-hi" autoComplete="off" />
              </Field>
              <Field label="संक्षेप">
                <textarea value={form.excerptHi} onChange={(e) => setField("excerptHi", e.target.value)} rows={3} className={textareaCls} id="editor-excerpt-hi" />
              </Field>
              <Field label="सामग्री">
                <textarea value={form.contentHi} onChange={(e) => setField("contentHi", e.target.value)} rows={12} className={textareaCls} id="editor-content-hi" />
              </Field>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Editor note */}
            <div className="bg-card border border-border/50 rounded-sm p-5 space-y-3">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-muted-foreground">Note to Admin</h3>
              <textarea
                value={form.editorNote}
                onChange={(e) => setField("editorNote", e.target.value)}
                rows={4}
                placeholder="Explain your changes, sources, or anything the admin should know…"
                className={textareaCls}
                id="editor-note"
              />
            </div>

            {/* Submit button */}
            <Button
              id="submit-revision-btn-sidebar"
              disabled={submitting || hasPending}
              onClick={() => void handleSubmitRevision()}
              className="w-full flex items-center justify-center gap-2 h-10 bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest rounded-sm"
            >
              <Send className="size-3.5" />
              {submitting ? "Submitting…" : hasPending ? "Awaiting Review" : "Submit to Admin"}
            </Button>

            {/* Revision history */}
            <div className="bg-card border border-border/50 rounded-sm p-5">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-muted-foreground mb-4">Revision History</h3>
              {revisions.length === 0 ? (
                <p className="text-xs text-muted-foreground font-sans">No revisions submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {revisions.slice(0, 8).map((rev) => (
                    <div key={rev.id} className="border border-border/40 rounded-sm p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-sans font-semibold text-foreground">v{rev.version}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-sans font-bold uppercase tracking-wider ${STATUS_BADGE[rev.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                          {STATUS_LABEL[rev.status] ?? rev.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
                        <Clock className="size-3" />{new Date(rev.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {rev.adminNote && (
                        <p className="mt-1.5 text-[11px] text-blue-600 font-sans italic">Admin: {rev.adminNote}</p>
                      )}
                      {rev.editorNote && (
                        <p className="mt-1 text-[11px] text-muted-foreground font-sans">Note: {rev.editorNote}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Story info */}
            <div className="bg-muted/30 border border-border/40 rounded-sm p-4">
              <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground mb-2">Story Info</h3>
              <dl className="text-xs font-sans space-y-1">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-semibold">{story.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Slug</dt>
                  <dd className="font-mono text-[10px] text-muted-foreground">{story.slug}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
