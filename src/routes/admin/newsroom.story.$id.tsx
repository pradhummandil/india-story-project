import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  Unlock,
  Calendar,
  Save,
  MessageSquare,
  History,
  FileText,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Sparkles,
  Cpu,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/newsroom/story/$id")({
  head: () => ({
    meta: [{ title: "Story Workspace & Workflow — Newsroom CMS" }],
  }),
  component: StoryWorkflowWorkspacePage,
});

type Revision = {
  id: string;
  version: number;
  title: string;
  excerpt: string;
  content: string;
  createdAt: string;
};

type Comment = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

type WorkflowState = {
  reviewerId: string | null;
  factCheckerId: string | null;
  legalReviewerId: string | null;
  lockedBy: string | null;
  lockedAt: string | null;
  notes: string;
  autoUnpublishAt: string | null;
};

function StoryWorkflowWorkspacePage() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const { user, session, initialized } = useAuthStore();

  const [story, setStory] = useState<any>(null);
  const [workflow, setWorkflow] = useState<WorkflowState | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Editing state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Workflow variables state
  const [reviewerId, setReviewerId] = useState("");
  const [factCheckerId, setFactCheckerId] = useState("");
  const [legalReviewerId, setLegalReviewerId] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  // Comment state
  const [commentText, setCommentText] = useState("");

  // Revision state
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  const loadData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      // 1. Load workflow, timeline, staff list
      const wfRes = await fetch(`/api/admin/newsroom/workflow?storyId=${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const wfData = await wfRes.json();
      setStory(wfData.story);
      setWorkflow(wfData.workflow);
      setStaff(wfData.staff || []);
      setTimeline(wfData.timeline || []);

      // Populate workflow fields
      setReviewerId(wfData.workflow.reviewerId || "");
      setFactCheckerId(wfData.workflow.factCheckerId || "");
      setLegalReviewerId(wfData.workflow.legalReviewerId || "");
      setNotes(wfData.workflow.notes || "");
      setStatus(wfData.story.status || "Draft");
      setScheduledAt(
        wfData.story.scheduledAt
          ? new Date(wfData.story.scheduledAt).toISOString().slice(0, 16)
          : "",
      );

      // 2. Load revisions
      const revRes = await fetch(`/api/admin/newsroom/revisions?storyId=${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const revData = await revRes.json();
      setRevisions(revData.revisions || []);

      // 3. Load internal comments
      const commRes = await fetch(`/api/admin/newsroom/comments?storyId=${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const commData = await commRes.json();
      setComments(commData.comments || []);
    } catch {
      setErrorMsg("Failed to load workspace data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user, session]);

  // Acquire or release story lock
  const handleLockToggle = async (lock: boolean) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/admin/newsroom/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          storyId: id,
          lockedBy: lock ? user?.id : null,
          lockedAt: lock ? new Date().toISOString() : null,
        }),
      });
      const out = await res.json();
      if (out.success) {
        setWorkflow((prev: any) => ({
          ...prev,
          lockedBy: lock ? user?.id : null,
          lockedAt: lock ? new Date().toISOString() : null,
        }));
      }
    } catch {}
  };

  // Submit workflow updates
  const handleSaveWorkflow = async () => {
    if (!session) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/newsroom/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          storyId: id,
          reviewerId: reviewerId || null,
          factCheckerId: factCheckerId || null,
          legalReviewerId: legalReviewerId || null,
          notes,
          status,
          scheduledPublishAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });

      const out = await res.json();
      if (out.success) {
        setSuccessMsg("Workflow metrics updated successfully!");
        loadData();
      } else {
        setErrorMsg(out.error || "Save failed.");
      }
    } catch {
      setErrorMsg("An error occurred while saving workflow metrics.");
    } finally {
      setSaving(false);
    }
  };

  // Post internal comment
  const handlePostComment = async () => {
    if (!session || !commentText.trim()) return;
    try {
      const res = await fetch(`/api/admin/newsroom/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          storyId: id,
          text: commentText,
        }),
      });
      const out = await res.json();
      if (out.success) {
        setComments([...comments, out.comment]);
        setCommentText("");
      }
    } catch {}
  };

  // Restore previous version
  const handleRestoreVersion = async (revisionId: string) => {
    if (!session) return;
    if (
      !confirm(
        "Are you sure you want to restore the story to this older version? The current version will be archived as a new revision.",
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/newsroom/revisions/restore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          storyId: id,
          revisionId,
        }),
      });
      const out = await res.json();
      if (out.success) {
        alert("Story version restored successfully!");
        setSelectedRevision(null);
        loadData();
      }
    } catch {}
  };

  // AI Assistant States
  const [aiTask, setAiTask] = useState("rewrite");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiScores, setAiScores] = useState<any>(null);
  const [aiLinguistics, setAiLinguistics] = useState<any>(null);

  const handleAiAction = async () => {
    if (!session) return;
    setAiLoading(true);
    setAiOutput("");
    setAiScores(null);
    setAiLinguistics(null);
    try {
      const res = await fetch("/api/admin/newsroom/ai-helper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          task: aiTask,
          title: story?.title || "",
          excerpt: story?.excerpt || "",
          content: story?.content || "",
        }),
      });
      const out = await res.json();
      if (aiTask === "scores") {
        setAiScores(out);
      } else if (aiTask === "linguistics") {
        setAiLinguistics(out);
      } else {
        setAiOutput(out.resultText || "");
      }
    } catch {
      setAiOutput("AI assistant request failed.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading && !story) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-white/30 font-sans text-xs uppercase tracking-widest animate-pulse">
          Setting up newsroom workspace…
        </div>
      </AdminLayout>
    );
  }

  const isLockedByOther = !!(workflow?.lockedBy && workflow.lockedBy !== user?.id);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Link Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link
            to="/admin/newsroom"
            className="inline-flex items-center gap-2 text-xs font-bold text-white/60 font-sans uppercase tracking-widest hover:text-white"
          >
            <ArrowLeft className="size-3.5" /> Back to Newsroom Console
          </Link>
          <div className="flex items-center gap-2">
            {isLockedByOther ? (
              <span className="inline-flex items-center gap-1.5 bg-red-950/40 border border-red-500/20 text-red-400 text-[10px] font-sans font-bold uppercase tracking-widest px-2.5 py-1">
                <Lock className="size-3" /> Story is Locked (Locked by Editor)
              </span>
            ) : workflow?.lockedBy === user?.id ? (
              <button
                onClick={() => handleLockToggle(false)}
                className="inline-flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[10px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 hover:bg-emerald-900/60"
              >
                <Unlock className="size-3" /> Locked by You (Click to release)
              </button>
            ) : (
              <button
                onClick={() => handleLockToggle(true)}
                className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/65 text-[10px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 hover:bg-white/10"
              >
                <Lock className="size-3" /> Story Unlocked (Click to Edit Lock)
              </button>
            )}
          </div>
        </div>

        {/* Locked warning banner */}
        {isLockedByOther && (
          <div className="bg-red-950/30 border border-red-500/30 p-4 rounded text-xs text-red-300 font-sans flex items-start gap-3">
            <AlertTriangle className="size-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-bold">Another editor is currently editing this story.</p>
              <p className="mt-1 opacity-80">
                To prevent overwrites and coordinate edits safely, options to alter statuses and
                assignments are temporarily disabled.
              </p>
            </div>
          </div>
        )}

        {/* Content & Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow Parameters (Left Side) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#141414] border border-white/5 p-6 rounded space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <FileText className="size-4 text-gold" />
                <h3 className="text-sm font-bold text-white font-sans uppercase tracking-widest">
                  Story Parameters
                </h3>
              </div>

              {/* Form elements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                <div>
                  <label className="block font-bold text-white/60 mb-1">Status Workflow</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isLockedByOther}
                    className="w-full bg-[#1e1e1e] text-white border border-white/10 px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Published">Published</option>
                    <option value="Hidden">Hidden</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-white/60 mb-1">
                    Scheduled Publish Time (Auto-Publish)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    disabled={isLockedByOther}
                    className="w-full bg-[#1e1e1e] text-white border border-white/10 px-3 py-1.5 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                <div>
                  <label className="block font-bold text-white/60 mb-1">Reviewer Assignment</label>
                  <select
                    value={reviewerId}
                    onChange={(e) => setReviewerId(e.target.value)}
                    disabled={isLockedByOther}
                    className="w-full bg-[#1e1e1e] text-white border border-white/10 px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="">-- Assign Editor --</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-white/60 mb-1">
                    Fact Checker Assignment
                  </label>
                  <select
                    value={factCheckerId}
                    onChange={(e) => setFactCheckerId(e.target.value)}
                    disabled={isLockedByOther}
                    className="w-full bg-[#1e1e1e] text-white border border-white/10 px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="">-- Assign Fact Checker --</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-white/60 mb-1">
                    Legal Review Assignment
                  </label>
                  <select
                    value={legalReviewerId}
                    onChange={(e) => setLegalReviewerId(e.target.value)}
                    disabled={isLockedByOther}
                    className="w-full bg-[#1e1e1e] text-white border border-white/10 px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="">-- Assign Legal Reviewer --</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="font-sans text-xs">
                <label className="block font-bold text-white/60 mb-1">
                  Editorial Notes (Internal Guidelines)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLockedByOther}
                  placeholder="Provide checklist requirements, source verification guides, or translation directives..."
                  rows={4}
                  className="w-full bg-[#1e1e1e] text-white border border-white/10 p-3 rounded focus:outline-none resize-y"
                />
              </div>

              {!isLockedByOther && (
                <div className="flex justify-end border-t border-white/5 pt-4">
                  <Button
                    onClick={handleSaveWorkflow}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/95 text-white font-sans text-xs uppercase tracking-widest font-bold px-6 py-2 flex items-center gap-2"
                  >
                    <Save className="size-4" />{" "}
                    {saving ? "Saving Workflow..." : "Update Workflow State"}
                  </Button>
                </div>
              )}

              {successMsg && <p className="text-xs text-gold font-sans font-bold">{successMsg}</p>}
              {errorMsg && <p className="text-xs text-red-400 font-sans font-bold">{errorMsg}</p>}
            </div>

            {/* Version Diff & Revision Comparison Slider */}
            <div className="bg-[#141414] border border-white/5 p-6 rounded space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <History className="size-4 text-gold" />
                <h3 className="text-sm font-bold text-white font-sans uppercase tracking-widest">
                  Version History & Revisions
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Revisions list */}
                <div className="md:col-span-1 border-r border-white/5 pr-4 space-y-2 max-h-72 overflow-y-auto">
                  <span className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-sans">
                    Archived versions
                  </span>
                  {revisions.length > 0 ? (
                    revisions.map((rev) => (
                      <button
                        key={rev.id}
                        onClick={() => setSelectedRevision(rev)}
                        className={`w-full text-left p-2 rounded text-xs font-sans border transition-all ${selectedRevision?.id === rev.id ? "bg-primary/10 border-primary/30 text-white" : "border-transparent text-white/55 hover:bg-white/5"}`}
                      >
                        <p className="font-bold">v{rev.version}</p>
                        <p className="text-[10px] opacity-75 mt-0.5">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-white/40 italic font-sans">No previous versions.</p>
                  )}
                </div>

                {/* Compare Diff Pane */}
                <div className="md:col-span-3 min-h-48 flex flex-col justify-between">
                  {selectedRevision ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-white/60 font-sans">
                          Comparing Version {selectedRevision.version} with Current Version
                        </span>
                        {!isLockedByOther && (
                          <button
                            onClick={() => handleRestoreVersion(selectedRevision.id)}
                            className="bg-primary/10 border border-primary/20 hover:bg-primary/25 text-gold text-[10px] uppercase font-bold tracking-widest px-3 py-1 font-sans"
                          >
                            Rollback to this version
                          </button>
                        )}
                      </div>

                      {/* Diff View */}
                      <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                        <div className="space-y-2 border-r border-white/5 pr-2">
                          <p className="font-bold text-white/30 uppercase tracking-wider text-[10px]">
                            v{selectedRevision.version} content
                          </p>
                          <p className="font-bold text-white/80 line-clamp-2">
                            {selectedRevision.title}
                          </p>
                          <p className="text-white/60 italic line-clamp-3">
                            {selectedRevision.excerpt}
                          </p>
                          <p className="text-white/50 line-clamp-6 leading-relaxed whitespace-pre-wrap">
                            {selectedRevision.content}
                          </p>
                        </div>
                        <div className="space-y-2 pl-2">
                          <p className="font-bold text-gold/60 uppercase tracking-wider text-[10px]">
                            Current version content
                          </p>
                          <p className="font-bold text-white">{story?.title}</p>
                          <p className="text-white/70 italic line-clamp-3">{story?.excerpt}</p>
                          <p className="text-white/60 line-clamp-6 leading-relaxed whitespace-pre-wrap">
                            {story?.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-white/20 italic text-xs font-sans">
                      <History className="size-8 mb-2" />
                      Select a version card on the left to see comparisons
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Internal Collaboration Feedback & Timeline (Right Side) */}
          <div className="space-y-6">
            {/* AI Editorial Assistant Panel */}
            <div className="bg-[#141414] border border-white/5 p-6 rounded space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Sparkles className="size-4 text-gold" />
                <h3 className="text-sm font-bold text-white font-sans uppercase tracking-widest">
                  AI Editorial Assistant
                </h3>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div>
                  <label className="block font-bold text-white/60 mb-1">
                    Select AI Helper Tool
                  </label>
                  <select
                    value={aiTask}
                    onChange={(e) => setAiTask(e.target.value)}
                    className="w-full bg-[#1e1e1e] text-white border border-white/10 px-3 py-2 rounded focus:outline-none"
                  >
                    <option value="rewrite">Rewrite Story</option>
                    <option value="grammar">Improve Grammar</option>
                    <option value="readability">Improve Readability</option>
                    <option value="seo-title">Generate SEO Title</option>
                    <option value="meta">Generate Meta Description</option>
                    <option value="keywords">Generate Keywords</option>
                    <option value="slug">Generate Slug</option>
                    <option value="summary">Generate Summary</option>
                    <option value="social">Generate Social Captions</option>
                    <option value="newsletter">Generate Newsletter Paragraph</option>
                    <option value="suggest-themes">Suggest Themes</option>
                    <option value="cover-prompt">Suggest Cover Prompt</option>
                    <option value="fact-check">Fact Check Recommendations</option>
                    <option value="duplicate">Duplicate Story Check</option>
                    <option value="scores">Evaluate Editorial Scores</option>
                    <option value="linguistics">Tone & Linguistics Scan</option>
                  </select>
                </div>

                <Button
                  onClick={handleAiAction}
                  disabled={aiLoading || isLockedByOther}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-sans text-xs uppercase tracking-widest font-bold py-2 flex items-center justify-center gap-2"
                >
                  <Cpu className="size-4" /> {aiLoading ? "Gemini is analyzing..." : "Run AI Task"}
                </Button>

                {/* Response outputs display */}
                {aiOutput && (
                  <div className="bg-[#1e1e1e]/90 border border-white/5 p-3 rounded space-y-2 mt-2">
                    <p className="font-bold text-[10px] text-gold uppercase tracking-wider">
                      AI Output
                    </p>
                    <p className="text-white/80 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto pr-1">
                      {aiOutput}
                    </p>
                  </div>
                )}

                {aiScores && (
                  <div className="bg-[#1e1e1e]/90 border border-white/5 p-3 rounded space-y-3 mt-2">
                    <p className="font-bold text-[10px] text-gold uppercase tracking-wider">
                      Editorial Diagnostics
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white/5 p-1 rounded">
                        <span className="block text-[8px] text-white/40">Headline</span>
                        <span className="font-bold text-white font-sans text-sm">
                          {aiScores.headlineScore}/100
                        </span>
                      </div>
                      <div className="bg-white/5 p-1 rounded">
                        <span className="block text-[8px] text-white/40">SEO</span>
                        <span className="font-bold text-white font-sans text-sm">
                          {aiScores.seoScore}/100
                        </span>
                      </div>
                      <div className="bg-white/5 p-1 rounded">
                        <span className="block text-[8px] text-white/40">Readability</span>
                        <span className="font-bold text-white font-sans text-sm">
                          {aiScores.readabilityScore}/100
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] space-y-1 text-white/70">
                      <p>
                        <strong>Title:</strong> {aiScores.headlineFeedback}
                      </p>
                      <p>
                        <strong>SEO:</strong> {aiScores.seoFeedback}
                      </p>
                      <p>
                        <strong>Readability:</strong> {aiScores.readabilityFeedback}
                      </p>
                    </div>
                  </div>
                )}

                {aiLinguistics && (
                  <div className="bg-[#1e1e1e]/90 border border-white/5 p-3 rounded space-y-2 mt-2">
                    <p className="font-bold text-[10px] text-gold uppercase tracking-wider">
                      Linguistic Analysis
                    </p>
                    <div className="text-[10px] space-y-1 text-white/70">
                      <p>
                        <strong>Tone:</strong> {aiLinguistics.toneSummary}
                      </p>
                      <p>
                        <strong>Bias Check:</strong> {aiLinguistics.biasRating}
                      </p>
                      <p>
                        <strong>Profanity:</strong>{" "}
                        {aiLinguistics.profanityFlag ? "⚠️ Flagged" : "✅ Clean"}
                      </p>
                      <p className="mt-1 pt-1 border-t border-white/5">{aiLinguistics.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Editor-only internal comments chat */}
            <div className="bg-[#141414] border border-white/5 p-6 rounded space-y-4 flex flex-col max-h-[460px]">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <MessageSquare className="size-4 text-gold" />
                <h3 className="text-sm font-bold text-white font-sans uppercase tracking-widest">
                  Internal Newsroom Chat
                </h3>
              </div>

              {/* Chat messages viewport */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-xs font-sans max-h-60">
                {comments.length > 0 ? (
                  comments.map((c) => (
                    <div key={c.id} className="bg-white/5 border border-white/5 p-2.5 rounded">
                      <div className="flex items-center justify-between mb-1 font-bold">
                        <span className="text-gold">{c.authorName}</span>
                        <span className="text-[9px] text-white/40">
                          {new Date(c.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-white/80 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-white/30 italic text-center py-4">No internal comments yet.</p>
                )}
              </div>

              {/* Comment submission form */}
              <div className="border-t border-white/5 pt-3 flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave review directives, approval notes..."
                  className="bg-background text-xs font-sans border-white/10 focus-visible:ring-primary/45 rounded-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handlePostComment();
                  }}
                />
                <Button
                  onClick={handlePostComment}
                  disabled={!commentText.trim()}
                  className="bg-primary hover:bg-primary/95 text-white font-sans text-[10px] uppercase font-bold tracking-widest rounded-none"
                >
                  Send
                </Button>
              </div>
            </div>

            {/* Audit Log Timeline */}
            <div className="bg-[#141414] border border-white/5 p-6 rounded space-y-4 max-h-[380px] overflow-y-auto">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Clock className="size-4 text-gold" />
                <h3 className="text-sm font-bold text-white font-sans uppercase tracking-widest">
                  Publishing Timeline
                </h3>
              </div>

              <div className="space-y-4 font-sans text-xs relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10 pr-1">
                {timeline.length > 0 ? (
                  timeline.map((event) => (
                    <div key={event.id} className="flex gap-3 items-start relative pl-6">
                      <div className="size-2 rounded-full bg-gold/75 absolute left-2 top-1.5" />
                      <div className="flex-1">
                        <p className="font-bold text-white/85 uppercase tracking-wider text-[9px]">
                          {event.action.replace(/_/g, " ")}
                        </p>
                        {event.action === "STORY_STATUS_CHANGE" && (
                          <p className="text-[10px] text-white/60 mt-0.5">
                            Status updated:{" "}
                            <span className="text-gold font-bold">{event.meta?.from}</span> &rarr;{" "}
                            <span className="text-emerald-400 font-bold">{event.meta?.to}</span>
                          </p>
                        )}
                        {event.action === "ROLLBACK_STORY" && (
                          <p className="text-[10px] text-white/60 mt-0.5">
                            Restored to version v{event.meta?.toVersion} (Bumps story to v
                            {event.meta?.restoredVersion})
                          </p>
                        )}
                        <span className="text-[9px] text-white/40 block mt-1">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/30 italic text-center py-2">No activity events.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
