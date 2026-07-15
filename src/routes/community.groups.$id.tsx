import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Globe, Lock, ShieldAlert, ArrowLeft, Send, Sparkles, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/community/groups/$id")({
  component: GroupDetailPage,
});

export default function GroupDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, session } = useAuthStore();

  const [group, setGroup] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Group announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [submittingAnn, setSubmittingAnn] = useState(false);

  const loadGroup = () => {
    setLoading(true);
    const token = session?.access_token;
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`/api/community/groups/${id}`, { headers })
      .then((r) => r.json())
      .then((d) => {
        setGroup(d.group);
        setIsMember(d.isMember ?? false);
        setUserRole(d.userRole ?? null);
        setAnnouncements(d.group?.announcements ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGroup();
  }, [id]);

  const handleJoinLeave = async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/community/groups/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: isMember ? "leave" : "join" }),
      });
      if (res.ok) {
        loadGroup();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !announcementTitle || !announcementContent) return;
    setSubmittingAnn(true);

    try {
      // In production, we'd POST to a group announcements endpoint.
      // For this implementation, we will append it locally or use moderator api.
      const res = await fetch(`/api/admin/community/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "announce",
          targetType: "group",
          targetId: id,
          title: announcementTitle,
          content: announcementContent,
        }),
      });

      setAnnouncementTitle("");
      setAnnouncementContent("");
      loadGroup(); // Reload details
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnn(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white/5 rounded-sm" />
        <div className="h-8 w-1/3 bg-white/5 rounded-sm" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12 space-y-4">
        <ShieldAlert className="size-8 text-primary mx-auto" />
        <p className="text-white/40 text-xs font-sans">Group not found or has been disabled.</p>
        <Link to="/community/groups" className="text-primary hover:underline text-xs">
          Back to Groups
        </Link>
      </div>
    );
  }

  const isOwnerOrMod = userRole === "owner" || userRole === "moderator";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ── Breadcrumb back button ── */}
      <Link
        to="/community/groups"
        className="inline-flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Back to Groups
      </Link>

      {/* ── Group Banner ── */}
      <div className="bg-[#121212] border border-white/5 p-8 relative overflow-hidden rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/10 rounded-sm text-primary">
              <Users className="size-5" />
            </span>
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-white/30 border border-white/5 px-2 py-0.5 rounded-full">
              {group.privacy === "public" ? "🌐 Public Group" : "🔒 Private Group"}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white leading-tight">
            {group.name}
          </h1>
          <p className="text-xs text-white/50 leading-relaxed font-sans">
            {group.description}
          </p>
        </div>

        {user ? (
          <button
            onClick={handleJoinLeave}
            className={`px-5 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest transition-colors rounded-sm ${
              isMember
                ? "bg-white/5 border border-white/10 text-white/50 hover:text-white"
                : "bg-primary text-white hover:bg-primary/95"
            }`}
          >
            {isMember ? `Joined (${userRole || "Member"})` : "Join Group"}
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-primary text-white px-5 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-primary/95 transition-colors"
          >
            Login to Join Group
          </Link>
        )}
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left cols (2): Announcements & Forums link */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-white/50">
              Group Announcements
            </h2>
            {isOwnerOrMod && (
              <span className="text-[8px] bg-primary/10 text-primary uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                Moderator Tools
              </span>
            )}
          </div>

          {/* Announcements list */}
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="text-center py-8 bg-[#121212] border border-white/5 rounded text-white/20 text-xs font-sans">
                No active announcements for this group.
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="bg-primary/5 border border-primary/10 p-5 rounded-sm space-y-2">
                  <h4 className="text-xs font-sans font-bold text-white/95">{ann.title}</h4>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">{ann.content}</p>
                  <p className="text-[8px] text-white/20 font-sans">
                    Posted {new Date(ann.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add Announcement Form (Moderator only) */}
          {isOwnerOrMod && (
            <form onSubmit={handleCreateAnnouncement} className="bg-[#121212] border border-white/5 p-5 space-y-3 rounded-sm">
              <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/70">
                Post New Announcement
              </h4>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Announcement Title"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="bg-black border border-white/8 w-full p-2 text-xs text-white focus:outline-none"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Write announcement text..."
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  className="bg-black border border-white/8 w-full p-2 text-xs text-white focus:outline-none resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingAnn}
                    className="bg-primary text-white text-[9px] font-sans font-bold uppercase tracking-widest px-4 py-2 hover:bg-primary/95 transition-colors disabled:opacity-50"
                  >
                    Post Announcement
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Group Forums Link */}
          <div className="bg-[#121212] border border-white/5 p-6 rounded-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-sans font-bold text-white/90">Group Discussion Board</h3>
              <p className="text-[10px] text-white/40 font-sans">
                Post discussions and engage in state-specific forums.
              </p>
            </div>
            <Link
              to="/community/forums"
              className="bg-white/5 border border-white/10 px-4 py-2 text-[9px] font-sans font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors"
            >
              Go to Forums
            </Link>
          </div>
        </div>

        {/* Right col: Members List */}
        <div className="bg-[#121212] border border-white/5 p-6 space-y-4 rounded-sm">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-3">
            <Users className="size-4 text-primary" />
            <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/80">
              Members ({group.members?.length ?? 0})
            </h3>
          </div>

          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {(group.members ?? []).map((m: any, i: number) => {
              const roleColors: Record<string, string> = {
                owner: "text-amber-400 border-amber-500/20 bg-amber-950/20",
                moderator: "text-slate-300 border-slate-500/20 bg-slate-800/20",
                member: "text-white/40 border-white/5 bg-transparent",
              };
              return (
                <div key={i} className="flex items-center justify-between gap-2 py-1">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-[9px] font-bold text-white/50">
                      {m.user?.name?.[0] || "M"}
                    </div>
                    <span className="text-[10px] text-white/70 font-sans font-bold truncate max-w-[120px]">
                      {m.user?.name || "Member"}
                    </span>
                  </div>
                  <span
                    className={`text-[7px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.2 border rounded-full ${
                      roleColors[m.role] || roleColors.member
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
