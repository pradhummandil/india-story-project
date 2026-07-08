import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Send, Image as ImageIcon, Tag } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/stories/new")({
  head: () => ({ meta: [{ title: "New Story — Admin" }] }),
  component: NewStoryPage,
});

type DropdownOption = { id: string; name: string; slug: string };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewStoryPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [excerptHi, setExcerptHi] = useState("");
  const [contentHi, setContentHi] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [featured, setFeatured] = useState(false);
  const [heroOfTheDay, setHeroOfTheDay] = useState(false);
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");

  // Relations
  const [categories, setCategories] = useState<DropdownOption[]>([]);
  const [states, setStates] = useState<DropdownOption[]>([]);
  const [authors, setAuthors] = useState<DropdownOption[]>([]);
  const [themes, setThemes] = useState<DropdownOption[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [themeId, setThemeId] = useState("");

  // Image
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  // Auto-slugify title
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
    };

    const res = await fetch("/api/admin/stories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err: any = await res.json();
      setError(err.error ?? "Failed to create story.");
      setLoading(false);
      return;
    }

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
    <AdminLayout title="New Story" subtitle="Create a new story">
      <div className="max-w-5xl">
        {/* Header actions */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/admin/stories"
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-sans transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Stories
          </Link>
          <div className="flex items-center gap-3">
            <Button
              id="save-draft-btn"
              variant="outline"
              className="h-10 px-4 rounded-sm border-white/20 text-white/60 hover:text-white hover:border-white/40 font-sans text-xs uppercase tracking-widest gap-2 bg-transparent"
              onClick={() => void handleSubmit(false)}
              disabled={loading}
            >
              <Save className="size-4" />
              Save Draft
            </Button>
            <Button
              id="publish-story-btn"
              className="h-10 px-4 rounded-sm bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest gap-2"
              onClick={() => void handleSubmit(true)}
              disabled={loading}
            >
              <Send className="size-4" />
              Publish
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-sm font-sans">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#161616] border border-white/10 rounded-sm p-6 space-y-5">
              <Field label="Title (English)">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Story title…"
                  className={inputCls}
                  id="story-title"
                />
              </Field>
              <Field label="Slug">
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="story-slug"
                  className={inputCls}
                  id="story-slug"
                />
              </Field>
              <Field label="Excerpt (English)">
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  placeholder="Short description shown on cards…"
                  className={textareaCls}
                  id="story-excerpt"
                />
              </Field>
              <Field label="Content (English)">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  placeholder="Full story content… (Markdown supported)"
                  className={textareaCls}
                  id="story-content"
                />
              </Field>
            </div>

            {/* Hindi */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-6 space-y-5">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                Hindi Translation (Optional)
              </h3>
              <Field label="शीर्षक (Title in Hindi)">
                <Input
                  value={titleHi}
                  onChange={(e) => setTitleHi(e.target.value)}
                  placeholder="हिंदी शीर्षक…"
                  className={inputCls}
                  id="story-title-hi"
                />
              </Field>
              <Field label="संक्षेप (Excerpt in Hindi)">
                <textarea
                  value={excerptHi}
                  onChange={(e) => setExcerptHi(e.target.value)}
                  rows={3}
                  placeholder="हिंदी में संक्षेप…"
                  className={textareaCls}
                  id="story-excerpt-hi"
                />
              </Field>
              <Field label="सामग्री (Content in Hindi)">
                <textarea
                  value={contentHi}
                  onChange={(e) => setContentHi(e.target.value)}
                  rows={12}
                  placeholder="हिंदी में पूरी कहानी…"
                  className={textareaCls}
                  id="story-content-hi"
                />
              </Field>
            </div>

            {/* SEO */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-6 space-y-5">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40">
                SEO
              </h3>
              <Field label="SEO Title">
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="SEO page title"
                  className={inputCls}
                  id="story-seo-title"
                />
              </Field>
              <Field label="SEO Description">
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={3}
                  placeholder="Meta description (150–160 chars)"
                  className={textareaCls}
                  id="story-seo-desc"
                />
              </Field>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Relations */}
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

            {/* Cover image */}
            <div className="bg-[#161616] border border-white/10 rounded-sm p-5 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <ImageIcon className="size-3.5" />
                Cover Image
              </h3>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Cover"
                  className="w-full aspect-video object-cover rounded-sm border border-white/10"
                />
              )}
              <Field label="Image URL">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://…"
                  className={inputCls}
                  id="story-image-url"
                />
              </Field>
              <Field label="Caption">
                <Input
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Image caption…"
                  className={inputCls}
                  id="story-image-caption"
                />
              </Field>
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
