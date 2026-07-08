import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Plus, Lock, CheckCircle, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/achievements")({
  head: () => ({ meta: [{ title: "System Achievements — Admin" }] }),
  component: AdminAchievementsPage,
});

export default function AdminAchievementsPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New badge form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#C8A96A");
  const [rarity, setRarity] = useState("common");

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  const loadData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/achievements", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void loadData();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !name || !description || !icon) return;

    try {
      const res = await fetch("/api/admin/achievements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name, description, icon, color, rarity }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        setIcon("");
        setColor("#C8A96A");
        setRarity("common");
        setShowAddForm(false);
        void loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-wide">Achievements & Badges</h1>
            <p className="text-xs font-sans text-white/50 uppercase tracking-widest mt-1">Manage reader badges and view user earnings stats</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-white font-sans text-xs uppercase tracking-wider rounded-sm gap-2"
          >
            <Plus className="size-4" /> Create Badge
          </Button>
        </div>

        {/* Create Badge Form Panel */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-[#161616] border border-white/10 rounded p-6 max-w-lg space-y-4">
            <h3 className="font-display text-base font-bold text-white mb-2">New Badge Specification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/40">Badge Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Explorer, Story Hunter..." className="h-9 bg-black/40 border-white/10 text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/40">Icon Emoji</label>
                <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🧭, 🎯, 📚..." className="h-9 bg-black/40 border-white/10 text-white" required />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Criteria explanation for earning this badge..."
                className="w-full h-20 px-3 py-2 bg-black/40 border border-white/10 text-xs font-sans rounded text-white focus:outline-none focus:border-primary/50"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/40">Hex Color</label>
                <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#C8A96A" className="h-9 bg-black/40 border-white/10 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/40">Rarity</label>
                <select
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value)}
                  className="w-full h-9 px-3 bg-black/40 border border-white/10 rounded text-xs font-sans text-white focus:outline-none"
                >
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)} className="border-white/10 rounded-sm">Cancel</Button>
              <Button type="submit" size="sm" className="bg-primary text-white rounded-sm">Create</Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-[#161616] border border-white/5 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.length === 0 ? (
              <div className="col-span-full bg-[#161616] border border-white/10 rounded p-8 text-center text-sm text-white/40 font-sans">
                No custom achievements configured yet.
              </div>
            ) : (
              badges.map((b) => (
                <div key={b.id} className="bg-[#161616] border border-white/10 rounded-lg p-5 flex flex-col justify-between hover:border-gold/30 transition-all relative">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-3xl">{b.icon}</span>
                      <span className={`text-[8px] uppercase tracking-widest font-bold font-sans px-2 py-0.5 rounded ${
                        b.rarity === "legendary"
                          ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                          : b.rarity === "epic"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : b.rarity === "rare"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-white/5 text-white/40 border border-white/10"
                      }`}>
                        {b.rarity}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-white">{b.name}</h4>
                    <p className="text-xs text-white/50 font-sans mt-1.5 leading-relaxed">{b.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                    <span>Slug: <span className="font-mono text-gold">{b.slug}</span></span>
                    <span className="flex items-center gap-1 font-sans">
                      <CheckCircle className="size-3.5 text-emerald-500" /> {b.userCount} earned
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
