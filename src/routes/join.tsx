import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  Award,
  MessageSquare,
  Plus,
  Send,
  Trophy,
  Flame,
  ChevronRight,
  Zap,
  Play,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Community Hub — India Story Project" },
      {
        name: "description",
        content:
          "Join the India Story Project readers and contributors community. Discussions, leaderboards, and challenges.",
      },
    ],
  }),
  component: CommunityHubPage,
});

type LeaderboardUser = {
  userId: string;
  name: string;
  avatarUrl?: string;
  totalXP: number;
  level: number;
  streak: number;
};

type DiscussionTopic = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  repliesCount: number;
  createdAt: string;
};

type DiscussionPost = {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  authorLevel: number;
  createdAt: string;
};

const challenges = [
  {
    title: "The Heritage Chronicler's Quest",
    desc: "Submit a visual dispatch exploring a living craft system or dying art form in your hometown. Winners get featured on the Hero slideshow.",
    deadline: "July 31, 2026",
    xp: "+500 XP",
  },
  {
    title: "Organic Pioneers Profile Challenge",
    desc: "Write a profile of a local farmer converting to eco-friendly, sustainable multi-cropping methods. Top 3 stories win direct cash grants.",
    deadline: "August 15, 2026",
    xp: "+1,000 XP & Grant",
  },
];

function CommunityHubPage() {
  const navigate = useNavigate();
  const { user, session } = useAuthStore();

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [postingTopic, setPostingTopic] = useState(false);

  // Selected topic details for reading replies
  const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic | null>(null);
  const [replies, setReplies] = useState<DiscussionPost[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [postingReply, setPostingReply] = useState(false);

  const fetchCommunityData = () => {
    setLoading(true);
    fetch("/api/community")
      .then((r) => r.json())
      .then((res) => {
        setLeaderboard(res.leaderboard ?? []);
        setTopics(res.topics ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  // Fetch replies when topic is selected
  useEffect(() => {
    if (!selectedTopic) return;
    setRepliesLoading(true);
    fetch(`/api/community/post?topicId=${selectedTopic.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReplies(data);
        }
      })
      .catch(console.error)
      .finally(() => setRepliesLoading(false));
  }, [selectedTopic]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !session) {
      alert("Please log in to start a discussion.");
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) return;

    setPostingTopic(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewContent("");
        fetchCommunityData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostingTopic(false);
    }
  };

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !session || !selectedTopic) {
      alert("Please log in to reply.");
      return;
    }
    if (!newReply.trim()) return;

    setPostingReply(true);
    try {
      const res = await fetch("/api/community/post", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ topicId: selectedTopic.id, content: newReply.trim() }),
      });
      if (res.ok) {
        setNewReply("");
        // Reload replies
        fetch(`/api/community/post?topicId=${selectedTopic.id}`)
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data)) setReplies(data);
          });
        // Update topics local count
        setTopics((p) =>
          p.map((t) =>
            t.id === selectedTopic.id ? { ...t, repliesCount: t.repliesCount + 1 } : t,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostingReply(false);
    }
  };

  return (
    <SiteLayout>
      <div className="bg-background min-h-screen py-24 md:py-32">
        {/* Header */}
        <div className="container mx-auto px-6 border-b border-border/40 pb-10 mb-12">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans font-bold mb-3 flex items-center gap-2">
              <Users className="size-4" /> Community Hub
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-none tracking-tight">
              Gather, Share, <span className="text-primary italic">Co-Create.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium">
              Join discussion forums, participate in editorial challenges, unlock verification
              badges, and explore our reader leaderboard.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Discussion board */}
          <div className="lg:col-span-2 space-y-8">
            <div className="border border-border bg-card/30 p-6 space-y-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2 border-b border-border/40 pb-3 font-sans">
                <MessageSquare className="size-4 text-gold" /> Discussion Boards
              </h3>

              {/* Start new topic form */}
              {user ? (
                <form
                  onSubmit={handleCreateTopic}
                  className="space-y-3 bg-card/65 p-4 border border-border/50"
                >
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gold font-sans">
                    Start a new thread
                  </p>
                  <Input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Thread Title (e.g. Preserving Ladakh Loom systems)..."
                    className="h-10 bg-background border-border rounded-none focus-visible:ring-primary/45 font-sans text-xs"
                  />
                  <textarea
                    required
                    rows={3}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write your topic post details here..."
                    className="w-full bg-background border border-border p-3 text-xs font-sans text-white focus:outline-none focus:border-primary placeholder:text-muted-foreground/60 resize-none"
                  />
                  <Button
                    type="submit"
                    disabled={postingTopic}
                    className="h-9 px-4 bg-primary hover:bg-primary/90 text-white rounded-none font-sans text-[10px] uppercase tracking-widest gap-2"
                  >
                    <Plus className="size-3.5" /> {postingTopic ? "Posting..." : "Create Thread"}
                  </Button>
                </form>
              ) : (
                <div className="bg-white/5 border border-white/5 p-4 text-center text-xs text-muted-foreground font-sans">
                  Please{" "}
                  <Link to="/login" className="text-gold hover:underline">
                    log in
                  </Link>{" "}
                  to create a discussion thread.
                </div>
              )}

              {/* Topics List */}
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-white/5 animate-pulse rounded-none border border-border/30"
                    />
                  ))}
                </div>
              ) : topics.length === 0 ? (
                <p className="text-xs text-muted-foreground font-sans italic">
                  No discussion threads active yet. Be the first to start one!
                </p>
              ) : (
                <div className="space-y-4">
                  {topics.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTopic(t)}
                      className="border border-border/60 bg-card p-4 hover:border-gold/40 hover:bg-card/75 transition-all cursor-pointer flex justify-between items-center group"
                    >
                      <div className="min-w-0 pr-4 space-y-1.5">
                        <h4 className="font-display font-bold text-sm text-white group-hover:text-primary transition-colors line-clamp-1">
                          {t.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-sans">
                          <span>Started by {t.authorName}</span>
                          <span>•</span>
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 px-3 py-1.5 text-center shrink-0">
                        <span className="text-white text-xs block font-mono font-bold">
                          {t.repliesCount}
                        </span>
                        <span className="text-[7px] text-muted-foreground uppercase font-bold tracking-wider font-sans">
                          Replies
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Writing Challenges */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2 border-b border-border/40 pb-3 font-sans">
                <Trophy className="size-4 text-gold" /> Contributor Challenges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.map((c) => (
                  <div
                    key={c.title}
                    className="border border-border/80 bg-card p-6 flex flex-col justify-between hover:border-gold/30 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider font-sans">
                        <span className="text-gold">{c.xp}</span>
                        <span className="text-muted-foreground">Ends {c.deadline}</span>
                      </div>
                      <h4 className="font-display font-bold text-md text-white">{c.title}</h4>
                      <p className="text-xs text-muted-foreground/90 font-sans leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40">
                      <Link
                        to="/share-story"
                        className="text-[10px] uppercase font-bold tracking-widest text-primary hover:text-gold transition-colors font-sans flex items-center gap-1"
                      >
                        Submit Entry <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Panel */}
          <div className="space-y-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2 border-b border-border/40 pb-3 font-sans">
              <Flame className="size-4 text-gold fill-gold" /> Reader Leaderboard
            </h3>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-white/5 animate-pulse border border-border/20" />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-xs text-muted-foreground font-sans italic">Leaderboard empty.</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((lb, index) => (
                  <div
                    key={lb.userId}
                    className="border border-border/50 bg-card p-3 flex items-center justify-between font-sans hover:border-gold/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono font-bold text-muted-foreground w-4">
                        {index + 1}.
                      </span>
                      {lb.avatarUrl ? (
                        <img
                          src={lb.avatarUrl}
                          alt={lb.name}
                          className="size-8 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gold uppercase shrink-0">
                          {lb.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{lb.name}</p>
                        <p className="text-[9px] text-muted-foreground">Level {lb.level}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-gold text-xs font-mono font-bold block">
                        {lb.totalXP} XP
                      </span>
                      {lb.streak > 0 && (
                        <span className="text-[8px] text-primary font-bold flex items-center gap-0.5 justify-end">
                          <Flame className="size-2.5 fill-primary" /> {lb.streak}d
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Topic / Reply Detail Drawer-Modal */}
        {selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="relative max-w-2xl w-full bg-[#121212] border border-border rounded-none p-6 flex flex-col max-h-[85vh]">
              {/* Close Button */}
              <button
                onClick={() => setSelectedTopic(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                title="Close"
              >
                <Plus className="size-5 rotate-45" />
              </button>

              {/* Topic Post Header */}
              <div className="border-b border-border/40 pb-4 mb-4 pr-8">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gold font-sans">
                  Community Forum
                </p>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  {selectedTopic.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-line bg-white/5 p-3 font-sans">
                  {selectedTopic.content}
                </p>
                <div className="flex items-center gap-2 mt-3 text-[9px] text-muted-foreground/80 font-sans font-medium">
                  <span>Thread by {selectedTopic.authorName}</span>
                  <span>•</span>
                  <span>{new Date(selectedTopic.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Replies list scroll block */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 font-sans text-xs">
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">
                  Replies
                </p>
                {repliesLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : replies.length === 0 ? (
                  <p className="italic text-muted-foreground/80 py-4 text-center">
                    No replies posted to this thread yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {replies.map((post) => (
                      <div
                        key={post.id}
                        className="border border-border/40 bg-card/65 p-3 flex gap-3 items-start"
                      >
                        {post.authorAvatar ? (
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="size-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gold uppercase shrink-0">
                            {post.authorName[0]}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-[11px]">
                              {post.authorName}
                            </span>
                            <span className="text-[8px] bg-white/5 border border-white/10 px-1 text-gold">
                              Lvl {post.authorLevel}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground/90 mt-1 leading-relaxed whitespace-pre-line">
                            {post.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply form */}
              {user ? (
                <form
                  onSubmit={handleAddReply}
                  className="flex gap-2 pt-4 border-t border-border/40 shrink-0"
                >
                  <Input
                    required
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Type your reply to this thread..."
                    className="h-10 bg-background border-border rounded-none focus-visible:ring-primary/45 font-sans text-xs"
                  />
                  <Button
                    type="submit"
                    disabled={postingReply}
                    className="h-10 px-4 bg-primary hover:bg-primary/90 text-white rounded-none font-sans text-xs uppercase tracking-widest gap-2"
                  >
                    <Send className="size-3.5" />
                  </Button>
                </form>
              ) : (
                <div className="text-center text-xs text-muted-foreground font-sans pt-4 border-t border-border/40">
                  Please{" "}
                  <Link to="/login" className="text-gold hover:underline">
                    log in
                  </Link>{" "}
                  to reply to threads.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
