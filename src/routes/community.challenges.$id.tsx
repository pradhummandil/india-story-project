import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { Trophy, Clock, Star, Award, ShieldAlert, ChevronRight, Check } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/community/challenges/$id")({
  component: ChallengeDetailPage,
});

export default function ChallengeDetailPage() {
  const { id } = Route.useParams();
  const { user, session } = useAuthStore();

  const [challenge, setChallenge] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Submission form state
  const [storyTitle, setStoryTitle] = useState("");
  const [storyUrl, setStoryUrl] = useState("");
  const [storyId, setStoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasEntered, setHasEntered] = useState(false);

  // User's own stories (to select for entering)
  const [userStories, setUserStories] = useState<any[]>([]);

  const loadChallenge = () => {
    setLoading(true);
    fetch(`/api/community/challenges/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setChallenge(d.challenge);
        setEntries(d.entries ?? []);

        // Check if user has already entered
        if (user && d.entries) {
          const entry = d.entries.find((e: any) => e.userId === user.id);
          if (entry) setHasEntered(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChallenge();
  }, [id, user]);

  useEffect(() => {
    // Fetch logged in user's draft/published stories to link
    if (user && session) {
      fetch(`/api/admin/stories?pageSize=100`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((d) => setUserStories(d.stories ?? []))
        .catch(console.error);
    }
  }, [user, session]);

  const handleSubmitEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/community/challenges/${id}/enter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          storyTitle: storyTitle || undefined,
          storyUrl: storyUrl || undefined,
          storyId: storyId || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit entry");
      }

      setHasEntered(true);
      loadChallenge();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-white/5 rounded-sm" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-44 bg-white/5 rounded-sm" />
          <div className="h-44 bg-white/5 rounded-sm" />
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-12 space-y-4">
        <ShieldAlert className="size-8 text-primary mx-auto" />
        <p className="text-white/40 text-xs font-sans">Challenge not found or has expired.</p>
        <Link to="/community/challenges" className="text-primary hover:underline text-xs">
          Back to Challenges
        </Link>
      </div>
    );
  }

  const isChallengeActive = challenge.isActive && new Date(challenge.endAt).getTime() > Date.now();

  return (
    <div className="space-y-8">
      {/* ── Challenge Header ── */}
      <div className="bg-[#121212] border border-white/5 p-6 rounded-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5">
              {challenge.theme || "Writing Challenge"}
            </span>
            <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-white/30">
              Starts: {new Date(challenge.startAt).toLocaleDateString("en-IN")}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white leading-tight">
            {challenge.title}
          </h1>
          <p className="text-xs text-white/40 font-sans">
            Deadline: {new Date(challenge.endAt).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/8 px-4 py-2 text-[10px] font-sans font-bold text-white/70 uppercase tracking-widest">
          <Clock className="size-3.5 text-primary" />
          {isChallengeActive ? (
            <span>Ends: {new Date(challenge.endAt).toLocaleDateString("en-IN")}</span>
          ) : (
            <span className="text-red-400">Ended</span>
          )}
        </div>
      </div>

      {/* ── Two column split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Rules & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121212] border border-white/5 p-6 rounded-sm space-y-4">
            <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/80 border-b border-white/5 pb-2">
              Challenge Guidelines & Overview
            </h3>
            <p className="text-xs text-white/75 font-sans leading-relaxed whitespace-pre-wrap">
              {challenge.description}
            </p>
          </div>

          <div className="bg-[#121212] border border-white/5 p-6 rounded-sm space-y-4">
            <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/80 border-b border-white/5 pb-2">
              Writing Rules
            </h3>
            <p className="text-xs text-white/75 font-sans leading-relaxed whitespace-pre-wrap">
              {challenge.rules}
            </p>
          </div>

          {/* Submission Form (Only if active, not entered yet, and logged in) */}
          {user && isChallengeActive && !hasEntered && (
            <form onSubmit={handleSubmitEntry} className="bg-[#121212] border border-white/8 p-6 space-y-4 rounded-sm">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-primary">
                Submit Your Entry
              </h3>

              {error && (
                <p className="text-red-500 text-[10px] font-sans uppercase tracking-widest bg-red-950/20 border border-red-500/20 p-2 text-center">
                  {error}
                </p>
              )}

              <div className="space-y-4 font-sans text-xs">
                {/* Story selection dropdown */}
                {userStories.length > 0 && (
                  <div className="space-y-1">
                    <label className="block text-white/40 uppercase tracking-wider text-[9px] font-bold">
                      Link Existing Story (Recommended)
                    </label>
                    <select
                      value={storyId}
                      onChange={(e) => {
                        setStoryId(e.target.value);
                        // Auto populate title
                        const match = userStories.find((s) => s.id === e.target.value);
                        if (match) setStoryTitle(match.title);
                      }}
                      className="bg-black border border-white/8 w-full p-2.5 text-white focus:outline-none"
                    >
                      <option value="">-- Choose one of your stories --</option>
                      {userStories.map((story) => (
                        <option key={story.id} value={story.id}>
                          {story.title} ({story.status})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-white/40 uppercase tracking-wider text-[9px] font-bold">
                      Entry Title (If not linking story)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Unsung Weaver of Pochampally"
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      disabled={!!storyId}
                      className="bg-black border border-white/8 w-full p-2.5 text-white focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-white/40 uppercase tracking-wider text-[9px] font-bold">
                      External Story URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://medium.com/my-story"
                      value={storyUrl}
                      onChange={(e) => setStoryUrl(e.target.value)}
                      disabled={!!storyId}
                      className="bg-black border border-white/8 w-full p-2.5 text-white focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary text-white text-[10px] font-sans font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-primary/95 transition-colors disabled:opacity-50"
                  >
                    Submit Entry
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Already Entered state banner */}
          {hasEntered && (
            <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Check className="size-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-sans font-bold text-white/90">Entry Submitted Successfully</h4>
                  <p className="text-[10px] text-white/40 font-sans">
                    Your story entry has been registered. The leaderboard will display votes shortly.
                  </p>
                </div>
              </div>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Entered
              </span>
            </div>
          )}

          {!user && (
            <div className="bg-[#121212] border border-white/5 p-6 text-center space-y-3 rounded-sm">
              <p className="text-white/40 text-xs font-sans">
                Log in to submit your story to this writing competition challenge.
              </p>
              <Link
                to="/login"
                className="inline-block bg-primary text-white text-[10px] font-sans font-bold uppercase tracking-widest px-4 py-2 hover:bg-primary/95 transition-colors rounded-sm"
              >
                Log In to Enter
              </Link>
            </div>
          )}
        </div>

        {/* Right: Leaderboard Grid */}
        <div className="bg-[#121212] border border-white/5 p-6 space-y-4 rounded-sm self-start">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-3">
            <Trophy className="size-4 text-primary" />
            <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/80">
              Competition Entries ({entries.length})
            </h3>
          </div>

          <div className="space-y-4">
            {entries.length === 0 ? (
              <p className="text-white/20 text-xs font-sans py-4 italic">No entries submitted yet.</p>
            ) : (
              entries.map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between gap-2.5 py-1.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/20 w-4 font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs text-white/80 font-sans font-bold">
                        {entry.storyTitle || "Linked Story Entry"}
                      </p>
                      <p className="text-[8px] text-white/40 font-sans">
                        By {entry.user?.name || "Member"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-white/60 font-mono font-bold">
                      {entry.votes}
                    </span>
                    <p className="text-[7px] text-white/30 uppercase tracking-widest font-bold">
                      Votes
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
