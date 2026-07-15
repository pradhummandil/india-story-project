import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Search,
  Trash2,
  Check,
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

export const Route = createFileRoute("/admin/contact")({
  head: () => ({ meta: [{ title: "Inbox — Admin" }] }),
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
        <div className="w-1/2 flex flex-col bg-[#161616] border border-white/10 rounded-sm overflow-hidden">
          {/* Header Filters */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-white/30" />
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-black/40 border-white/10 text-xs font-sans placeholder:text-white/30"
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
                  className={`px-3 py-1.5 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-colors border ${
                    statusFilter === status
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "bg-transparent text-white/40 border-white/5 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {loading ? (
              <div className="space-y-1 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 border border-white/5 animate-pulse space-y-3">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-white/5 rounded" />
                      <div className="h-3 w-16 bg-white/5 rounded" />
                    </div>
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <div className="h-3 w-2/3 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center text-xs text-white/30 flex flex-col items-center justify-center gap-2">
                <Inbox className="size-8 text-white/20" />
                No messages found.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 cursor-pointer hover:bg-white/5 transition-colors relative ${
                    selectedMessage?.id === msg.id ? "bg-white/5" : ""
                  }`}
                >
                  {msg.status === "unread" && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary" />
                  )}
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-xs text-white truncate max-w-[150px]">
                      {msg.name}
                    </span>
                    <span className="text-[9px] font-mono text-white/30">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-gold/80 font-medium truncate mt-0.5">
                    {msg.subject}
                  </div>
                  <div className="text-[11px] text-white/40 line-clamp-2 mt-1 leading-normal">
                    {msg.message}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Footer */}
          {pageCount > 1 && (
            <div className="p-3 border-t border-white/10 flex justify-between items-center text-[10px] font-sans">
              <span className="text-white/40">Total: {total}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="h-7 text-[10px] px-2.5 border-white/10"
                >
                  Prev
                </Button>
                <span className="py-1 text-white/60">
                  {page} / {pageCount}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === pageCount}
                  onClick={() => setPage(page + 1)}
                  className="h-7 text-[10px] px-2.5 border-white/10"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Detail Pane */}
        <div className="flex-1 bg-[#161616] border border-white/10 rounded-sm flex flex-col overflow-hidden">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Message Header */}
              <div className="p-5 border-b border-white/10 flex justify-between items-start">
                <div className="space-y-1 min-w-0">
                  <h3 className="text-base font-semibold text-white truncate">
                    {selectedMessage.subject}
                  </h3>
                  <div className="text-xs text-white/50 flex flex-wrap gap-x-3 gap-y-1">
                    <span>
                      From:{" "}
                      <span className="text-white/80 font-medium">{selectedMessage.name}</span> (
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
                    <div className="text-[10px] text-white/30 flex items-center gap-1 font-mono">
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
                      className="border-white/10 h-8 gap-1.5 text-xs text-white/60 hover:text-white"
                      onClick={() => handleUpdateStatus(selectedMessage.id, "archived")}
                    >
                      <Archive className="size-3.5" /> Archive
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 h-8 gap-1.5 text-xs text-white/60 hover:text-white"
                      onClick={() => handleUpdateStatus(selectedMessage.id, "read")}
                    >
                      <Inbox className="size-3.5" /> Unarchive
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 text-xs text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(selectedMessage.id)}
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </div>
              </div>

              {/* Message Body & Responses */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Original Message */}
                <div className="space-y-2">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/30 block">
                    Message
                  </span>
                  <div className="bg-black/30 border border-white/5 rounded-sm p-4 text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Reply display */}
                {selectedMessage.replyContent ? (
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-400/70 flex items-center gap-1">
                      <Check className="size-3.5" /> Replied on{" "}
                      {selectedMessage.repliedAt
                        ? new Date(selectedMessage.repliedAt).toLocaleString()
                        : ""}
                    </span>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-sm p-4 text-sm text-emerald-200/90 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.replyContent}
                    </div>
                  </div>
                ) : (
                  /* Reply Form */
                  <form
                    onSubmit={handleSendReply}
                    className="space-y-4 border-t border-white/5 pt-4"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor="reply-text"
                        className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/30 block"
                      >
                        Write Reply Email
                      </label>
                      <Textarea
                        id="reply-text"
                        rows={6}
                        placeholder="Type your reply here. This will be sent as an email to the sender..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                        className="bg-black/30 border-white/10 text-sm leading-relaxed text-white"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={submittingReply || !replyText.trim()}
                        className="bg-primary hover:bg-primary/95 text-white gap-2 text-xs font-semibold px-4 py-2 rounded-sm"
                      >
                        <Reply className="size-3.5" />
                        {submittingReply ? "Sending..." : "Send Reply Email"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-xs text-white/30 p-8">
              <MessageSquare className="size-12 text-white/10 mb-2" />
              Select a message from the list to view and reply.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
