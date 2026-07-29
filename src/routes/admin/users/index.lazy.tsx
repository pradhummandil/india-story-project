import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, User, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Input } from "@/components/ui/input";

export const Route = createLazyFileRoute("/admin/users/")({
  component: AdminUsersPage,
});

const ROLES = ["admin", "editor", "author", "user"] as const;
type RoleType = (typeof ROLES)[number];
type UserRow = {
  id: string;
  email: string;
  name?: string;
  role: RoleType;
  active: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const loadUsers = () => {
    if (!user || !session) return;
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      ...(debouncedQuery ? { query: debouncedQuery } : {}),
    });

    fetch(`/api/admin/users?${params}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((r) => r.json())
      .then((d: any) => {
        setUsers(d.users ?? []);
        setTotal(d.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [user, session, page, debouncedQuery]);

  const handleRoleChange = async (id: string, role: RoleType) => {
    if (!session) return;
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ role }),
    });
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, role } : u)));
  };
  const handleToggleActive = async (id: string, active: boolean) => {
    if (!session) return;
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ active: !active }),
    });
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, active: !active } : u)));
  };

  return (
    <AdminLayout title="Users" subtitle={`${total} registered users`}>
      <div className="max-w-5xl">
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="users-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email or name…"
              className="pl-10 h-10 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground font-sans text-sm"
            />
          </div>
        </div>
        <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
                {["User", "Role", "Status", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-sans"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground font-sans">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted/60 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-muted-foreground font-sans text-xs"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{u.name || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground font-sans">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => void handleRoleChange(u.id, e.target.value as RoleType)}
                        className="bg-background border border-border text-foreground font-sans text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-primary capitalize font-medium"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void handleToggleActive(u.id, u.active)}
                        className={`flex items-center gap-1.5 text-xs font-sans font-semibold cursor-pointer ${u.active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                      >
                        {u.active ? (
                          <ToggleRight className="size-4" />
                        ) : (
                          <ToggleLeft className="size-4" />
                        )}
                        {u.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-sans text-xs font-mono">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 font-sans text-xs">
              <span className="text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors font-semibold cursor-pointer"
                >
                  Prev
                </button>
                <span className="text-foreground font-semibold">
                  {page} / {Math.ceil(total / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / PAGE_SIZE)}
                  className="px-3 py-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors font-semibold cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
