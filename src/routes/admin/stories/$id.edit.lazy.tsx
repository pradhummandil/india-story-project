import { createLazyFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeft, Save, Send, Trash2, UploadCloud, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/admin/stories/$id/edit")({
  component: EditStoryPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────
type StoryFull = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  titleHi?: string;
  excerptHi?: string;
  contentHi?: string;
  seoTitle?: string;
  seoDescription?: string;
  readingTime?: number;
  featured: boolean;
  homepageSlideshow: boolean;
  slideshowOrder: number;
  seoPriority: number;
  readingPriority: number;
  pinnedStory: boolean;
  trendingStory: boolean;
  editorsPick: boolean;
  status: string;
  stateId: string;
  authorId: string;
  themeId: string;
  themeIds?: string[];
  images: Array<{ id: string; imageUrl: string; caption?: string; heroImage: boolean }>;
};
type DropdownOption = { id: string; name: string; slug: string };

// ─── Field wrapper — defined OUTSIDE the page component so it is never
//     re-created on render, preventing React from unmounting/remounting inputs ──
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Draft localStorage helpers ───────────────────────────────────────────────
function draftKey(id: string) {
  return `isp-story-draft-${id}`;
}
function saveDraft(id: string, story: StoryFull, coverImageUrl: string | null, additionalImages: string[]) {
  try {
    localStorage.setItem(draftKey(id), JSON.stringify({ story, coverImageUrl, additionalImages, savedAt: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}
function loadDraft(id: string): { story: StoryFull; coverImageUrl: string | null; additionalImages: string[]; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(draftKey(id));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function clearDraft(id: string) {
  try { localStorage.removeItem(draftKey(id)); } catch { /* ignore */ }
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function EditStoryPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();

  // ── Core form state ──────────────────────────────────────────────────────
  const [story, setStory] = useState<StoryFull | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // ── Dropdown data ─────────────────────────────────────────────────────────
  const [states, setStates] = useState<DropdownOption[]>([]);
  const [authors, setAuthors] = useState<DropdownOption[]>([]);
  const [themes, setThemes] = useState<DropdownOption[]>([]);

  // ── Upload refs ───────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  // ── Editor assignment ─────────────────────────────────────────────────────
  const [editors, setEditors] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [assignedEditorId, setAssignedEditorId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  // ── Guard: only fetch ONCE per (id, user) pair ────────────────────────────
  // Using a ref so the fetch doesn't re-run on every render / auth refresh.
  const fetchedRef = useRef<string | null>(null);

  // ── Auth redirect ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  // ── Initial data fetch — guarded so it runs exactly once per story ID ─────
  useEffect(() => {
    if (!initialized || !user) return;
    // Only fetch once per id — prevents auth-store re-renders from re-fetching
    if (fetchedRef.current === id) return;
    fetchedRef.current = id;

    setLoading(true);

    Promise.all([
      fetch(`/api/admin/stories/${id}`, {
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      }).then((r) => r.json()),
      fetch("/api/states").then((r) => r.json()),
      fetch("/api/authors").then((r) => r.json()),
      fetch("/api/themes").then((r) => r.json()),
      fetch("/api/admin/editors", {
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      }).then((r) => r.json()).catch(() => ({ editors: [] })),
    ])
      .then(([s, sts, auths, thms, editorRes]) => {
        const fullStory = s as StoryFull;

        setStates(sts.states ?? []);
        setAuthors(auths.authors ?? []);
        setThemes(thms.themes ?? []);
        setEditors(editorRes?.editors ?? []);
        setAssignedEditorId((fullStory as any).assignedEditorId ?? null);

        // Check for a saved draft — prefer local edits over DB data
        const draft = loadDraft(id);
        if (draft && draft.story && draft.savedAt > Date.now() - 24 * 60 * 60 * 1000) {
          // Draft exists and is less than 24h old — restore it
          setStory(draft.story);
          setCoverImageUrl(draft.coverImageUrl);
          setAdditionalImages(draft.additionalImages ?? []);
          setHasDraft(true);
        } else {
          // No draft — use DB data as initial state
          const normalized: StoryFull = {
            ...fullStory,
            themeId: fullStory.themeIds?.[0] ?? "",
          };
          setStory(normalized);

          if (fullStory.images && fullStory.images.length > 0) {
            const cover = fullStory.images.find((img) => img.heroImage) ?? fullStory.images[0];
            const others = fullStory.images.filter((img) => !img.heroImage);
            setCoverImageUrl(cover.imageUrl);
            setAdditionalImages(others.map((img) => img.imageUrl));
          }
        }
      })
      .catch((err) => {
        console.error("[EditStory] Fetch error:", err);
        setError("Failed to load story. Please refresh.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user, id]);

  // ── Auto-save draft to localStorage on every story change ─────────────────
  // Debounced 500ms so it doesn't fire on every keystroke
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!story) return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      saveDraft(id, story, coverImageUrl, additionalImages);
    }, 500);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [story, coverImageUrl, additionalImages, id]);

  // ── Field update helpers — stable references via useCallback ─────────────
  const setField = useCallback(<K extends keyof StoryFull>(key: K, value: StoryFull[K]) => {
    setStory((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  // ── Cover image upload ────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      if (data.files?.[0]?.url) {
        setCoverImageUrl(data.files[0].url);
      } else {
        throw new Error("Upload succeeded but no URL was returned.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Gallery upload ────────────────────────────────────────────────────────
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !session) return;
    setGalleryUploading(true);
    setError(null);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      if (data.files?.length > 0) {
        setAdditionalImages((prev) => [...prev, ...data.files.map((f: any) => f.url)]);
      }
      if (data.warnings?.length > 0) {
        setError(`Some files failed: ${data.warnings.join(" | ")}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload images.");
    } finally {
      setGalleryUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  // ── Save / Publish ────────────────────────────────────────────────────────
  const handleSave = async (publish?: boolean) => {
    if (!story) return;
    setSaving(true);
    setError(null);

    const body = {
      ...story,
      status: publish ? "Published" : story.status,
      coverImage: coverImageUrl,
      additionalImages,
      themeIds: story.themeId ? [story.themeId] : [],
    };

    try {
      const res = await fetch(`/api/admin/stories/${id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          Authorization: session ? `Bearer ${session.access_token}` : "",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err: any = await res.json();
        throw new Error(err.error ?? "Save failed.");
      }

      // Clear draft on successful save
      clearDraft(id);
      setHasDraft(false);

      // Notify other tabs / pages
      try {
        new BroadcastChannel("isp-stories-updates").postMessage("update");
      } catch { /* BroadcastChannel not supported in all envs */ }

      toast.success(publish ? "Story published!" : "Draft saved!");
      void navigate({ to: "/admin/stories" });
    } catch (err: any) {
      setError(err.message || "Save failed. Please try again.");
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm("Delete this story permanently?")) return;
    try {
      await fetch(`/api/admin/stories/${id}`, {
        method: "DELETE",
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      clearDraft(id);
      try { new BroadcastChannel("isp-stories-updates").postMessage("update"); } catch { /* ignore */ }
      void navigate({ to: "/admin/stories" });
    } catch (err: any) {
      setError(err.message || "Delete failed.");
    }
  };

  // ─── Discard draft ────────────────────────────────────────────────────────
  const handleDiscardDraft = () => {
    clearDraft(id);
    setHasDraft(false);
    // Reset fetchedRef so we re-fetch from DB
    fetchedRef.current = null;
    setLoading(true);
    setStory(null);
    // Retrigger the fetch effect by bumping a reload flag
    // We do this by simply re-setting fetchedRef and faking a dependency update
    // Force a re-fetch by clearing the guard and re-running
    Promise.all([
      fetch(`/api/admin/stories/${id}`, {
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      }).then((r) => r.json()),
      fetch("/api/states").then((r) => r.json()),
      fetch("/api/authors").then((r) => r.json()),
      fetch("/api/themes").then((r) => r.json()),
    ])
      .then(([s, sts, auths, thms]) => {
        const fullStory = s as StoryFull;
        setStates(sts.states ?? []);
        setAuthors(auths.authors ?? []);
        setThemes(thms.themes ?? []);
        setStory({ ...fullStory, themeId: fullStory.themeIds?.[0] ?? "" });
        if (fullStory.images?.length > 0) {
          const cover = fullStory.images.find((img) => img.heroImage) ?? fullStory.images[0];
          setCoverImageUrl(cover.imageUrl);
          setAdditionalImages(fullStory.images.filter((img) => !img.heroImage).map((img) => img.imageUrl));
        } else {
          setCoverImageUrl(null);
          setAdditionalImages([]);
        }
        fetchedRef.current = id;
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // ─── CSS classes ──────────────────────────────────────────────────────────
  const inputCls =
    "h-10 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground font-sans text-sm px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";
  const textareaCls =
    "w-full rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground font-sans text-sm px-3.5 py-2.5 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";
  const selectCls =
    "h-10 w-full rounded-lg bg-background border border-border text-foreground font-sans text-sm px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading || !story) {
    return (
      <AdminLayout title="Edit Story">
        <div className="flex items-center justify-center h-64 text-muted-foreground font-sans text-xs animate-pulse">
          Loading…
        </div>
      </AdminLayout>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="Edit Story" subtitle={story.title}>
      <div className="max-w-5xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/admin/stories"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-sans transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to Stories
          </Link>
          <div className="flex items-center gap-3">
            <Button
              id="delete-story-btn"
              variant="outline"
              className="h-10 px-4 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 font-sans text-xs uppercase tracking-wider gap-2 bg-transparent"
              onClick={handleDelete}
              disabled={saving}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
            <Button
              id="edit-save-draft-btn"
              variant="outline"
              className="h-10 px-4 rounded-lg border-border text-foreground hover:bg-muted font-sans text-xs uppercase tracking-wider gap-2 bg-card shadow-sm"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              <Save className="size-4" /> {saving ? "Saving…" : "Save Draft"}
            </Button>
            <Button
              id="edit-publish-btn"
              className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-wider gap-2 shadow-sm font-bold"
              onClick={() => void handleSave(true)}
              disabled={saving}
            >
              <Send className="size-4" /> {story.status === "Published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        {/* Draft recovery banner */}
        {hasDraft && (
          <div className="mb-6 flex items-center justify-between bg-amber-500/10 border border-amber-500/30 px-4 py-3 rounded-xl">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-sans font-semibold">
              📝 Unsaved draft restored — your previous edits are shown below.
            </span>
            <button
              onClick={handleDiscardDraft}
              className="text-xs text-amber-600/80 dark:text-amber-400/80 hover:underline font-sans ml-4 font-bold"
            >
              Discard draft and load from database
            </button>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl font-sans flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-destructive hover:opacity-80">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column: content fields ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* English content */}
            <div className="bg-card border border-border/80 rounded-xl p-6 space-y-5 shadow-sm">
              <Field label="Title (English)">
                <Input
                  value={story.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className={inputCls}
                  id="edit-story-title"
                  autoComplete="off"
                />
              </Field>
              <Field label="Slug">
                <Input
                  value={story.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  className={inputCls}
                  id="edit-story-slug"
                  autoComplete="off"
                />
              </Field>
              <Field label="Excerpt (English)">
                <textarea
                  value={story.excerpt}
                  onChange={(e) => setField("excerpt", e.target.value)}
                  rows={3}
                  className={textareaCls}
                  id="edit-story-excerpt"
                />
              </Field>
              <Field label="Content (English)">
                <textarea
                  value={story.content}
                  onChange={(e) => setField("content", e.target.value)}
                  rows={16}
                  className={textareaCls}
                  id="edit-story-content"
                />
              </Field>
            </div>

            {/* Hindi translation */}
            <div className="bg-card border border-border/80 rounded-xl p-6 space-y-5 shadow-sm">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
                Hindi Translation
              </h3>
              <Field label="शीर्षक">
                <Input
                  value={story.titleHi ?? ""}
                  onChange={(e) => setField("titleHi", e.target.value)}
                  className={inputCls}
                  id="edit-title-hi"
                  autoComplete="off"
                />
              </Field>
              <Field label="संक्षेप">
                <textarea
                  value={story.excerptHi ?? ""}
                  onChange={(e) => setField("excerptHi", e.target.value)}
                  rows={3}
                  className={textareaCls}
                  id="edit-excerpt-hi"
                />
              </Field>
              <Field label="सामग्री">
                <textarea
                  value={story.contentHi ?? ""}
                  onChange={(e) => setField("contentHi", e.target.value)}
                  rows={12}
                  className={textareaCls}
                  id="edit-content-hi"
                />
              </Field>
            </div>

            {/* SEO metadata */}
            <div className="bg-card border border-border/80 rounded-xl p-6 space-y-5 shadow-sm">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
                SEO Metadata
              </h3>
              <Field label="SEO Title">
                <Input
                  value={story.seoTitle ?? ""}
                  onChange={(e) => setField("seoTitle", e.target.value)}
                  placeholder="Leave empty to use main title…"
                  className={inputCls}
                  id="edit-seo-title"
                  autoComplete="off"
                />
              </Field>
              <Field label="SEO Description">
                <textarea
                  value={story.seoDescription ?? ""}
                  onChange={(e) => setField("seoDescription", e.target.value)}
                  placeholder="Leave empty to use main excerpt…"
                  rows={3}
                  className={textareaCls}
                  id="edit-seo-desc"
                />
              </Field>
            </div>
          </div>

          {/* ── Right column: sidebar ── */}
          <div className="space-y-6">
            {/* Story details */}
            <div className="bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
                Story Details
              </h3>
              <Field label="Status">
                <select
                  value={story.status}
                  onChange={(e) => setField("status", e.target.value)}
                  className={selectCls}
                  id="edit-status"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </Field>
              <Field label="Author">
                <select
                  value={story.authorId}
                  onChange={(e) => setField("authorId", e.target.value)}
                  className={selectCls}
                  id="edit-author"
                >
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="State">
                <select
                  value={story.stateId}
                  onChange={(e) => setField("stateId", e.target.value)}
                  className={selectCls}
                  id="edit-state"
                >
                  {states.map((s2) => (
                    <option key={s2.id} value={s2.id}>
                      {s2.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Theme">
                <select
                  value={story.themeId}
                  onChange={(e) => setField("themeId", e.target.value)}
                  className={selectCls}
                  id="edit-theme"
                >
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Toggle options */}
            <div className="bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
                Options
              </h3>
              {(
                [
                  { label: "Featured Story", key: "featured" },
                  { label: "Homepage Slideshow", key: "homepageSlideshow" },
                  { label: "Pinned Story", key: "pinnedStory" },
                  { label: "Trending Story", key: "trendingStory" },
                  { label: "Editor's Pick", key: "editorsPick" },
                ] as const
              ).map(({ label, key }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-sans text-foreground font-medium">{label}</span>
                  <button
                    id={`edit-${key}`}
                    type="button"
                    onClick={() => setField(key, !story[key] as any)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${story[key] ? "bg-primary" : "bg-muted-foreground/30"}`}
                  >
                    <span
                      className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${story[key] ? "left-5" : "left-0.5"}`}
                    />
                  </button>
                </label>
              ))}

              {story.homepageSlideshow && (
                <Field label="Slideshow Order">
                  <Input
                    type="number"
                    value={story.slideshowOrder}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setField("slideshowOrder", isNaN(val) ? 0 : val);
                    }}
                    className={inputCls}
                    id="edit-slideshow-order"
                  />
                </Field>
              )}

              <Field label="SEO Priority (0.0 – 1.0)">
                <Input
                  type="number"
                  step="0.1"
                  value={story.seoPriority ?? 0.5}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setField("seoPriority", isNaN(val) ? 0.5 : val);
                  }}
                  className={inputCls}
                  id="edit-seo-priority"
                />
              </Field>

              <Field label="Reading Priority (Integer)">
                <Input
                  type="number"
                  value={story.readingPriority ?? 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setField("readingPriority", isNaN(val) ? 0 : val);
                  }}
                  className={inputCls}
                  id="edit-reading-priority"
                />
              </Field>
            </div>

            {/* Cover image */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-5 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                Cover Image
              </h3>
              {coverImageUrl ? (
                <div className="relative group">
                  <img
                    src={coverImageUrl}
                    alt="Cover"
                    className="w-full aspect-video object-cover border border-white/10 rounded-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-black text-white hover:text-red-400 transition-colors"
                    title="Remove Image"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video border-2 border-dashed border-white/10 hover:border-primary/50 rounded-sm flex flex-col items-center justify-center cursor-pointer transition-colors"
                >
                  <UploadCloud className="size-8 text-white/20 mb-2" />
                  <span className="text-xs text-white/40 font-sans">
                    {uploading ? "Uploading cover..." : "Click to upload cover image"}
                  </span>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/40 font-sans">
                  Or paste a direct URL
                </label>
                <Input
                  value={coverImageUrl ?? ""}
                  onChange={(e) => setCoverImageUrl(e.target.value || null)}
                  placeholder="https://example.com/image.jpg"
                  className="h-9 bg-black/20 border-white/10 text-white text-xs font-sans"
                />
              </div>
            </div>

            {/* Gallery images */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-5 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                Additional Images Gallery
              </h3>
              {additionalImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {additionalImages.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="relative group aspect-video">
                      <img
                        src={url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover border border-white/10 rounded-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setAdditionalImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 hover:bg-black text-white hover:text-red-400 transition-colors"
                        title="Delete Image"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-white/10 hover:border-primary/50 rounded-sm flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <UploadCloud className="size-6 text-white/20 mb-1" />
                <span className="text-[10px] text-white/40 font-sans uppercase font-bold tracking-wider">
                  {galleryUploading ? "Uploading files..." : "Upload Multiple Images"}
                </span>
              </div>
              <input ref={galleryInputRef} type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
            </div>

            {/* ── Assign Editor ── */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                  Assign Editor
                </h3>
                <Link
                  to="/admin/stories/$id/revisions"
                  params={{ id }}
                  className="text-[10px] text-primary/70 hover:text-primary font-sans uppercase tracking-wider font-bold transition-colors"
                >
                  View Revisions →
                </Link>
              </div>
              <Field label="Editor">
                <select
                  value={assignedEditorId ?? ""}
                  onChange={(e) => setAssignedEditorId(e.target.value || null)}
                  className={selectCls}
                  id="edit-assign-editor"
                >
                  <option value="">— Unassigned —</option>
                  {editors.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name || e.email}
                    </option>
                  ))}
                </select>
              </Field>
              <Button
                id="assign-editor-btn"
                type="button"
                disabled={assigning}
                onClick={async () => {
                  setAssigning(true);
                  try {
                    const res = await fetch(`/api/admin/stories/assign/${id}`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: session ? `Bearer ${session.access_token}` : "",
                      },
                      body: JSON.stringify({ editorId: assignedEditorId }),
                    });
                    if (res.ok) {
                      toast.success(assignedEditorId ? "Editor assigned — they have been notified." : "Assignment removed.");
                    } else {
                      const d = await res.json();
                      toast.error(d.error || "Assignment failed.");
                    }
                  } catch {
                    toast.error("Assignment failed. Check your connection.");
                  } finally {
                    setAssigning(false);
                  }
                }}
                className="w-full h-9 rounded-sm bg-white/5 hover:bg-white/10 border border-white/20 text-white/70 hover:text-white font-sans text-xs uppercase tracking-widest transition-colors"
              >
                {assigning ? "Assigning…" : assignedEditorId ? "Assign & Notify Editor" : "Remove Assignment"}
              </Button>
              {editors.length === 0 && (
                <p className="text-[10px] text-white/30 font-sans">
                  No editors found. Promote a user to Editor role in User Management.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
