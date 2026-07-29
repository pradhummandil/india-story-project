import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Plus, Lock, CheckCircle, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createLazyFileRoute("/admin/achievements")({
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
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
              Achievements & Badges
            </h1>
            <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider mt-1 font-bold">
              Manage reader badges and view user earnings stats
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-wider rounded-lg gap-2 shadow-sm font-semibold"
          >
            <Plus className="size-4" /> Create Badge
          </Button>
        </div>

        {/* Create Badge Form Panel */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border/80 rounded-xl p-6 max-w-lg space-y-4 shadow-sm"
          >
            <h3 className="font-display text-base font-bold text-foreground mb-2">
              New Badge Specification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Badge Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Explorer, Story Hunter..."
                  className="h-9 bg-background border-border text-foreground rounded-lg"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Icon Emoji</label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="🧭, 🎯, 📚..."
                  className="h-9 bg-background border-border text-foreground rounded-lg"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Criteria explanation for earning this badge..."
                className="w-full h-20 px-3 py-2 bg-background border border-border text-xs font-sans rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Hex Color</label>
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#C8A96A"
                  className="h-9 bg-background border-border text-foreground rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Rarity</label>
                <select
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value)}
                  className="w-full h-9 px-3 bg-background border border-border rounded-lg text-xs font-sans text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="border-border rounded-lg text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold shadow-xs">
                Create
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-28 bg-muted/40 border border-border/40 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.length === 0 ? (
              <div className="col-span-full bg-card border border-border/80 rounded-xl p-8 text-center text-xs text-muted-foreground font-sans shadow-sm">
                No custom achievements configured yet.
              </div>
            ) : (
              badges.map((b) => (
                <div
                  key={b.id}
                  className="bg-card border border-border/80 rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all relative shadow-sm"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-3xl">{b.icon}</span>
                      <span
                        className={`text-[8px] uppercase tracking-wider font-bold font-sans px-2 py-0.5 rounded-full ${
                          b.rarity === "legendary"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : b.rarity === "epic"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : b.rarity === "rare"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : "bg-muted text-muted-foreground border border-border/60"
                        }`}
                      >
                        {b.rarity}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-foreground">{b.name}</h4>
                    <p className="text-xs text-muted-foreground font-sans mt-1.5 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground font-sans font-medium">
                    <span>
                      Slug: <span className="font-mono text-primary font-bold">{b.slug}</span>
                    </span>
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
