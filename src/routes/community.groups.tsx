import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Plus, Lock, Globe, ShieldAlert, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/community/groups")({
  component: GroupsPage,
});

export default function GroupsPage() {
  const { user, session } = useAuthStore();

  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");
  const [privacy, setPrivacy] = useState("all");

  // Create group modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState("public");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadGroups = () => {
    setLoading(true);
    const token = session?.access_token;
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    const privacyFilter = privacy !== "all" ? `&privacy=${privacy}` : "";
    fetch(`/api/community/groups?sort=${sort}${privacyFilter}`, { headers })
      .then((r) => r.json())
      .then((d) => setGroups(d.groups ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGroups();
  }, [sort, privacy]);

  const handleJoinLeave = async (groupId: string, isMember: boolean) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/community/groups/${groupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: isMember ? "leave" : "join" }),
      });
      if (res.ok) {
        loadGroups(); // Refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !name || !description) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/community/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name, description, privacy: groupPrivacy }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create group");
      }

      setShowModal(false);
      setName("");
      setDescription("");
      loadGroups();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Groups Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Regional Hubs & Story Groups
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-1">
            Join groups centered around history, folklore, startups, or specific Indian states.
          </p>
        </div>
        {user ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-sans font-bold uppercase tracking-widest px-4 py-2 hover:bg-primary/95 transition-colors"
          >
            <Plus className="size-3.5" />
            Create Group
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-card border border-border text-[10px] font-sans font-bold uppercase tracking-widest px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in to Join
          </Link>
        )}
      </div>

      {/* ── Controls: Sort & Filter ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-1.5">
          {[
            { id: "popular", label: "Popular" },
            { id: "new", label: "Newest" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`px-3 py-1.5 text-[9px] font-sans font-bold uppercase tracking-widest rounded transition-colors ${
                sort === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-sans font-bold">
            Privacy:
          </span>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className="bg-background border border-border text-foreground text-[10px] font-sans font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-primary/50"
          >
            <option value="all" className="bg-card text-foreground">All Groups</option>
            <option value="public" className="bg-card text-foreground">🌐 Public</option>
            <option value="private" className="bg-card text-foreground">🔒 Private</option>
          </select>
        </div>
      </div>

      {/* ── Groups Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-muted rounded-2xl animate-pulse" />
          ))
        ) : groups.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl text-muted-foreground text-xs font-sans col-span-full shadow-sm">
            No groups found matching selection.
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="bg-card border border-border p-5 flex flex-col justify-between h-48 rounded-2xl hover:border-gold/40 shadow-sm transition-all"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20">
                    <Users className="size-4" />
                  </span>
                  <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1 border border-border px-2 py-0.5 rounded-full bg-muted/50">
                    {group.privacy === "public" ? (
                      <>
                        <Globe className="size-2.5" /> Public
                      </>
                    ) : (
                      <>
                        <Lock className="size-2.5" /> Private
                      </>
                    )}
                  </span>
                </div>
                <div className="space-y-1">
                  <Link
                    to={`/community/groups/${group.id}` as any}
                    className="text-xs font-sans font-bold text-foreground hover:text-primary transition-colors block truncate"
                  >
                    {group.name}
                  </Link>
                  <p className="text-[10px] text-muted-foreground font-sans line-clamp-2 leading-relaxed">
                    {group.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <span className="text-[9px] text-muted-foreground font-sans">
                  {group.memberCount} members
                </span>
                {user ? (
                  <button
                    onClick={() => handleJoinLeave(group.id, group.isMember)}
                    className={`px-3 py-1 text-[9px] font-sans font-bold uppercase tracking-widest rounded transition-colors ${
                      group.isMember
                        ? "bg-muted border border-border text-foreground hover:bg-muted/80"
                        : "bg-primary text-primary-foreground hover:bg-primary/95"
                    }`}
                  >
                    {group.isMember ? "Joined" : "Join"}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="text-[9px] text-primary font-sans font-bold uppercase tracking-widest hover:underline"
                  >
                    Login to Join
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Create Group Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 p-6 rounded-sm w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/80">
                Create Community Group
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs text-white/30 hover:text-white"
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-[10px] font-sans uppercase tracking-widest bg-red-950/20 border border-red-500/20 p-2 text-center">
                {error}
              </p>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="block text-white/40 uppercase tracking-wider text-[9px] font-bold">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telangana Folklore & Art Studies..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black border border-white/8 w-full p-2.5 text-white focus:outline-none focus:border-white/20 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-white/40 uppercase tracking-wider text-[9px] font-bold">
                  Group Privacy Setting
                </label>
                <select
                  value={groupPrivacy}
                  onChange={(e) => setGroupPrivacy(e.target.value)}
                  className="bg-black border border-white/8 w-full p-2.5 text-white focus:outline-none focus:border-white/20 text-xs"
                >
                  <option value="public">🌐 Public (Anyone can view and join)</option>
                  <option value="private">🔒 Private (Requires invite/approval)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-white/40 uppercase tracking-wider text-[9px] font-bold">
                  Group Description
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the purpose, region, or topics of discussion for this group..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-black border border-white/8 w-full p-2.5 text-white focus:outline-none focus:border-white/20 text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white/5 border border-white/8 px-4 py-2 text-[10px] font-sans font-bold uppercase tracking-widest text-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white px-5 py-2 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-primary/95 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function handleToggleJoin(groupId: string, isMember: boolean) {
    handleJoinLeave(groupId, isMember);
  }
}
