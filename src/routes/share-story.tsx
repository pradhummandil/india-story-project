import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  UploadCloud,
  FileText,
  User,
  Mail,
  Lock,
  Globe,
  Chrome,
  MapPin,
  Image as ImageIcon,
  Video,
  Link2,
  Check,
  Loader2,
  ArrowRight,
  BookOpen,
  Heart,
  Users,
  Star,
  Shield,
  Zap,
  ChevronDown,
  PenLine,
  Eye,
  Award,
  Feather,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/site/Layout";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase-client";
import { categories as defaultCategories } from "@/lib/stories-data";

export const Route = createFileRoute("/share-story")({
  head: () => ({
    meta: [
      { title: "Share Your Story — India Story Project" },
      {
        name: "description",
        content:
          "Your story can inspire millions. Submit your story of change, unsung heroes, or cultural heritage to India's most trusted storytelling platform.",
      },
    ],
  }),
  component: ShareStoryPage,
});

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const whyShareReasons = [
  {
    icon: Heart,
    title: "Inspire Positive Change",
    desc: "Your story of a local hero or grassroots innovator can spark change across millions of readers nationwide.",
  },
  {
    icon: Globe,
    title: "Preserve Cultural Heritage",
    desc: "Document traditions, crafts, and wisdom before they fade. Be part of India's living digital archive.",
  },
  {
    icon: Users,
    title: "Build a Community",
    desc: "Join a growing community of contributors celebrating the real, vibrant India beyond headlines.",
  },
  {
    icon: Award,
    title: "Earn Recognition",
    desc: "Earn XP points, contributor badges, and be credited as a verified storyteller on every published piece.",
  },
];

const processSteps = [
  {
    num: "01",
    icon: PenLine,
    name: "Submit",
    desc: "Fill out your story form with rich details, images, and context about your subject.",
    color: "from-blue-500/20 to-blue-600/5",
    accent: "text-blue-400",
  },
  {
    num: "02",
    icon: Eye,
    name: "Editorial Review",
    desc: "Our editors read, evaluate, and provide initial feedback within 5–7 working days.",
    color: "from-purple-500/20 to-purple-600/5",
    accent: "text-purple-400",
  },
  {
    num: "03",
    icon: Shield,
    name: "Fact Verification",
    desc: "We verify facts, geographic coordinates, and corroborate information with trusted sources.",
    color: "from-amber-500/20 to-amber-600/5",
    accent: "text-amber-400",
  },
  {
    num: "04",
    icon: Star,
    name: "Approval",
    desc: "Approved stories receive final polish by our copy editors for style and readability.",
    color: "from-emerald-500/20 to-emerald-600/5",
    accent: "text-emerald-400",
  },
  {
    num: "05",
    icon: Zap,
    name: "Published",
    desc: "Your story goes live on India Story Project and is shared with our reading community.",
    color: "from-gold/20 to-gold/5",
    accent: "text-gold",
  },
];

const guidelines = [
  "Stories must be about real people, places, or events in India.",
  "Content should be original and not published elsewhere.",
  "Minimum 500 words for full stories; 150 words for summaries.",
  "Cite all sources and provide verifiable facts.",
  "Avoid defamatory language, political bias, or unverified claims.",
  "Images must be royalty-free or your own photography.",
];

const faqs = [
  {
    q: "How long does the review process take?",
    a: "Our editorial team reviews submissions within 5–7 working days. You'll receive an email notification when your story status changes.",
  },
  {
    q: "Can I submit stories in Hindi or other regional languages?",
    a: "Yes! We accept stories in English and Hindi. Our platform is being expanded to support more Indian languages soon.",
  },
  {
    q: "Will I be credited as the author?",
    a: "Absolutely. Your name appears on every story you contribute. You'll also receive contributor XP points and badges.",
  },
  {
    q: "What types of stories are you looking for?",
    a: "We celebrate unsung heroes, grassroots innovations, cultural heritage, sustainable practices, and community transformations across India.",
  },
  {
    q: "Can I submit photos and videos with my story?",
    a: "Yes. You can upload a cover image, gallery photos, and a video link or file. High-quality visuals improve publication chances.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        onClick={() => setOpen(!open)}
      >
        <span className="font-sans font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-muted-foreground font-sans leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShareStoryPage() {
  const { user, session, profile, loading: authLoading } = useAuthStore();

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [heroName, setHeroName] = useState("");
  const [story, setStory] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("Heritage");
  const [stateName, setStateName] = useState("Delhi");
  const [district, setDistrict] = useState("");
  const [language, setLanguage] = useState("en");
  const [authorName, setAuthorName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [externalLinks, setExternalLinks] = useState("");
  const [phone, setPhone] = useState("");
  const [tags, setTags] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showSEO, setShowSEO] = useState(false);

  // Upload states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-populate user details
  useEffect(() => {
    if (user) {
      setContactEmail(user.email ?? "");
      setAuthorName(
        profile?.fullName ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          ""
      );
    }
  }, [user, profile]);

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/share-story`,
      },
    });
    if (authError) {
      setLoginError(authError.message);
      setLoginLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setLoginError(authError.message);
      setLoginLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!session) return null;
    const formData = new FormData();
    formData.append("files", file);

    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.files?.[0]?.url || null;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadFile(file);
      if (url) setCoverImage(url);
    } catch {
      alert("Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        if (url) urls.push(url);
      }
      setGalleryImages((prev) => [...prev, ...urls]);
    } catch {
      alert("Failed to upload gallery images.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await uploadFile(file);
      if (url) setVideoUrl(url);
    } catch {
      alert("Failed to upload video file.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent | null, isDraft = false) => {
    if (e) e.preventDefault();
    if (!session) return;

    if (!title.trim()) {
      setErrorMessage("Please fill in Title.");
      return;
    }

    if (!isDraft && (!story.trim() || !summary.trim())) {
      setErrorMessage("Please fill in Title, Story, and Summary.");
      return;
    }

    setSubmitLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title,
          heroName,
          content: story,
          excerpt: summary,
          categoryName: category,
          stateName,
          district,
          language,
          authorName,
          email: contactEmail,
          imageUrl: coverImage || null,
          galleryUrls: galleryImages.length > 0 ? JSON.stringify(galleryImages) : null,
          videoUrl: videoUrl || null,
          externalLinks: externalLinks || null,
          phone: phone || null,
          tags: tags || null,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          seoKeywords: seoKeywords || null,
          status: isDraft ? "Draft" : "Pending",
        }),
      });

      if (res.ok) {
        if (isDraft) {
          setDraftSaved(true);
          setTimeout(() => setDraftSaved(false), 3000);
        } else {
          setDone(true);
        }
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Submission failed.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setHeroName("");
    setStory("");
    setSummary("");
    setCategory("Heritage");
    setStateName("Delhi");
    setDistrict("");
    setLanguage("en");
    setCoverImage("");
    setGalleryImages([]);
    setVideoUrl("");
    setExternalLinks("");
    setPhone("");
    setTags("");
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords("");
    setDone(false);
    setErrorMessage(null);
    setIsPreview(false);
  };

  if (authLoading) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="size-8 animate-spin text-gold mx-auto" />
            <p className="text-muted-foreground font-sans text-sm">
              Loading…
            </p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="bg-background text-foreground min-h-screen">
        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32 bg-black border-b border-border/40">
          {/* Background gradients */}
          <div className="absolute inset-0 bg-hero opacity-20 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute -top-40 -left-20 size-[600px] rounded-full bg-gold/8 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-20 size-[500px] rounded-full bg-saffron/8 blur-[120px] pointer-events-none" />
          </div>

          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }} />

          <div className="container mx-auto px-6 relative text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-gold/20 text-[11px] uppercase tracking-[0.2em] text-gold font-sans font-bold mb-8"
            >
              <Feather className="size-3" />
              India Story Project — Open Submissions
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight"
            >
              Your Story Can
              <br />
              <span className="text-gradient-gold italic">Inspire Millions</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 text-base md:text-lg text-muted-foreground leading-relaxed font-sans max-w-2xl mx-auto"
            >
              Across every corner of India, unsung heroes, creative pioneers, and grassroots innovators are shaping tomorrow.
              Be part of documenting modern India's transformation — one authentic voice at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            >
              <a
                href="#submission-form"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold text-sm uppercase tracking-widest h-13 px-8 rounded-full shadow-glow transition-all duration-300 btn-premium"
              >
                <PenLine className="size-4" />
                Submit Your Story
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-border hover:border-gold/40 text-foreground hover:text-gold font-sans font-semibold text-sm h-13 px-8 rounded-full transition-all duration-300"
              >
                <BookOpen className="size-4" />
                How It Works
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center justify-center gap-8 mt-14 text-muted-foreground"
            >
              {[
                { value: "500+", label: "Stories Published" },
                { value: "36", label: "States Covered" },
                { value: "5M+", label: "Readers Reached" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-2xl font-bold text-gradient-gold">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-wider font-sans font-bold mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Why Share Your Story ─── */}
        <section className="py-24 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">Why Contribute</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 leading-tight">
                Why Share Your Story?
              </h2>
              <p className="mt-4 text-muted-foreground font-sans max-w-xl mx-auto text-sm leading-relaxed">
                Every voice matters. Every story creates ripples. Here's why contributors choose the India Story Project.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyShareReasons.map((reason, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass rounded-2xl p-7 border border-white/5 hover:border-gold/20 hover-lift group"
                >
                  <div className="size-12 rounded-xl bg-gold/8 border border-gold/15 flex items-center justify-center text-gold mb-5 group-hover:bg-gold/15 transition-colors duration-300">
                    <reason.icon className="size-5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground mb-2">{reason.title}</h3>
                  <p className="text-xs text-muted-foreground font-sans leading-relaxed">{reason.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section id="how-it-works" className="py-24 bg-card/10 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">Editorial Process</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
                How It Works
              </h2>
              <p className="mt-4 text-muted-foreground font-sans max-w-xl mx-auto text-sm leading-relaxed">
                Every story goes through our rigorous 5-stage editorial review to ensure quality, accuracy, and impact.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {processSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className={`relative rounded-2xl bg-gradient-to-b ${step.color} border border-white/5 p-6 hover:border-gold/15 transition-all duration-300 group`}
                >
                  {/* Step number */}
                  <span className="font-display text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors absolute top-4 right-4 leading-none select-none">
                    {step.num}
                  </span>

                  <div className={`size-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 ${step.accent}`}>
                    <step.icon className="size-5" />
                  </div>
                  <h4 className="font-sans font-bold text-sm text-foreground mb-2">{step.name}</h4>
                  <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Submission Guidelines ─── */}
        <section className="py-20 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">Standards</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-5 leading-tight">
                  Submission Guidelines
                </h2>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-8">
                  We maintain high editorial standards to ensure every story we publish is accurate, impactful, and honors the subject.
                </p>
                <ul className="space-y-3">
                  {guidelines.map((g, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3 text-sm font-sans text-foreground/80"
                    >
                      <span className="mt-1 size-4 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                        <Check className="size-2.5 text-primary" />
                      </span>
                      {g}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Decorative benefits card */}
              <div className="glass rounded-2xl p-8 border border-gold/15">
                <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Star className="size-4.5 text-gold" />
                  What You Earn
                </h3>
                <div className="space-y-5">
                  {[
                    { icon: Award, label: "+20 XP Points", desc: "For every accepted submission" },
                    { icon: Star, label: "Contributor Badge", desc: "Displayed on your profile" },
                    { icon: BookOpen, label: "Author Byline", desc: "Credit on every published story" },
                    { icon: Users, label: "Community Access", desc: "Join our inner circle of storytellers" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="size-9 rounded-lg bg-gold/8 border border-gold/15 flex items-center justify-center text-gold shrink-0">
                        <b.icon className="size-4" />
                      </div>
                      <div>
                        <div className="text-sm font-sans font-semibold text-foreground">{b.label}</div>
                        <div className="text-xs text-muted-foreground font-sans">{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Submission Form + Auth ─── */}
        <section id="submission-form" className="py-20 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-12">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">Submit Your Work</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">
                Tell Your Story
              </h2>
              <p className="mt-4 text-muted-foreground font-sans max-w-lg mx-auto text-sm leading-relaxed">
                {user
                  ? `Welcome, ${profile?.fullName || user.email?.split("@")[0] || "Contributor"}. Fill in the details below.`
                  : "Sign in to access the submission form. Only authenticated contributors can submit stories."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!user ? (
                /* ─── Auth Wall ─── */
                <motion.div
                  key="auth-required"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="glass rounded-2xl border border-white/8 overflow-hidden">
                    {/* Top accent bar */}
                    <div className="h-1 bg-gradient-to-r from-gold via-saffron to-gold" />

                    <div className="p-8 md:p-12">
                      <div className="text-center mb-8">
                        <div className="size-16 rounded-full bg-gradient-to-br from-gold/15 to-saffron/10 border border-gold/20 flex items-center justify-center mx-auto mb-5">
                          <Lock className="size-6 text-gold" />
                        </div>
                        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                          Sign in to Continue
                        </h3>
                        <p className="text-sm text-muted-foreground font-sans max-w-sm mx-auto">
                          Only authenticated contributors can submit stories to our living archive.
                        </p>
                      </div>

                      {loginError && (
                        <div className="mb-6 p-4 rounded-xl text-sm bg-red-500/8 border border-red-500/20 text-red-400 font-sans text-center">
                          {loginError}
                        </div>
                      )}

                      <div className="max-w-sm mx-auto space-y-5">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12 rounded-xl border-border font-sans text-sm font-semibold gap-3 hover:border-gold/40 hover:bg-white/4 text-foreground transition-all duration-300"
                          onClick={handleGoogleLogin}
                          disabled={loginLoading}
                        >
                          {loginLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Chrome className="size-4" />
                          )}
                          Continue with Google
                        </Button>

                        <div className="relative flex items-center gap-4">
                          <div className="flex-grow border-t border-border/40" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans font-bold shrink-0">
                            or email
                          </span>
                          <div className="flex-grow border-t border-border/40" />
                        </div>

                        <form onSubmit={handleEmailLogin} className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="bg-transparent border-border focus-visible:ring-gold/30 h-11 font-sans text-sm rounded-xl"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                              Password
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="bg-transparent border-border focus-visible:ring-gold/30 h-11 font-sans text-sm rounded-xl"
                            />
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-sans text-xs uppercase tracking-widest font-bold rounded-xl"
                            disabled={loginLoading}
                          >
                            {loginLoading ? (
                              <Loader2 className="size-4 animate-spin mr-2" />
                            ) : null}
                            Sign In
                          </Button>
                        </form>

                        <p className="text-center text-xs text-muted-foreground font-sans">
                          Don't have an account?{" "}
                          <Link to="/login" className="text-primary hover:text-primary/80 underline underline-offset-2">
                            Create one
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : done ? (
                /* ─── Success State ─── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="glass rounded-2xl border border-white/8 overflow-hidden text-center">
                    <div className="h-1 bg-gradient-to-r from-emerald-500 via-gold to-emerald-500" />
                    <div className="p-12 md:p-16">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="size-20 rounded-full bg-gradient-to-br from-gold to-saffron flex items-center justify-center mx-auto mb-6 shadow-glow"
                      >
                        <Check className="size-9 text-white" />
                      </motion.div>
                      <h3 className="font-display text-3xl font-bold text-foreground mb-3">
                        Story Submitted!
                      </h3>
                      <p className="text-muted-foreground font-sans max-w-sm mx-auto text-sm leading-relaxed mb-2">
                        Namaste! Your story has entered our editorial queue. Our team will review it within 5–7 working days.
                      </p>
                      <div className="inline-flex items-center gap-2 mt-2 mb-8 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold font-sans text-xs font-bold uppercase tracking-wider">
                        <Star className="size-3" />
                        +20 XP Earned
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={handleReset}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-xs uppercase tracking-widest font-bold h-11 px-8 rounded-xl"
                        >
                          <PenLine className="size-4 mr-2" />
                          Share Another Story
                        </Button>
                        <Link to="/">
                          <Button
                            variant="outline"
                            className="h-11 px-8 rounded-xl border-border font-sans text-xs uppercase tracking-widest"
                          >
                            Back to Home
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ─── Submission Form ─── */
                <motion.div
                  key="submission-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="glass rounded-2xl border border-white/8 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-gold via-saffron to-gold" />
                    <div className="p-6 md:p-10">
                      {/* Form header */}
                      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/40">
                        <div className="size-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                          <FileText className="size-4.5" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-foreground">
                            Submission Form
                          </h3>
                          <p className="text-xs text-muted-foreground font-sans">
                            Fields marked with * are required
                          </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground font-sans">
                          <User className="size-3.5 text-gold" />
                          {profile?.fullName || user.email?.split("@")[0]}
                        </div>
                      </div>

                      {errorMessage && (
                        <div className="mb-6 p-4 rounded-xl text-sm bg-red-500/8 border border-red-500/20 text-red-400 font-sans">
                          {errorMessage}
                        </div>
                      )}

                      {draftSaved && (
                        <div className="mb-6 p-4 rounded-xl text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans flex items-center gap-2">
                          <Check className="size-4 text-emerald-400" />
                          <span>Draft saved successfully! You can continue editing.</span>
                        </div>
                      )}

                      {isPreview ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2">
                              <Sparkles className="size-4.5 text-gold" />
                              <h3 className="font-display text-xl font-bold text-white">Story Preview</h3>
                            </div>
                            <Button
                              type="button"
                              onClick={() => setIsPreview(false)}
                              variant="outline"
                              className="h-9 px-4 rounded-xl border-border font-sans text-xs uppercase tracking-wider hover:bg-white/5 text-white"
                            >
                              Back to Editor
                            </Button>
                          </div>

                          <div className="space-y-6 max-w-2xl mx-auto py-4">
                            {coverImage && (
                              <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10">
                                <img src={coverImage} className="w-full h-full object-cover" alt="Cover Preview" />
                              </div>
                            )}

                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase font-bold text-gold font-sans">
                                <span className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                                  {category}
                                </span>
                                <span>•</span>
                                <span>{stateName}{district ? `, ${district}` : ""}</span>
                                <span>•</span>
                                <span>{language === "hi" ? "हिन्दी" : "English"}</span>
                              </div>
                              <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
                                {title || "Untitled Story"}
                              </h1>
                              {heroName && (
                                <p className="text-xs font-sans text-white/50 italic">
                                  Subject: <span className="text-gold font-bold not-italic">{heroName}</span>
                                </p>
                              )}
                              <p className="text-xs font-sans text-white/45">
                                By {authorName || "Anonymous Contributor"}
                              </p>
                            </div>

                            <div className="border-l-2 border-gold pl-4 py-1">
                              <p className="text-sm text-muted-foreground italic font-sans leading-relaxed">
                                {summary || "No summary excerpt provided."}
                              </p>
                            </div>

                            <div className="text-sm text-white/80 font-sans leading-relaxed whitespace-pre-wrap pt-4 border-t border-white/5">
                              {story || "Write your story of change..."}
                            </div>

                            {videoUrl && (
                              <div className="pt-4 border-t border-white/5">
                                <p className="text-xs text-white/40 uppercase tracking-widest font-sans font-bold mb-2">Video Attachment</p>
                                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold underline hover:text-white transition-colors break-all">
                                  {videoUrl}
                                </a>
                              </div>
                            )}

                            {externalLinks && (
                              <div className="pt-4 border-t border-white/5">
                                <p className="text-xs text-white/40 uppercase tracking-widest font-sans font-bold mb-2">References & Links</p>
                                <div className="flex flex-wrap gap-2">
                                  {externalLinks.split(",").map((link, idx) => (
                                    <a key={idx} href={link.trim()} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded hover:bg-gold/10 hover:text-gold transition-colors">
                                      {link.trim()}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-6 border-t border-white/5 flex gap-3 justify-end">
                            <Button
                              type="button"
                              onClick={() => setIsPreview(false)}
                              variant="outline"
                              className="h-11 px-6 rounded-xl border-border text-white text-xs font-sans uppercase tracking-widest"
                            >
                              Keep Editing
                            </Button>
                            <Button
                              type="button"
                              onClick={() => void handleSubmit(null, false)}
                              className="h-11 px-8 bg-primary hover:bg-primary/95 text-white font-sans uppercase tracking-widest text-xs font-bold rounded-xl"
                              disabled={submitLoading}
                            >
                              {submitLoading ? "Submitting..." : "Submit Story"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={(e) => void handleSubmit(e, false)} className="space-y-7">
                          {/* Title & Hero Name */}
                          <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                Story Title *
                              </Label>
                              <Input
                                id="title"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. The Tree-Man of Jodhpur"
                                className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 h-11 rounded-xl font-sans text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="heroName" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                Hero / Subject Name
                              </Label>
                              <Input
                                id="heroName"
                                value={heroName}
                                onChange={(e) => setHeroName(e.target.value)}
                                placeholder="e.g. Ranaram Bishnoi"
                                className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 h-11 rounded-xl font-sans text-sm"
                              />
                            </div>
                          </div>

                          {/* Category, State, District */}
                          <div className="grid sm:grid-cols-3 gap-5">
                            <div className="space-y-2">
                              <Label htmlFor="category" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                Category *
                              </Label>
                              <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-background border border-border/60 text-foreground h-11 px-3 rounded-xl font-sans text-sm outline-none focus:border-gold/40 transition-colors"
                              >
                                {defaultCategories.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="stateName" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                State *
                              </Label>
                              <select
                                id="stateName"
                                value={stateName}
                                onChange={(e) => setStateName(e.target.value)}
                                className="w-full bg-background border border-border/60 text-foreground h-11 px-3 rounded-xl font-sans text-sm outline-none focus:border-gold/40 transition-colors"
                              >
                                {STATES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="district" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                District / City *
                              </Label>
                              <Input
                                id="district"
                                required
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                placeholder="e.g. Jodhpur"
                                className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 h-11 rounded-xl font-sans text-sm"
                              />
                            </div>
                          </div>

                          {/* Language + Author + Email */}
                          <div className="grid sm:grid-cols-3 gap-5">
                            <div className="space-y-2">
                              <Label htmlFor="language" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                Language *
                              </Label>
                              <select
                                id="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-background border border-border/60 text-foreground h-11 px-3 rounded-xl font-sans text-sm outline-none focus:border-gold/40 transition-colors"
                              >
                                <option value="en">English</option>
                                <option value="hi">Hindi (हिन्दी)</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="authorName" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                Your Name
                              </Label>
                              <Input
                                id="authorName"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                placeholder="Author name"
                                className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 h-11 rounded-xl font-sans text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contactEmail" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                Contact Email *
                              </Label>
                              <Input
                                id="contactEmail"
                                type="email"
                                required
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 h-11 rounded-xl font-sans text-sm"
                              />
                            </div>
                          </div>

                          {/* Phone & Tags */}
                          <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                Contact Phone (Optional)
                              </Label>
                              <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. +91 98765 43210"
                                className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 h-11 rounded-xl font-sans text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tags" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                Tags / Keywords <span className="normal-case text-muted-foreground/60">(comma-separated)</span>
                              </Label>
                              <Input
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g. environment, water conservation, solar"
                                className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 h-11 rounded-xl font-sans text-sm"
                              />
                            </div>
                          </div>

                          {/* Collapsible SEO Fields */}
                          <div className="border border-border/20 rounded-xl p-4 bg-white/3">
                            <button
                              type="button"
                              onClick={() => setShowSEO(!showSEO)}
                              className="w-full flex items-center justify-between text-left text-xs uppercase tracking-wider text-muted-foreground font-sans font-bold hover:text-white transition-colors"
                            >
                              <span>SEO Metadata Settings (Optional)</span>
                              <span className="text-[10px] text-gold">{showSEO ? "Hide [-]" : "Show [+]"}</span>
                            </button>
                            {showSEO && (
                              <div className="space-y-4 mt-4 pt-4 border-t border-border/20">
                                <div className="space-y-2">
                                  <Label htmlFor="seoTitle" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                    SEO Title
                                  </Label>
                                  <Input
                                    id="seoTitle"
                                    value={seoTitle}
                                    onChange={(e) => setSeoTitle(e.target.value)}
                                    placeholder="e.g. Tree-Man of Jodhpur: Ranaram Bishnoi's Story"
                                    className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 h-11 rounded-xl font-sans text-sm"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="seoDescription" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                    SEO Description
                                  </Label>
                                  <Textarea
                                    id="seoDescription"
                                    value={seoDescription}
                                    onChange={(e) => setSeoDescription(e.target.value)}
                                    placeholder="Brief description optimized for search engine snippets (under 160 characters)"
                                    rows={2}
                                    className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 rounded-xl font-sans text-sm resize-none"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="seoKeywords" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                                    SEO Keywords
                                  </Label>
                                  <Input
                                    id="seoKeywords"
                                    value={seoKeywords}
                                    onChange={(e) => setSeoKeywords(e.target.value)}
                                    placeholder="e.g. tree planting, conservation, Jodhpur hero, Rajasthan"
                                    className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 h-11 rounded-xl font-sans text-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Summary */}
                          <div className="space-y-2">
                            <Label htmlFor="summary" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                              Story Summary * <span className="normal-case text-muted-foreground/60">(1–2 sentence excerpt shown in previews)</span>
                            </Label>
                            <Textarea
                              id="summary"
                              required
                              value={summary}
                              onChange={(e) => setSummary(e.target.value)}
                              placeholder="e.g. The remarkable story of a 75-year-old farmer who planted over 50,000 trees in the Thar Desert..."
                              rows={3}
                              className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 rounded-xl font-sans text-sm resize-none"
                            />
                          </div>

                          {/* Full Story */}
                          <div className="space-y-2">
                            <Label htmlFor="story" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">
                              Full Story * <span className="normal-case text-muted-foreground/60">(Markdown supported)</span>
                            </Label>
                            <Textarea
                              id="story"
                              required
                              value={story}
                              onChange={(e) => setStory(e.target.value)}
                              placeholder="Write your story of change here..."
                              rows={12}
                              className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 rounded-xl font-sans text-sm leading-relaxed resize-none"
                            />
                          </div>

                          {/* Image Upload Block */}
                          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                            <div className="space-y-2">
                              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-sans block">Cover Image</Label>
                              <div className="border border-dashed border-border/60 hover:border-gold/30 rounded-xl transition-colors overflow-hidden min-h-[140px] flex flex-col items-center justify-center">
                                {coverImage ? (
                                  <div className="relative group w-full aspect-[16/10] overflow-hidden rounded border border-white/10">
                                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <label className="cursor-pointer text-[10px] uppercase font-bold tracking-wider text-gold hover:text-white transition-colors">
                                        Change Image
                                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                                      </label>
                                    </div>
                                  </div>
                                ) : uploadingCover ? (
                                  <div className="flex flex-col items-center text-white/40 text-xs font-sans">
                                    <Loader2 className="size-6 animate-spin text-gold mb-2" />
                                    Uploading to Cloudinary...
                                  </div>
                                ) : (
                                  <label className="cursor-pointer flex flex-col items-center text-muted-foreground text-xs font-sans hover:text-white transition-colors">
                                    <UploadCloud className="size-7 mb-2 text-muted-foreground/30" />
                                    Upload Cover Image
                                    <span className="text-[10px] text-white/20 mt-1">Direct upload to Cloudinary</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                                  </label>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-sans block">Gallery Images (Optional)</Label>
                              <div className="border border-dashed border-border/60 hover:border-gold/30 rounded-xl transition-colors min-h-[140px] flex flex-col items-center justify-center">
                                {uploadingGallery ? (
                                  <div className="flex flex-col items-center text-white/40 text-xs font-sans">
                                    <Loader2 className="size-6 animate-spin text-gold mb-2" />
                                    Uploading files...
                                  </div>
                                ) : (
                                  <label className="cursor-pointer flex flex-col items-center text-muted-foreground text-xs font-sans hover:text-white transition-colors w-full">
                                    <ImageIcon className="size-7 mb-2 text-muted-foreground/30" />
                                    Upload Multiple Images
                                    <span className="text-[10px] text-white/20 mt-1">Direct upload to Cloudinary</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                                  </label>
                                )}
                                {galleryImages.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                    {galleryImages.map((img, i) => (
                                      <div key={i} className="size-10 rounded overflow-hidden border border-white/10">
                                        <img src={img} className="size-full object-cover" />
                                      </div>
                                    ))}
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-gold self-center ml-2">{galleryImages.length} files</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Video & External Links */}
                          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                            <div className="space-y-2">
                              <Label htmlFor="video" className="text-xs uppercase tracking-wider text-muted-foreground font-sans block">Video (Optional URL or File)</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="video"
                                  value={videoUrl}
                                  onChange={(e) => setVideoUrl(e.target.value)}
                                  placeholder="Link (e.g. Youtube or Vimeo)"
                                  className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 h-10 rounded-xl font-sans text-xs"
                                />
                                <label className="h-10 bg-white/5 hover:bg-white/10 border border-white/10 px-4 rounded-xl flex items-center justify-center cursor-pointer font-sans text-xs text-white shrink-0">
                                  {uploadingVideo ? <Loader2 className="size-4 animate-spin text-gold" /> : <Video className="size-4" />}
                                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                                </label>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="externalLinks" className="text-xs uppercase tracking-wider text-muted-foreground font-sans">External Links / References</Label>
                              <Input
                                  id="externalLinks"
                                  value={externalLinks}
                                  onChange={(e) => setExternalLinks(e.target.value)}
                                  placeholder="Links separated by comma"
                                  className="bg-transparent border-border/60 focus-visible:border-gold/40 focus-visible:ring-gold/20 h-10 rounded-xl font-sans text-xs"
                              />
                            </div>
                          </div>

                          {/* Submit & Draft Buttons */}
                          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                            <Button
                              type="button"
                              onClick={() => void handleSubmit(null, true)}
                              variant="outline"
                              className="w-full sm:w-auto h-13 border-border hover:border-gold/30 hover:bg-white/5 text-white uppercase tracking-[0.15em] text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                              disabled={submitLoading || uploadingCover || uploadingGallery || uploadingVideo}
                            >
                              {submitLoading ? (
                                <Loader2 className="size-4 animate-spin text-gold" />
                              ) : (
                                <FileText className="size-4 text-gold" />
                              )}
                              Save Draft
                            </Button>

                            <Button
                              type="button"
                              onClick={() => setIsPreview(true)}
                              variant="outline"
                              className="w-full sm:w-auto h-13 border-border hover:border-gold/30 hover:bg-white/5 text-white uppercase tracking-[0.15em] text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                              disabled={submitLoading || uploadingCover || uploadingGallery || uploadingVideo}
                            >
                              <Sparkles className="size-4 text-gold" />
                              Preview Story
                            </Button>

                            <Button
                              type="submit"
                              className="flex-1 h-13 bg-primary hover:bg-primary/95 text-primary-foreground uppercase tracking-[0.15em] text-xs font-bold rounded-xl shadow-glow btn-premium flex items-center justify-center gap-2"
                              disabled={submitLoading || uploadingCover || uploadingGallery || uploadingVideo}
                            >
                              {submitLoading ? (
                                <>
                                  <Loader2 className="size-4 animate-spin" />
                                  Submitting Story…
                                </>
                              ) : (
                                <>
                                  Submit for Review
                                  <ArrowRight className="size-4" />
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      )}
                      <p className="text-center text-xs text-muted-foreground font-sans mt-3">
                        By submitting, you agree to our editorial guidelines and confirm this content is original.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ─── FAQ Section ─── */}
        <section className="py-20 bg-card/10 border-b border-border/40">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-12">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-gold">Questions</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">
                Frequently Asked
              </h2>
            </div>
            <div className="glass rounded-2xl border border-white/8 px-8 py-2">
              {faqs.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="py-24">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Feather className="size-8 text-gold mx-auto mb-5" />
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-5 leading-tight">
                Every Story Matters.
                <br />
                <span className="text-gradient-gold italic">Yours Does Too.</span>
              </h2>
              <p className="text-muted-foreground font-sans text-base max-w-xl mx-auto mb-8 leading-relaxed">
                Don't let the stories of real India go untold. Join hundreds of contributors who are building the most authentic digital archive of Bharat.
              </p>
              <a
                href="#submission-form"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold text-sm uppercase tracking-widest h-13 px-10 rounded-full shadow-glow transition-all duration-300 btn-premium"
              >
                <PenLine className="size-4" />
                Start Writing Now
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
