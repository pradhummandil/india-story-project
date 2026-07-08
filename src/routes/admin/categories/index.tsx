import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Edit, Trash2, FolderOpen } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/categories/")({
  head: () => ({ meta: [{ title: "Categories — Admin" }] }),
  component: AdminCategoriesPage,
});

type Category = { id: string; name: string; slug: string };

export default function AdminCategoriesPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [cats, setCats] = useState<Category[]>([]);
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
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d: any) => setCats(d.categories ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const slugify = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-");
  const handleEdit = (c: Category) => {
    setEditId(c.id);
    setName(c.name);
    setSlug(c.slug);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const body = { name, slug: slug || slugify(name) };
    const url = editId ? `/api/admin/categories/${editId}` : "/api/admin/categories";
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
    if (editId) setCats((p) => p.map((c) => (c.id === editId ? updated.category : c)));
    else setCats((p) => [...p, updated.category]);
    setName("");
    setSlug("");
    setEditId(null);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setCats((p) => p.filter((c) => c.id !== id));
  };

  const inputCls = "h-10 rounded-sm bg-white/5 border-white/10 text-white/80 font-sans text-sm";
  return (
    <AdminLayout title="Categories" subtitle="Manage story categories">
      <div className="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#161616] border border-white/10 rounded-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                All Categories
              </h3>
            </div>
            {loading ? (
              <div className="p-8 text-white/20 text-xs font-sans text-center">Loading…</div>
            ) : (
              <div className="divide-y divide-white/5">
                {cats.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-white/3 group"
                  >
                    <div>
                      <p className="text-sm font-sans text-white/80">{c.name}</p>
                      <p className="text-xs font-mono text-white/30">{c.slug}</p>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-white/30 hover:text-primary transition-colors"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(c.id)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-[#161616] border border-white/10 rounded-sm p-6">
            <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
              <FolderOpen className="size-3.5" />
              {editId ? "Edit Category" : "New Category"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-2">
                  Name
                </label>
                <Input
                  id="cat-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editId) setSlug(slugify(e.target.value));
                  }}
                  placeholder="Category name"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-2">
                  Slug
                </label>
                <Input
                  id="cat-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="category-slug"
                  className={`${inputCls} font-mono`}
                />
              </div>
              {error && <p className="text-xs text-red-400 font-sans">{error}</p>}
              <div className="flex gap-2">
                <Button
                  id="cat-submit-btn"
                  type="submit"
                  className="flex-1 h-10 rounded-sm bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest"
                >
                  {editId ? "Update" : "Create"}
                </Button>
                {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-3 rounded-sm border-white/10 text-white/40 hover:text-white bg-transparent font-sans text-xs"
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
