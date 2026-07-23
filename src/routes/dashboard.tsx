import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useI18nStore, uiText } from "@/lib/i18n";
import { Forbidden403 } from "@/components/site/Forbidden403";
import { SiteLayout } from "@/components/site/Layout";
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  MessageSquare,
  Image as ImageIcon,
  Award,
  User,
  Plus,
  Eye,
  Heart,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoriesData } from "@/lib/stories-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Author Dashboard — India Story Project" }] }),
  component: AuthorDashboardPage,
});

type Tab =
  | "overview"
  | "drafts"
  | "published"
  | "pending"
  | "analytics"
  | "comments"
  | "media"
  | "achievements"
  | "profile";

export function AuthorDashboardPage() {
  const navigate = useNavigate();
  const { user, profile, loading, initialized, session } = useAuthStore();
  const { stories } = useStoriesData();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  useEffect(() => {
    if (!session) return;
    setLoadingSubmissions(true);
    fetch("/api/submissions", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => setSubmissions(data.submissions || []))
      .catch(console.error)
      .finally(() => setLoadingSubmissions(false));
  }, [session, activeTab]);

  // Determine Author's own stories
  const authorStories = useMemo(() => {
    if (!profile) return [];
    const name = profile.fullName || "";
    return stories.filter(
      (s) =>
        s.authorName?.toLowerCase() === name.toLowerCase() ||
        s.authorBio?.toLowerCase() === user?.email?.toLowerCase()
    );
  }, [stories, profile, user]);

  const stats = useMemo(() => {
    const drafts = authorStories.filter((s) => !s.publishedAt);
    const published = authorStories.filter((s) => s.publishedAt);
    const totalViews = authorStories.reduce((acc, s) => acc + (s.viewCount || 0), 0);
    return {
      total: authorStories.length,
      draftsCount: drafts.length,
      publishedCount: published.length,
      views: totalViews,
    };
  }, [authorStories]);

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
  const isAuthor = role === "author" || role === "editor" || role === "admin" || role === "superadmin";

  if (!user || !profile || !isAuthor) {
    return <Forbidden403 />;
  }

  const lang = useI18nStore((s) => s.lang);
  const dashText = uiText[lang].dashboard;

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: dashText.welcome, icon: LayoutDashboard },
    { id: "drafts", label: dashText.myDrafts, icon: Clock },
    { id: "published", label: dashText.published, icon: CheckCircle },
    { id: "pending", label: dashText.pending, icon: AlertCircle },
    { id: "analytics", label: dashText.analytics, icon: BarChart3 },
    { id: "comments", label: dashText.comments, icon: MessageSquare },
    { id: "media", label: dashText.media, icon: ImageIcon },
    { id: "achievements", label: dashText.achievements, icon: Award },
    { id: "profile", label: dashText.profile, icon: User },
  ];

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#F8F5EF] pt-24 pb-16 px-6 font-sans text-foreground">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 mt-4">
          
          {/* Author Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 bg-white border border-border/80 p-5 rounded-none flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName || ""}
                  className="size-10 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="size-10 rounded-full bg-gold/10 flex items-center justify-center font-display text-sm font-bold text-gold">
                  {profile.fullName?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate">{profile.fullName}</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1 mt-0.5">
                  <Shield className="size-3 text-gold" />
                  {dashText.title}
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
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wider rounded-none transition-all cursor-pointer ${
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

            <div className="mt-auto border-t border-border/50 pt-4">
              <Button
                onClick={() => void navigate({ to: "/share-story" })}
                className="w-full h-10 rounded-none bg-gold hover:bg-gold/90 text-white font-sans text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="size-4" />
                {dashText.writeStory}
              </Button>
            </div>
          </aside>

          {/* Main Dashboard Area */}
          <main className="flex-1 bg-white border border-border/80 p-6 lg:p-8 shadow-sm minimum-height-dashboard">
            
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">Welcome back, {profile.fullName}!</h1>
                  <p className="text-xs text-muted-foreground mt-1">Here is a quick snapshot of your creative impact.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: dashText.totalStories, val: stats.total, icon: BookOpen },
                    { label: dashText.published, val: stats.publishedCount, icon: CheckCircle },
                    { label: dashText.totalReads, val: stats.views, icon: Eye },
                    { label: dashText.estRevenue, val: `₹${(stats.views * 0.15).toFixed(2)}`, icon: BarChart3 },
                    { label: dashText.authorLevel, val: `${lang === "hi" ? "स्तर" : "Level"} ${(profile as any)?.level || 1}`, icon: Award },
                    { label: dashText.readingXP, val: `${(profile as any)?.totalXP || 0} XP`, icon: Shield },
                    { label: dashText.readingStreak, val: `${(profile as any)?.readingStreak || 0} ${lang === "hi" ? "दिन" : "Days"}`, icon: Clock },
                    { label: dashText.pendingSubmissions, val: submissions.filter(s => s.status === 'Pending').length, icon: AlertCircle },
                  ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div key={i} className="border border-border/50 p-4 bg-muted/20 hover:border-gold/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{card.label}</span>
                          <Icon className="size-4 text-gold" />
                        </div>
                        <p className="font-display text-2xl font-bold text-foreground">{card.val}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="border border-border/50 p-6 bg-muted/10">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Stories</h3>
                  {authorStories.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">You haven't written any stories yet.</p>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {authorStories.slice(0, 4).map((story) => (
                        <div key={story.id} className="py-3 flex items-center justify-between text-xs font-sans">
                          <div>
                            <p className="font-bold text-foreground line-clamp-1">{story.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {story.publishedAt ? `Published on ${new Date(story.publishedAt).toLocaleDateString()}` : "Draft Mode"}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${story.publishedAt ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {story.publishedAt ? "Published" : "Draft"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My Drafts Tab */}
            {activeTab === "drafts" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Draft Stories</h2>
                  <p className="text-xs text-muted-foreground mt-1">Stories you are currently working on.</p>
                </div>
                <div className="border border-border/50 divide-y divide-border/40">
                  {authorStories.filter(s => !s.publishedAt).length === 0 ? (
                    <p className="text-xs text-muted-foreground p-8 text-center">No drafts found.</p>
                  ) : (
                    authorStories.filter(s => !s.publishedAt).map((draft) => (
                      <div key={draft.id} className="p-4 flex justify-between items-center hover:bg-muted/10">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{draft.title}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1">Last edited recently</p>
                        </div>
                        <Button
                          onClick={() => void navigate({ to: `/stories/$slug`, params: { slug: draft.slug } })}
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-semibold tracking-wider uppercase rounded-none cursor-pointer"
                        >
                          Preview Draft
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Published Stories Tab */}
            {activeTab === "published" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Published Stories</h2>
                  <p className="text-xs text-muted-foreground mt-1">Live dispatches on India Story Project.</p>
                </div>
                <div className="border border-border/50 divide-y divide-border/40">
                  {authorStories.filter(s => s.publishedAt).length === 0 ? (
                    <p className="text-xs text-muted-foreground p-8 text-center">No published stories found.</p>
                  ) : (
                    authorStories.filter(s => s.publishedAt).map((pub) => (
                      <div key={pub.id} className="p-4 flex justify-between items-center hover:bg-muted/10">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{pub.title}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Published on {new Date(pub.publishedAt!).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => void navigate({ to: `/stories/$slug`, params: { slug: pub.slug } })}
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-semibold tracking-wider uppercase rounded-none cursor-pointer"
                        >
                          View Story
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Pending Review Tab */}
            {activeTab === "pending" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">My Submitted Stories</h2>
                  <p className="text-xs text-muted-foreground mt-1">Track the real-time status and editorial workflow timeline of your submissions.</p>
                </div>

                <div className="space-y-6">
                  {loadingSubmissions ? (
                    <div className="text-center p-8 text-xs text-muted-foreground">Loading submissions...</div>
                  ) : submissions.length === 0 ? (
                    <div className="border border-border/50 p-8 text-center text-xs text-muted-foreground">
                      You haven't submitted any stories yet.
                    </div>
                  ) : (
                    submissions.map((sub) => {
                      // Map state to readable status
                      const getStatusInfo = (status: string) => {
                        switch (status) {
                          case "Pending":
                            return { label: "Submitted", color: "bg-blue-100 text-blue-800 border-blue-200" };
                          case "UnderReview":
                            return { label: "Under Review", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
                          case "FactChecking":
                            return { label: "Assigned to Editor", color: "bg-amber-100 text-amber-800 border-amber-200" };
                          case "Draft":
                            return { label: "Editing", color: "bg-purple-100 text-purple-800 border-purple-200" };
                          case "ChangesRequested":
                            return { label: "Waiting for Approval", color: "bg-pink-100 text-pink-800 border-pink-200" };
                          case "Approved":
                            return { label: "Approved", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
                          case "Published":
                            return { label: "Published", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
                          case "Rejected":
                            return { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200" };
                          default:
                            return { label: status, color: "bg-stone-100 text-stone-800 border-stone-200" };
                        }
                      };

                      const statusInfo = getStatusInfo(sub.status);

                      return (
                        <div key={sub.id} className="border border-border/50 p-6 bg-card hover:border-gold/30 transition-all shadow-sm">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4 mb-4">
                            <div>
                              <h3 className="font-display text-base font-bold text-foreground">{sub.title}</h3>
                              <p className="text-[10px] text-muted-foreground mt-1">Region: {sub.stateName} · Theme: {sub.themes || "General"}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${statusInfo.color} shrink-0 self-start md:self-auto`}>
                              {statusInfo.label}
                            </span>
                          </div>

                          {/* Interactive Status Timeline */}
                          <div className="space-y-4">
                            <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Workflow Timeline</h4>
                            <div className="relative pl-6 border-l border-border/60 ml-2 space-y-4">
                              {/* Step 1: Submission */}
                              <div className="relative">
                                <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-emerald-500 border-4 border-white" />
                                <p className="text-xs font-bold text-foreground">Story Submitted</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Submitted successfully on {new Date(sub.createdAt).toLocaleString()}</p>
                              </div>

                              {/* Step 2: Under Review */}
                              {sub.status !== "Pending" && (
                                <div className="relative">
                                  <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-emerald-500 border-4 border-white" />
                                  <p className="text-xs font-bold text-foreground">Editorial Review</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">Review initiated on {new Date(sub.updatedAt).toLocaleString()}</p>
                                </div>
                              )}

                              {/* Step 3: Assignment/Edit */}
                              {(sub.status === "FactChecking" || sub.status === "Draft" || sub.status === "Published" || sub.status === "Approved") && (
                                <div className="relative">
                                  <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-emerald-500 border-4 border-white" />
                                  <p className="text-xs font-bold text-foreground">Assigned to Editor</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">Formatting, SEO tags, and image adjustments underway.</p>
                                </div>
                              )}

                              {/* Step 4: Final Resolution */}
                              {(sub.status === "Published" || sub.status === "Approved" || sub.status === "Rejected") && (
                                <div className="relative">
                                  <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-emerald-500 border-4 border-white" />
                                  <p className="text-xs font-bold text-foreground">
                                    {sub.status === "Rejected" ? "Submission Rejected" : "Approved & Published"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Processed on {new Date(sub.updatedAt).toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Story Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Story Analytics</h2>
                  <p className="text-xs text-muted-foreground mt-1">View metrics and performance stats for your published stories.</p>
                </div>
                <div className="border border-border/50 p-6">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-3 text-xs font-bold text-muted-foreground">
                    <span>Story Title</span>
                    <div className="flex gap-8">
                      <span>Likes</span>
                      <span>Reads</span>
                    </div>
                  </div>
                  {authorStories.filter(s => s.publishedAt).length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">No active story metrics found.</p>
                  ) : (
                    authorStories.filter(s => s.publishedAt).map((story) => (
                      <div key={story.id} className="flex items-center justify-between py-3 border-b border-border/20 text-xs font-sans">
                        <span className="font-semibold text-foreground line-clamp-1">{story.title}</span>
                        <div className="flex gap-12 font-mono text-muted-foreground shrink-0">
                          <span>{Math.floor((story.viewCount ?? 0) * 0.1)}</span>
                          <span>{story.viewCount ?? 0}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Comments Feed</h2>
                  <p className="text-xs text-muted-foreground mt-1">Reader dispatches and comments left on your stories.</p>
                </div>
                <div className="border border-border/50 p-6 text-center text-xs text-muted-foreground">
                  No comments recorded on your stories.
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === "media" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Media Library</h2>
                  <p className="text-xs text-muted-foreground mt-1">Author image resources and media assets.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {authorStories
                    .map((s) => s.image)
                    .filter((img): img is string => Boolean(img))
                    .map((img, i) => (
                      <div key={i} className="aspect-square border border-border/50 overflow-hidden relative group bg-muted">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  <div className="aspect-square border-2 border-dashed border-border/80 flex flex-col items-center justify-center text-muted-foreground gap-2 cursor-pointer hover:border-gold/50 transition-colors">
                    <Plus className="size-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Add Asset</span>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Author Achievements</h2>
                  <p className="text-xs text-muted-foreground mt-1">Earn badges by publishing dispatches from across India.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "Local Reporter", desc: "First story published on India Story Project", unlocked: stats.publishedCount >= 1 },
                    { name: "Wordsmith", desc: "Publish 5 stories in the catalog", unlocked: stats.publishedCount >= 5 },
                    { name: "National Voice", desc: "Gain 1000 total reading views", unlocked: stats.views >= 1000 },
                  ].map((ach, i) => (
                    <div key={i} className={`p-4 border border-border/50 flex items-center gap-4 ${ach.unlocked ? "bg-gold/5 border-gold/30" : "bg-muted/10 opacity-60"}`}>
                      <Award className={`size-8 ${ach.unlocked ? "text-gold" : "text-muted-foreground"}`} />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{ach.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{ach.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Author Profile</h2>
                  <p className="text-xs text-muted-foreground mt-1">Manage your biographical notes and details.</p>
                </div>
                <div className="border border-border/50 p-6 bg-muted/5 space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Display Name</label>
                    <p className="text-sm font-bold text-foreground bg-white border border-border p-2.5">{profile.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Login Email</label>
                    <p className="text-sm text-foreground bg-white border border-border p-2.5">{profile.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Role Assigned</label>
                    <p className="text-xs font-mono font-bold text-primary bg-primary/5 border border-primary/20 px-3 py-1.5 inline-block uppercase rounded-sm">
                      {profile.role}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </SiteLayout>
  );
}
