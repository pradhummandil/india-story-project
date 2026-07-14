import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Save, Send, Trash2, UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/stories/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Story — Admin" }] }),
  component: EditStoryPage,
});

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
  heroOfTheDay: boolean;
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
  images: Array<{ id: string; imageUrl: string; caption?: string; heroImage: boolean }>;
};
type DropdownOption = { id: string; name: string; slug: string };

export default function EditStoryPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();
  const [story, setStory] = useState<StoryFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<DropdownOption[]>([]);
  const [authors, setAuthors] = useState<DropdownOption[]>([]);
  const [themes, setThemes] = useState<DropdownOption[]>([]);

  // Cover image management states
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery images states
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/admin/stories/${id}`).then((r) => r.json()),
      fetch("/api/states").then((r) => r.json()),
      fetch("/api/authors").then((r) => r.json()),
      fetch("/api/themes").then((r) => r.json()),
    ])
      .then(([s, sts, auths, thms]) => {
        const fullStory = s as StoryFull;
        setStory(fullStory);
        setStates(sts.states ?? []);
        setAuthors(auths.authors ?? []);
        setThemes(thms.themes ?? []);

        // Initial cover image & gallery images
        if (fullStory.images && fullStory.images.length > 0) {
          const cover = fullStory.images.find(img => img.heroImage);
          const others = fullStory.images.filter(img => !img.heroImage);
          if (cover) {
            setCoverImageUrl(cover.imageUrl);
          } else {
            setCoverImageUrl(fullStory.images[0].imageUrl);
          }
          setAdditionalImages(others.map(img => img.imageUrl));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, id]);

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
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      if (data.files && data.files.length > 0) {
        setCoverImageUrl(data.files[0].url);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !session) return;

    setGalleryUploading(true);
    setError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      if (data.files && data.files.length > 0) {
        const uploadedUrls = data.files.map((f: any) => f.url);
        setAdditionalImages((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleSave = async (publish?: boolean) => {
    if (!story) return;
    setSaving(true);
    setError(null);

    // Send coverImage in body payload to upsert/delete on server side
    const body = {
      ...story,
      status: publish ? "Published" : story.status,
      coverImage: coverImageUrl, // Will be string URL or null (if deleted)
      additionalImages,
    };

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
      setError(err.error ?? "Save failed.");
      setSaving(false);
      return;
    }
    new BroadcastChannel("isp-stories-updates").postMessage("update");
    void navigate({ to: "/admin/stories" });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this story permanently?")) return;
    await fetch(`/api/admin/stories/${id}`, {
      method: "DELETE",
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
    });
    new BroadcastChannel("isp-stories-updates").postMessage("update");
    void navigate({ to: "/admin/stories" });
  };

  if (loading || !story) {
    return (
      <AdminLayout title="Edit Story">
        <div className="flex items-center justify-center h-64 text-white/20 font-sans text-xs animate-pulse">
          Loading…
        </div>
      </AdminLayout>
    );
  }

  const inputCls =
    "h-10 rounded-sm bg-white/5 border-white/10 text-white/80 placeholder:text-white/20 font-sans text-sm focus:border-primary/50";
  const textareaCls =
    "w-full rounded-sm bg-white/5 border border-white/10 text-white/80 placeholder:text-white/20 font-sans text-sm px-3 py-2 resize-none focus:outline-none focus:border-primary/50 transition-colors";
  const selectCls =
    "h-10 w-full rounded-sm bg-[#0F0F0F] border border-white/10 text-white/80 font-sans text-sm px-3 focus:outline-none focus:border-primary/50 transition-colors";
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-2">
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <AdminLayout title="Edit Story" subtitle={story.title}>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/admin/stories"
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-sans transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to Stories
          </Link>
          <div className="flex items-center gap-3">
            <Button
              id="delete-story-btn"
              variant="outline"
              className="h-10 px-4 rounded-sm border-red-500/20 text-red-400 hover:bg-red-500/10 font-sans text-xs uppercase tracking-widest gap-2 bg-transparent"
              onClick={handleDelete}
              disabled={saving}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
            <Button
              id="edit-save-draft-btn"
              variant="outline"
              className="h-10 px-4 rounded-sm border-white/20 text-white/60 hover:text-white font-sans text-xs uppercase tracking-widest gap-2 bg-transparent"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              <Save className="size-4" /> Save Draft
            </Button>
            <Button
              id="edit-publish-btn"
              className="h-10 px-4 rounded-sm bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest gap-2"
              onClick={() => void handleSave(true)}
              disabled={saving}
            >
              <Send className="size-4" /> {story.status === "Published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
        {error && (
          <div className="mb-6 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-sm font-sans">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#161616] border border-white/10 rounded-sm p-6 space-y-5">
              <Field label="Title (English)">
                <Input
                  value={story.title}
                  onChange={(e) => setStory((s) => s && { ...s, title: e.target.value })}
                  className={inputCls}
                  id="edit-story-title"
                />
              </Field>
              <Field label="Slug">
                <Input
                  value={story.slug}
                  onChange={(e) => setStory((s) => s && { ...s, slug: e.target.value })}
                  className={inputCls}
                  id="edit-story-slug"
                />
              </Field>
              <Field label="Excerpt (English)">
                <textarea
                  value={story.excerpt}
                  onChange={(e) => setStory((s) => s && { ...s, excerpt: e.target.value })}
                  rows={3}
                  className={textareaCls}
                  id="edit-story-excerpt"
                />
              </Field>
              <Field label="Content (English)">
                <textarea
                  value={story.content}
                  onChange={(e) => setStory((s) => s && { ...s, content: e.target.value })}
                  rows={16}
                  className={textareaCls}
                  id="edit-story-content"
                />
              </Field>
            </div>
            <div className="bg-[#161616] border border-white/10 rounded-sm p-6 space-y-5">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                Hindi Translation
              </h3>
              <Field label="शीर्षक">
                <Input
                  value={story.titleHi ?? ""}
                  onChange={(e) => setStory((s) => s && { ...s, titleHi: e.target.value })}
                  className={inputCls}
                  id="edit-title-hi"
                />
              </Field>
              <Field label="संक्षेप">
                <textarea
                  value={story.excerptHi ?? ""}
                  onChange={(e) => setStory((s) => s && { ...s, excerptHi: e.target.value })}
                  rows={3}
                  className={textareaCls}
                  id="edit-excerpt-hi"
                />
              </Field>
              <Field label="सामग्री">
                <textarea
                  value={story.contentHi ?? ""}
                  onChange={(e) => setStory((s) => s && { ...s, contentHi: e.target.value })}
                  rows={12}
                  className={textareaCls}
                  id="edit-content-hi"
                />
              </Field>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-[#161616] border border-white/10 rounded-sm p-5 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                Story Details
              </h3>
              <Field label="Author">
                <select
                  value={story.authorId}
                  onChange={(e) => setStory((s) => s && { ...s, authorId: e.target.value })}
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
                  onChange={(e) => setStory((s) => s && { ...s, stateId: e.target.value })}
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
                  onChange={(e) => setStory((s) => s && { ...s, themeId: e.target.value })}
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
            <div className="bg-[#161616] border border-white/10 rounded-sm p-5 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                Options
              </h3>
              {(
                [
                  { label: "Featured Story", key: "featured" },
                  { label: "Hero of the Day", key: "heroOfTheDay" },
                  { label: "Homepage Slideshow", key: "homepageSlideshow" },
                  { label: "Pinned Story", key: "pinnedStory" },
                  { label: "Trending Story", key: "trendingStory" },
                  { label: "Editor's Pick", key: "editorsPick" },
                ] as const
              ).map(({ label, key }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-sans text-white/60">{label}</span>
                  <button
                    id={`edit-${key}`}
                    type="button"
                    onClick={() => setStory((s) => s && { ...s, [key]: !s[key] })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${story[key] ? "bg-primary" : "bg-white/10"}`}
                  >
                    <span
                      className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${story[key] ? "left-5" : "left-0.5"}`}
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
                      setStory((s) => s && { ...s, slideshowOrder: isNaN(val) ? 0 : val });
                    }}
                    className={inputCls}
                    id="edit-slideshow-order"
                  />
                </Field>
              )}

              <Field label="SEO Priority (Float 0.0 - 1.0)">
                <Input
                  type="number"
                  step="0.1"
                  value={story.seoPriority ?? 0.5}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setStory((s) => s && { ...s, seoPriority: isNaN(val) ? 0.5 : val });
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
                    setStory((s) => s && { ...s, readingPriority: isNaN(val) ? 0 : val });
                  }}
                  className={inputCls}
                  id="edit-reading-priority"
                />
              </Field>
            </div>

            {/* Premium Cover Image Controls */}
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
                    {uploading ? "Uploading cover..." : "Upload Cover Image"}
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/40 font-sans">
                  Direct Cover Image URL
                </label>
                <Input
                  value={coverImageUrl ?? ""}
                  onChange={(e) => setCoverImageUrl(e.target.value || null)}
                  placeholder="https://images.unsplash.com/..."
                  className="h-9 bg-black/20 border-white/10 text-white text-xs font-sans"
                />
              </div>
            </div>

            {/* Gallery Images controls */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-5 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                Additional Images Gallery
              </h3>

              {additionalImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {additionalImages.map((url, idx) => (
                    <div key={idx} className="relative group aspect-video">
                      <img
                        src={url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover border border-white/10 rounded-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
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

              <input
                ref={galleryInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
