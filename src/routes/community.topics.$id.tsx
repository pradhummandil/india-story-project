import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { MessageSquare, Lock, Eye, Send, ShieldAlert, Flag, Trash2, Heart, Lightbulb, Flame, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/community/topics/$id")({
  component: TopicDetailPage,
});

export default function TopicDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, session } = useAuthStore();

  const [topic, setTopic] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form replies state
  const [newReplyText, setNewReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);

  // Moderation state
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("spam");

  const loadTopic = () => {
    setLoading(true);
    fetch(`/api/community/topics/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setTopic(d.topic);
        setPosts(d.topic?.posts ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTopic();
  }, [id]);

  const handlePostReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!session || !newReplyText.trim()) return;
    setSubmittingReply(true);

    try {
      const res = await fetch(`/api/community/topics/${id}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: newReplyText,
          parentId: replyParentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to post reply");
      setNewReplyText("");
      setReplyParentId(null);
      loadTopic(); // Reload thread
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleToggleReaction = async (postId: string, emoji: string) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/community/posts/${postId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ emoji }),
      });
      if (res.ok) {
        loadTopic();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReport = async (postId: string) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/community/posts/${postId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ reason: reportReason }),
      });
      if (res.ok) {
        alert("Thank you. The reply has been reported for moderation.");
        setReportingPostId(null);
        loadTopic();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!session || !confirm("Are you sure you want to delete this reply?")) return;
    try {
      const res = await fetch(`/api/admin/community/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "delete",
          targetType: "post",
          targetId: postId,
        }),
      });
      if (res.ok) {
        loadTopic();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTopic = async () => {
    if (!session || !confirm("Are you sure you want to delete this entire topic?")) return;
    try {
      const res = await fetch(`/api/admin/community/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "delete",
          targetType: "topic",
          targetId: id,
        }),
      });
      if (res.ok) {
        void navigate({ to: "/community/forums" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-white/5 w-1/3 rounded" />
        <div className="h-28 bg-[#121212] border border-white/5 rounded" />
        <div className="space-y-3">
          <div className="h-12 bg-white/5 rounded" />
          <div className="h-12 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertCircle className="size-8 text-primary mx-auto" />
        <p className="text-white/40 text-xs font-sans">Discussion topic not found or was deleted.</p>
        <Link to="/community/forums" className="text-primary hover:underline text-xs">
          Back to Forums
        </Link>
      </div>
    );
  }

  // Filter root posts vs nested posts
  const rootPosts = posts.filter((p) => !p.parentId);
  const repliesMap = posts.reduce((acc: any, p: any) => {
    if (p.parentId) {
      acc[p.parentId] = acc[p.parentId] || [];
      acc[p.parentId].push(p);
    }
    return acc;
  }, {});

  const isTopicAuthorOrAdmin =
    user && (user.id === topic.userId || ["SuperAdmin", "Admin", "Editor"].includes(user.app_metadata?.role || ""));

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ── Breadcrumbs & Admin Actions ── */}
      <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-widest text-white/30">
        <div className="flex items-center gap-1.5">
          <Link to="/community/forums" className="hover:text-white transition-colors">
            Forums
          </Link>
          <span>/</span>
          <span className="text-primary">{topic.category?.name || "General"}</span>
        </div>
        {isTopicAuthorOrAdmin && (
          <button
            onClick={handleDeleteTopic}
            className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors uppercase font-bold"
          >
            <Trash2 className="size-3" />
            Delete Topic
          </button>
        )}
      </div>

      {/* ── Topic Banner ── */}
      <div className="bg-[#121212] border border-white/5 p-6 rounded-sm space-y-4 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-white leading-tight">
              {topic.title}
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-white/35 font-sans">
              <span>By {topic.user?.name || "Member"}</span>
              <span>•</span>
              <span>Published {new Date(topic.createdAt).toLocaleString("en-IN")}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Eye className="size-3" /> {topic.viewCount} views
              </span>
            </div>
          </div>
          {topic.isLocked && (
            <span className="flex items-center gap-1 bg-red-950/30 border border-red-500/20 text-red-400 text-[8px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
              <Lock className="size-3" /> Locked
            </span>
          )}
        </div>
        <p className="text-xs text-white/70 leading-relaxed font-sans whitespace-pre-wrap pt-2 border-t border-white/5">
          {topic.content}
        </p>
      </div>

      {/* ── Replies Section ── */}
      <div className="space-y-4">
        <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/50">
          Replies ({posts.length})
        </h3>

        {rootPosts.length === 0 ? (
          <div className="text-center py-8 bg-[#121212]/50 border border-white/5 rounded text-white/20 text-xs font-sans">
            No replies yet. Be the first to join the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {rootPosts.map((post) => {
              const children = repliesMap[post.id] || [];
              const reactions = post.reactions || [];

              // Calculate unique reaction counts
              const reactionCounts = reactions.reduce((acc: any, r: any) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {});

              const isPostAuthorOrAdmin =
                user && (user.id === post.userId || ["SuperAdmin", "Admin", "Editor"].includes(user.app_metadata?.role || ""));

              return (
                <div key={post.id} className="bg-[#121212] border border-white/5 p-5 space-y-4 rounded-sm">
                  {/* User info bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-[9px] font-bold text-white/60">
                        {post.user?.name?.[0] || "M"}
                      </div>
                      <div>
                        <p className="text-[10px] text-white/70 font-sans font-bold">
                          {post.user?.name || "Member"}
                        </p>
                        <p className="text-[8px] text-white/30 font-sans">
                          {new Date(post.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Report Flag */}
                      {user && (
                        <button
                          onClick={() => setReportingPostId(post.id)}
                          className="text-white/20 hover:text-red-400 transition-colors"
                          title="Report Post"
                        >
                          <Flag className="size-3.5" />
                        </button>
                      )}
                      {/* Delete */}
                      {isPostAuthorOrAdmin && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-white/20 hover:text-red-400 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-xs text-white/75 font-sans leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Reaction / Reply bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
                    {/* Reactions */}
                    <div className="flex items-center gap-1.5">
                      {["👍", "❤️", "🔥", "💡", "🤔", "😂"].map((emoji) => {
                        const count = reactionCounts[emoji] || 0;
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(post.id, emoji)}
                            className={`px-2 py-1 text-[10px] font-sans border rounded-sm transition-colors flex items-center gap-1 ${
                              session
                                ? "bg-white/5 border-white/8 text-white/40 hover:text-white/70"
                                : "bg-transparent border-transparent text-white/20 cursor-default"
                            }`}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className="font-mono text-white/70 font-bold">{count}</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Inline Reply Trigger */}
                    {user && !topic.isLocked && (
                      <button
                        onClick={() => {
                          setReplyParentId(post.id);
                          setNewReplyText(`@${post.user?.name || "Member"} `);
                        }}
                        className="text-[9px] font-sans font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <MessageSquare className="size-3" /> Reply
                      </button>
                    )}
                  </div>

                  {/* Inline Nested Children */}
                  {children.length > 0 && (
                    <div className="space-y-3 pl-6 border-l border-white/5 mt-3">
                      {children.map((child: any) => {
                        const isChildAuthorOrAdmin =
                          user && (user.id === child.userId || ["SuperAdmin", "Admin", "Editor"].includes(user.app_metadata?.role || ""));
                        return (
                          <div key={child.id} className="bg-white/3 border border-white/5 p-4 space-y-2 rounded-sm">
                            <div className="flex justify-between items-center text-[9px] font-sans text-white/30">
                              <span className="font-bold text-white/50">{child.user?.name}</span>
                              <div className="flex items-center gap-2">
                                <span>{new Date(child.createdAt).toLocaleDateString("en-IN")}</span>
                                {isChildAuthorOrAdmin && (
                                  <button
                                    onClick={() => handleDeletePost(child.id)}
                                    className="text-red-500/50 hover:text-red-400"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-white/60 font-sans leading-relaxed whitespace-pre-wrap">
                              {child.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Report Overlay Popup */}
                  {reportingPostId === post.id && (
                    <div className="bg-white/5 border border-white/10 p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-red-400">
                          Report Inappropriate Content
                        </span>
                        <button onClick={() => setReportingPostId(null)} className="text-xs text-white/40">
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center gap-2 font-sans text-xs">
                        <select
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="bg-black border border-white/10 p-1.5 text-white focus:outline-none"
                        >
                          <option value="spam">Spam / Unsolicited Ads</option>
                          <option value="hate">Hate Speech</option>
                          <option value="harassment">Harassment</option>
                          <option value="misinformation">Misinformation</option>
                          <option value="other">Other / Off-Topic</option>
                        </select>
                        <button
                          onClick={() => handleSubmitReport(post.id)}
                          className="bg-red-600 text-white px-3 py-1.5 font-bold uppercase tracking-widest text-[9px] hover:bg-red-500"
                        >
                          Submit Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Reply Box ── */}
      {user && !topic.isLocked ? (
        <form onSubmit={handlePostReply} className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-sans uppercase tracking-widest text-white/30">
            <span>
              {replyParentId ? "Replying to user thread" : "Leave a reply"}
            </span>
            {replyParentId && (
              <button
                type="button"
                onClick={() => {
                  setReplyParentId(null);
                  setNewReplyText("");
                }}
                className="text-red-400 font-bold"
              >
                Cancel Thread Mode
              </button>
            )}
          </div>
          <div className="relative">
            <textarea
              required
              rows={4}
              placeholder="Join the discussion... Type '@' to mention contributors."
              value={newReplyText}
              onChange={(e) => setNewReplyText(e.target.value)}
              className="bg-black border border-white/8 w-full p-3.5 text-xs text-white focus:outline-none focus:border-white/20 resize-none font-sans"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingReply}
              className="flex items-center gap-1.5 bg-primary text-white text-[10px] font-sans font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-primary/95 transition-colors disabled:opacity-50"
            >
              <Send className="size-3" />
              {submittingReply ? "Posting..." : "Post Reply"}
            </button>
          </div>
        </form>
      ) : topic.isLocked ? (
        <div className="bg-white/3 border border-white/5 p-4 rounded text-center text-white/30 text-xs font-sans flex items-center justify-center gap-2">
          <Lock className="size-4" /> This discussion has been locked by a community moderator.
        </div>
      ) : (
        <div className="bg-[#121212] border border-white/5 p-6 text-center space-y-3 rounded">
          <p className="text-white/40 text-xs font-sans">
            You must be logged in to participate in the forums.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary text-white text-[10px] font-sans font-bold uppercase tracking-widest px-4 py-2 hover:bg-primary/95 transition-colors"
          >
            Log In
          </Link>
        </div>
      )}
    </div>
  );
}
