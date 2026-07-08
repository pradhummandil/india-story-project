import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Save, Send, UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/stories/new")({
  head: () => ({ meta: [{ title: "New Story — Admin" }] }),
  component: NewStoryPage,
});

type DropdownOption = { id: string; name: string; slug: string };

export default function NewStoryPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  // Translations
  const [titleHi, setTitleHi] = useState("");
  const [excerptHi, setExcerptHi] = useState("");
  const [contentHi, setContentHi] = useState("");

  // Meta
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [featured, setFeatured] = useState(false);
  const [heroOfTheDay, setHeroOfTheDay] = useState(false);

  // Dropdowns
  const [categories, setCategories] = useState<DropdownOption[]>([]);
  const [states, setStates] = useState<DropdownOption[]>([]);
  const [authors, setAuthors] = useState<DropdownOption[]>([]);
  const [themes, setThemes] = useState<DropdownOption[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [themeId, setThemeId] = useState("");

  // Image Upload States
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery images states
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  // Auto-slugify
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  useEffect(() => {
    if (title && !slug) setSlug(slugify(title));
  }, [title]);

  // Load dropdown data
  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/states").then((r) => r.json()),
      fetch("/api/authors").then((r) => r.json()),
      fetch("/api/themes").then((r) => r.json()),
    ])
      .then(([cats, sts, auths, thms]) => {
        setCategories(cats.categories ?? []);
        setStates(sts.states ?? []);
        setAuthors(auths.authors ?? []);
        setThemes(thms.themes ?? []);
      })
      .catch(console.error);
  }, [user]);

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
        setImageUrl(data.files[0].url);
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

  const handleSubmit = async (publish: boolean) => {
    if (!title || !excerpt || !content || !categoryId || !stateId || !authorId || !themeId) {
      setError("Title, Excerpt, Content, Category, State, Author, and Theme are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const body = {
      title,
      excerpt,
      content,
      titleHi: titleHi || null,
      excerptHi: excerptHi || null,
      contentHi: contentHi || null,
      slug: slug || slugify(title),
      seoTitle: seoTitle || title,
      seoDescription: seoDesc || excerpt,
      readingTime: readingTime ? parseInt(readingTime, 10) : null,
      featured,
      heroOfTheDay,
      status: publish ? "Published" : "Draft",
      categoryId,
      stateId,
      authorId,
      themeId,
      imageUrl: imageUrl || null,
      imageCaption: imageCaption || null,
      additionalImages,
    };

    const res = await fetch("/api/admin/stories", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: session ? `Bearer ${session.access_token}` : "",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err: any = await res.json();
      setError(err.error ?? "Failed to create story.");
      setLoading(false);
      return;
    }

    new BroadcastChannel("isp-stories-updates").postMessage("update");
    void navigate({ to: "/admin/stories" });
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-sans font-bold uppercase tracking-widest text-white/40 mb-2">
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls =
    "h-10 rounded-sm bg-white/5 border-white/10 text-white/80 placeholder:text-white/20 font-sans text-sm focus:border-primary/50";
  const textareaCls =
    "w-full rounded-sm bg-white/5 border border-white/10 text-white/80 placeholder:text-white/20 font-sans text-sm px-3 py-2 resize-none focus:outline-none focus:border-primary/50 transition-colors";
  const selectCls =
    "h-10 w-full rounded-sm bg-[#0F0F0F] border border-white/10 text-white/80 font-sans text-sm px-3 focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <AdminLayout title="New Story" subtitle="Create a new story for India Story Project">
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
              id="new-story-draft-btn"
              variant="outline"
              className="h-10 px-4 rounded-sm border-white/20 text-white/60 hover:text-white font-sans text-xs uppercase tracking-widest gap-2 bg-transparent"
              onClick={() => void handleSubmit(false)}
              disabled={loading}
            >
              <Save className="size-4" /> Save Draft
            </Button>
            <Button
              id="new-story-publish-btn"
              className="h-10 px-4 rounded-sm bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest gap-2"
              onClick={() => void handleSubmit(true)}
              disabled={loading}
            >
              <Send className="size-4" /> Publish
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
            {/* English version */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-6 space-y-5">
              <Field label="Title (English)">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter story title…"
                  className={inputCls}
                  id="story-title"
                  required
                />
              </Field>
              <Field label="Slug">
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="story-url-slug"
                  className={inputCls}
                  id="story-slug"
                  required
                />
              </Field>
              <Field label="Excerpt (English)">
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Write excerpt summary here…"
                  rows={3}
                  className={textareaCls}
                  id="story-excerpt"
                  required
                />
              </Field>
              <Field label="Content (English)">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write main story content here…"
                  rows={16}
                  className={textareaCls}
                  id="story-content"
                  required
                />
              </Field>
            </div>

            {/* Hindi translation */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-6 space-y-5">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                Hindi Translation (Optional)
              </h3>
              <Field label="शीर्षक">
                <Input
                  value={titleHi}
                  onChange={(e) => setTitleHi(e.target.value)}
                  placeholder="शीर्षक दर्ज करें…"
                  className={inputCls}
                  id="story-title-hi"
                />
              </Field>
              <Field label="संक्षेप">
                <textarea
                  value={excerptHi}
                  onChange={(e) => setExcerptHi(e.target.value)}
                  placeholder="संक्षिप्त विवरण यहाँ लिखें…"
                  rows={3}
                  className={textareaCls}
                  id="story-excerpt-hi"
                />
              </Field>
              <Field label="सामग्री">
                <textarea
                  value={contentHi}
                  onChange={(e) => setContentHi(e.target.value)}
                  placeholder="मुख्य कहानी की सामग्री यहाँ लिखें…"
                  rows={12}
                  className={textareaCls}
                  id="story-content-hi"
                />
              </Field>
            </div>

            {/* SEO details */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-6 space-y-5">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                SEO Metadata
              </h3>
              <Field label="SEO Title">
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Leave empty to use main title…"
                  className={inputCls}
                  id="story-seo-title"
                />
              </Field>
              <Field label="SEO Description">
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  placeholder="Leave empty to use main excerpt…"
                  rows={3}
                  className={textareaCls}
                  id="story-seo-desc"
                />
              </Field>
            </div>
          </div>

          {/* Details & options */}
          <div className="space-y-6">
            <div className="bg-[#161616] border border-white/10 rounded-sm p-5 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                Story Details
              </h3>
              <Field label="Author">
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className={selectCls}
                  id="story-author"
                  required
                >
                  <option value="">Select author…</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={selectCls}
                  id="story-category"
                  required
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="State / Region">
                <select
                  value={stateId}
                  onChange={(e) => setStateId(e.target.value)}
                  className={selectCls}
                  id="story-state"
                  required
                >
                  <option value="">Select state…</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Theme">
                <select
                  value={themeId}
                  onChange={(e) => setThemeId(e.target.value)}
                  className={selectCls}
                  id="story-theme"
                  required
                >
                  <option value="">Select theme…</option>
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Reading Time (minutes)">
                <Input
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  className={inputCls}
                  id="story-reading-time"
                />
              </Field>
            </div>

            {/* Premium Cover Image Controls */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-5 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <ImageIcon className="size-3.5" />
                Cover Image
              </h3>

              {imageUrl ? (
                <div className="relative group">
                  <img
                    src={imageUrl}
                    alt="Cover"
                    className="w-full aspect-video object-cover rounded-sm border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
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
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="h-9 bg-black/20 border-white/10 text-white text-xs font-sans"
                />
              </div>

              <Field label="Image Caption">
                <Input
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Image caption details..."
                  className="h-9"
                  id="story-image-caption"
                />
              </Field>
            </div>

            {/* Gallery Images controls */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-5 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <ImageIcon className="size-3.5" />
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

            {/* Options */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-5 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                Options
              </h3>
              {[
                {
                  label: "Featured Story",
                  value: featured,
                  set: setFeatured,
                  id: "story-featured",
                },
                {
                  label: "Hero of the Day",
                  value: heroOfTheDay,
                  set: setHeroOfTheDay,
                  id: "story-hero-of-day",
                },
              ].map(({ label, value, set, id }) => (
                <label key={id} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-sans text-white/60">{label}</span>
                  <button
                    id={id}
                    type="button"
                    onClick={() => set((v) => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-white/10"}`}
                  >
                    <span
                      className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-0.5"}`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
