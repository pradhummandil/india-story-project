import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Edit, Trash2, User } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createLazyFileRoute("/admin/authors/")({
  component: AdminAuthorsPage,
});

type Author = { id: string; name: string; bio?: string; avatar?: string };

export default function AdminAuthorsPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);
  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/authors")
      .then((r) => r.json())
      .then((d: any) => setAuthors(d.authors ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleEdit = (a: Author) => {
    setEditId(a.id);
    setName(a.name);
    setBio(a.bio ?? "");
    setAvatar(a.avatar ?? "");
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const body = { name, bio: bio || null, avatar: avatar || null };
    const url = editId ? `/api/admin/authors/${editId}` : "/api/admin/authors";
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err: any = await res.json();
      setError(err.error ?? "Failed");
      return;
    }
    const updated: any = await res.json();
    if (editId) setAuthors((p) => p.map((a) => (a.id === editId ? updated.author : a)));
    else setAuthors((p) => [...p, updated.author]);
    setName("");
    setBio("");
    setAvatar("");
    setEditId(null);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this author?")) return;
    await fetch(`/api/admin/authors/${id}`, { method: "DELETE" });
    setAuthors((p) => p.filter((a) => a.id !== id));
  };

  const inputCls = "h-10 rounded-lg bg-background border border-border text-foreground font-sans text-sm px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";
  return (
    <AdminLayout title="Authors" subtitle="Manage story authors">
      <div className="max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border/60">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
                All Authors
              </h3>
            </div>
            {loading ? (
              <div className="p-8 text-muted-foreground text-xs font-sans text-center">Loading…</div>
            ) : (
              <div className="divide-y divide-border/40">
                {authors.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 group"
                  >
                    <div className="flex items-center gap-3">
                      {a.avatar ? (
                        <img
                          src={a.avatar}
                          alt={a.name}
                          className="size-8 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <User className="size-4 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold font-sans text-foreground">{a.name}</p>
                        {a.bio && (
                          <p className="text-xs text-muted-foreground font-sans truncate max-w-[200px]">
                            {a.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(a)}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(a.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground mb-6">
              {editId ? "Edit Author" : "New Author"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Name
                </label>
                <Input
                  id="author-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Bio
                </label>
                <textarea
                  id="author-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg bg-background border border-border text-foreground font-sans text-sm px-3 py-2 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Avatar URL
                </label>
                <Input
                  id="author-avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://…"
                  className={inputCls}
                />
              </div>
              {avatar && (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="size-16 rounded-full object-cover border border-border"
                />
              )}
              {error && <p className="text-xs text-red-500 font-sans">{error}</p>}
              <div className="flex gap-2 pt-2">
                {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-1/2 rounded-lg border-border text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setEditId(null);
                      setName("");
                      setBio("");
                      setAvatar("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className={`rounded-lg bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-wider font-bold shadow-sm ${editId ? "w-1/2" : "w-full"}`}
                >
                  {editId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
