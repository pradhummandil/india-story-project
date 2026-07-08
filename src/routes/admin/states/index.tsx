import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Edit, Trash2, MapPin } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/states/")({
  head: () => ({ meta: [{ title: "States — Admin" }] }),
  component: AdminStatesPage,
});

type State = { id: string; name: string; slug: string; latitude?: number; longitude?: number };

export default function AdminStatesPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);
  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/states")
      .then((r) => r.json())
      .then((d: any) => setStates(d.states ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const slugify = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-");
  const handleEdit = (s: State) => {
    setEditId(s.id);
    setName(s.name);
    setSlug(s.slug);
    setLat(String(s.latitude ?? ""));
    setLng(String(s.longitude ?? ""));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const body = {
      name,
      slug: slug || slugify(name),
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
    };
    const url = editId ? `/api/admin/states/${editId}` : "/api/admin/states";
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
    if (editId) setStates((p) => p.map((s2) => (s2.id === editId ? updated.state : s2)));
    else setStates((p) => [...p, updated.state]);
    setName("");
    setSlug("");
    setLat("");
    setLng("");
    setEditId(null);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this state?")) return;
    await fetch(`/api/admin/states/${id}`, { method: "DELETE" });
    setStates((p) => p.filter((s) => s.id !== id));
  };

  const inputCls = "h-10 rounded-sm bg-white/5 border-white/10 text-white/80 font-sans text-sm";
  return (
    <AdminLayout title="States" subtitle="Manage Indian states and regions">
      <div className="max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#161616] border border-white/10 rounded-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                All States
              </h3>
            </div>
            {loading ? (
              <div className="p-8 text-white/20 text-xs font-sans text-center">Loading…</div>
            ) : (
              <div className="divide-y divide-white/5">
                {states.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-white/3 group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="size-4 text-white/20" />
                      <div>
                        <p className="text-sm font-sans text-white/80">{s.name}</p>
                        <p className="text-xs font-mono text-white/30">
                          {s.slug} {s.latitude ? `(${s.latitude}, ${s.longitude})` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(s)}
                        className="text-white/30 hover:text-primary transition-colors"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(s.id)}
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
            <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-6">
              {editId ? "Edit State" : "New State"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(
                [
                  { label: "Name", v: name, sv: setName, id: "state-name", type: "text" },
                  { label: "Slug", v: slug, sv: setSlug, id: "state-slug", type: "text" },
                  { label: "Latitude", v: lat, sv: setLat, id: "state-lat", type: "number" },
                  { label: "Longitude", v: lng, sv: setLng, id: "state-lng", type: "number" },
                ] as const
              ).map((f) => (
                <div key={f.id}>
                  <label className="block text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-2">
                    {f.label}
                  </label>
                  <Input
                    id={f.id}
                    type={f.type}
                    value={f.v}
                    onChange={(e) => (f.sv as (v: string) => void)(e.target.value)}
                    className={inputCls}
                  />
                </div>
              ))}
              {error && <p className="text-xs text-red-400 font-sans">{error}</p>}
              <div className="flex gap-2">
                <Button
                  id="state-submit-btn"
                  type="submit"
                  className="flex-1 h-10 rounded-sm bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest"
                >
                  {editId ? "Update" : "Create"}
                </Button>
                {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-3 rounded-sm border-white/10 text-white/40 bg-transparent font-sans text-xs"
                    onClick={() => {
                      setEditId(null);
                      setName("");
                      setSlug("");
                      setLat("");
                      setLng("");
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
