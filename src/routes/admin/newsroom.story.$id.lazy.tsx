import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

export const Route = createLazyFileRoute("/admin/newsroom/story/$id")({
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
      const wfRes = await fetch(`/api/admin/newsroom/workflow?storyId=${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const wfData = await wfRes.json();
      setStory(wfData.story);
      setWorkflow(wfData.workflow);
      setStaff(wfData.staff || []);
      setTimeline(wfData.timeline || []);

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

      const revRes = await fetch(`/api/admin/newsroom/revisions?storyId=${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const revData = await revRes.json();
      setRevisions(revData.revisions || []);

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

  const isLockedByOther = !!(workflow?.lockedBy && workflow.lockedBy !== user?.id);

  // Skeletons
  const SkeletonWorkspace = () => (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-4 w-48 bg-white/5 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-96 bg-[#121212] border border-white/5 rounded-lg" />
          <div className="h-60 bg-[#121212] border border-white/5 rounded-lg" />
        </div>
        <div className="space-y-6">
          <div className="h-80 bg-[#121212] border border-white/5 rounded-lg" />
          <div className="h-80 bg-[#121212] border border-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  );

  if (loading && !story) {
    return (
      <AdminLayout>
        <SkeletonWorkspace />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto select-none">
        
        {/* Navigation Banner */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-5 gap-4">
          <Link
            to="/admin/newsroom"
            className="inline-flex items-center gap-2 text-[10px] font-black font-sans uppercase tracking-widest text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5 shrink-0" /> Back to Console
          </Link>
          
          <div className="flex items-center gap-2 self-start sm:self-center">
            {isLockedByOther ? (
              <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/25 text-red-400 text-[9px] font-sans font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                <Lock className="size-3 shrink-0" /> locked by other editor
              </span>
            ) : workflow?.lockedBy === user?.id ? (
              <button
                onClick={() => handleLockToggle(false)}
                className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-sans font-black uppercase tracking-wider px-2.5 py-1 rounded-md hover:bg-emerald-500/20 cursor-pointer transition-colors"
              >
                <Unlock className="size-3 shrink-0" /> locked by you (click to release)
              </button>
            ) : (
              <button
                onClick={() => handleLockToggle(true)}
                className="inline-flex items-center gap-1.5 bg-white/5 border border-white/8 text-white/60 text-[9px] font-sans font-black uppercase tracking-wider px-2.5 py-1 rounded-md hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
              >
                <Lock className="size-3 shrink-0" /> acquire edit lock
              </button>
            )}
          </div>
        </div>

        {/* Lock Alert banner */}
        {isLockedByOther && (
          <div className="bg-red-500/5 border border-red-500/15 p-4 rounded-lg text-xs text-red-400 font-sans flex items-start gap-3">
            <AlertTriangle className="size-4.5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Another editor holds the lock for this story dispatch.</p>
              <p className="text-white/60">
                Workflow status variables and assignments updates are disabled to prevent collision.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main workspace (left) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Story parameters */}
            <div className="bg-[#121212] border border-white/5 p-6 rounded-lg space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <FileText className="size-4 text-[#C8A96A]" />
                <h3 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest">
                  Story Workspace Parameters
                </h3>
              </div>

              {/* Status and schedules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-white/50 uppercase tracking-wider text-[9px]">Workflow Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isLockedByOther}
                    className="w-full bg-[#161616] text-white border border-white/10 px-3 py-2.5 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Published">Published</option>
                    <option value="Hidden">Hidden</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-white/50 uppercase tracking-wider text-[9px]">
                    Auto-Publish Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    disabled={isLockedByOther}
                    className="w-full bg-[#161616] text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Assignments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-white/50 uppercase tracking-wider text-[9px]">Reviewer Assignment</label>
                  <select
                    value={reviewerId}
                    onChange={(e) => setReviewerId(e.target.value)}
                    disabled={isLockedByOther}
                    className="w-full bg-[#161616] text-white border border-white/10 px-3 py-2.5 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="">-- Assign Editor --</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-white/50 uppercase tracking-wider text-[9px]">
                    Fact Checker
                  </label>
                  <select
                    value={factCheckerId}
                    onChange={(e) => setFactCheckerId(e.target.value)}
                    disabled={isLockedByOther}
                    className="w-full bg-[#161616] text-white border border-white/10 px-3 py-2.5 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="">-- Assign Fact Checker --</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-white/50 uppercase tracking-wider text-[9px]">
                    Legal Reviewer
                  </label>
                  <select
                    value={legalReviewerId}
                    onChange={(e) => setLegalReviewerId(e.target.value)}
                    disabled={isLockedByOther}
                    className="w-full bg-[#161616] text-white border border-white/10 px-3 py-2.5 rounded-lg text-xs focus:outline-none"
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

              <div className="font-sans text-xs space-y-1.5">
                <label className="block font-bold text-white/50 uppercase tracking-wider text-[9px]">
                  Internal Guidelines / Curation Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLockedByOther}
                  placeholder="Provide checklists, fact-check notes, or translation instructions..."
                  rows={4}
                  className="w-full bg-[#161616] text-white border border-white/10 p-3 rounded-lg focus:outline-none resize-y"
                />
              </div>

              {!isLockedByOther && (
                <div className="flex flex-col sm:flex-row justify-end border-t border-white/5 pt-4 gap-2">
                  <Button
                    onClick={handleSaveWorkflow}
                    disabled={saving}
                    className="h-10 bg-[#C8A96A] hover:bg-[#C8A96A]/90 text-black font-sans text-xs uppercase tracking-widest font-black px-6 rounded-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="size-4" />
                    {saving ? "Saving changes..." : "Save Workspace"}
                  </Button>
                </div>
              )}

              {successMsg && (
                <div className="bg-white/5 border border-white/5 text-xs text-[#C8A96A] font-bold p-3 rounded-lg text-center animate-fadeIn">
                  ✓ {successMsg}
                </div>
              )}
            </div>

            {/* Version Diff History */}
            <div className="bg-[#121212] border border-white/5 p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <History className="size-4 text-[#C8A96A]" />
                <h3 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest">
                  Revision Comparisons & Version History
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Archived list */}
                <div className="md:col-span-1 border-r border-white/5 pr-4 space-y-2 max-h-72 overflow-y-auto">
                  <span className="block text-[8px] font-black text-white/30 uppercase tracking-widest mb-2 font-sans">
                    Saved versions
                  </span>
                  {revisions.length > 0 ? (
                    revisions.map((rev) => (
                      <button
                        key={rev.id}
                        onClick={() => setSelectedRevision(rev)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs font-sans border transition-all cursor-pointer ${
                          selectedRevision?.id === rev.id
                            ? "bg-[#C8A96A]/10 border-[#C8A96A]/30 text-white font-bold"
                            : "border-transparent text-white/40 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <p className="text-white/80">v{rev.version}</p>
                        <p className="text-[9px] opacity-50 mt-0.5">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-[10px] text-white/30 italic font-sans">No edits recorded.</p>
                  )}
                </div>

                {/* Diff Comparison */}
                <div className="md:col-span-3 min-h-48 flex flex-col justify-between">
                  {selectedRevision ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
                        <span className="text-[10px] font-bold text-white/50 font-sans uppercase tracking-wide">
                          Comparing Version {selectedRevision.version} to Current
                        </span>
                        {!isLockedByOther && (
                          <button
                            onClick={() => handleRestoreVersion(selectedRevision.id)}
                            className="bg-[#C8A96A]/10 border border-[#C8A96A]/20 hover:bg-[#C8A96A]/20 text-[#C8A96A] text-[9px] uppercase font-black tracking-widest px-3 py-1.5 rounded-md font-sans transition-colors cursor-pointer"
                          >
                            Rollback current to v{selectedRevision.version}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                        <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-white/5 pb-4 sm:pb-0 sm:pr-4">
                          <p className="font-bold text-white/30 uppercase tracking-wider text-[9px]">
                            v{selectedRevision.version} Content
                          </p>
                          <p className="font-bold text-white/80 line-clamp-2">
                            {selectedRevision.title}
                          </p>
                          <p className="text-white/50 italic line-clamp-3">
                            {selectedRevision.excerpt}
                          </p>
                          <p className="text-white/40 line-clamp-6 leading-relaxed whitespace-pre-wrap">
                            {selectedRevision.content}
                          </p>
                        </div>
                        <div className="space-y-2 sm:pl-4">
                          <p className="font-bold text-[#C8A96A]/60 uppercase tracking-wider text-[9px]">
                            Current Content
                          </p>
                          <p className="font-bold text-white">{story?.title}</p>
                          <p className="text-white/60 italic line-clamp-3">{story?.excerpt}</p>
                          <p className="text-white/50 line-clamp-6 leading-relaxed whitespace-pre-wrap">
                            {story?.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-white/20 italic text-xs font-sans gap-2 py-6">
                      <History className="size-7" />
                      Select an archived version on the left to see modifications side-by-side
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI, Comments & Timeline (right side) */}
          <div className="space-y-6">
            
            {/* AI Assistant */}
            <div className="bg-[#121212] border border-white/5 p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Sparkles className="size-4 text-[#C8A96A]" />
                <h3 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest">
                  AI Editorial Assistant
                </h3>
              </div>

              <div className="space-y-3.5 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-white/50 uppercase tracking-wider text-[9px]">Select AI Utility</label>
                  <select
                    value={aiTask}
                    onChange={(e) => setAiTask(e.target.value)}
                    className="w-full bg-[#161616] text-white border border-white/10 px-3 py-2.5 rounded-lg text-xs focus:outline-none"
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
                  className="w-full h-10 bg-[#C8A96A] hover:bg-[#C8A96A]/95 text-black font-sans text-xs uppercase tracking-widest font-black rounded-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Cpu className="size-4 shrink-0" />
                  {aiLoading ? "Gemini is writing..." : "Execute AI Prompt"}
                </Button>

                {/* AI Text output */}
                {aiOutput && (
                  <div className="bg-white/2 border border-white/5 p-4 rounded-lg space-y-2 mt-2">
                    <p className="font-black text-[9px] text-[#C8A96A] uppercase tracking-wider">
                      Response
                    </p>
                    <p className="text-white/80 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 pr-1">
                      {aiOutput}
                    </p>
                  </div>
                )}

                {/* AI Scores display */}
                {aiScores && (
                  <div className="bg-white/2 border border-white/5 p-4 rounded-lg space-y-3 mt-2">
                    <p className="font-black text-[9px] text-[#C8A96A] uppercase tracking-wider">
                      Diagnostics Evaluations
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-white/5 p-2 rounded-md">
                        <span className="block text-[8px] text-white/40 mb-1">Headline</span>
                        <span className="font-bold text-white font-mono">{aiScores.headlineScore}/100</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-md">
                        <span className="block text-[8px] text-white/40 mb-1">SEO</span>
                        <span className="font-bold text-white font-mono">{aiScores.seoScore}/100</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-md">
                        <span className="block text-[8px] text-white/40 mb-1">Structure</span>
                        <span className="font-bold text-white font-mono">{aiScores.readabilityScore}/100</span>
                      </div>
                    </div>
                    <div className="text-[10px] space-y-1.5 text-white/70 pt-2 border-t border-white/5">
                      <p><strong>Title:</strong> {aiScores.headlineFeedback}</p>
                      <p><strong>SEO:</strong> {aiScores.seoFeedback}</p>
                      <p><strong>Readability:</strong> {aiScores.readabilityFeedback}</p>
                    </div>
                  </div>
                )}

                {/* AI Linguistics */}
                {aiLinguistics && (
                  <div className="bg-white/2 border border-white/5 p-4 rounded-lg space-y-2 mt-2">
                    <p className="font-black text-[9px] text-[#C8A96A] uppercase tracking-wider">
                      Linguistics scan
                    </p>
                    <div className="text-[10px] space-y-1.5 text-white/70">
                      <p><strong>Tone:</strong> {aiLinguistics.toneSummary}</p>
                      <p><strong>Bias Check:</strong> {aiLinguistics.biasRating}</p>
                      <p><strong>Profanity:</strong> {aiLinguistics.profanityFlag ? "⚠️ Flagged" : "✅ Clean"}</p>
                      <p className="mt-2 pt-2 border-t border-white/5 leading-relaxed italic text-white/50">{aiLinguistics.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Board */}
            <div className="bg-[#121212] border border-white/5 p-6 rounded-lg space-y-4 flex flex-col max-h-[460px]">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <MessageSquare className="size-4 text-[#C8A96A]" />
                <h3 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest">
                  Internal Collab Chat
                </h3>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-xs font-sans max-h-60 scrollbar-thin scrollbar-thumb-white/5">
                {comments.length > 0 ? (
                  comments.map((c) => (
                    <div key={c.id} className="bg-white/5 border border-white/5 p-2.5 rounded-lg">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[#C8A96A] font-bold">{c.authorName}</span>
                        <span className="text-[9px] text-white/40 font-mono">
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
                  <p className="text-white/20 italic text-center py-4">No internal collaboration logs.</p>
                )}
              </div>

              <div className="border-t border-white/5 pt-3 flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Note edits review findings..."
                  className="bg-background text-xs font-sans border-white/10 rounded-lg focus-visible:ring-0 focus-visible:border-[#C8A96A]/45 h-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handlePostComment();
                  }}
                />
                <Button
                  onClick={handlePostComment}
                  disabled={!commentText.trim()}
                  className="bg-[#C8A96A] hover:bg-[#C8A96A]/95 text-black font-sans text-[10px] uppercase font-black tracking-widest rounded-lg h-9 cursor-pointer"
                >
                  Send
                </Button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[#121212] border border-white/5 p-6 rounded-lg space-y-4 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Clock className="size-4 text-[#C8A96A]" />
                <h3 className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest">
                  Publishing Timeline
                </h3>
              </div>

              <div className="space-y-4 font-sans text-xs relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5 pr-1">
                {timeline.length > 0 ? (
                  timeline.map((event) => (
                    <div key={event.id} className="flex gap-3 items-start relative pl-6">
                      <div className="size-2 rounded-full bg-[#C8A96A]/60 absolute left-2 top-1.5" />
                      <div className="flex-1">
                        <p className="font-bold text-white/80 uppercase tracking-wider text-[9px]">
                          {event.action.replace(/_/g, " ")}
                        </p>
                        {event.action === "STORY_STATUS_CHANGE" && (
                          <p className="text-[10px] text-white/50 mt-0.5">
                            Status changed: <span className="text-[#C8A96A] font-semibold">{event.meta?.from}</span> &rarr; <span className="text-emerald-400 font-semibold">{event.meta?.to}</span>
                          </p>
                        )}
                        {event.action === "ROLLBACK_STORY" && (
                          <p className="text-[10px] text-white/50 mt-0.5">
                            Restored to version v{event.meta?.toVersion}
                          </p>
                        )}
                        <span className="text-[9px] text-white/30 block mt-1 font-mono">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/20 italic text-center py-2">No system timeline events.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
