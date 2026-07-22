import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  UserCheck,
  CheckCircle,
  XCircle,
  Save,
  Clock,
  FileText,
  Sparkles,
  MapPin,
  Globe,
  Tag,
  Mail,
  Phone,
  Video,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/submissions/$id")({
  component: AdminSubmissionDetailPage,
});

function AdminSubmissionDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { id?: string };
  const id = params?.id || "";
  const { user, session, initialized } = useAuthStore();

  const [submission, setSubmission] = useState<any>(null);
  const [editors, setEditors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Editor Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEditorId, setSelectedEditorId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  const loadData = async () => {
    if (!session) return;
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Fetch submission details
      const subRes = await fetch(`/api/admin/submissions`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const subData = await subRes.json();
      const item = (subData.submissions || []).find((s: any) => s.id === id);
      if (!item) {
        setErrorMsg("Submission not found");
      } else {
        setSubmission(item);
        setAdminNotes(item.adminNotes || "");
      }

      // 2. Fetch Editors for assignment
      const usersRes = await fetch(`/api/admin/users?pageSize=100`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const usersData = await usersRes.json();
      const staffList = (usersData.users || []).filter(
        (u: any) =>
          u.role?.toLowerCase() === "editor" ||
          u.role?.toLowerCase() === "admin" ||
          u.role?.toLowerCase() === "superadmin"
      );
      setEditors(staffList);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to load submission");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) void loadData();
  }, [session, id]);

  const handleAction = async (action: string, editorId?: string) => {
    if (!session || !submission) return;
    setActionLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/submissions/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          submissionId: submission.id,
          action,
          adminNotes,
          editorId: editorId || selectedEditorId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      setSuccessMsg(`Submission updated to ${action}`);
      setShowAssignModal(false);
      void loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Submission Review">
        <div className="p-12 text-center text-muted-foreground animate-pulse text-xs uppercase tracking-widest">
          Loading submission details...
        </div>
      </AdminLayout>
    );
  }

  if (errorMsg && !submission) {
    return (
      <AdminLayout title="Error">
        <div className="p-8 max-w-md mx-auto text-center space-y-4">
          <ShieldAlert className="size-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold">{errorMsg}</h2>
          <Button onClick={() => void navigate({ to: "/editor" })} size="sm">
            Return to Newsroom
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Submission #${submission.id.slice(0, 8)}`}>
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Navigation & Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/editor"
              search={{ tab: "pipeline" }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {submission.status}
                </span>
                <span className="text-xs text-white/40">
                  Submitted {new Date(submission.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold text-white mt-1">
                {submission.title}
              </h1>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssignModal(true)}
              className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 cursor-pointer"
            >
              <UserCheck className="size-3.5" />
              Assign Editor
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => handleAction("Rejected")}
              className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10 cursor-pointer"
            >
              <XCircle className="size-3.5" />
              Reject
            </Button>

            <Button
              size="sm"
              disabled={actionLoading}
              onClick={() => setShowAssignModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            >
              <CheckCircle className="size-3.5" />
              Approve & Assign
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Submission Content Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Excerpt Box */}
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96A] block mb-1">
                  Submission Title (English)
                </span>
                <h2 className="text-xl font-bold text-white">{submission.title}</h2>
              </div>

              {submission.titleHi && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Submission Title (Hindi)
                  </span>
                  <h3 className="text-lg font-medium text-white/90">{submission.titleHi}</h3>
                </div>
              )}

              {submission.excerpt && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                    Excerpt / Summary
                  </span>
                  <p className="text-sm text-white/80 leading-relaxed italic bg-white/5 p-3 rounded-lg border border-white/5">
                    {submission.excerpt}
                  </p>
                </div>
              )}
            </div>

            {/* Main Content Body */}
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96A] block">
                Story Narrative Content
              </span>
              <div className="prose prose-invert max-w-none text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                {submission.content || "No narrative content provided."}
              </div>
            </div>

            {/* Media & Attachments */}
            {(submission.imageUrl || submission.videoUrl || submission.galleryUrls) && (
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96A] block">
                  Media & Visual Attachments
                </span>
                {submission.imageUrl && (
                  <div>
                    <img
                      src={submission.imageUrl}
                      alt={submission.title}
                      className="w-full max-h-80 object-cover rounded-lg border border-white/10"
                    />
                    {submission.imageCaption && (
                      <p className="text-xs text-white/50 mt-1 italic">
                        Caption: {submission.imageCaption}
                      </p>
                    )}
                  </div>
                )}
                {submission.videoUrl && (
                  <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                    <Video className="size-4 shrink-0" />
                    <span className="truncate">Video Link: {submission.videoUrl}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-6">
            {/* Author Card */}
            <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96A] block">
                Contributor Metadata
              </span>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#C8A96A]/20 border border-[#C8A96A]/40 flex items-center justify-center font-black text-[#C8A96A]">
                  {(submission.authorName || "C").charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {submission.authorName || "Anonymous"}
                  </h4>
                  <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                    <Mail className="size-3 text-white/30" />
                    {submission.email || "No email"}
                  </p>
                </div>
              </div>
            </div>

            {/* Geographical Location */}
            <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96A] block">
                Geographical Context
              </span>
              <div className="space-y-2 text-xs text-white/80">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/40">State:</span>
                  <span className="font-bold text-white">{submission.stateName || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/40">District:</span>
                  <span className="font-bold text-white">{submission.district || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Themes:</span>
                  <span className="font-bold text-[#C8A96A]">{submission.themes || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96A] block">
                Editorial Review Notes
              </span>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add editorial review guidance or notes for assigned editor..."
                rows={4}
                className="w-full text-xs bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#C8A96A]"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction(submission.status)}
                className="w-full text-xs cursor-pointer border-white/10 hover:bg-white/10"
              >
                <Save className="size-3.5" /> Save Editorial Notes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Assign Editor</h3>
              <p className="text-xs text-white/50 mt-1">
                Select an editorial team member to review and polish this submission.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                Select Editorial Staff Member
              </label>
              <select
                value={selectedEditorId}
                onChange={(e) => setSelectedEditorId(e.target.value)}
                className="w-full text-xs bg-black/60 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-[#C8A96A]"
              >
                <option value="">-- Choose Editor --</option>
                {editors.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.fullName || ed.email} ({ed.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAssignModal(false)}
                className="text-white/60 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!selectedEditorId || actionLoading}
                onClick={() => handleAction("ASSIGNED_TO_EDITOR")}
                className="bg-[#C8A96A] hover:bg-[#b59659] text-black font-bold cursor-pointer"
              >
                Assign & Transition
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
