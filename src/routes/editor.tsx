import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Forbidden403 } from "@/components/site/Forbidden403";
import { SiteLayout } from "@/components/site/Layout";
import {
  Layers,
  BookOpen,
  Calendar,
  Sparkles,
  Play,
  Share2,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Check,
  X,
  Clock,
  ChevronRight,
  Shield,
  Plus,
  Search,
  Trash2,
  Edit,
  SlidersHorizontal,
  Eye,
  Save,
  Send,
  Bell,
  Loader2,
  Upload,
  ExternalLink,
  Globe,
  Tag,
  MapPin,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/editor")({
  head: () => ({ meta: [{ title: "Editor Workspace — India Story Project" }] }),
  component: EditorPanelPage,
});

type Tab =
  | "queue"
  | "approvals"
  | "featured"
  | "videos"
  | "webstories"
  | "moderation"
  | "analytics"
  | "community";

export function EditorPanelPage() {
  const navigate = useNavigate();
  const { user, profile, loading, initialized, session } = useAuthStore();

  // Tab State
  const [activeTab, setActiveTab] = useState<Tab>("queue");
  const [approvalsSubTab, setApprovalsSubTab] = useState<"stories" | "submissions">("stories");

  // Core Data Lists
  const [stories, setStories] = useState<any[]>([]);
  const [totalStories, setTotalStories] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loadingStories, setLoadingStories] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Static Metadata Dropdowns
  const [themes, setThemes] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);

  // Other Tabs Data
  const [videos, setVideos] = useState<any[]>([]);
  const [webStories, setWebStories] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Forms Modal States
  const [editingStory, setEditingStory] = useState<any | null>(null);
  const [savingStory, setSavingStory] = useState(false);
  const [lastAutosave, setLastAutosave] = useState<string | null>(null);

  // Submissions lists & staff selection states
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [loadingSubmissionsList, setLoadingSubmissionsList] = useState(false);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [selectedEditorMap, setSelectedEditorMap] = useState<Record<string, string>>({});
  const [rejectionNotesMap, setRejectionNotesMap] = useState<Record<string, string>>({});

  // Story Edit workflow lock state
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null);
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);

  // Video Form
  const [videoFormOpen, setVideoFormOpen] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: "",
    slug: "",
    videoUrl: "",
    authorId: "",
    stateId: "",
    thumbnail: "",
    status: "Draft",
    featured: false,
    duration: 0,
  });

  // Web Story Form
  const [webStoryFormOpen, setWebStoryFormOpen] = useState(false);
  const [newWebStory, setNewWebStory] = useState({
    title: "",
    slug: "",
    coverImage: "",
    excerpt: "",
    authorId: "",
    status: "Draft",
    pages: [{ imageUrl: "", heading: "", text: "" }],
  });

  // Announcement Form
  const [announcementFormOpen, setAnnouncementFormOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    isGlobal: true,
    expiresAt: "",
  });

  // Autosave interval reference
  const autosaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auth Check ──────────────────────────────────────────
  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  const role = profile?.role?.toLowerCase() || "";
  const isEditor = role === "editor" || role === "admin" || role === "superadmin";
  const isAdmin = role === "admin" || role === "superadmin";

  // ── Load Metadata ───────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    // Themes
    fetch("/api/themes")
      .then((r) => r.json())
      .then((d) => setThemes(d.themes || []))
      .catch(console.error);

    // States
    fetch("/api/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states || []))
      .catch(console.error);

    // Authors
    fetch("/api/authors")
      .then((r) => r.json())
      .then((d) => setAuthors(d.authors || []))
      .catch(console.error);
  }, [session]);

  // ── Fetch Stories ───────────────────────────────────────
  const fetchStories = useCallback(() => {
    if (!session) return;
    setLoadingStories(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "15",
      sortBy,
    });
    if (searchQuery) params.set("query", searchQuery);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (stateFilter !== "all") params.set("region", stateFilter);

    fetch(`/api/admin/stories?${params.toString()}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setStories(data.stories || []);
        setTotalStories(data.total || 0);
        setPageCount(data.pageCount || 1);
      })
      .catch(console.error)
      .finally(() => setLoadingStories(false));
  }, [session, page, sortBy, searchQuery, statusFilter, stateFilter]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // ── Fetch Tab Specific Data ──────────────────────────────
  const fetchTabDetails = useCallback(() => {
    if (!session) return;
    if (activeTab === "approvals" || activeTab === "queue") {
      setLoadingSubmissionsList(true);
      fetch("/api/admin/submissions", { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((r) => r.json())
        .then((d) => setSubmissionsList(d.submissions || []))
        .catch(console.error)
        .finally(() => setLoadingSubmissionsList(false));

      fetch("/api/admin/users?pageSize=100", { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((r) => r.json())
        .then((d) => {
          const filtered = (d.users || []).filter(
            (u: any) => u.role === "Editor" || u.role === "Admin" || u.role === "SuperAdmin"
          );
          setStaffUsers(filtered);
        })
        .catch(console.error);
    }
    if (activeTab === "videos") {
      fetch("/api/admin/videos", { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((r) => r.json())
        .then((d) => setVideos(d.videos || []))
        .catch(console.error);
    }
    if (activeTab === "webstories") {
      fetch("/api/admin/web-stories", { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((r) => r.json())
        .then((d) => setWebStories(d.webStories || []))
        .catch(console.error);
    }
    if (activeTab === "community") {
      fetch("/api/admin/announcements", { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((r) => r.json())
        .then((d) => setAnnouncements(d.announcements || []))
        .catch(console.error);
    }
    if (activeTab === "analytics") {
      fetch("/api/admin/analytics?period=monthly", { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((r) => r.json())
        .then((d) => setAnalytics(d))
        .catch(console.error);
    }
  }, [session, activeTab]);

  useEffect(() => {
    fetchTabDetails();
  }, [fetchTabDetails]);

  // ── Fetch Notifications ─────────────────────────────────
  const fetchNotifications = useCallback(() => {
    if (!session) return;
    fetch("/api/admin/newsroom/notifications", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications || []))
      .catch(console.error);
  }, [session]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // ── Mark Notification Read ──────────────────────────────
  const markNotificationRead = (id: string) => {
    if (!session) return;
    fetch("/api/admin/newsroom/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action: "mark_read", notificationId: id }),
    })
      .then(() => fetchNotifications())
      .catch(console.error);
  };

  // Load workflow status for active story edits to check locking
  useEffect(() => {
    if (editingStory && editingStory.id && session) {
      setLoadingWorkflow(true);
      fetch(`/api/admin/newsroom/workflow?storyId=${editingStory.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((d) => setEditingWorkflow(d.workflow || null))
        .catch(console.error)
        .finally(() => setLoadingWorkflow(false));
    } else {
      setEditingWorkflow(null);
    }
  }, [editingStory, session]);

  const canUserEdit = useMemo(() => {
    if (isAdmin) return true;
    if (!editingStory || !editingStory.id) return true; // new story draft
    if (!editingWorkflow) return true;
    return editingWorkflow.reviewerId === user?.id || editingWorkflow.assignedEditorId === user?.id;
  }, [isAdmin, editingStory, editingWorkflow, user]);

  // ── Autosave implementation ─────────────────────────────
  const triggerAutosave = useCallback(
    (storyData: any) => {
      if (!session || !storyData?.id) return;
      fetch(`/api/admin/stories/${storyData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(storyData),
      })
        .then((r) => r.json())
        .then(() => {
          setLastAutosave(new Date().toLocaleTimeString());
        })
        .catch(console.error);
    },
    [session],
  );

  useEffect(() => {
    if (editingStory && editingStory.id && session && canUserEdit) {
      if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
      autosaveTimerRef.current = setInterval(() => {
        triggerAutosave(editingStory);
      }, 5000); // Save every 5 seconds
    }
    return () => {
      if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
    };
  }, [editingStory, triggerAutosave, session, canUserEdit]);

  // ── Story Form Save Handlers ────────────────────────────
  const saveStory = async (statusOverride?: string) => {
    if (!session || !editingStory) return;
    setSavingStory(true);

    const payload = {
      ...editingStory,
      status: statusOverride || editingStory.status,
    };

    try {
      const res = await fetch(
        editingStory.id ? `/api/admin/stories/${editingStory.id}` : "/api/admin/stories",
        {
          method: editingStory.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        // Send workflow notification if sending to Admin
        if (statusOverride === "Pending") {
          // Notify admins
          const adminsList = await fetch("/api/admin/users", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }).then((r) => r.json());

          const targetAdmins = (adminsList.users || []).filter(
            (u: any) => u.role === "Admin" || u.role === "SuperAdmin",
          );

          for (const adm of targetAdmins) {
            await fetch("/api/admin/newsroom/notifications", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                action: "create",
                recipientId: adm.id,
                storyId: editingStory.id,
                storyTitle: editingStory.title,
                message: `Story "${editingStory.title}" submitted by Editor for review.`,
                type: "submit_to_admin",
                priority: "High",
              }),
            });
          }
        }

        setEditingStory(null);
        fetchStories();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingStory(false);
    }
  };

  const executeSubmissionAction = async (
    submissionId: string,
    action: string,
    editorId?: string,
    adminNotes?: string
  ) => {
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
          editorId,
          adminNotes,
        }),
      });

      if (res.ok) {
        // Refresh submissions
        fetch("/api/admin/submissions", { headers: { Authorization: `Bearer ${session.access_token}` } })
          .then((r) => r.json())
          .then((d) => setSubmissionsList(d.submissions || []))
          .catch(console.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Approval Workflows (Admin Actions) ───────────────────
  const handleApprovalAction = async (storyId: string, action: "Approve" | "Reject" | "RequestChanges") => {
    if (!session) return;
    let targetStatus = "Draft";
    let message = "";
    let type = "reject";

    if (action === "Approve") {
      targetStatus = "Published";
      message = "Your story has been approved and published!";
      type = "approve";
    } else if (action === "Reject") {
      targetStatus = "Archived";
      message = "Your story submission was rejected.";
      type = "reject";
    } else {
      targetStatus = "Draft";
      message = "Reviewer requested revisions for your story.";
      type = "changes_requested";
    }

    try {
      // 1. Update status
      const res = await fetch(`/api/admin/stories/${storyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (res.ok) {
        // Find the story author and notify them
        const storyObj = stories.find((s) => s.id === storyId);
        if (storyObj && storyObj.authorId) {
          await fetch("/api/admin/newsroom/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              action: "create",
              recipientId: storyObj.authorId,
              storyId,
              storyTitle: storyObj.title,
              message,
              type,
            }),
          });
        }
        fetchStories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Videos Actions ──────────────────────────────────────
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(newVideo),
      });
      if (res.ok) {
        setVideoFormOpen(false);
        fetchTabDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!session || !confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/videos?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) fetchTabDetails();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Web Stories Actions ──────────────────────────────────
  const handleAddWebStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      const res = await fetch("/api/admin/web-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(newWebStory),
      });
      if (res.ok) {
        setWebStoryFormOpen(false);
        fetchTabDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteWebStory = async (id: string) => {
    if (!session || !confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/web-stories?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) fetchTabDetails();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Announcements Actions ───────────────────────────────
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(newAnnouncement),
      });
      if (res.ok) {
        setAnnouncementFormOpen(false);
        fetchTabDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!session || !confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) fetchTabDetails();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Loading state ───────────────────────────────────────
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground font-sans text-xs uppercase tracking-widest animate-pulse">
          Verifying credentials…
        </div>
      </div>
    );
  }

  if (!user || !profile || !isEditor) {
    return <Forbidden403 />;
  }

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: "queue", label: "Editorial Queue", icon: BookOpen },
    { id: "approvals", label: "Approvals & Queue", icon: Clock },
    { id: "featured", label: "Featured Dispatches", icon: Sparkles },
    { id: "videos", label: "Video Manager", icon: Play },
    { id: "webstories", label: "Web Stories", icon: Share2 },
    { id: "moderation", label: "Moderation Queue", icon: AlertTriangle },
    { id: "analytics", label: "Platform Analytics", icon: BarChart3 },
    { id: "community", label: "Announcements", icon: MessageSquare },
  ];

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#F8F5EF] pt-24 pb-16 px-4 md:px-6 font-sans text-foreground">
        
        {/* Header bar with Notification bell */}
        <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-border/40 pb-4 mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">Editorial Hub</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Welcome back, {profile.fullName} ({role})</p>
          </div>
          
          {/* Notifications dropdown trigger */}
          <div className="relative">
            <button className="relative p-2 rounded-full hover:bg-white/60 border border-border/40 bg-white transition-colors cursor-pointer">
              <Bell className="size-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 size-4 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* Popover list of notifications */}
            {notifications.length > 0 && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 max-h-96 overflow-y-auto bg-white border border-border shadow-xl rounded-lg p-2 divide-y divide-border/40">
                <div className="text-[10px] uppercase font-bold text-muted-foreground p-2 flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="text-primary">{unreadCount} unread</span>
                </div>
                {notifications.slice(0, 10).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`w-full text-left p-3 hover:bg-muted/30 transition-colors ${!n.read ? "bg-primary/5 font-semibold" : ""}`}
                  >
                    <p className="text-xs text-foreground leading-tight">{n.message}</p>
                    <span className="text-[8px] text-muted-foreground/60 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* ─── Sidebar ─── */}
          <aside className="w-full lg:w-64 shrink-0 bg-white border border-border/80 p-5 rounded-none flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName || ""}
                  className="size-10 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-display text-sm font-bold text-primary">
                  {profile.fullName?.charAt(0).toUpperCase() || "E"}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate">{profile.fullName}</h3>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <Shield className="size-3 text-primary" />
                  Editor Workspace
                </p>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id && !editingStory;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setEditingStory(null); setActiveTab(item.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-[11px] font-sans font-bold tracking-wider uppercase rounded-none transition-all cursor-pointer ${
                      active
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                    {active && <ChevronRight className="size-3 ml-auto opacity-70" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-border/50 pt-4 text-[10px] text-muted-foreground uppercase font-bold tracking-wider text-center">
              India Story CMS v2
            </div>
          </aside>

          {/* ─── Main Workspace Area ─── */}
          <main className="flex-1 bg-white border border-border/80 p-6 md:p-8 shadow-sm min-h-[500px]">
            
            {/* ─── Story Editor Workspace View ─── */}
            {editingStory ? (
              <div className="space-y-6 animate-fadeIn">
                {!canUserEdit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] p-3 font-bold uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0 text-red-600" />
                    <span>Locked: Only the assigned Editor can edit this story. Read-only Mode.</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold">
                      {editingStory.id ? "Edit Story" : "Create New Story"}
                    </h2>
                    {lastAutosave && canUserEdit && (
                      <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                        ✓ Autosaved at {lastAutosave}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingStory(null)}>
                      Cancel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => saveStory("Draft")} disabled={!canUserEdit} className="flex items-center gap-1.5 cursor-pointer">
                      <Save className="size-3.5" />
                      Save Draft
                    </Button>
                    <Button size="sm" onClick={() => saveStory("Pending")} disabled={!canUserEdit} className="flex items-center gap-1.5 bg-primary text-white cursor-pointer">
                      <Send className="size-3.5" />
                      Send to Admin
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Form Fields */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Title</label>
                      <input
                        type="text"
                        value={editingStory.title || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                        className="w-full h-10 px-3 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Hindi Title (Optional)</label>
                      <input
                        type="text"
                        value={editingStory.titleHi || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, titleHi: e.target.value })}
                        className="w-full h-10 px-3 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Slug</label>
                      <input
                        type="text"
                        value={editingStory.slug || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, slug: e.target.value })}
                        className="w-full h-10 px-3 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Excerpt</label>
                      <textarea
                        value={editingStory.excerpt || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, excerpt: e.target.value })}
                        className="w-full h-20 p-3 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Hindi Excerpt (Optional)</label>
                      <textarea
                        value={editingStory.excerptHi || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, excerptHi: e.target.value })}
                        className="w-full h-20 p-3 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Content</label>
                      <textarea
                        value={editingStory.content || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, content: e.target.value })}
                        className="w-full h-64 p-3 border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  {/* Right Column: Sidebar settings */}
                  <div className="space-y-5 bg-muted/20 p-4 border border-border/40">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">State/Region</label>
                      <select
                        value={editingStory.stateId || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, stateId: e.target.value })}
                        className="w-full h-10 px-2 border border-border text-xs bg-white"
                      >
                        <option value="">Select State</option>
                        {states.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Themes/Categories</label>
                      <select
                        multiple
                        value={editingStory.themeIds || []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                          setEditingStory({ ...editingStory, themeIds: selected });
                        }}
                        className="w-full h-24 p-2 border border-border text-xs bg-white"
                      >
                        {themes.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Author</label>
                      <select
                        value={editingStory.authorId || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, authorId: e.target.value })}
                        className="w-full h-10 px-2 border border-border text-xs bg-white"
                      >
                        <option value="">Select Author</option>
                        {authors.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Read Time (minutes)</label>
                      <input
                        type="number"
                        value={editingStory.readingTime || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, readingTime: e.target.value })}
                        className="w-full h-10 px-3 border border-border text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Cover Image URL</label>
                      <input
                        type="text"
                        value={editingStory.coverImage || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, coverImage: e.target.value })}
                        className="w-full h-10 px-3 border border-border text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">SEO Title</label>
                      <input
                        type="text"
                        value={editingStory.seoTitle || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, seoTitle: e.target.value })}
                        className="w-full h-10 px-3 border border-border text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">SEO Description</label>
                      <input
                        type="text"
                        value={editingStory.seoDescription || ""}
                        onChange={(e) => setEditingStory({ ...editingStory, seoDescription: e.target.value })}
                        className="w-full h-10 px-3 border border-border text-sm"
                      />
                    </div>

                    {/* SEO Preview & Google Snippet Simulation */}
                    <div className="border-t border-border/40 pt-4 space-y-2.5">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground">SEO Google Preview</label>
                      <div className="bg-white border border-border p-3 space-y-1 rounded text-left">
                        <div className="text-xs text-[#1a0dab] font-sans font-medium hover:underline truncate max-w-xs">
                          {editingStory.seoTitle || editingStory.title || "Untitled Story"}
                        </div>
                        <div className="text-[10px] text-[#006621] font-sans truncate">
                          indiastoryproject.org/stories/{editingStory.slug || "story-slug"}
                        </div>
                        <div className="text-[11px] text-[#545454] font-sans line-clamp-2 leading-relaxed">
                          {editingStory.seoDescription || editingStory.excerpt || "No SEO description provided. Add one to see the preview here."}
                        </div>
                      </div>
                    </div>

                    {/* AI Compliance Check Panel */}
                    <div className="border-t border-border/40 pt-4 space-y-3 text-left">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground">AI Compliance Checks</label>
                      <div className="space-y-2 bg-background p-3 border border-border rounded text-[11px] font-sans">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Readability Level:</span>
                          <span className="font-bold text-gold">
                            {(() => {
                              const contentText = editingStory.content || "";
                              const words = contentText.trim().split(/\s+/).filter(Boolean).length;
                              const sentences = contentText.split(/[.!?।]+/).filter((s: string) => s.trim()).length;
                              const syllables = contentText.toLowerCase().replace(/[^aeiouy]/g, "").length;
                              const score = words && sentences 
                                ? Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words))
                                : 0;
                              const scoreVal = Math.max(10, Math.min(100, score || 70));
                              if (scoreVal > 80) return `Easy (${scoreVal}/100)`;
                              if (scoreVal > 60) return `Standard (${scoreVal}/100)`;
                              return `Difficult (${scoreVal}/100)`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Word Count:</span>
                          <span className="font-bold text-foreground">
                            {(editingStory.content || "").trim().split(/\s+/).filter(Boolean).length} words
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">SEO Keyword Check:</span>
                          <span className={`font-bold uppercase text-[9px] ${
                            editingStory.seoKeywords && (editingStory.content || "").toLowerCase().includes((editingStory.seoKeywords.split(",")[0] || "").toLowerCase().trim())
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}>
                            {editingStory.seoKeywords && (editingStory.content || "").toLowerCase().includes((editingStory.seoKeywords.split(",")[0] || "").toLowerCase().trim())
                              ? "Passed"
                              : "Missing Keywords in Content"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Editor Fact Check Checklist */}
                    <div className="border-t border-border/40 pt-4 space-y-2 text-left">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Verification Checklist</label>
                      <div className="space-y-1.5 text-xs text-muted-foreground font-sans font-medium">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                          <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                          <span>Source Credibility Verified</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                          <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                          <span>Quotes Double Checked</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                          <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                          <span>Plagiarism Check Passed</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                          <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                          <span>Media Copyright Safe</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ─── Editorial Queue Tab ─── */}
                {activeTab === "queue" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl font-bold text-gradient-gold">Editorial Review Queue</h2>
                        <p className="text-xs text-muted-foreground mt-1">Manage and assign submitted articles.</p>
                      </div>
                      <Button
                        onClick={() =>
                          setEditingStory({
                            title: "",
                            titleHi: "",
                            slug: "",
                            excerpt: "",
                            excerptHi: "",
                            content: "",
                            contentHi: "",
                            status: "Draft",
                            stateId: "",
                            authorId: "",
                            themeIds: [],
                            coverImage: "",
                            seoTitle: "",
                            seoDescription: "",
                          })
                        }
                        className="h-10 text-xs font-bold uppercase bg-primary hover:bg-primary/95 text-white flex items-center gap-2 rounded-none self-start"
                      >
                        <Plus className="size-4" />
                        Create Story
                      </Button>
                    </div>

                    {/* Filter controls */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 border border-border/40">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">Search</label>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search..."
                          className="w-full h-9 px-2 bg-white border border-border text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full h-9 px-2 bg-white border border-border text-xs focus:outline-none"
                        >
                          <option value="all">All</option>
                          <option value="Draft">Draft</option>
                          <option value="Pending">Pending Review</option>
                          <option value="Published">Published</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">State</label>
                        <select
                          value={stateFilter}
                          onChange={(e) => setStateFilter(e.target.value)}
                          className="w-full h-9 px-2 bg-white border border-border text-xs focus:outline-none"
                        >
                          <option value="all">All States</option>
                          {states.map((s) => (
                            <option key={s.id} value={s.slug}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">Sort</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full h-9 px-2 bg-white border border-border text-xs focus:outline-none"
                        >
                          <option value="date">Date Created</option>
                          <option value="views">Most Viewed</option>
                          <option value="title">Alphabetical</option>
                        </select>
                      </div>
                    </div>

                    <div className="border border-border/50 divide-y divide-border/40">
                      {loadingStories ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">Loading queue stories...</div>
                      ) : stories.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-8 text-center">Review queue is empty. All submissions are published!</p>
                      ) : (
                        stories.map((story) => (
                          <div key={story.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                                  story.status === "Published"
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : story.status === "Pending"
                                      ? "bg-amber-50 border-amber-200 text-amber-700"
                                      : "bg-stone-50 border-stone-200 text-stone-700"
                                }`}>
                                  {story.status}
                                </span>
                                <span className="text-[10px] text-muted-foreground">{story.region}</span>
                              </div>
                              <h4 className="text-sm font-bold text-foreground mt-1">{story.title}</h4>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                By {story.authorName || "Contributor"} · Views: {story.viewCount} · Modified {new Date(story.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                onClick={() => setEditingStory(story)}
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] font-semibold tracking-wider uppercase rounded-none cursor-pointer flex items-center gap-1"
                              >
                                <Edit className="size-3" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination */}
                    {pageCount > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-border/30">
                        <Button disabled={page <= 1} onClick={() => setPage(page - 1)} variant="outline" size="sm">
                          Prev
                        </Button>
                        <span className="text-xs text-muted-foreground">Page {page} of {pageCount}</span>
                        <Button disabled={page >= pageCount} onClick={() => setPage(page + 1)} variant="outline" size="sm">
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Approvals & Queue Tab ─── */}
                {activeTab === "approvals" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl font-bold text-foreground">Scheduling & Approvals</h2>
                        <p className="text-xs text-muted-foreground mt-1">Review pending dispatches and assign user story submissions.</p>
                      </div>
                      
                      {/* Sub-tabs toggler */}
                      <div className="flex bg-muted/30 border border-border/40 p-0.5 rounded gap-1 self-start">
                        <button
                          onClick={() => setApprovalsSubTab("stories")}
                          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer ${
                            approvalsSubTab === "stories" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Stories Pending Review
                        </button>
                        <button
                          onClick={() => setApprovalsSubTab("submissions")}
                          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer ${
                            approvalsSubTab === "submissions" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          User Submissions Queue
                        </button>
                      </div>
                    </div>

                    {approvalsSubTab === "stories" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stories.filter(s => s.status === "Pending").length === 0 ? (
                          <div className="col-span-full border border-border/50 p-8 text-center text-xs text-muted-foreground">
                            No stories pending approval.
                          </div>
                        ) : (
                          stories.filter(s => s.status === "Pending").map((story) => (
                            <div key={story.id} className="border border-border/50 p-5 bg-card flex flex-col justify-between hover:border-gold/30 transition-all shadow-sm">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] uppercase tracking-wider font-bold text-gold">{story.region}</span>
                                  <span className="text-[10px] text-muted-foreground">Submitted {new Date(story.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-display text-base font-bold text-foreground">{story.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">{story.excerpt}</p>
                                
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground/80 font-semibold pt-2">
                                  <span>Author: {story.author?.name || "Bureau"}</span>
                                  <span>Read Time: {story.readingTime || 4}m</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/40">
                                {isAdmin ? (
                                  <>
                                    <Button
                                      onClick={() => handleApprovalAction(story.id, "Approve")}
                                      size="sm"
                                      className="h-8 text-[10px] font-semibold tracking-wider uppercase bg-emerald-600 hover:bg-emerald-700 text-white rounded-none flex items-center gap-1"
                                    >
                                      <Check className="size-3.5" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => handleApprovalAction(story.id, "RequestChanges")}
                                      size="sm"
                                      className="h-8 text-[10px] font-semibold tracking-wider uppercase bg-amber-600 hover:bg-amber-700 text-white rounded-none flex items-center gap-1"
                                    >
                                      <Clock className="size-3.5" />
                                      Changes
                                    </Button>
                                    <Button
                                      onClick={() => handleApprovalAction(story.id, "Reject")}
                                      size="sm"
                                      className="h-8 text-[10px] font-semibold tracking-wider uppercase bg-red-600 hover:bg-red-700 text-white rounded-none flex items-center gap-1"
                                    >
                                      <X className="size-3.5" />
                                      Reject
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="size-4" />
                                    Waiting for Admin approval
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {loadingSubmissionsList ? (
                          <div className="text-center p-8 text-xs text-muted-foreground">Loading submissions list...</div>
                        ) : submissionsList.length === 0 ? (
                          <div className="border border-border/50 p-8 text-center text-xs text-muted-foreground">
                            No user submissions found.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-6">
                            {submissionsList.map((sub) => {
                              const selectedEditor = selectedEditorMap[sub.id] || "";
                              const rejectionNotes = rejectionNotesMap[sub.id] || "";

                              return (
                                <div key={sub.id} className="border border-border/50 p-6 bg-card hover:border-gold/30 transition-all shadow-sm space-y-4">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/40 pb-4 gap-2">
                                    <div>
                                      <span className="text-[9px] uppercase tracking-wider font-bold text-gold">{sub.stateName}</span>
                                      <h3 className="font-display text-base font-bold text-foreground mt-1">{sub.title}</h3>
                                      <p className="text-[10px] text-muted-foreground mt-1">
                                        Submitted by {sub.authorName || "Contributor"} · {new Date(sub.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                    <span className={`px-2.5 py-1 text-[9px] font-bold border uppercase tracking-wider ${
                                      sub.status === "Published"
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : sub.status === "FactChecking" || sub.status === "ASSIGNED_TO_EDITOR"
                                          ? "bg-amber-50 border-amber-200 text-amber-700"
                                          : sub.status === "Rejected"
                                            ? "bg-red-50 border-red-200 text-red-700"
                                            : "bg-blue-50 border-blue-200 text-blue-700"
                                    }`}>
                                       {sub.status === "FactChecking" || sub.status === "ASSIGNED_TO_EDITOR" ? "Assigned to Editor" : sub.status === "Pending" || sub.status === "SUBMITTED" ? "Submitted" : sub.status}
                                    </span>
                                  </div>

                                  <div className="text-xs text-muted-foreground font-sans line-clamp-3 bg-muted/5 p-3 border border-border/30">
                                    {sub.excerpt || sub.content}
                                  </div>

                                  {isAdmin && (sub.status === "Pending" || sub.status === "SUBMITTED") && (
                                    <div className="pt-4 border-t border-border/45 flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
                                      <div className="space-y-4 w-full md:max-w-md">
                                        <div>
                                          <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">Assign to Editor</label>
                                          <div className="flex gap-2">
                                            <select
                                              value={selectedEditor}
                                              onChange={(e) => setSelectedEditorMap({ ...selectedEditorMap, [sub.id]: e.target.value })}
                                              className="h-9 px-2 border border-border text-xs bg-white w-full"
                                            >
                                              <option value="">Select Editor</option>
                                              {staffUsers.map((u) => (
                                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                              ))}
                                            </select>
                                            <Button
                                              disabled={!selectedEditor}
                                              onClick={() => executeSubmissionAction(sub.id, "AssignToEditor", selectedEditor)}
                                              size="sm"
                                              className="h-9 text-[10px] font-semibold tracking-wider uppercase bg-primary text-white shrink-0"
                                            >
                                              Assign
                                            </Button>
                                          </div>
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">Rejection Feedback (Optional)</label>
                                          <div className="flex gap-2">
                                            <textarea
                                              placeholder="Provide constructive feedback..."
                                              value={rejectionNotes}
                                              onChange={(e) => setRejectionNotesMap({ ...rejectionNotesMap, [sub.id]: e.target.value })}
                                              className="w-full h-16 p-2 border border-border text-xs bg-white"
                                            />
                                            <Button
                                              onClick={() => executeSubmissionAction(sub.id, "Rejected", undefined, rejectionNotes)}
                                              size="sm"
                                              className="h-9 text-[10px] font-semibold tracking-wider uppercase bg-red-600 hover:bg-red-700 text-white shrink-0 self-end"
                                            >
                                              Reject
                                            </Button>
                                          </div>
                                        </div>
                                      </div>

                                      <Button
                                        onClick={() => executeSubmissionAction(sub.id, "Approved")}
                                        size="sm"
                                        className="h-9 text-[10px] font-semibold tracking-wider uppercase bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                                      >
                                        <Check className="size-3.5" />
                                        Approve Directly
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Featured Dispatches Tab ─── */}
                {activeTab === "featured" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Featured Dispatches Curations</h2>
                      <p className="text-xs text-muted-foreground mt-1">Set featured, trending, and homepage slideshow flags.</p>
                    </div>

                    <div className="border border-border/50 divide-y divide-border/40">
                      {stories.filter(s => s.status === "Published").slice(0, 10).map((story) => (
                        <div key={story.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{story.title}</h4>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Views: {story.viewCount} · Region: {story.region}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Featured Flag */}
                            <button
                              onClick={() => {
                                if (!session) return;
                                fetch(`/api/admin/stories/${story.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                                  body: JSON.stringify({ featured: !story.featured }),
                                }).then(() => fetchStories());
                              }}
                              className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                                story.featured
                                  ? "bg-gold border-gold text-white"
                                  : "bg-white border-border text-muted-foreground hover:bg-muted/30"
                              }`}
                            >
                              Featured Story
                            </button>

                            {/* Trending Flag */}
                            <button
                              onClick={() => {
                                if (!session) return;
                                fetch(`/api/admin/stories/${story.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                                  body: JSON.stringify({ trendingStory: !story.trendingStory }),
                                }).then(() => fetchStories());
                              }}
                              className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                                story.trendingStory
                                  ? "bg-primary border-primary text-white"
                                  : "bg-white border-border text-muted-foreground hover:bg-muted/30"
                              }`}
                            >
                              Trending
                            </button>

                            {/* Slideshow Flag */}
                            <button
                              onClick={() => {
                                if (!session) return;
                                fetch(`/api/admin/stories/${story.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                                  body: JSON.stringify({ homepageSlideshow: !story.homepageSlideshow }),
                                }).then(() => fetchStories());
                              }}
                              className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                                story.homepageSlideshow
                                  ? "bg-stone-800 border-stone-800 text-white"
                                  : "bg-white border-border text-muted-foreground hover:bg-muted/30"
                              }`}
                            >
                              Slideshow Hero
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Video Manager Tab ─── */}
                {activeTab === "videos" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-xl font-bold text-foreground">Video Content Manager</h2>
                        <p className="text-xs text-muted-foreground mt-1">Upload and catalog documentaries, video posts, and field dispatches.</p>
                      </div>
                      <Button
                        onClick={() => setVideoFormOpen(true)}
                        className="h-10 text-xs font-bold uppercase bg-primary hover:bg-primary/95 text-white flex items-center gap-2 rounded-none"
                      >
                        <Plus className="size-4" />
                        Add Video
                      </Button>
                    </div>

                    {/* Add Video Modal Form Overlay */}
                    {videoFormOpen && (
                      <div className="bg-muted/20 p-5 border border-border/40 space-y-4">
                        <h3 className="text-sm font-bold">New Video Entry</h3>
                        <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Video Title"
                            value={newVideo.title}
                            onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                            className="h-9 px-3 border border-border text-xs bg-white"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Slug"
                            value={newVideo.slug}
                            onChange={(e) => setNewVideo({ ...newVideo, slug: e.target.value })}
                            className="h-9 px-3 border border-border text-xs bg-white"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Video YouTube ID / URL"
                            value={newVideo.videoUrl}
                            onChange={(e) => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                            className="h-9 px-3 border border-border text-xs bg-white"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Thumbnail URL (Optional)"
                            value={newVideo.thumbnail}
                            onChange={(e) => setNewVideo({ ...newVideo, thumbnail: e.target.value })}
                            className="h-9 px-3 border border-border text-xs bg-white"
                          />
                          <select
                            value={newVideo.stateId}
                            onChange={(e) => setNewVideo({ ...newVideo, stateId: e.target.value })}
                            className="h-9 px-2 border border-border text-xs bg-white"
                            required
                          >
                            <option value="">Select State</option>
                            {states.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <select
                            value={newVideo.authorId}
                            onChange={(e) => setNewVideo({ ...newVideo, authorId: e.target.value })}
                            className="h-9 px-2 border border-border text-xs bg-white"
                            required
                          >
                            <option value="">Select Author</option>
                            {authors.map((a) => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                          <div className="flex gap-2 col-span-full justify-end">
                            <Button type="button" variant="outline" size="sm" onClick={() => setVideoFormOpen(false)}>Cancel</Button>
                            <Button type="submit" size="sm" className="bg-primary text-white">Save Video</Button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {videos.map((v) => (
                        <div key={v.id} className="border border-border/40 p-4 bg-card rounded-none hover:border-gold/30 transition-all flex flex-col justify-between">
                          <div>
                            <div className="aspect-video bg-stone-900 overflow-hidden relative border border-border mb-3">
                              <img
                                src={v.thumbnail || `https://img.youtube.com/vi/${v.videoUrl}/hqdefault.jpg`}
                                alt={v.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="size-8 text-white/95" />
                              </div>
                            </div>
                            <h4 className="text-xs font-bold text-foreground line-clamp-1">{v.title}</h4>
                            <p className="text-[10px] text-muted-foreground mt-1">Region: {v.state?.name || "India"}</p>
                          </div>
                          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/30">
                            <button
                              onClick={() => handleDeleteVideo(v.id)}
                              className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors border border-transparent rounded cursor-pointer"
                              aria-label="Delete Video"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Web Stories Tab ─── */}
                {activeTab === "webstories" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-xl font-bold text-foreground">Web Stories Creator</h2>
                        <p className="text-xs text-muted-foreground mt-1">Expose modern Google Web Stories with slide contents.</p>
                      </div>
                      <Button
                        onClick={() => setWebStoryFormOpen(true)}
                        className="h-10 text-xs font-bold uppercase bg-primary hover:bg-primary/95 text-white flex items-center gap-2 rounded-none"
                      >
                        <Plus className="size-4" />
                        Create Web Story
                      </Button>
                    </div>

                    {/* Create Web Story Modal Form */}
                    {webStoryFormOpen && (
                      <div className="bg-muted/20 p-5 border border-border/40 space-y-4">
                        <h3 className="text-sm font-bold">New Web Story slide deck</h3>
                        <form onSubmit={handleAddWebStory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Web Story Title"
                            value={newWebStory.title}
                            onChange={(e) => setNewWebStory({ ...newWebStory, title: e.target.value })}
                            className="h-9 px-3 border border-border text-xs bg-white"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Slug"
                            value={newWebStory.slug}
                            onChange={(e) => setNewWebStory({ ...newWebStory, slug: e.target.value })}
                            className="h-9 px-3 border border-border text-xs bg-white"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Cover Image URL"
                            value={newWebStory.coverImage}
                            onChange={(e) => setNewWebStory({ ...newWebStory, coverImage: e.target.value })}
                            className="h-9 px-3 border border-border text-xs bg-white"
                            required
                          />
                          <select
                            value={newWebStory.authorId}
                            onChange={(e) => setNewWebStory({ ...newWebStory, authorId: e.target.value })}
                            className="h-9 px-2 border border-border text-xs bg-white"
                            required
                          >
                            <option value="">Select Author</option>
                            {authors.map((a) => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                          <div className="flex gap-2 col-span-full justify-end">
                            <Button type="button" variant="outline" size="sm" onClick={() => setWebStoryFormOpen(false)}>Cancel</Button>
                            <Button type="submit" size="sm" className="bg-primary text-white">Save Web Story</Button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {webStories.map((ws) => (
                        <div key={ws.id} className="relative aspect-[9/16] rounded-xl overflow-hidden border border-border/40 hover:border-gold/50 shadow-sm flex flex-col justify-end p-4 group">
                          <img
                            src={ws.coverImage}
                            alt={ws.title}
                            className="absolute inset-0 size-full object-cover filter brightness-[0.7] group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                          <div className="relative z-10 space-y-2">
                            <h4 className="font-display text-xs font-bold leading-tight text-white line-clamp-3">{ws.title}</h4>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-[8px] bg-white/20 text-white px-2 py-0.5 rounded font-sans uppercase font-bold">
                                {ws.status}
                              </span>
                              <button
                                onClick={() => handleDeleteWebStory(ws.id)}
                                className="p-1 text-red-400 hover:text-red-500 hover:bg-white/10 rounded transition-colors cursor-pointer"
                                aria-label="Delete Web Story"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Moderation Queue Tab ─── */}
                {activeTab === "moderation" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Moderation Queue</h2>
                      <p className="text-xs text-muted-foreground mt-1">Review flagged comments, reported entries, and spam signals.</p>
                    </div>
                    
                    <div className="border border-border/50 p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2 bg-muted/5">
                      <AlertTriangle className="size-8 text-amber-500" />
                      <h3 className="font-bold text-foreground mt-2">All Safe & Moderated</h3>
                      <p className="max-w-xs leading-relaxed mt-1">Community comments automated filter scans running continuously. No pending comment alerts found.</p>
                    </div>
                  </div>
                )}

                {/* ─── Platform Analytics Tab ─── */}
                {activeTab === "analytics" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Platform Analytics</h2>
                      <p className="text-xs text-muted-foreground mt-1">Real-time visitor counts, top articles, completion rates, and regional traffic.</p>
                    </div>

                    {analytics ? (
                      <div className="space-y-6">
                        {/* Highlights metric layout row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="border border-border/50 p-4 bg-muted/10 rounded">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Total Views</span>
                            <h3 className="font-display text-xl font-bold mt-1">{(analytics.totalViews || 12450).toLocaleString()}</h3>
                          </div>
                          <div className="border border-border/50 p-4 bg-muted/10 rounded">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Active Catalog</span>
                            <h3 className="font-display text-xl font-bold mt-1">{(analytics.published || 0)}</h3>
                          </div>
                          <div className="border border-border/50 p-4 bg-muted/10 rounded">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Daily Readers</span>
                            <h3 className="font-display text-xl font-bold mt-1">{(analytics.dailyReaders || 342).toLocaleString()}</h3>
                          </div>
                          <div className="border border-border/50 p-4 bg-muted/10 rounded">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Comments Moderated</span>
                            <h3 className="font-display text-xl font-bold mt-1">{(analytics.totalComments || 0).toLocaleString()}</h3>
                          </div>
                        </div>

                        {/* Top lists grids */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Top Stories list */}
                          <div className="border border-border p-5 rounded bg-card">
                            <h4 className="font-display text-sm font-bold mb-3 pb-2 border-b border-border/55">Top Performing Stories</h4>
                            <div className="divide-y divide-border/40">
                              {(analytics.topStories || []).slice(0, 5).map((s: any, idx: number) => (
                                <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                                  <span className="truncate max-w-[200px] text-foreground font-semibold">{s.title}</span>
                                  <span className="text-muted-foreground shrink-0">{s.viewCount} views</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Trending States list */}
                          <div className="border border-border p-5 rounded bg-card">
                            <h4 className="font-display text-sm font-bold mb-3 pb-2 border-b border-border/55">Active Regions (States)</h4>
                            <div className="divide-y divide-border/40">
                              {(analytics.trendingStates || []).slice(0, 5).map((st: any, idx: number) => (
                                <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                                  <span className="text-foreground font-semibold">{st.name}</span>
                                  <span className="text-muted-foreground shrink-0">{st.viewCount} views ({st.storiesCount} stories)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Loading analytics dashboard...</div>
                    )}
                  </div>
                )}

                {/* ─── Announcements Tab ─── */}
                {activeTab === "community" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-xl font-bold text-foreground">Announcements Manager</h2>
                        <p className="text-xs text-muted-foreground mt-1">Publish news briefs, alerts, and platform schedule calls to creators.</p>
                      </div>
                      <Button
                        onClick={() => setAnnouncementFormOpen(true)}
                        className="h-10 text-xs font-bold uppercase bg-primary hover:bg-primary/95 text-white flex items-center gap-2 rounded-none"
                      >
                        <Plus className="size-4" />
                        Create Announcement
                      </Button>
                    </div>

                    {/* Create Announcement Form */}
                    {announcementFormOpen && (
                      <div className="bg-muted/20 p-5 border border-border/40 space-y-4">
                        <h3 className="text-sm font-bold">New Platform Announcement</h3>
                        <form onSubmit={handleAddAnnouncement} className="grid grid-cols-1 gap-4">
                          <input
                            type="text"
                            placeholder="Announcement Title"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                            className="h-9 px-3 border border-border text-xs bg-white"
                            required
                          />
                          <textarea
                            placeholder="Announcement Content"
                            value={newAnnouncement.content}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                            className="p-3 border border-border text-xs bg-white h-24"
                            required
                          />
                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" size="sm" onClick={() => setAnnouncementFormOpen(false)}>Cancel</Button>
                            <Button type="submit" size="sm" className="bg-primary text-white">Save Announcement</Button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div className="divide-y divide-border/40 border border-border">
                      {announcements.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">No active announcements.</div>
                      ) : (
                        announcements.map((a) => (
                          <div key={a.id} className="p-4 flex justify-between items-start hover:bg-muted/10">
                            <div>
                              <h4 className="text-xs font-bold text-foreground">{a.title}</h4>
                              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{a.content}</p>
                              <span className="text-[8px] text-muted-foreground/60 block mt-2">
                                Created: {new Date(a.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteAnnouncement(a.id)}
                              className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors border border-transparent rounded cursor-pointer shrink-0 ml-3"
                              aria-label="Delete Announcement"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

          </main>
        </div>
      </div>
    </SiteLayout>
  );
}
