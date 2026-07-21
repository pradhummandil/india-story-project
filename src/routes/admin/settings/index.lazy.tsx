import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Settings } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Forbidden403 } from "@/components/site/Forbidden403";

export const Route = createLazyFileRoute("/admin/settings/")({
  component: AdminSettingsPage,
});

type Setting = { key: string; value: string; label?: string };

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const { user, profile, initialized } = useAuthStore();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);
  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d: any) => setSettings(d.settings ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const setValue = (key: string, value: string) =>
    setSettings((p) => p.map((s) => (s.key === key ? { ...s, value } : s)));
  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const role = profile?.role?.toLowerCase() || user?.app_metadata?.role?.toLowerCase();

  if (role !== "superadmin") {
    return <Forbidden403 />;
  }

  return (
    <AdminLayout title="Settings" subtitle="Site configuration">
      <div className="max-w-2xl">
        <div className="bg-[#161616] border border-white/10 rounded-sm p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="size-4 text-white/40" />
            <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
              Site Settings
            </h3>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : settings.length === 0 ? (
            <p className="text-white/20 text-sm font-sans">
              No settings configured yet. Settings will appear here once added through the database.
            </p>
          ) : (
            settings.map((s) => (
              <div key={s.key}>
                <label className="block text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-2">
                  {s.label ?? s.key}
                </label>
                <Input
                  id={`setting-${s.key}`}
                  value={s.value}
                  onChange={(e) => setValue(s.key, e.target.value)}
                  className="h-10 rounded-sm bg-white/5 border-white/10 text-white/80 font-sans text-sm"
                />
              </div>
            ))
          )}

          {saved && (
            <p className="text-xs text-emerald-400 font-sans bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
              ✓ Settings saved successfully.
            </p>
          )}

          <Button
            id="settings-save-btn"
            onClick={handleSave}
            disabled={saving || loading}
            className="h-10 px-6 rounded-sm bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest gap-2"
          >
            <Save className="size-4" /> {saving ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
