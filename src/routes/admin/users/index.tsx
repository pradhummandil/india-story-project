import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, User, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/users/")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
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

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);
  useEffect(() => {
    if (!user || !session) return;
    fetch("/api/admin/users", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((r) => r.json())
      .then((d: any) => setUsers(d.users ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, session]);

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

  const filtered = users.filter(
    (u) =>
      !query ||
      u.email.includes(query) ||
      (u.name ?? "").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AdminLayout title="Users" subtitle={`${users.length} registered users`}>
      <div className="max-w-5xl">
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <Input
              id="users-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email or name…"
              className="pl-10 h-10 rounded-sm bg-white/5 border-white/10 text-white/80 placeholder:text-white/20 font-sans text-sm"
            />
          </div>
        </div>
        <div className="bg-[#161616] border border-white/10 rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["User", "Role", "Status", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-white/30"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-white/20 font-sans text-xs"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="size-4 text-primary/60" />
                        </div>
                        <div>
                          <p className="text-sm font-sans text-white/80">{u.name || "Anonymous"}</p>
                          <p className="text-xs text-white/30 font-sans">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => void handleRoleChange(u.id, e.target.value as RoleType)}
                        className="bg-[#0F0F0F] border border-white/10 text-white/70 font-sans text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-primary/50"
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
                        className={`flex items-center gap-1.5 text-xs font-sans font-semibold ${u.active ? "text-emerald-400" : "text-white/30"}`}
                      >
                        {u.active ? (
                          <ToggleRight className="size-4" />
                        ) : (
                          <ToggleLeft className="size-4" />
                        )}
                        {u.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-white/30 font-sans text-xs">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
