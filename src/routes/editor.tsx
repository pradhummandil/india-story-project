import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoriesData } from "@/lib/stories-data";

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
  const { user, profile, loading, initialized } = useAuthStore();
  const { stories } = useStoriesData();
  const [activeTab, setActiveTab] = useState<Tab>("queue");

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  // Editorial queue (Draft stories)
  const queueStories = useMemo(() => {
    return stories.filter((s) => !s.publishedAt);
  }, [stories]);

  // Approved stories
  const approvedStories = useMemo(() => {
    return stories.filter((s) => s.publishedAt);
  }, [stories]);

  const stats = useMemo(() => {
    return {
      queueCount: queueStories.length,
      publishedCount: approvedStories.length,
      featuredCount: stories.filter((s) => s.featured).length,
    };
  }, [queueStories, approvedStories, stories]);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground font-sans text-xs uppercase tracking-widest animate-pulse">
          Verifying credentials…
        </div>
      </div>
    );
  }

  const role = profile?.role?.toLowerCase();
  const isEditor = role === "editor" || role === "admin" || role === "superadmin";

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
      <div className="min-h-screen bg-[#F8F5EF] pt-24 pb-16 px-6 font-sans text-foreground">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 mt-4">
          
          {/* Editor Sidebar */}
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
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wider uppercase rounded-none transition-all cursor-pointer ${
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

          {/* Main Workspace Area */}
          <main className="flex-1 bg-white border border-border/80 p-6 lg:p-8 shadow-sm minimum-height-dashboard">
            
            {/* Editorial Queue Tab */}
            {activeTab === "queue" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Editorial Review Queue</h2>
                  <p className="text-xs text-muted-foreground mt-1">Stories submitted by authors waiting for verification.</p>
                </div>

                <div className="border border-border/50 divide-y divide-border/40">
                  {queueStories.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-8 text-center">Review queue is empty. All submissions are published!</p>
                  ) : (
                    queueStories.map((story) => (
                      <div key={story.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{story.title}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            By {story.authorName || "Contributor"} · Region: {story.region}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] font-semibold tracking-wider uppercase rounded-none cursor-pointer border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1"
                          >
                            <Check className="size-3.5" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] font-semibold tracking-wider uppercase rounded-none cursor-pointer border-red-300 text-red-700 bg-red-50 hover:bg-red-100 flex items-center gap-1"
                          >
                            <X className="size-3.5" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Approvals & Schedule Tab */}
            {activeTab === "approvals" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Scheduling & Approvals</h2>
                  <p className="text-xs text-muted-foreground mt-1">Organize editorial release calendars and scheduling.</p>
                </div>
                <div className="border border-border/50 p-6 text-center text-xs text-muted-foreground">
                  No scheduled releases currently registered.
                </div>
              </div>
            )}

            {/* Featured Tab */}
            {activeTab === "featured" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Featured Dispatches</h2>
                  <p className="text-xs text-muted-foreground mt-1">Select stories showcased on the Homepage curated list.</p>
                </div>
                <div className="border border-border/50 divide-y divide-border/40">
                  {approvedStories.slice(0, 8).map((story) => (
                    <div key={story.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{story.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Author: {story.authorName} · Views: {story.viewCount}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${story.featured ? "bg-gold text-white" : "bg-muted text-muted-foreground"}`}>
                        {story.featured ? "Featured" : "Standard"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Manager Tab */}
            {activeTab === "videos" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Video Content Manager</h2>
                  <p className="text-xs text-muted-foreground mt-1">Curate video and documentary entries.</p>
                </div>
                <div className="border border-border/50 p-6 text-center text-xs text-muted-foreground">
                  Video records database is connected. Click the Admin CMS console to complete bulk alterations.
                </div>
              </div>
            )}

            {/* Web Stories Tab */}
            {activeTab === "webstories" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Web Stories Manager</h2>
                  <p className="text-xs text-muted-foreground mt-1">Monitor web stories and dynamic slide decks.</p>
                </div>
                <div className="border border-border/50 p-6 text-center text-xs text-muted-foreground">
                  Web story pages linked to database. Expose stories by setting them to 'Published' in Admin console.
                </div>
              </div>
            )}

            {/* Moderation Queue Tab */}
            {activeTab === "moderation" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Moderation Queue</h2>
                  <p className="text-xs text-muted-foreground mt-1">Flagged comments, reports, and reader reviews.</p>
                </div>
                <div className="border border-border/50 p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <AlertTriangle className="size-8 text-muted-foreground/50" />
                  <p>All clean. No comments flagged by automated spam controls or community reports.</p>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Platform Analytics</h2>
                  <p className="text-xs text-muted-foreground mt-1">Consolidated view count of stories, visitors, and categories.</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-border/50 p-4 bg-muted/20">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Active Catalog</span>
                    <h3 className="font-display text-2xl font-bold mt-1">{stats.publishedCount}</h3>
                  </div>
                  <div className="border border-border/50 p-4 bg-muted/20">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Pending Queue</span>
                    <h3 className="font-display text-2xl font-bold mt-1">{stats.queueCount}</h3>
                  </div>
                  <div className="border border-border/50 p-4 bg-muted/20">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Curated Featured</span>
                    <h3 className="font-display text-2xl font-bold mt-1">{stats.featuredCount}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Community Tab */}
            {activeTab === "community" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Community Announcements</h2>
                  <p className="text-xs text-muted-foreground mt-1">Publish alerts and challenge notifications to readers.</p>
                </div>
                <div className="border border-border/50 p-6 text-center text-xs text-muted-foreground">
                  No notifications or active announcements.
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </SiteLayout>
  );
}
