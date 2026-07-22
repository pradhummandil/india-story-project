import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Forbidden403 } from "@/components/site/Forbidden403";
import { SiteLayout } from "@/components/site/Layout";
import { NotificationDropdown } from "@/components/site/NotificationDropdown";
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
  LayoutDashboard,
  Inbox,
  Kanban as KanbanIcon,
  GitCompare,
  Users,
  Image as ImageIcon,
  Settings,
  CheckCircle2,
  ArrowRight,
  Filter,
  Archive,
  Mail,
  CheckCheck,
  History,
  UserCheck,
  RefreshCw,
  AlertCircle,
  Sliders,
  CheckSquare,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/editor")({
  head: () => ({ meta: [{ title: "Editor Workspace — India Story Project" }] }),
  component: EditorPanelPage,
});

type Tab =
  | "dashboard"
  | "inbox"
  | "pipeline"
  | "published"
  | "users"
  | "media"
  | "analytics"
  | "settings";

export function EditorPanelPage() {
  const navigate = useNavigate();
  const { user, profile, loading, initialized, session } = useAuthStore();

  // Tab State
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [pipelineViewMode, setPipelineViewMode] = useState<"kanban" | "table">("kanban");
  const [inboxCategory, setInboxCategory] = useState<"all" | "unread" | "assigned" | "submissions" | "editorial" | "system">("all");
  const [selectedInboxNotif, setSelectedInboxNotif] = useState<any | null>(null);
  
  // Diff & Timeline Modal States
  const [diffModalItem, setDiffModalItem] = useState<any | null>(null);
  const [timelineItem, setTimelineItem] = useState<any | null>(null);
  const [timelineLogs, setTimelineLogs] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Users Tab State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsersList, setLoadingUsersList] = useState(false);

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
    if (activeTab === "dashboard" || activeTab === "pipeline") {
      setLoadingSubmissionsList(true);
      fetch("/api/admin/submissions", { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((r) => r.json())
        .then((d) => setSubmissionsList(d.submissions || []))
        .catch(console.error)
        .finally(() => setLoadingSubmissionsList(false));

      fetch("/api/admin/users?pageSize=100", { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((r) => r.json())
        .then((d) => {
          setUsersList(d.users || []);
          const filtered = (d.users || []).filter(
            (u: any) => u.role === "Editor" || u.role === "Admin" || u.role === "SuperAdmin" || u.role === "editor" || u.role === "admin" || u.role === "superadmin"
          );
          setStaffUsers(filtered);
        })
        .catch(console.error);
    }
    if (activeTab === "users") {
      setLoadingUsersList(true);
      fetch("/api/admin/users?pageSize=100", { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((r) => r.json())
        .then((d) => setUsersList(d.users || []))
        .catch(console.error)
        .finally(() => setLoadingUsersList(false));
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
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "pipeline", label: "Story Pipeline", icon: KanbanIcon },
    { id: "published", label: "Published Stories", icon: FileText },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "media", label: "Media Library", icon: ImageIcon },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
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
          <NotificationDropdown />
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
                {/* ─── 1. Dashboard Tab ─── */}
                {activeTab === "dashboard" && (
                  <div className="space-y-8 animate-fadeIn">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold text-foreground">Editorial Dashboard</h2>
                      <p className="text-xs text-muted-foreground mt-1">Real-time dispatches overview, story pipeline status, and recent activity.</p>
                    </div>

                    {/* Stat Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="border border-border/60 p-5 bg-card shadow-sm border-l-4 border-l-blue-500">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">New Submissions</span>
                        <h3 className="font-display text-2xl font-black text-foreground mt-2">
                          {submissionsList.filter(s => s.status === "SUBMITTED" || s.status === "Pending").length}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="size-3 text-blue-500" /> Awaiting initial review
                        </p>
                      </div>

                      <div className="border border-border/60 p-5 bg-card shadow-sm border-l-4 border-l-amber-500">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Assigned to Editors</span>
                        <h3 className="font-display text-2xl font-black text-foreground mt-2">
                          {submissionsList.filter(s => s.status === "ASSIGNED_TO_EDITOR" || s.status === "FactChecking").length}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <UserCheck className="size-3 text-amber-500" /> Editors working
                        </p>
                      </div>

                      <div className="border border-border/60 p-5 bg-card shadow-sm border-l-4 border-l-purple-500">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Ready to Publish</span>
                        <h3 className="font-display text-2xl font-black text-foreground mt-2">
                          {stories.filter(s => s.status === "Pending").length}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <CheckCircle2 className="size-3 text-purple-500" /> Pending Admin sign-off
                        </p>
                      </div>

                      <div className="border border-border/60 p-5 bg-card shadow-sm border-l-4 border-l-emerald-500">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Published Dispatches</span>
                        <h3 className="font-display text-2xl font-black text-foreground mt-2">{totalStories}</h3>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Globe className="size-3 text-emerald-500" /> Live on publication platform
                        </p>
                      </div>
                    </div>

                    {/* Quick Action Navigation */}
                    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/20 border border-border/40">
                      <Button
                        onClick={() => {
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
                          });
                        }}
                        className="h-9 text-xs font-bold uppercase bg-primary hover:bg-primary/95 text-white flex items-center gap-2 rounded-none cursor-pointer"
                      >
                        <Plus className="size-4" />
                        Create Story
                      </Button>
                      <Button
                        onClick={() => setActiveTab("pipeline")}
                        variant="outline"
                        className="h-9 text-xs font-bold uppercase border-border text-foreground flex items-center gap-2 rounded-none cursor-pointer"
                      >
                        <KanbanIcon className="size-4 text-primary" />
                        Open Story Pipeline
                      </Button>
                      <Button
                        onClick={() => setActiveTab("inbox")}
                        variant="outline"
                        className="h-9 text-xs font-bold uppercase border-border text-foreground flex items-center gap-2 rounded-none cursor-pointer"
                      >
                        <Inbox className="size-4 text-amber-600" />
                        Check Inbox ({unreadCount})
                      </Button>
                    </div>

                    {/* Recent Submissions Table */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-base font-bold text-foreground">Recent Submissions Queue</h3>
                        <Button onClick={() => setActiveTab("pipeline")} variant="link" className="text-xs text-primary font-bold uppercase">
                          View All Pipeline ➔
                        </Button>
                      </div>

                      <div className="border border-border divide-y divide-border/40 bg-card">
                        {submissionsList.slice(0, 5).map((sub) => (
                          <div key={sub.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-gold">{sub.stateName || "General"}</span>
                                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                                  sub.status === "Published" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-blue-50 border-blue-200 text-blue-700"
                                }`}>
                                  {sub.status}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-foreground mt-1">{sub.title}</h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5">By {sub.authorName || "Contributor"} · {new Date(sub.createdAt).toLocaleString()}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                onClick={() => {
                                  setDiffModalItem({ original: sub, edited: null });
                                }}
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] font-semibold uppercase rounded-none cursor-pointer flex items-center gap-1"
                              >
                                <GitCompare className="size-3 text-primary" />
                                Preview & Diff
                              </Button>
                              <Button
                                onClick={() => setActiveTab("pipeline")}
                                size="sm"
                                className="h-8 text-[10px] font-semibold uppercase bg-primary text-white rounded-none cursor-pointer"
                              >
                                Manage in Pipeline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 2. Gmail-Style Inbox Tab ─── */}
                {activeTab === "inbox" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold text-foreground">Editorial Inbox</h2>
                      <p className="text-xs text-muted-foreground mt-1">Database-driven communications, notifications, and workflow alerts.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 border border-border bg-card min-h-[550px]">
                      {/* Left Category Menu */}
                      <div className="lg:col-span-3 border-r border-border/50 p-4 bg-muted/10 space-y-2">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2 pb-2 border-b border-border/40">
                          Inbox Folders
                        </div>
                        {[
                          { id: "all", label: "All Messages", icon: Mail },
                          { id: "unread", label: "Unread", icon: Bell },
                          { id: "assigned", label: "Assigned Stories", icon: UserCheck },
                          { id: "submissions", label: "Submissions", icon: FileText },
                          { id: "editorial", label: "Editorial Reviews", icon: Sparkles },
                          { id: "system", label: "System Alerts", icon: AlertCircle },
                        ].map((cat) => {
                          const Icon = cat.icon;
                          const active = inboxCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setInboxCategory(cat.id as any)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-none cursor-pointer transition-all ${
                                active ? "bg-primary text-white font-bold" : "text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="size-4 shrink-0" />
                                <span>{cat.label}</span>
                              </div>
                              {cat.id === "unread" && unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-red-600 text-white">
                                  {unreadCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Middle Notification List */}
                      <div className="lg:col-span-5 border-r border-border/50 divide-y divide-border/40 max-h-[550px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-xs text-muted-foreground">No notifications in inbox.</div>
                        ) : (
                          notifications
                            .filter((n) => {
                              if (inboxCategory === "unread") return !n.read;
                              if (inboxCategory === "assigned") return n.type?.includes("ASSIGNED") || n.type?.includes("editor");
                              if (inboxCategory === "submissions") return n.type?.includes("SUBMISSION") || n.type?.includes("submitted");
                              if (inboxCategory === "editorial") return n.type?.includes("REVIEW") || n.type?.includes("PUBLISHED");
                              return true;
                            })
                            .map((notif) => {
                              const isSelected = selectedInboxNotif?.id === notif.id;
                              return (
                                <div
                                  key={notif.id}
                                  onClick={() => {
                                    setSelectedInboxNotif(notif);
                                    if (!notif.read) markNotificationRead(notif.id);
                                  }}
                                  className={`p-4 cursor-pointer transition-all hover:bg-muted/20 border-l-4 ${
                                    isSelected
                                      ? "bg-primary/10 border-l-primary"
                                      : !notif.read
                                      ? "bg-amber-50/60 border-l-amber-500 font-bold"
                                      : "border-l-transparent"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] uppercase font-bold text-primary">{notif.type || "NOTIFICATION"}</span>
                                    <span className="text-[9px] text-muted-foreground">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-foreground leading-snug">{notif.title || notif.message}</h4>
                                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">{notif.message}</p>
                                </div>
                              );
                            })
                        )}
                      </div>

                      {/* Right Interactive Reading Pane */}
                      <div className="lg:col-span-4 p-6 bg-muted/5 flex flex-col justify-between">
                        {selectedInboxNotif ? (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="border-b border-border/50 pb-4">
                              <span className="text-[9px] uppercase font-black tracking-widest text-gold block">Notification Detail</span>
                              <h3 className="font-display text-lg font-bold text-foreground mt-1">{selectedInboxNotif.title || "Workflow Alert"}</h3>
                              <p className="text-[10px] text-muted-foreground mt-1">Received {new Date(selectedInboxNotif.createdAt).toLocaleString()}</p>
                            </div>

                            <div className="text-xs text-foreground leading-relaxed bg-white p-4 border border-border/40 rounded shadow-sm">
                              {selectedInboxNotif.message}
                            </div>

                            <div className="pt-4 flex flex-col gap-2">
                              <Button
                                onClick={() => setActiveTab("pipeline")}
                                className="w-full h-9 text-xs font-bold uppercase bg-primary text-white rounded-none cursor-pointer flex items-center justify-center gap-2"
                              >
                                View Target in Pipeline <ArrowRight className="size-4" />
                              </Button>
                              <Button
                                onClick={() => markNotificationRead(selectedInboxNotif.id)}
                                variant="outline"
                                className="w-full h-9 text-xs font-bold uppercase border-border rounded-none cursor-pointer flex items-center justify-center gap-2"
                              >
                                <CheckCheck className="size-4 text-emerald-600" /> Mark as Read
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-center p-8 text-xs text-muted-foreground">
                            Select a notification from the list to preview message details.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 3. Story Pipeline Tab (Kanban + Table) ─── */}
                {activeTab === "pipeline" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                      <div>
                        <h2 className="font-display text-2xl font-extrabold text-foreground">Story Pipeline</h2>
                        <p className="text-xs text-muted-foreground mt-1">End-to-end editorial pipeline for story review, assignment, edits, and publication.</p>
                      </div>

                      {/* Kanban vs Table View Switcher */}
                      <div className="flex bg-muted/30 border border-border/40 p-1 rounded-none gap-1 self-start">
                        <button
                          onClick={() => setPipelineViewMode("kanban")}
                          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                            pipelineViewMode === "kanban" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <KanbanIcon className="size-3.5" /> Kanban Board
                        </button>
                        <button
                          onClick={() => setPipelineViewMode("table")}
                          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                            pipelineViewMode === "table" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <List className="size-3.5" /> Table View
                        </button>
                      </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/20 border border-border/40">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">Search Pipeline</label>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search title, author..."
                          className="w-full h-9 px-2 bg-white border border-border text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">State/Region</label>
                        <select
                          value={stateFilter}
                          onChange={(e) => setStateFilter(e.target.value)}
                          className="w-full h-9 px-2 bg-white border border-border text-xs focus:outline-none"
                        >
                          <option value="all">All Regions</option>
                          {states.map((s) => (
                            <option key={s.id} value={s.slug}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">Status Stage</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full h-9 px-2 bg-white border border-border text-xs focus:outline-none"
                        >
                          <option value="all">All Stages</option>
                          <option value="SUBMITTED">New Submission</option>
                          <option value="ASSIGNED_TO_EDITOR">Assigned to Editor</option>
                          <option value="Pending">Pending Review</option>
                          <option value="Published">Published</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => fetchTabDetails()}
                          variant="outline"
                          className="w-full h-9 text-xs font-bold uppercase border-border rounded-none flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="size-3.5 text-primary" /> Refresh Pipeline
                        </Button>
                      </div>
                    </div>

                    {/* Kanban Board View */}
                    {pipelineViewMode === "kanban" ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-4">
                        {/* Column 1: New Submissions */}
                        <div className="bg-muted/15 border border-border/60 p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-blue-600"></span> New Submissions
                            </span>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {submissionsList.filter(s => s.status === "SUBMITTED" || s.status === "Pending").length}
                            </span>
                          </div>

                          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                            {submissionsList.filter(s => s.status === "SUBMITTED" || s.status === "Pending").map((sub) => (
                              <div key={sub.id} className="bg-white border border-border p-4 shadow-sm hover:border-primary/50 transition-all space-y-3">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-gold">{sub.stateName || "State"}</span>
                                  <h4 className="font-display text-sm font-bold text-foreground leading-snug mt-0.5">{sub.title}</h4>
                                  <p className="text-[10px] text-muted-foreground mt-1">By {sub.authorName || "Author"} · {new Date(sub.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                                  <Button
                                    onClick={() => setDiffModalItem({ original: sub, edited: null })}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[9px] font-bold uppercase rounded-none cursor-pointer"
                                  >
                                    Diff & Assign
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Column 2: Assigned to Editor */}
                        <div className="bg-muted/15 border border-border/60 p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-amber-600"></span> Editor Working
                            </span>
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              {submissionsList.filter(s => s.status === "ASSIGNED_TO_EDITOR" || s.status === "FactChecking").length}
                            </span>
                          </div>

                          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                            {submissionsList.filter(s => s.status === "ASSIGNED_TO_EDITOR" || s.status === "FactChecking").map((sub) => (
                              <div key={sub.id} className="bg-white border border-border p-4 shadow-sm hover:border-amber-500/50 transition-all space-y-3">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-amber-600">Assigned to Editor</span>
                                  <h4 className="font-display text-sm font-bold text-foreground leading-snug mt-0.5">{sub.title}</h4>
                                  <p className="text-[10px] text-muted-foreground mt-1">Author: {sub.authorName || "Author"}</p>
                                </div>

                                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                                  <Button
                                    onClick={() => setDiffModalItem({ original: sub, edited: null })}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[9px] font-bold uppercase rounded-none cursor-pointer"
                                  >
                                    Review Progress
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Column 3: Ready to Publish */}
                        <div className="bg-muted/15 border border-border/60 p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-purple-600"></span> Ready to Publish
                            </span>
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              {stories.filter(s => s.status === "Pending").length}
                            </span>
                          </div>

                          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                            {stories.filter(s => s.status === "Pending").map((story) => (
                              <div key={story.id} className="bg-white border border-border p-4 shadow-sm hover:border-purple-500/50 transition-all space-y-3">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-purple-600">Admin Sign-off Required</span>
                                  <h4 className="font-display text-sm font-bold text-foreground leading-snug mt-0.5">{story.title}</h4>
                                  <p className="text-[10px] text-muted-foreground mt-1">Author: {story.authorName || "Bureau"}</p>
                                </div>

                                <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                                  {isAdmin && (
                                    <Button
                                      onClick={() => handleApprovalAction(story.id, "Approve")}
                                      size="sm"
                                      className="h-7 text-[9px] font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white rounded-none cursor-pointer"
                                    >
                                      Publish
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Column 4: Published */}
                        <div className="bg-muted/15 border border-border/60 p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-emerald-600"></span> Published Dispatches
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              {stories.filter(s => s.status === "Published").length}
                            </span>
                          </div>

                          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                            {stories.filter(s => s.status === "Published").slice(0, 8).map((story) => (
                              <div key={story.id} className="bg-white border border-border p-4 shadow-sm space-y-2">
                                <span className="text-[9px] uppercase font-bold text-emerald-600 block">Live Dispatch</span>
                                <h4 className="font-display text-xs font-bold text-foreground truncate">{story.title}</h4>
                                <p className="text-[9px] text-muted-foreground">Views: {story.viewCount} · Published {new Date(story.updatedAt).toLocaleDateString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Table View */
                      <div className="border border-border divide-y divide-border/40 bg-card">
                        <div className="p-3 bg-muted/20 grid grid-cols-12 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                          <div className="col-span-5">Story Title & Details</div>
                          <div className="col-span-2">Region</div>
                          <div className="col-span-2">Status Stage</div>
                          <div className="col-span-3 text-right">Actions</div>
                        </div>

                        {submissionsList.map((sub) => (
                          <div key={sub.id} className="p-4 grid grid-cols-12 items-center text-xs hover:bg-muted/10">
                            <div className="col-span-5 font-bold text-foreground">
                              {sub.title}
                              <span className="block text-[10px] font-normal text-muted-foreground">By {sub.authorName || "Contributor"}</span>
                            </div>
                            <div className="col-span-2 text-muted-foreground">{sub.stateName || "General"}</div>
                            <div className="col-span-2">
                              <span className="px-2 py-0.5 text-[8px] font-bold uppercase border bg-blue-50 border-blue-200 text-blue-700">
                                {sub.status}
                              </span>
                            </div>
                            <div className="col-span-3 text-right space-x-2">
                              <Button
                                onClick={() => setDiffModalItem({ original: sub, edited: null })}
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] font-bold uppercase rounded-none cursor-pointer"
                              >
                                View Diff
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── 4. Published Stories Tab ─── */}
                {activeTab === "published" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold text-foreground">Published Dispatches Catalog</h2>
                      <p className="text-xs text-muted-foreground mt-1">Manage live dispatches, SEO metadata, and feature curations.</p>
                    </div>

                    <div className="border border-border divide-y divide-border/40 bg-card">
                      {stories.filter(s => s.status === "Published").map((story) => (
                        <div key={story.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-emerald-600 block">Published Story</span>
                            <h4 className="text-sm font-bold text-foreground mt-0.5">{story.title}</h4>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Views: {story.viewCount} · Author: {story.authorName || "Bureau"} · Modified {new Date(story.updatedAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <Button
                              onClick={() => setEditingStory(story)}
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] font-bold uppercase rounded-none cursor-pointer flex items-center gap-1"
                            >
                              <Edit className="size-3 text-primary" /> Edit Dispatch
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── 5. Users & Roles Tab ─── */}
                {activeTab === "users" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold text-foreground">Users & Roles Manager</h2>
                      <p className="text-xs text-muted-foreground mt-1">Database-backed RBAC role configuration for staff editors and contributors.</p>
                    </div>

                    <div className="border border-border divide-y divide-border/40 bg-card">
                      <div className="p-3 bg-muted/20 grid grid-cols-12 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        <div className="col-span-4">User Profile</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-3">Assigned Role</div>
                        <div className="col-span-2 text-right">Status</div>
                      </div>

                      {loadingUsersList ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">Loading users directory...</div>
                      ) : (
                        usersList.map((u) => (
                          <div key={u.id} className="p-4 grid grid-cols-12 items-center text-xs hover:bg-muted/10">
                            <div className="col-span-4 font-bold text-foreground flex items-center gap-2">
                              <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                {u.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <span>{u.name || "User Profile"}</span>
                            </div>
                            <div className="col-span-3 text-muted-foreground">{u.email}</div>
                            <div className="col-span-3">
                              {isAdmin ? (
                                <select
                                  value={u.role?.toLowerCase()}
                                  onChange={async (e) => {
                                    const newRole = e.target.value;
                                    if (!session) return;
                                    await fetch("/api/admin/users", {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                                      body: JSON.stringify({ userId: u.id, role: newRole }),
                                    });
                                    fetchTabDetails();
                                  }}
                                  className="h-8 px-2 border border-border text-xs bg-white font-bold text-primary focus:outline-none"
                                >
                                  <option value="user">User / Author</option>
                                  <option value="editor">Editor</option>
                                  <option value="admin">Admin</option>
                                  <option value="superadmin">Super Admin</option>
                                </select>
                              ) : (
                                <span className="font-bold text-primary uppercase">{u.role}</span>
                              )}
                            </div>
                            <div className="col-span-2 text-right">
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ─── 6. Media Library Tab ─── */}
                {activeTab === "media" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold text-foreground">Media Assets Library</h2>
                      <p className="text-xs text-muted-foreground mt-1">Cloudinary synced assets, cover images, and optimized thumbnails.</p>
                    </div>

                    <div className="border border-dashed border-border/80 p-8 text-center bg-muted/10 space-y-3">
                      <ImageIcon className="size-8 mx-auto text-muted-foreground" />
                      <p className="text-xs font-bold uppercase text-foreground">Upload Media Files</p>
                      <p className="text-[10px] text-muted-foreground">Drag and drop images or copy web URLs directly into editor dispatches.</p>
                    </div>
                  </div>
                )}

                {/* ─── 7. Analytics Tab ─── */}
                {activeTab === "analytics" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold text-foreground">Platform Analytics</h2>
                      <p className="text-xs text-muted-foreground mt-1">Readership traffic, state dispatch distribution, and engagement metrics.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border border-border/60 bg-card">
                        <span className="text-[10px] font-extrabold uppercase text-muted-foreground">Total Dispatches</span>
                        <p className="text-2xl font-black text-foreground mt-1">{totalStories}</p>
                      </div>
                      <div className="p-4 border border-border/60 bg-card">
                        <span className="text-[10px] font-extrabold uppercase text-muted-foreground">Total Submissions</span>
                        <p className="text-2xl font-black text-foreground mt-1">{submissionsList.length}</p>
                      </div>
                      <div className="p-4 border border-border/60 bg-card">
                        <span className="text-[10px] font-extrabold uppercase text-muted-foreground">Active Staff</span>
                        <p className="text-2xl font-black text-foreground mt-1">{usersList.length}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </main>
        </div>
      </div>

      {/* ─── Side-by-Side Diff & Assignment Modal ─── */}
      {diffModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border/80 shadow-2xl rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 bg-muted/20 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {diffModalItem.original?.status || "SUBMITTED"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Submitted by {diffModalItem.original?.authorName || "Contributor"} ({diffModalItem.original?.stateName || "State"})
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mt-1">
                  {diffModalItem.original?.title}
                </h3>
              </div>
              <button
                onClick={() => setDiffModalItem(null)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Side-by-Side Diff Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/5">
              
              {/* Left Column: Original User Submission */}
              <div className="space-y-4 border-r border-border/40 pr-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="font-display text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="size-4 text-blue-500" /> Original Submission
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(diffModalItem.original?.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Title</span>
                    <p className="font-bold text-foreground mt-0.5">{diffModalItem.original?.title}</p>
                  </div>
                  {diffModalItem.original?.titleHi && (
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-amber-600 block">Title (Hindi)</span>
                      <p className="font-medium text-foreground mt-0.5">{diffModalItem.original?.titleHi}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Excerpt</span>
                    <p className="text-muted-foreground italic bg-muted/20 p-2.5 rounded border border-border/40 mt-0.5">
                      {diffModalItem.original?.excerpt || "No excerpt provided."}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Narrative Content</span>
                    <div className="p-3 bg-card border border-border/60 rounded max-h-60 overflow-y-auto whitespace-pre-wrap text-muted-foreground leading-relaxed mt-0.5">
                      {diffModalItem.original?.content || "No narrative content."}
                    </div>
                  </div>
                  {diffModalItem.original?.imageUrl && (
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-1">Cover Image</span>
                      <img
                        src={diffModalItem.original.imageUrl}
                        alt={diffModalItem.original.title}
                        className="w-full h-40 object-cover rounded border border-border/60"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Editor Version / Revision */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="font-display text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                    <Sparkles className="size-4 text-amber-500" /> Editor Revision & Review
                  </h4>
                  <span className="text-[10px] text-amber-600 font-bold uppercase">
                    {diffModalItem.edited ? "Editor Revised" : "Awaiting Assignment"}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {diffModalItem.edited ? (
                    <>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Revised Title</span>
                        <p className="font-bold text-foreground mt-0.5">{diffModalItem.edited.title}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Revised Content</span>
                        <div className="p-3 bg-card border border-border/60 rounded max-h-60 overflow-y-auto whitespace-pre-wrap text-muted-foreground leading-relaxed mt-0.5">
                          {diffModalItem.edited.content}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 border border-dashed border-border/80 text-center bg-muted/10 space-y-2 rounded">
                      <Layers className="size-6 mx-auto text-muted-foreground" />
                      <p className="text-xs font-bold text-foreground">Original Submission Queue Item</p>
                      <p className="text-[10px] text-muted-foreground">
                        Assign an editor below to start active editing and fact-checking.
                      </p>
                    </div>
                  )}

                  {/* Quick Assignment Box inside Modal */}
                  {isAdmin && (
                    <div className="p-4 bg-muted/20 border border-border/60 rounded space-y-3 mt-4">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground block">
                        Assign to Editor Staff
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          id="modalEditorSelect"
                          className="flex-1 h-8 px-2 border border-border text-xs bg-background font-bold focus:outline-none"
                        >
                          <option value="">-- Select Editor --</option>
                          {usersList
                            .filter((u) => u.role?.toLowerCase() === "editor" || u.role?.toLowerCase() === "admin" || u.role?.toLowerCase() === "superadmin")
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name || u.email} ({u.role})
                              </option>
                            ))}
                        </select>
                        <Button
                          size="sm"
                          className="h-8 text-[10px] font-bold uppercase bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                          onClick={async () => {
                            const sel = (document.getElementById("modalEditorSelect") as HTMLSelectElement)?.value;
                            if (!sel || !session) return;
                            await executeSubmissionAction(diffModalItem.original.id, "ASSIGNED_TO_EDITOR", sel);
                            setDiffModalItem(null);
                          }}
                        >
                          Assign Editor
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDiffModalItem(null)}
                className="text-xs font-bold cursor-pointer"
              >
                Close Preview
              </Button>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold text-rose-600 border-rose-300 hover:bg-rose-50 cursor-pointer"
                    onClick={async () => {
                      await executeSubmissionAction(diffModalItem.original.id, "Rejected");
                      setDiffModalItem(null);
                    }}
                  >
                    Reject Submission
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    onClick={async () => {
                      await executeSubmissionAction(diffModalItem.original.id, "Published");
                      setDiffModalItem(null);
                    }}
                  >
                    Approve & Publish Live
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </SiteLayout>
  );
}
