import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Download, CheckCircle, XCircle, Mail, AlertTriangle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/newsletter")({
  head: () => ({ meta: [{ title: "Newsletter Subscribers — Admin" }] }),
  component: AdminNewsletterPage,
});

type Subscriber = {
  id: string;
  email: string;
  verified: boolean;
  status: string;
  language: string;
  createdAt: string;
};

export default function AdminNewsletterPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchSubscribers = async () => {
    if (!session) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(
        `/api/admin/newsletter?status=${statusFilter}&query=${encodeURIComponent(
          searchQuery
        )}&page=${page}&pageSize=15`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch subscribers");
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setTotal(data.total || 0);
      setPageCount(data.pageCount || 1);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while loading subscribers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubscribers();
    }
  }, [user, statusFilter, page]);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (user) {
        setPage(1);
        fetchSubscribers();
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleDelete = async (id: string, email: string) => {
    if (!session) return;
    if (!window.confirm(`Are you sure you want to permanently delete subscriber: ${email}?`)) return;

    try {
      setErrorMsg(null);
      const res = await fetch(`/api/admin/newsletter?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete subscriber");

      setSuccessMsg("Subscriber deleted successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchSubscribers();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete subscriber");
    }
  };

  const handleExportCSV = async () => {
    if (!session) return;
    try {
      setErrorMsg(null);
      const res = await fetch(
        `/api/admin/newsletter?status=${statusFilter}&query=${encodeURIComponent(
          searchQuery
        )}&export=true`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newsletter_subscribers_${statusFilter}_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMsg("CSV exported successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to export CSV");
    }
  };

  return (
    <AdminLayout title="Newsletter Subscribers" subtitle="Monitor and manage all mailing list subscriptions.">
      <div className="space-y-6 max-w-6xl">
        {/* Alerts */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-sm font-sans flex items-center gap-2"
            >
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-sm text-sm font-sans flex items-center gap-2"
            >
              <CheckCircle className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161616] border border-white/10 p-5 rounded-sm">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 size-4 text-white/30" />
              <Input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-black/40 border-white/10 text-xs font-sans placeholder:text-white/30"
              />
            </div>
            <div className="flex gap-2">
              {["all", "verified", "pending", "unsubscribed"].map((status) => (
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

          <Button
            onClick={handleExportCSV}
            className="bg-primary hover:bg-primary/95 text-white gap-2 text-xs font-semibold px-4 h-9 self-start md:self-auto"
          >
            <Download className="size-3.5" /> Export to CSV
          </Button>
        </div>

        {/* Table Area */}
        <div className="bg-[#161616] border border-white/10 rounded-sm overflow-hidden">
          {loading ? (
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-white/40 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-3">Email</th>
                  <th className="p-3">Verified</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5 animate-pulse">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="p-3">
                        <div className="h-4 bg-white/5 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : subscribers.length === 0 ? (
            <div className="p-16 text-center text-xs text-white/30 flex flex-col items-center justify-center gap-2">
              <Mail className="size-8 text-white/10" />
              No subscribers found matching the filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-white/60 uppercase tracking-wider text-[10px]">
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Verified</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Lang</th>
                    <th className="p-4 font-bold">Subscribed Date</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-white">{sub.email}</td>
                      <td className="p-4">
                        {sub.verified ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle className="size-3.5" /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                            <XCircle className="size-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                          sub.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-4 font-semibold uppercase text-white/60">{sub.language}</td>
                      <td className="p-4 font-mono text-white/40">
                        {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.id, sub.email)}
                          className="p-1 text-white/30 hover:text-red-400 transition-colors inline-block"
                          title="Delete Subscriber"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {pageCount > 1 && (
            <div className="p-4 border-t border-white/10 flex justify-between items-center text-[10px] font-sans">
              <span className="text-white/40">Total: {total} subscribers</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="h-8 text-[10px] px-3 border-white/10"
                >
                  Prev
                </Button>
                <span className="py-1.5 text-white/60">
                  {page} / {pageCount}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === pageCount}
                  onClick={() => setPage(page + 1)}
                  className="h-8 text-[10px] px-3 border-white/10"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
