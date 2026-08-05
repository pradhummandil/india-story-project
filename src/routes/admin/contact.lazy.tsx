import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Search,
  Trash2,
  Check,
  CheckCircle,
  Send,
  Inbox,
  MessageSquare,
  Reply,
  Globe,
  ShieldAlert,
  Archive,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createLazyFileRoute("/admin/contact")({
  component: AdminContactInboxPage,
});

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  country: string | null;
  replyContent: string | null;
  repliedAt: string | null;
  createdAt: string;
};

export default function AdminContactInboxPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  const fetchMessages = async () => {
    if (!session) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(
        `/api/admin/contact?status=${statusFilter}&query=${encodeURIComponent(
          searchQuery,
        )}&page=${page}&pageSize=10`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data.messages || []);
      setTotal(data.total || 0);
      setPageCount(data.pageCount || 1);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while loading inbox");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, statusFilter, page]);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (user) {
        setPage(1);
        fetchMessages();
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setReplyText("");
    if (msg.status === "unread" && session) {
      // Mark as read
      try {
        const res = await fetch("/api/admin/contact", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ id: msg.id, status: "read" }),
        });
        if (res.ok) {
          // Update local status
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: "read" } : m)));
        }
      } catch (err) {
        console.error("Failed to mark message as read:", err);
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!session) return;
    try {
      setErrorMsg(null);
      const res = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setSuccessMsg(`Message status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchMessages();
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!session) return;
    if (!window.confirm("Are you sure you want to permanently delete this message?")) return;

    try {
      setErrorMsg(null);
      const res = await fetch(`/api/admin/contact?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete message");

      setSuccessMsg("Message deleted successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
      setSelectedMessage(null);
      fetchMessages();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete message");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !selectedMessage || !replyText.trim()) return;

    try {
      setSubmittingReply(true);
      setErrorMsg(null);
      const res = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: selectedMessage.id,
          replyContent: replyText.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to send reply");

      const data = await res.json();
      setSuccessMsg("Reply email sent to sender successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
      setSelectedMessage(
        data.message || {
          ...selectedMessage,
          replyContent: replyText.trim(),
          repliedAt: new Date().toISOString(),
          status: "read",
        },
      );
      setReplyText("");
      fetchMessages();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <AdminLayout
      title="Inbox"
      subtitle="Manage and reply to message submissions from the contact page."
    >
      <div className="h-[calc(100vh-12rem)] flex gap-6 overflow-hidden">
        {/* Left List Pane */}
        <div className="w-1/2 flex flex-col bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm">
          {/* Header Filters */}
          <div className="p-4 border-b border-border/60 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-border text-xs font-sans placeholder:text-muted-foreground rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              {["all", "unread", "read", "archived"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border ${
                    statusFilter === status
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {loading ? (
              <div className="space-y-1 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 border border-border/40 animate-pulse space-y-3 rounded-lg">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-muted/60 rounded" />
                      <div className="h-3 w-16 bg-muted/60 rounded" />
                    </div>
                    <div className="h-4 w-full bg-muted/60 rounded" />
                    <div className="h-3 w-2/3 bg-muted/60 rounded" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Inbox className="size-8 text-muted-foreground/40" />
                No messages found.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 cursor-pointer hover:bg-muted/40 transition-colors relative ${
                    selectedMessage?.id === msg.id ? "bg-muted/60" : ""
                  }`}
                >
                  {msg.status === "unread" && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary" />
                  )}
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-xs text-foreground truncate max-w-[150px]">
                      {msg.name}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-primary font-bold truncate mt-0.5">
                    {msg.subject}
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-normal">
                    {msg.message}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Footer */}
          {pageCount > 1 && (
            <div className="p-3 border-t border-border/60 flex justify-between items-center text-[10px] font-sans">
              <span className="text-muted-foreground">Total: {total}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="h-7 text-[10px] px-2.5 border-border"
                >
                  Prev
                </Button>
                <span className="py-1 text-foreground font-semibold">
                  {page} / {pageCount}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === pageCount}
                  onClick={() => setPage(page + 1)}
                  className="h-7 text-[10px] px-2.5 border-border"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Detail Pane */}
        <div className="flex-1 bg-card border border-border/80 rounded-xl flex flex-col overflow-hidden shadow-sm">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Message Header */}
              <div className="p-5 border-b border-border/60 flex justify-between items-start">
                <div className="space-y-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground truncate">
                    {selectedMessage.subject}
                  </h3>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                    <span>
                      From:{" "}
                      <span className="text-foreground font-medium">{selectedMessage.name}</span> (
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="text-primary hover:underline"
                      >
                        {selectedMessage.email}
                      </a>
                      )
                    </span>
                    <span>·</span>
                    <span>Received: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedMessage.country && (
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Globe className="size-3" />
                      <span>{selectedMessage.country}</span>
                      {selectedMessage.ipAddress && <span>({selectedMessage.ipAddress})</span>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedMessage.status !== "archived" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedMessage.id, "archived")}
                      className="h-8 text-xs border-border text-muted-foreground hover:text-foreground"
                    >
                      <Archive className="size-3.5 mr-1" /> Archive
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedMessage.id, "read")}
                      className="h-8 text-xs border-border text-muted-foreground hover:text-foreground"
                    >
                      Unarchive
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">
                    Message Body
                  </h4>
                  <div className="text-sm font-sans text-foreground whitespace-pre-wrap leading-relaxed bg-background p-4 rounded-xl border border-border/60">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Reply section */}
                {selectedMessage.replyContent ? (
                  <div className="space-y-2 pt-4 border-t border-border/60">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                        <CheckCircle className="size-3 text-primary" /> Admin Reply Sent
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {selectedMessage.repliedAt
                          ? new Date(selectedMessage.repliedAt).toLocaleString()
                          : ""}
                      </span>
                    </div>
                    <div className="text-xs font-sans text-foreground whitespace-pre-wrap leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/20">
                      {selectedMessage.replyContent}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-border/60">
                    <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Send className="size-3" /> Reply via Email
                    </h4>
                    <textarea
                      rows={4}
                      placeholder="Type your response to send directly to user email..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none font-sans"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={submittingReply || !replyText.trim()}
                        className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-sm"
                      >
                        <Send className="size-3.5 mr-1.5" />
                        {submittingReply ? "Sending..." : "Send Email Reply"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <Mail className="size-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">Select a message from the left to view details</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
