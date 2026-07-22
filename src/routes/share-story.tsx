import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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
  ArrowLeft,
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
  Smartphone,
  Trash2,
  Info,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/site/Layout";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase-client";
import { themes as defaultThemes } from "@/lib/stories-data";

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
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
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
    color: "from-red-950/20 to-neutral-900/5",
    accent: "text-red-500",
  },
  {
    num: "02",
    icon: Eye,
    name: "Editorial Review",
    desc: "Our editors read, evaluate, and provide initial feedback within 5–7 working days.",
    color: "from-red-950/20 to-neutral-900/5",
    accent: "text-red-500",
  },
  {
    num: "03",
    icon: Shield,
    name: "Fact Verification",
    desc: "We verify facts, geographic coordinates, and corroborate information with trusted sources.",
    color: "from-red-950/20 to-neutral-900/5",
    accent: "text-red-500",
  },
  {
    num: "04",
    icon: Star,
    name: "Approval",
    desc: "Approved stories receive final polish by our copy editors for style and readability.",
    color: "from-red-950/20 to-neutral-900/5",
    accent: "text-red-500",
  },
  {
    num: "05",
    icon: Zap,
    name: "Published",
    desc: "Your story goes live on India Story Project and is shared with our reading community.",
    color: "from-red-950/20 to-neutral-900/5",
    accent: "text-red-500",
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
    <div className="border-b border-neutral-800 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        onClick={() => setOpen(!open)}
      >
        <span className="font-sans font-semibold text-sm text-white group-hover:text-red-500 transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`size-4 text-neutral-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
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
            <p className="pb-5 text-sm text-neutral-350 font-sans leading-relaxed">{a}</p>
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

  // Wizard active step
  const [activeStep, setActiveStep] = useState(0);

  // Form states
  const [title, setTitle] = useState("");
  const [heroName, setHeroName] = useState("");
  const [story, setStory] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedThemes, setSelectedThemes] = useState<string[]>(["Heritage"]);
  const [allThemes, setAllThemes] = useState<string[]>(defaultThemes.filter((t) => t !== "All"));
  const [themeSearch, setThemeSearch] = useState("");
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

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
  
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [coverUploadSuccess, setCoverUploadSuccess] = useState<boolean>(false);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);
  const [galleryUploadSuccess, setGalleryUploadSuccess] = useState<boolean>(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [videoUploadSuccess, setVideoUploadSuccess] = useState<boolean>(false);

  // Drag and drop states
  const [isDragOverCover, setIsDragOverCover] = useState(false);
  const [isDragOverGallery, setIsDragOverGallery] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("isp_autosave_story_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.heroName) setHeroName(parsed.heroName);
        if (parsed.story) setStory(parsed.story);
        if (parsed.summary) setSummary(parsed.summary);
        if (parsed.selectedThemes) setSelectedThemes(parsed.selectedThemes);
        if (parsed.stateName) setStateName(parsed.stateName);
        if (parsed.district) setDistrict(parsed.district);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.authorName) setAuthorName(parsed.authorName);
        if (parsed.contactEmail) setContactEmail(parsed.contactEmail);
        if (parsed.coverImage) setCoverImage(parsed.coverImage);
        if (parsed.galleryImages) setGalleryImages(parsed.galleryImages);
        if (parsed.videoUrl) setVideoUrl(parsed.videoUrl);
        if (parsed.externalLinks) setExternalLinks(parsed.externalLinks);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.tags) setTags(parsed.tags);
        if (parsed.seoTitle) setSeoTitle(parsed.seoTitle);
        if (parsed.seoDescription) setSeoDescription(parsed.seoDescription);
        if (parsed.seoKeywords) setSeoKeywords(parsed.seoKeywords);
      } catch (e) {
        console.error("Autosave draft restoration failed:", e);
      }
    }
  }, []);

  // Autosave periodically to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const draft = {
        title,
        heroName,
        story,
        summary,
        selectedThemes,
        stateName,
        district,
        language,
        authorName,
        contactEmail,
        coverImage,
        galleryImages,
        videoUrl,
        externalLinks,
        phone,
        tags,
        seoTitle,
        seoDescription,
        seoKeywords,
      };
      localStorage.setItem("isp_autosave_story_draft", JSON.stringify(draft));
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    title,
    heroName,
    story,
    summary,
    selectedThemes,
    stateName,
    district,
    language,
    authorName,
    contactEmail,
    coverImage,
    galleryImages,
    videoUrl,
    externalLinks,
    phone,
    tags,
    seoTitle,
    seoDescription,
    seoKeywords,
  ]);

  useEffect(() => {
    fetch("/api/themes")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.themes || [];
        if (list.length > 0) {
          setAllThemes(list.map((t: any) => t.name));
        }
      })
      .catch((err) => console.error("Failed to fetch themes:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setShowThemeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = (themeName: string) => {
    if (selectedThemes.includes(themeName)) {
      setSelectedThemes(selectedThemes.filter((t) => t !== themeName));
    } else {
      setSelectedThemes([...selectedThemes, themeName]);
    }
    setThemeSearch("");
  };

  // Pre-populate user details
  useEffect(() => {
    if (user) {
      if (!contactEmail) setContactEmail(user.email ?? "");
      if (!authorName) {
        setAuthorName(
          profile?.fullName || user.user_metadata?.name || user.email?.split("@")[0] || "",
        );
      }
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

  const validateImageFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["jpg", "jpeg", "png", "webp", "avif"];

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || "")) {
      return `Invalid file type for "${file.name}". Allowed types are: JPG, JPEG, PNG, WEBP, AVIF.`;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return `File "${file.name}" exceeds the maximum size limit of 10MB (actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!session) throw new Error("No session found. Please sign in.");

    const formData = new FormData();
    formData.append("files", file);

    console.log(
      `[Upload Client] Requesting upload for file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`,
    );

    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      let errMsg = `Upload failed with status code ${res.status}`;
      try {
        const errData = await res.json();
        errMsg = errData.error || errMsg;
      } catch (_) {}
      throw new Error(errMsg);
    }

    const data = await res.json();
    const uploadedUrl = data.files?.[0]?.url;
    if (!uploadedUrl) {
      throw new Error("Server succeeded but did not return any media URL.");
    }

    return uploadedUrl;
  };

  const uploadFileWithRetry = async (file: File): Promise<string> => {
    let attempts = 0;
    while (attempts < 2) {
      try {
        const url = await uploadFile(file);
        return url;
      } catch (err: any) {
        attempts++;
        if (attempts >= 2) {
          throw err;
        }
        console.warn(
          `[Upload Client] Attempt 1 failed for ${file.name}. Retrying once. Error:`,
          err,
        );
      }
    }
    throw new Error("Upload failed after retry");
  };

  const performCoverImageUpload = async (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    setUploadingCover(true);
    setCoverUploadError(null);
    setCoverUploadSuccess(false);

    try {
      console.log(`[Upload Cover] Uploading: ${file.name}`);
      const url = await uploadFileWithRetry(file);
      setCoverImage(url);
      setCoverUploadSuccess(true);
      console.log(`[Upload Cover] Successfully uploaded: ${url}`);
    } catch (err: any) {
      console.error(`[Upload Cover] Failed to upload ${file.name}:`, err);
      setCoverUploadError(err.message || "Failed to upload cover image.");
      alert(`Cover upload failed: ${err.message}`);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await performCoverImageUpload(file);
  };

  const performGalleryUpload = async (fileList: File[]) => {
    for (const file of fileList) {
      const validationError = validateImageFile(file);
      if (validationError) {
        alert(validationError);
        return;
      }
    }

    setUploadingGallery(true);
    setGalleryUploadError(null);
    setGalleryUploadSuccess(false);

    try {
      console.log(`[Upload Gallery] Uploading ${fileList.length} files in parallel`);
      const uploadPromises = fileList.map((file) => uploadFileWithRetry(file));
      const urls = await Promise.all(uploadPromises);

      setGalleryImages((prev) => [...prev, ...urls]);
      setGalleryUploadSuccess(true);
      console.log(`[Upload Gallery] Successfully uploaded:`, urls);
    } catch (err: any) {
      console.error(`[Upload Gallery] Failed to upload gallery:`, err);
      setGalleryUploadError(err.message || "Failed to upload gallery images.");
      alert(`Gallery upload failed: ${err.message}`);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await performGalleryUpload(Array.from(files));
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 20 * 1024 * 1024; // 20MB for video
    if (file.size > maxSize) {
      alert("Video file size cannot exceed 20MB.");
      return;
    }

    setUploadingVideo(true);
    setVideoUploadError(null);
    setVideoUploadSuccess(false);

    try {
      console.log(`[Upload Video] Uploading: ${file.name}`);
      const url = await uploadFileWithRetry(file);
      setVideoUrl(url);
      setVideoUploadSuccess(true);
      console.log(`[Upload Video] Successfully uploaded: ${url}`);
    } catch (err: any) {
      console.error(`[Upload Video] Failed to upload ${file.name}:`, err);
      setVideoUploadError(err.message || "Failed to upload video file.");
      alert(`Video upload failed: ${err.message}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent | null, isDraft = false) => {
    if (e) e.preventDefault();
    if (!session) return;
    if (uploadingCover || uploadingGallery || uploadingVideo) {
      setErrorMessage("Please wait for all image and video uploads to complete before submitting.");
      return;
    }

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
          themes: selectedThemes.join(", "),
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
          // Clear local autosave draft
          localStorage.removeItem("isp_autosave_story_draft");
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
    setSelectedThemes(["Heritage"]);
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
    setActiveStep(0);
  };

  const autoSlug = title
    ? "/stories/" +
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
    : "";

  const stepsList = [
    { label: "Core details", icon: Sparkles },
    { label: "Content", icon: FileText },
    { label: "Visual Media", icon: ImageIcon },
    { label: "Verification & SEO", icon: Shield },
  ];

  const handleNextStep = () => {
    if (activeStep === 0) {
      if (!title.trim()) {
        setErrorMessage("Please enter a story title to proceed.");
        return;
      }
      if (!district.trim()) {
        setErrorMessage("Please specify the district or city.");
        return;
      }
      if (selectedThemes.length === 0) {
        setErrorMessage("Please select at least one theme.");
        return;
      }
    }
    if (activeStep === 1) {
      if (!summary.trim()) {
        setErrorMessage("Please write a story summary.");
        return;
      }
      if (!story.trim()) {
        setErrorMessage("Please write the full story text.");
        return;
      }
    }
    setErrorMessage(null);
    setActiveStep((prev) => Math.min(prev + 1, stepsList.length - 1));
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  if (authLoading) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-neutral-950">
          <div className="text-center space-y-4">
            <Loader2 className="size-8 animate-spin text-red-500 mx-auto" />
            <p className="text-neutral-450 font-sans text-sm">Loading…</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="bg-neutral-950 text-white min-h-screen relative overflow-hidden font-sans">
        
        {/* ─── Parallax Animated Heritage Elements (Branding CSS) ─── */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Saffron and Gold ambient blur blobs */}
          <div className="absolute top-1/4 left-10 size-72 rounded-full bg-red-900/10 blur-[80px]" />
          <div className="absolute bottom-1/3 right-10 size-[320px] rounded-full bg-amber-900/10 blur-[100px]" />
          
          {/* Floating Line Art / Feathers or Clouds outline elements */}
          <motion.div
            animate={{
              y: [0, -18, 0],
              rotate: [0, 4, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-24 right-20 size-24 opacity-15 text-red-500"
          >
            <Feather className="size-full" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -6, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-32 left-16 size-20 opacity-10 text-amber-500"
          >
            <Globe className="size-full" />
          </motion.div>
        </div>

        {/* ─── Hero Section (Cinematic Feel) ─── */}
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-28 border-b border-neutral-900 z-10">
          <div className="container mx-auto px-6 relative text-center max-w-4xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-950/40 border border-red-500/20 text-[10px] uppercase tracking-widest text-red-400 font-sans font-bold shadow-md"
            >
              <Feather className="size-3.5" />
              India Story Project — Open Submissions
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight"
            >
              Your Story Can
              <br />
              <span className="text-gradient-gold italic font-serif">Inspire Millions</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-sm sm:text-base md:text-lg text-neutral-300 leading-relaxed font-sans max-w-2xl mx-auto"
            >
              Across every corner of India, unsung heroes, creative pioneers, and grassroots
              innovators are shaping tomorrow. Be part of documenting modern India's transformation
              — one authentic voice at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4"
            >
              <a
                href="#submission-form"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs uppercase tracking-widest h-12 px-8 rounded-full shadow-lg hover:shadow-red-500/20 transition-all duration-300"
              >
                <PenLine className="size-4" />
                Submit Your Story
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-neutral-800 hover:border-red-500/40 text-neutral-300 hover:text-white font-sans font-semibold text-xs h-12 px-8 rounded-full transition-all duration-300 bg-neutral-900/30"
              >
                <BookOpen className="size-4" />
                How It Works
              </a>
            </motion.div>
          </div>
        </section>

        {/* ─── Why Share Your Story ─── */}
        <section className="py-20 border-b border-neutral-900 relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-red-500">
              Why Contribute
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">
              Why Share Your Story?
            </h2>
            <p className="text-neutral-400 font-sans max-w-xl mx-auto text-xs leading-relaxed">
              Every voice matters. Every story creates ripples. Here's why contributors choose the India Story Project.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyShareReasons.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-neutral-900/80 rounded-2xl p-6.5 border border-neutral-850 hover:border-red-500/40 hover:shadow-md transition-all duration-350 group"
              >
                <div className="size-11 rounded-xl bg-red-950/30 border border-red-500/15 flex items-center justify-center text-red-500 mb-5 group-hover:bg-red-950/60 transition-colors">
                  <reason.icon className="size-4.5" />
                </div>
                <h3 className="font-display font-bold text-sm text-white mb-2">
                  {reason.title}
                </h3>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  {reason.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section id="how-it-works" className="py-20 border-b border-neutral-900 relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-red-500">
              Editorial Process
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-neutral-400 font-sans max-w-xl mx-auto text-xs leading-relaxed">
              Every story goes through our rigorous 5-stage editorial review to ensure quality, accuracy, and impact.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {processSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="relative rounded-2xl bg-neutral-900/60 border border-neutral-850 p-5.5 hover:border-red-500/40 transition-all duration-300 group"
              >
                <span className="font-display text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors absolute top-4 right-4 leading-none select-none">
                  {step.num}
                </span>

                <div className={`size-9 rounded-lg bg-neutral-800 flex items-center justify-center mb-4 ${step.accent}`}>
                  <step.icon className="size-4.5" />
                </div>
                <h4 className="font-sans font-bold text-xs text-white mb-2">{step.name}</h4>
                <p className="text-[10px] text-neutral-350 font-sans leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Submission Guidelines & Rewards ─── */}
        <section className="py-20 border-b border-neutral-900 relative z-10 max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-red-500">
                Standards
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                Submission Guidelines
              </h2>
              <p className="text-neutral-400 font-sans text-xs leading-relaxed">
                We maintain high editorial standards to ensure every story we publish is accurate, impactful, and honors the subject.
              </p>
              <ul className="space-y-2.5">
                {guidelines.map((g, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 text-xs font-sans text-neutral-300"
                  >
                    <span className="mt-0.5 size-4 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center shrink-0">
                      <Check className="size-2 text-red-500" />
                    </span>
                    {g}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* What you earn rewards block */}
            <div className="bg-neutral-900/90 rounded-2xl p-7 border border-neutral-850 shadow-md">
              <h3 className="font-display text-base font-bold text-white mb-6 flex items-center gap-2">
                <Star className="size-4.5 text-red-500" />
                What You Earn
              </h3>
              <div className="space-y-4">
                {[
                  { icon: Award, label: "+20 XP Points", desc: "For every accepted submission" },
                  { icon: Star, label: "Contributor Badge", desc: "Displayed on your profile" },
                  { icon: BookOpen, label: "Author Byline", desc: "Credit on every published story" },
                  { icon: Users, label: "Community Access", desc: "Join our inner circle of storytellers" },
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="size-9 rounded-lg bg-red-950/40 border border-red-500/15 flex items-center justify-center text-red-500 shrink-0">
                      <b.icon className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-sans font-semibold text-white">
                        {b.label}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-sans">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Submission Form Wizard (Red + White Styling) ─── */}
        <section id="submission-form" className="py-20 relative z-10 max-w-3xl mx-auto px-6">
          
          <div className="text-center mb-10 space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-red-500">
              Submit Your Work
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">Tell Your Story</h2>
            <p className="text-neutral-400 font-sans max-w-md mx-auto text-xs leading-relaxed">
              {user
                ? `Welcome, ${profile?.fullName || user.email?.split("@")[0] || "Contributor"}. Submit your work below.`
                : "Sign in to access the submission form. Only authenticated contributors can submit stories."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!user ? (
              /* ─── Auth Wall ─── */
              <motion.div
                key="auth-required"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-neutral-900 rounded-2xl border border-neutral-850 overflow-hidden shadow-xl"
              >
                <div className="h-1 bg-red-600" />
                <div className="p-8 md:p-12 text-center space-y-6">
                  <div className="size-14 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center mx-auto">
                    <Lock className="size-5 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold text-white">
                      Sign in to Continue
                    </h3>
                    <p className="text-xs text-neutral-450 font-sans max-w-xs mx-auto leading-relaxed">
                      Only authenticated contributors can submit stories to our living archive.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3.5 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-400 font-sans">
                      {loginError}
                    </div>
                  )}

                  <div className="max-w-xs mx-auto space-y-4 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 rounded-xl border-neutral-800 bg-neutral-950 hover:bg-neutral-900 font-sans text-xs font-semibold gap-3 text-white transition-all"
                      onClick={handleGoogleLogin}
                      disabled={loginLoading}
                    >
                      {loginLoading ? (
                        <Loader2 className="size-4 animate-spin text-red-500" />
                      ) : (
                        <Chrome className="size-4" />
                      )}
                      Continue with Google
                    </Button>

                    <div className="relative flex items-center gap-3">
                      <div className="flex-grow border-t border-neutral-850" />
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-sans font-bold">
                        or email
                      </span>
                      <div className="flex-grow border-t border-neutral-850" />
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-3.5">
                      <div className="space-y-1.5 text-left">
                        <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-10 font-sans text-xs rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <Label htmlFor="password" className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-10 font-sans text-xs rounded-xl"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white h-10 font-sans text-xs uppercase tracking-widest font-bold rounded-xl"
                        disabled={loginLoading}
                      >
                        {loginLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                        Sign In
                      </Button>
                    </form>

                    <p className="text-xs text-neutral-450 font-sans">
                      Don't have an account?{" "}
                      <Link to="/login" className="text-red-500 hover:underline">
                        Create one
                      </Link>
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : done ? (
              /* ─── Success State ─── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-neutral-900 rounded-2xl border border-neutral-850 overflow-hidden shadow-xl"
              >
                <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
                <div className="p-10 md:p-14 text-center space-y-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                    className="size-16 rounded-full bg-red-600 flex items-center justify-center mx-auto shadow-md"
                  >
                    <Check className="size-7 text-white" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-bold text-white">
                      Story Submitted!
                    </h3>
                    <p className="text-neutral-300 font-sans max-w-sm mx-auto text-xs leading-relaxed">
                      Namaste! Your story has entered our editorial queue. Our team will review it within 5–7 working days.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-sans text-[10px] font-bold uppercase tracking-wider">
                    <Star className="size-3" />
                    +20 XP Earned
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button
                      onClick={handleReset}
                      className="bg-red-600 hover:bg-red-700 text-white font-sans text-xs uppercase tracking-widest font-bold h-11 px-6 rounded-xl"
                    >
                      <PenLine className="size-4 mr-2" />
                      Share Another Story
                    </Button>
                    <Link to="/">
                      <Button
                        variant="outline"
                        className="h-11 px-6 rounded-xl border-neutral-800 bg-neutral-950 text-white font-sans text-xs uppercase tracking-widest hover:bg-neutral-900"
                      >
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ─── Submission Form Wizard ─── */
              <motion.div
                key="submission-wizard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900 rounded-2xl border border-neutral-850 overflow-hidden shadow-xl"
              >
                <div className="h-1 bg-red-600" />
                
                {/* Stepper Wizard Indicator */}
                <div className="px-6 pt-6 pb-4 border-b border-neutral-850 bg-neutral-950/20">
                  <div className="flex items-center justify-between gap-2.5">
                    {stepsList.map((st, idx) => {
                      const isActive = idx === activeStep;
                      const isComplete = idx < activeStep;
                      return (
                        <div key={idx} className="flex-1 flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (isComplete) setActiveStep(idx);
                            }}
                            className={`flex items-center gap-1.5 focus:outline-none text-[10px] uppercase font-bold tracking-wider ${
                              isActive ? "text-red-500" : isComplete ? "text-neutral-200" : "text-neutral-500"
                            }`}
                          >
                            <span className={`size-6 rounded-full border flex items-center justify-center shrink-0 text-[10px] ${
                              isComplete ? "bg-red-600 border-red-600 text-white" : isActive ? "border-red-500/50 bg-red-500/10 text-red-500" : "border-neutral-800 text-neutral-500"
                            }`}>
                              {isComplete ? <Check className="size-3.5" /> : idx + 1}
                            </span>
                            <span className="hidden sm:inline">{st.label}</span>
                          </button>
                          {idx < stepsList.length - 1 && (
                            <div className={`flex-1 h-px ml-2.5 mr-1 ${idx < activeStep ? "bg-red-600" : "bg-neutral-850"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Slim progress bar */}
                  <div className="w-full h-1 bg-neutral-850 rounded-full overflow-hidden mt-4">
                    <motion.div
                      className="h-full bg-red-600"
                      animate={{ width: `${((activeStep + 1) / stepsList.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="p-6 md:p-10 space-y-6">
                  
                  {/* Status Banner messages */}
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-400 font-sans">
                      {errorMessage}
                    </div>
                  )}

                  {draftSaved && (
                    <div className="p-3.5 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans flex items-center gap-2">
                      <Check className="size-4" />
                      <span>Draft saved successfully! You can continue editing.</span>
                    </div>
                  )}

                  {/* Wizard content */}
                  {isPreview ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-neutral-850 pb-4">
                        <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                          <Sparkles className="size-4 text-red-500" />
                          Story Preview
                        </h3>
                        <Button
                          type="button"
                          onClick={() => setIsPreview(false)}
                          variant="outline"
                          className="h-8 px-3 rounded-lg border-neutral-800 bg-neutral-950 text-xs font-sans text-white hover:bg-neutral-900"
                        >
                          Back to Editor
                        </Button>
                      </div>

                      <div className="space-y-4 max-w-2xl mx-auto py-2">
                        {coverImage && (
                          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
                            <img src={coverImage} className="w-full h-full object-cover" alt="Cover Preview" />
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-[9px] tracking-wider uppercase font-bold text-red-400 font-sans">
                            {selectedThemes.map((t, idx) => (
                              <span key={idx} className="bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                            <span>•</span>
                            <span>{stateName}{district ? `, ${district}` : ""}</span>
                            <span>•</span>
                            <span>{language === "hi" ? "हिन्दी" : "English"}</span>
                          </div>
                          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">
                            {title || "Untitled Story"}
                          </h1>
                          {heroName && (
                            <p className="text-xs font-sans text-neutral-400 italic">
                              Subject: <span className="text-red-500 font-bold not-italic">{heroName}</span>
                            </p>
                          )}
                          <p className="text-[10px] text-neutral-400">
                            By {authorName || "Anonymous Contributor"}
                          </p>
                        </div>

                        <div className="border-l-2 border-red-600 pl-4 py-0.5">
                          <p className="text-xs text-neutral-350 italic font-sans leading-relaxed">
                            {summary || "No summary excerpt provided."}
                          </p>
                        </div>

                        <div className="text-xs sm:text-sm text-neutral-200 font-sans leading-relaxed whitespace-pre-wrap pt-4 border-t border-neutral-850">
                          {story || "Write your story of change..."}
                        </div>

                        {videoUrl && (
                          <div className="pt-3 border-t border-neutral-850">
                            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-sans font-bold mb-1">
                              Video Link
                            </p>
                            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 underline break-all font-semibold">
                              {videoUrl}
                            </a>
                          </div>
                        )}

                        {externalLinks && (
                          <div className="pt-3 border-t border-neutral-850">
                            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-sans font-bold mb-1">
                              References
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {externalLinks.split(",").map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.trim()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] bg-neutral-950 border border-neutral-800 px-2 py-1 rounded text-neutral-300 hover:text-red-500"
                                >
                                  {link.trim()}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-neutral-850 flex gap-3 justify-end">
                        <Button
                          type="button"
                          onClick={() => setIsPreview(false)}
                          variant="outline"
                          className="h-10 px-4 rounded-xl border-neutral-800 text-white hover:bg-neutral-900 text-xs uppercase tracking-widest"
                        >
                          Keep Editing
                        </Button>
                        <Button
                          type="button"
                          onClick={() => void handleSubmit(null, false)}
                          className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white font-sans uppercase tracking-widest text-xs font-bold rounded-xl"
                          disabled={submitLoading}
                        >
                          {submitLoading ? "Submitting..." : "Submit Story"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Step Forms */}
                      <AnimatePresence mode="wait">
                        {activeStep === 0 && (
                          <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                          >
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-850 pb-2">
                              Step 1: Core Details
                            </h3>
                            
                            <div className="grid sm:grid-cols-2 gap-5">
                              <div className="space-y-2">
                                <Label htmlFor="title" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                  Story Title *
                                </Label>
                                <Input
                                  id="title"
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                  placeholder="e.g. The Tree-Man of Jodhpur"
                                  className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-11 rounded-xl text-xs"
                                />
                                {title && (
                                  <p className="text-[9px] text-neutral-400 truncate">
                                    Slug preview: <span className="text-red-500 font-semibold">{autoSlug}</span>
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="heroName" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                  Hero / Subject Name
                                </Label>
                                <Input
                                  id="heroName"
                                  value={heroName}
                                  onChange={(e) => setHeroName(e.target.value)}
                                  placeholder="e.g. Ranaram Bishnoi"
                                  className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-11 rounded-xl text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-5">
                              <div className="space-y-2 relative" ref={themeDropdownRef}>
                                <Label className="text-[10px] uppercase font-bold tracking-wider text-neutral-350 block">
                                  Themes *
                                </Label>
                                <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 flex flex-wrap gap-1.5 min-h-[44px] items-center">
                                  {selectedThemes.map((t) => (
                                    <span
                                      key={t}
                                      className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 font-sans"
                                    >
                                      {t}
                                      <button
                                        type="button"
                                        onClick={() => toggleTheme(t)}
                                        className="hover:text-red-400 font-bold ml-0.5 text-[9px]"
                                      >
                                        ✕
                                      </button>
                                    </span>
                                  ))}
                                  <input
                                    type="text"
                                    placeholder={selectedThemes.length === 0 ? "Select themes..." : "Add theme..."}
                                    value={themeSearch}
                                    onChange={(e) => {
                                      setThemeSearch(e.target.value);
                                      setShowThemeDropdown(true);
                                    }}
                                    onFocus={() => setShowThemeDropdown(true)}
                                    className="bg-transparent border-none outline-none flex-1 min-w-[70px] text-white text-xs p-0"
                                  />
                                </div>
                                {showThemeDropdown && (
                                  <div className="absolute z-50 w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                                    {allThemes
                                      .filter(
                                        (t) =>
                                          t.toLowerCase().includes(themeSearch.toLowerCase()) &&
                                          !selectedThemes.includes(t),
                                      )
                                      .map((t) => (
                                        <button
                                          key={t}
                                          type="button"
                                          onClick={() => {
                                            toggleTheme(t);
                                            setShowThemeDropdown(false);
                                          }}
                                          className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-850 text-white transition-colors"
                                        >
                                          {t}
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="stateName" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                  State *
                                </Label>
                                <select
                                  id="stateName"
                                  value={stateName}
                                  onChange={(e) => setStateName(e.target.value)}
                                  className="w-full bg-neutral-950 border border-neutral-800 text-white h-11 px-3 rounded-xl text-xs outline-none focus:border-red-500/50"
                                >
                                  {STATES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="district" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                  District / City *
                                </Label>
                                <Input
                                  id="district"
                                  value={district}
                                  onChange={(e) => setDistrict(e.target.value)}
                                  placeholder="e.g. Jodhpur"
                                  className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-11 rounded-xl text-xs"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="language" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                Language *
                              </Label>
                              <select
                                id="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 text-white h-11 px-3 rounded-xl text-xs outline-none focus:border-red-500/50"
                              >
                                <option value="en">English</option>
                                <option value="hi">Hindi (हिन्दी)</option>
                              </select>
                            </div>
                          </motion.div>
                        )}

                        {activeStep === 1 && (
                          <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                          >
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-850 pb-2">
                              Step 2: Story Content
                            </h3>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label htmlFor="summary" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                  Story Summary *
                                </Label>
                                <span className={`text-[9px] font-bold ${summary.length > 250 ? "text-red-500" : "text-neutral-550"}`}>
                                  {summary.length} / 250 chars
                                </span>
                              </div>
                              <Textarea
                                id="summary"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value.slice(0, 300))}
                                placeholder="Write a brief 1-2 sentence preview summary of the story..."
                                rows={3}
                                className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 rounded-xl text-xs resize-none"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label htmlFor="story" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                  Full Story * (Markdown supported)
                                </Label>
                                <span className="text-[9px] text-neutral-450 uppercase font-bold">
                                  Words: {story.trim() ? story.trim().split(/\s+/).length : 0}
                                </span>
                              </div>
                              <Textarea
                                id="story"
                                value={story}
                                onChange={(e) => setStory(e.target.value)}
                                placeholder="Describe the change, the innovator, or the tradition in full detail here..."
                                rows={10}
                                className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 rounded-xl text-xs leading-relaxed resize-none"
                              />
                            </div>
                          </motion.div>
                        )}

                        {activeStep === 2 && (
                          <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-850 pb-2">
                              Step 3: Visual Media
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-6">
                              {/* Drag and Drop Cover Image */}
                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-wider text-neutral-350 block">
                                  Cover Image
                                </Label>
                                <div
                                  onDragOver={(e) => { e.preventDefault(); setIsDragOverCover(true); }}
                                  onDragLeave={() => setIsDragOverCover(false)}
                                  onDrop={async (e) => {
                                    e.preventDefault();
                                    setIsDragOverCover(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) await performCoverImageUpload(file);
                                  }}
                                  className={`border-2 border-dashed rounded-2xl min-h-[150px] flex flex-col items-center justify-center transition-all overflow-hidden relative ${
                                    isDragOverCover ? "border-red-500 bg-red-950/10" : "border-neutral-800 hover:border-red-500/30"
                                  }`}
                                >
                                  {coverImage ? (
                                    <div className="relative group w-full h-full aspect-[16/10]">
                                      <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                        <button
                                          type="button"
                                          onClick={() => setCoverImage("")}
                                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md"
                                          title="Remove Cover Image"
                                        >
                                          <Trash2 className="size-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : uploadingCover ? (
                                    <div className="text-center text-xs text-neutral-400 space-y-1.5">
                                      <Loader2 className="size-6 animate-spin text-red-500 mx-auto" />
                                      <span>Uploading to Cloudinary...</span>
                                    </div>
                                  ) : (
                                    <label className="cursor-pointer p-4 text-center flex flex-col items-center text-neutral-400 hover:text-white transition-colors w-full h-full justify-center">
                                      <UploadCloud className="size-7 text-neutral-500 mb-2" />
                                      <span className="text-xs font-semibold">Drag & drop cover photo here</span>
                                      <span className="text-[9px] text-neutral-550 mt-0.5">or click to browse from files</span>
                                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                                    </label>
                                  )}
                                </div>
                                {coverUploadError && <p className="text-[10px] text-red-500 mt-1 font-semibold">{coverUploadError}</p>}
                                {coverImage && coverUploadSuccess && (
                                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                                    <span className="size-1.5 rounded-full bg-emerald-400" /> ✓ Cover image ready
                                  </p>
                                )}
                              </div>

                              {/* Drag and drop gallery images */}
                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-wider text-neutral-350 block">
                                  Gallery Photos (Optional)
                                </Label>
                                <div
                                  onDragOver={(e) => { e.preventDefault(); setIsDragOverGallery(true); }}
                                  onDragLeave={() => setIsDragOverGallery(false)}
                                  onDrop={async (e) => {
                                    e.preventDefault();
                                    setIsDragOverGallery(false);
                                    const files = e.dataTransfer.files;
                                    if (files && files.length > 0) {
                                      await performGalleryUpload(Array.from(files));
                                    }
                                  }}
                                  className={`border-2 border-dashed rounded-2xl min-h-[150px] flex flex-col items-center justify-center transition-all ${
                                    isDragOverGallery ? "border-red-500 bg-red-950/10" : "border-neutral-800 hover:border-red-500/30"
                                  }`}
                                >
                                  {uploadingGallery ? (
                                    <div className="text-center text-xs text-neutral-400 space-y-1.5">
                                      <Loader2 className="size-6 animate-spin text-red-500 mx-auto" />
                                      <span>Uploading gallery...</span>
                                    </div>
                                  ) : (
                                    <label className="cursor-pointer p-4 text-center flex flex-col items-center text-neutral-400 hover:text-white transition-colors w-full h-full justify-center">
                                      <ImageIcon className="size-7 text-neutral-500 mb-2" />
                                      <span className="text-xs font-semibold">Drag & drop multiple photos</span>
                                      <span className="text-[9px] text-neutral-550 mt-0.5">or click to browse files</span>
                                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                                    </label>
                                  )}
                                </div>
                                {galleryImages.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {galleryImages.map((img, i) => (
                                      <div key={i} className="relative group size-10 rounded-lg overflow-hidden border border-neutral-800">
                                        <img src={img} className="size-full object-cover" />
                                        <button
                                          type="button"
                                          onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                                          className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Trash2 className="size-3" />
                                        </button>
                                      </div>
                                    ))}
                                    <span className="text-[9px] uppercase font-bold text-red-400 self-center ml-1">{galleryImages.length} uploaded</span>
                                  </div>
                                )}
                                {galleryUploadError && <p className="text-[10px] text-red-500 mt-1 font-semibold">{galleryUploadError}</p>}
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5 pt-2">
                              <div className="space-y-2">
                                <Label htmlFor="video" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350 block">
                                  Video Attachment (Optional Youtube/Vimeo or File)
                                </Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="video"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="Link (e.g. Youtube URL)"
                                    className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-10 text-xs"
                                  />
                                  <label className="h-10 bg-neutral-800 hover:bg-neutral-750 border border-neutral-800 px-4 rounded-xl flex items-center justify-center cursor-pointer text-white shrink-0">
                                    {uploadingVideo ? (
                                      <Loader2 className="size-4 animate-spin text-red-500" />
                                    ) : (
                                      <Video className="size-4 text-red-500" />
                                    )}
                                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                                  </label>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="tags" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                  Tags / Keywords <span className="normal-case text-neutral-500 font-semibold">(comma-separated)</span>
                                </Label>
                                <Input
                                  id="tags"
                                  value={tags}
                                  onChange={(e) => setTags(e.target.value)}
                                  placeholder="e.g. solar, water harvesting, rajasthan"
                                  className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-10 text-xs"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeStep === 3 && (
                          <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-850 pb-2">
                              Step 4: Verification & SEO settings
                            </h3>

                            <div className="grid sm:grid-cols-3 gap-5">
                              <div className="space-y-2">
                                <Label htmlFor="authorName" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                  Your Name
                                </Label>
                                <Input
                                  id="authorName"
                                  value={authorName}
                                  onChange={(e) => setAuthorName(e.target.value)}
                                  placeholder="Author Name"
                                  className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-11 rounded-xl text-xs"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="contactEmail" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                  Contact Email *
                                </Label>
                                <Input
                                  id="contactEmail"
                                  type="email"
                                  value={contactEmail}
                                  onChange={(e) => setContactEmail(e.target.value)}
                                  placeholder="your@email.com"
                                  className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-11 rounded-xl text-xs"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                  Phone Number (Optional)
                                </Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="e.g. +91 98765 43210"
                                  className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-11 rounded-xl text-xs"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="externalLinks" className="text-[10px] uppercase font-bold tracking-wider text-neutral-350">
                                Reference Links / Sources
                              </Label>
                              <Input
                                id="externalLinks"
                                value={externalLinks}
                                onChange={(e) => setExternalLinks(e.target.value)}
                                placeholder="Separated by comma (e.g. wikipedia link, news article)"
                                className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-10 text-xs"
                              />
                            </div>

                            {/* SEO settings card container */}
                            <div className="border border-neutral-800 rounded-xl p-4 bg-neutral-950/40 space-y-4">
                              <button
                                type="button"
                                onClick={() => setShowSEO(!showSEO)}
                                className="w-full flex items-center justify-between text-left text-[10px] uppercase tracking-wider text-neutral-300 font-sans font-bold hover:text-white transition-colors"
                              >
                                <span className="flex items-center gap-1.5">
                                  <Info className="size-4 text-red-500" />
                                  Google SEO Metadata Options
                                </span>
                                <span className="text-[10px] text-red-500 font-bold uppercase">
                                  {showSEO ? "Hide [-]" : "Configure [+]"}
                                </span>
                              </button>
                              
                              {showSEO && (
                                <div className="space-y-4 pt-3 border-t border-neutral-800">
                                  <div className="space-y-1.5">
                                    <Label htmlFor="seoTitle" className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                                      SEO Page Title
                                    </Label>
                                    <Input
                                      id="seoTitle"
                                      value={seoTitle}
                                      onChange={(e) => setSeoTitle(e.target.value)}
                                      placeholder="Custom title showing on search engine page"
                                      className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-10 text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label htmlFor="seoDescription" className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                                      SEO Description Excerpt
                                    </Label>
                                    <Textarea
                                      id="seoDescription"
                                      value={seoDescription}
                                      onChange={(e) => setSeoDescription(e.target.value.slice(0, 160))}
                                      placeholder="Meta description (ideally under 160 characters)"
                                      rows={2}
                                      className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 text-xs resize-none"
                                    />
                                    <span className="text-[8px] text-neutral-500 float-right font-bold mt-0.5">
                                      {seoDescription.length} / 160 chars
                                    </span>
                                  </div>
                                  <div className="space-y-1.5 pt-2">
                                    <Label htmlFor="seoKeywords" className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                                      SEO Meta Keywords
                                    </Label>
                                    <Input
                                      id="seoKeywords"
                                      value={seoKeywords}
                                      onChange={(e) => setSeoKeywords(e.target.value)}
                                      placeholder="e.g. water project, jodhpur, bishnoi community"
                                      className="bg-neutral-950 border-neutral-800 focus:border-red-500/50 h-10 text-xs"
                                    />
                                  </div>

                                  {/* Dynamic Google Search preview mockup */}
                                  <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-4 text-left space-y-1.5">
                                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1">
                                      <Info className="size-3" />
                                      Google Search Snippet Preview
                                    </span>
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] text-neutral-400 block truncate">
                                        https://www.indiastoryproject.com{autoSlug}
                                      </span>
                                      <span className="text-sm font-semibold text-[#8ab4f8] hover:underline cursor-pointer block leading-tight truncate">
                                        {seoTitle || title || "India Story Project — Experience India's Stories"}
                                      </span>
                                      <p className="text-xs text-[#bdc1c6] font-sans leading-relaxed line-clamp-2">
                                        {seoDescription || summary || "A premium storytelling platform celebrating the changemakers, innovators, and unsung heroes shaping modern India."}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Footer Actions (Next / Prev / Submit) */}
                      <div className="pt-6 border-t border-neutral-850 flex flex-col sm:flex-row gap-3">
                        <Button
                          type="button"
                          onClick={() => void handleSubmit(null, true)}
                          variant="outline"
                          className="w-full sm:w-auto h-11 border-neutral-800 bg-neutral-950 text-white hover:bg-neutral-900 uppercase tracking-widest text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                          disabled={submitLoading || uploadingCover || uploadingGallery || uploadingVideo}
                        >
                          <FileText className="size-4 text-red-500" />
                          Save Draft
                        </Button>

                        <div className="flex-1 flex gap-3 sm:justify-end">
                          {activeStep > 0 && (
                            <Button
                              type="button"
                              onClick={handlePrevStep}
                              variant="outline"
                              className="w-1/2 sm:w-auto h-11 border-neutral-800 bg-neutral-950 text-white hover:bg-neutral-900 uppercase tracking-widest text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                            >
                              <ArrowLeft className="size-4" />
                              Back
                            </Button>
                          )}
                          
                          {activeStep < stepsList.length - 1 ? (
                            <Button
                              type="button"
                              onClick={handleNextStep}
                              className="w-1/2 sm:flex-1 md:max-w-[200px] h-11 bg-red-600 hover:bg-red-700 text-white uppercase tracking-widest text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                            >
                              Next
                              <ArrowRight className="size-4" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                type="button"
                                onClick={() => setIsPreview(true)}
                                variant="outline"
                                className="w-1/2 sm:w-auto h-11 border-neutral-800 bg-neutral-950 text-white hover:bg-neutral-900 uppercase tracking-widest text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                              >
                                <Eye className="size-4 text-red-500" />
                                Preview
                              </Button>
                              <Button
                                type="button"
                                onClick={() => void handleSubmit(null, false)}
                                className="w-1/2 sm:flex-1 md:max-w-[200px] h-11 bg-red-600 hover:bg-red-700 text-white uppercase tracking-widest text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                                disabled={submitLoading || uploadingCover || uploadingGallery || uploadingVideo}
                              >
                                {submitLoading ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <>
                                    Submit
                                    <Check className="size-4" />
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-center text-[10px] text-neutral-450 font-sans mt-4">
                    By submitting, you agree to our editorial guidelines and confirm this content is original.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ─── FAQ Section ─── */}
        <section className="py-20 border-t border-neutral-900 relative z-10 max-w-3xl mx-auto px-6">
          <div className="text-center mb-10 space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-red-500">
              Questions
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">Frequently Asked</h2>
          </div>
          <div className="bg-neutral-900/90 rounded-2xl border border-neutral-850 px-6 py-2 shadow-lg">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="py-24 relative z-10 max-w-3xl mx-auto px-6 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Feather className="size-8 text-red-500 mx-auto" />
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Every Story Matters.
              <br />
              <span className="text-gradient-gold italic font-serif">Yours Does Too.</span>
            </h2>
            <p className="text-neutral-350 font-sans text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Don't let the stories of real India go untold. Join hundreds of contributors who are building the most authentic digital archive of Bharat.
            </p>
            <a
              href="#submission-form"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs uppercase tracking-widest h-12 px-8 rounded-full shadow-lg transition-all duration-300"
            >
              <PenLine className="size-4" />
              Start Writing Now
            </a>
          </motion.div>
        </section>

      </div>
    </SiteLayout>
  );
}
