import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Edit, Trash2, Compass } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/themes/")({
  head: () => ({ meta: [{ title: "Themes CMS — Admin" }] }),
  component: AdminThemesPage,
});

type Theme = {
  id: string;
  name: string;
  slug: string;
  _count?: { stories: number };
};

export default function AdminThemesPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/themes")
      .then((r) => r.json())
      .then((d: any) => setThemes(d.themes ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const slugify = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-");

  const handleEdit = (t: Theme) => {
    setEditId(t.id);
    setName(t.name);
    setSlug(t.slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const body = {
      name,
      slug: slug || slugify(name),
    };

    const url = editId ? `/api/admin/themes/${editId}` : "/api/admin/themes";
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err: any = await res.json();
      setError(err.error ?? "Failed to save theme");
      return;
    }

    const updated: any = await res.json();
    if (editId) {
      setThemes((p) => p.map((t) => (t.id === editId ? updated.theme : t)));
    } else {
      setThemes((p) => [...p, updated.theme]);
    }

    setName("");
    setSlug("");
    setEditId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this theme? All associated story links will be removed.")) return;
    const res = await fetch(`/api/admin/themes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setThemes((p) => p.filter((t) => t.id !== id));
    } else {
      alert("Failed to delete theme.");
    }
  };

  const inputCls = "h-10 rounded-sm bg-white/5 border-white/10 text-white/80 font-sans text-sm focus-visible:ring-primary/40";

  return (
    <AdminLayout title="Themes CMS" subtitle="Manage story themes and categories">
      <div className="max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="md:col-span-2 bg-[#161616] border border-white/10 rounded-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                All Themes
              </h3>
            </div>
            {loading ? (
              <div className="p-8 text-white/20 text-xs font-sans text-center">Loading…</div>
            ) : (
              <div className="divide-y divide-white/5">
                {themes.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-white/3 group"
                  >
                    <div className="flex items-center gap-3">
                      <Compass className="size-4 text-white/20" />
                      <div>
                        <p className="text-sm font-sans text-white/80">{t.name}</p>
                        <p className="text-xs font-mono text-white/30">
                          {t.slug} ({t._count?.stories ?? 0} stories)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-white/30 hover:text-primary transition-colors cursor-pointer"
                        title="Edit Theme"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(t.id)}
                        className="text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Theme"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          <div className="bg-[#161616] border border-white/10 rounded-sm p-6">
            <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-6">
              {editId ? "Edit Theme" : "New Theme"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-2">
                  Name
                </label>
                <Input
                  id="theme-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-2">
                  Slug
                </label>
                <Input
                  id="theme-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={slugify(name)}
                  className={inputCls}
                />
              </div>

              {error && <p className="text-xs text-red-400 font-sans">{error}</p>}

              <div className="flex gap-2 pt-2">
                <Button
                  id="theme-submit-btn"
                  type="submit"
                  className="flex-1 h-10 rounded-sm bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest cursor-pointer"
                >
                  {editId ? "Update" : "Create"}
                </Button>
                {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-3 rounded-sm border-white/10 text-white/40 bg-transparent font-sans text-xs cursor-pointer"
                    onClick={() => {
                      setEditId(null);
                      setName("");
                      setSlug("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
