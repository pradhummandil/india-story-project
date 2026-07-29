import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  ExternalLink,
  FileText,
  AlertCircle,
  Sparkles,
  Info,
  MessageSquare,
  Heart,
  UserPlus,
  AtSign,
  Mail,
  Share2,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";

export type NotificationItem = {
  id: string;
  createdAt: string;
  message: string;
  read: boolean;
  type: string;
  title: string;
  storyId?: string | null;
  submissionId?: string | null;
  priority?: string | null;
  actionUrl?: string | null;
};

// ─── Icon map by notification type ───────────────────────────────────────────
function NotifIcon({ type, unread }: { type: string; unread: boolean }) {
  const cls = `size-4`;
  const icon = (() => {
    switch (type) {
      case "COMMENT":       return <MessageSquare className={cls} />;
      case "REPLY":         return <MessageSquare className={cls} />;
      case "MENTION":       return <AtSign className={cls} />;
      case "FOLLOW":        return <UserPlus className={cls} />;
      case "NEWSLETTER_SUBSCRIBE": return <Mail className={cls} />;
      case "COLLECTION_SHARE":     return <Share2 className={cls} />;
      case "SYSTEM_ALERT":  return <ShieldAlert className={cls + " text-rose-500"} />;
      case "ASSIGNMENT":    return <FileText className={cls} />;
      case "REVISION_SUBMITTED":   return <FileText className={cls} />;
      case "REVISION_APPROVED":    return <CheckCheck className={cls + " text-emerald-500"} />;
      case "REVISION_REJECTED":    return <AlertCircle className={cls + " text-rose-500"} />;
      default:
        if (type?.includes("SUBMISSION")) return <FileText className={cls} />;
        return <Info className={cls} />;
    }
  })();

  return (
    <div
      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
        unread ? "bg-amber-500/10 text-amber-600" : "bg-muted/60 text-muted-foreground"
      }`}
    >
      {icon}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function NotificationDropdown() {
  const navigate = useNavigate();
  const { user, session } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastNotification, setToastNotification] = useState<NotificationItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const previousIdsRef = useRef<Set<string>>(new Set());

  const authHeaders = useCallback(
    () =>
      session ? { Authorization: `Bearer ${session.access_token}` } : {},
    [session]
  );

  // ─── Fetch all notifications (initial load + after mutations) ─────────────
  const fetchNotifications = useCallback(async () => {
    if (!user || !session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: NotificationItem[] = data.notifications || [];
      setNotifications(list);
      previousIdsRef.current = new Set(list.map((n) => n.id));
    } catch (e) {
      console.error("[NotificationDropdown] fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [user, session, authHeaders]);

  // ─── Initial fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  // ─── Supabase Realtime subscription — ZERO POLLING ───────────────────────
  // Listens on postgres_changes for INSERT on the Notification table filtered
  // by recipientId = current user. Fires instantly across all browser tabs /
  // devices without any setTimeout or setInterval.
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
          filter: `recipientId=eq.${user.id}`,
        },
        (payload: any) => {
          const raw = payload.new;
          if (!raw) return;

          const newNotif: NotificationItem = {
            id: raw.id,
            createdAt: raw.createdAt ?? new Date().toISOString(),
            message: raw.message ?? "",
            read: raw.isRead ?? false,
            type: raw.type ?? "SYSTEM_ALERT",
            title: raw.title ?? "Notification",
            storyId: raw.storyId ?? null,
            submissionId: raw.submissionId ?? null,
            priority: raw.priority ?? "normal",
            actionUrl: raw.actionUrl ?? null,
          };

          // Skip if we already have it (e.g. just came from initial fetch)
          if (previousIdsRef.current.has(newNotif.id)) return;
          previousIdsRef.current.add(newNotif.id);

          // Prepend to list
          setNotifications((prev) => [newNotif, ...prev]);

          // Show pop-up toast
          setToastNotification(newNotif);
        }
      )
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "Notification",
          filter: `recipientId=eq.${user.id}`,
        },
        (payload: any) => {
          const raw = payload.new;
          if (!raw) return;
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === raw.id ? { ...n, read: raw.isRead ?? n.read } : n
            )
          );
        }
      )
      .on(
        "postgres_changes" as any,
        {
          event: "DELETE",
          schema: "public",
          table: "Notification",
        },
        (payload: any) => {
          const old = payload.old;
          if (!old?.id) return;
          setNotifications((prev) => prev.filter((n) => n.id !== old.id));
          previousIdsRef.current.delete(old.id);
        }
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          console.debug("[NotifRealtime] Subscribed to Notification changes for", user.id);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // ─── Auto-hide toast after 5 seconds ─────────────────────────────────────
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // ─── Click outside & ESC ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!session) return;
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "mark_read", notificationId: id }),
      });
    } catch (err) {
      console.error("Mark read error:", err);
      // Revert optimistic update
      void fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (!session) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
    } catch (err) {
      console.error("Mark all read error:", err);
      void fetchNotifications();
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) return;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    previousIdsRef.current.delete(id);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "delete", notificationId: id }),
      });
    } catch (err) {
      console.error("Delete notification error:", err);
      void fetchNotifications();
    }
  };

  const handleItemClick = (n: NotificationItem) => {
    if (!n.read) void markAsRead(n.id);
    setOpen(false);
    if (n.actionUrl) {
      void navigate({ to: n.actionUrl as any });
    } else if (n.submissionId) {
      void navigate({ to: `/editor?tab=pipeline&id=${n.submissionId}` as any });
    } else {
      void navigate({ to: "/editor?tab=inbox" as any });
    }
  };

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-muted/80 text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
        aria-label="Open notifications"
        id="notification-bell"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Floating toast — appears for 5s when new notification arrives */}
      {toastNotification && !open && (
        <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-card border border-gold/40 shadow-2xl p-4 rounded-xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-gold/10 text-gold shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">{toastNotification.title}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                {toastNotification.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-card border border-border/80 shadow-2xl rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => void markAllAsRead()}
                  className="text-[10px] text-muted-foreground hover:text-foreground font-semibold px-2 py-1 rounded hover:bg-muted/40 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                  id="mark-all-read-btn"
                >
                  <CheckCheck className="size-3 text-emerald-500" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted/40 transition-colors cursor-pointer"
                aria-label="Close notifications dropdown"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="size-8 mx-auto text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors cursor-pointer group ${
                    !n.read ? "bg-amber-500/5 border-l-2 border-l-amber-500" : ""
                  }`}
                >
                  <div className="flex gap-3 min-w-0">
                    <NotifIcon type={n.type} unread={!n.read} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-xs font-bold truncate ${
                            !n.read ? "text-foreground font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          {n.title}
                        </h4>
                        {!n.read && <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-muted-foreground/60 block mt-1">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!n.read && (
                      <button
                        onClick={(e) => void markAsRead(n.id, e)}
                        className="p-1 text-muted-foreground hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <CheckCheck className="size-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => void deleteNotification(n.id, e)}
                      className="p-1 text-muted-foreground hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border/60 bg-muted/10 text-center">
            <Link
              to="/editor"
              search={{ tab: "inbox" } as any}
              onClick={() => setOpen(false)}
              className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
            >
              View Full Inbox
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
