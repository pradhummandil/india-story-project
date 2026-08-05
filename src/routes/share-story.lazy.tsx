import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useId } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  UploadCloud,
  FileText,
  User,
  Mail,
  Globe,
  MapPin,
  Image as ImageIcon,
  Video,
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
  Trash2,
  Info,
  Calendar,
  Send,
  X,
  AlertCircle,
  Phone,
  Compass,
  Palette,
  Leaf,
  Flame,
  Music,
  Landmark,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/Layout";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase-client";
import { themes as defaultThemes } from "@/lib/stories-data";
import { useI18nStore, uiText } from "@/lib/i18n";
import { StoryCard, type Story } from "@/components/site/StoryCard";
import { TiltCard } from "@/components/site/TiltCard";

export const Route = createLazyFileRoute("/share-story")({
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

const CATEGORY_ITEMS = [
  { name: "Heritage", icon: Landmark, desc: "Ancient lore, monuments, architecture & oral histories" },
  { name: "Innovation", icon: Zap, desc: "Grassroots tech, rural inventions & smart solutions" },
  { name: "Culture", icon: Palette, desc: "Folk arts, festivals, rituals & traditional wisdom" },
  { name: "Social Change", icon: Users, desc: "Community leaders, education & reform initiatives" },
  { name: "Environment", icon: Leaf, desc: "Water harvesting, afforestation & eco-conservation" },
  { name: "Arts & Crafts", icon: Music, desc: "Master artisans, handlooms & endangered crafts" },
  { name: "Courage & Resilience", icon: Shield, desc: "Overcoming hardship, bravery & inspirational spirit" },
  { name: "Wildlife & Nature", icon: Compass, desc: "Biodiversity preservation, flora, fauna & guardians" },
];

const whyShareReasonsEn = [
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

const whyShareReasonsHi = [
  {
    icon: Heart,
    title: "सकारात्मक बदलाव को प्रेरित करें",
    desc: "किसी स्थानीय नायक या जमीनी नवप्रवर्तक की आपकी कहानी देश भर के लाखों पाठकों में बदलाव की अलख जगा सकती है।",
  },
  {
    icon: Globe,
    title: "सांस्कृतिक विरासत को सहेजें",
    desc: "परंपराओं, कलाओं और ज्ञान के लुप्त होने से पहले उनका दस्तावेजीकरण करें। भारत के जीवंत डिजिटल संग्रह का हिस्सा बनें।",
  },
  {
    icon: Users,
    title: "समुदाय का निर्माण करें",
    desc: "सुरखियों से परे वास्तविक, जीवंत भारत का जश्न मनाने वाले योगदानकर्ताओं के बढ़ते समुदाय में शामिल हों।",
  },
  {
    icon: Award,
    title: "पहचान अर्जित करें",
    desc: "XP पॉइंट्स, योगदानकर्ता बैज अर्जित करें और हर प्रकाशित कहानी पर एक सत्यापित कहानीकार के रूप में श्रेय पाएं।",
  },
];

const processStepsEn = [
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

const processStepsHi = [
  {
    num: "01",
    icon: PenLine,
    name: "जमा करें",
    desc: "अपने विषय के बारे में समृद्ध विवरण, छवियों और संदर्भ के साथ अपनी कहानी का फ़ॉर्म भरें।",
    color: "from-red-950/20 to-neutral-900/5",
    accent: "text-red-500",
  },
  {
    num: "02",
    icon: Eye,
    name: "संपादकीय समीक्षा",
    desc: "हमारे संपादक 5–7 कार्य दिवसों के भीतर कहानी पढ़ते हैं, मूल्यांकन करते हैं और प्रतिक्रिया देते हैं।",
    color: "from-red-950/20 to-neutral-900/5",
    accent: "text-red-500",
  },
  {
    num: "03",
    icon: Shield,
    name: "तथ्य सत्यापन",
    desc: "हम तथ्यों, भौगोलिक निर्देशांकों की पुष्टि करते हैं और विश्वसनीय स्रोतों से जानकारी की जांच करते हैं।",
    color: "from-red-950/20 to-neutral-900/5",
    accent: "text-red-500",
  },
  {
    num: "04",
    icon: Star,
    name: "स्वीकृत",
    desc: "स्वीकृत कहानियों को हमारी प्रति संपादकीय टीम द्वारा अंतिम रूप दिया जाता है।",
    color: "from-red-950/20 to-neutral-900/5",
    accent: "text-red-500",
  },
  {
    num: "05",
    icon: Zap,
    name: "प्रकाशित",
    desc: "आपकी कहानी इंडिया स्टोरी प्रोजेक्ट पर लाइव हो जाती है और पाठकों के साथ साझा की जाती है।",
    color: "from-red-950/20 to-neutral-900/5",
    accent: "text-red-500",
  },
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
        type="button"
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        onClick={() => setOpen(!open)}
      >
        <span className="font-sans font-semibold text-sm text-white group-hover:text-[#8B0000] transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`size-4 text-neutral-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-[#8B0000]" : ""}`}
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

/* ─── Reusable Floating Label Input ─── */
interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  isValid?: boolean;
  isRequired?: boolean;
  helperText?: string;
}

function FloatingInput({
  label,
  value,
  onChange,
  error,
  isValid,
  isRequired,
  helperText,
  id,
  type = "text",
  className = "",
  ...props
}: FloatingInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).trim() !== "";
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative group w-full">
      <motion.div
        animate={error ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`peer w-full bg-neutral-900/90 border text-white text-xs sm:text-sm rounded-xl px-4 pt-5 pb-2 outline-none transition-all duration-300 ${
            error
              ? "border-red-500/80 focus:ring-2 focus:ring-red-500/30"
              : isFocused
              ? "border-[#8B0000] ring-2 ring-[#8B0000]/40 scale-[1.008]"
              : "border-neutral-800 hover:border-neutral-700"
          } ${className}`}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={`absolute left-4 pointer-events-none font-sans transition-all duration-200 ${
            isFloating
              ? "top-1.5 text-[9px] uppercase tracking-wider font-bold text-[#C8A96A]"
              : "top-3.5 text-xs text-neutral-400"
          }`}
        >
          {label} {isRequired && <span className="text-[#8B0000] font-bold">*</span>}
        </label>
        
        <AnimatePresence>
          {isValid && !error && hasValue && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.25, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="absolute right-3.5 top-3.5 size-4 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 pointer-events-none"
            >
              <Check className="size-2.5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[10px] text-red-400 font-sans font-medium mt-1 pl-1 flex items-center gap-1"
          >
            <AlertCircle className="size-3 shrink-0" />
            {error}
          </motion.p>
        ) : helperText ? (
          <p className="text-[10px] text-neutral-400 font-sans mt-1 pl-1">{helperText}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ─── Reusable Floating Label Textarea ─── */
interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | null;
  isValid?: boolean;
  isRequired?: boolean;
  helperText?: string;
  wordCount?: number;
}

function FloatingTextarea({
  label,
  value,
  onChange,
  error,
  isValid,
  isRequired,
  helperText,
  wordCount,
  id,
  rows = 5,
  className = "",
  ...props
}: FloatingTextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).trim() !== "";
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative group w-full">
      <motion.div
        animate={error ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <textarea
          id={textareaId}
          rows={rows}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`peer w-full bg-neutral-900/90 border text-white text-xs sm:text-sm rounded-xl px-4 pt-6 pb-3 outline-none transition-all duration-300 resize-none ${
            error
              ? "border-red-500/80 focus:ring-2 focus:ring-red-500/30"
              : isFocused
              ? "border-[#8B0000] ring-2 ring-[#8B0000]/40 scale-[1.005]"
              : "border-neutral-800 hover:border-neutral-700"
          } ${className}`}
          {...props}
        />
        <label
          htmlFor={textareaId}
          className={`absolute left-4 pointer-events-none font-sans transition-all duration-200 ${
            isFloating
              ? "top-2 text-[9px] uppercase tracking-wider font-bold text-[#C8A96A]"
              : "top-4 text-xs text-neutral-400"
          }`}
        >
          {label} {isRequired && <span className="text-[#8B0000] font-bold">*</span>}
        </label>

        {wordCount !== undefined && (
          <span className="absolute right-3 top-2 text-[9px] font-sans font-bold text-neutral-400 uppercase tracking-wider pointer-events-none">
            {wordCount} words
          </span>
        )}

        <AnimatePresence>
          {isValid && !error && hasValue && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.25, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="absolute right-3.5 bottom-3.5 size-4 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 pointer-events-none"
            >
              <Check className="size-2.5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[10px] text-red-400 font-sans font-medium mt-1 pl-1 flex items-center gap-1"
          >
            <AlertCircle className="size-3 shrink-0" />
            {error}
          </motion.p>
        ) : helperText ? (
          <p className="text-[10px] text-neutral-400 font-sans mt-1 pl-1">{helperText}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ShareStoryPage() {
  const { user, session, profile, loading: authLoading } = useAuthStore();
  const lang = useI18nStore((s) => s.lang);
  const shouldReduceMotion = useReducedMotion();

  // Active step state (5 steps)
  const [activeStep, setActiveStep] = useState(0);

  // Form input states
  const [title, setTitle] = useState("");
  const [heroName, setHeroName] = useState("");
  const [summary, setSummary] = useState("");
  const [story, setStory] = useState("");
  const [selectedThemes, setSelectedThemes] = useState<string[]>(["Heritage"]);
  const [stateName, setStateName] = useState("Delhi");
  const [district, setDistrict] = useState("");
  const [language, setLanguage] = useState("en");
  
  // Author & Contact
  const [authorName, setAuthorName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [authorBio, setAuthorBio] = useState("");

  // Visual Media & Extras
  const [coverImage, setCoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [externalLinks, setExternalLinks] = useState("");
  const [tags, setTags] = useState("");

  // SEO options
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [showSEO, setShowSEO] = useState(false);

  // UI state
  const [draftSaved, setDraftSaved] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validation errors map
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
        if (parsed.summary) setSummary(parsed.summary);
        if (parsed.story) setStory(parsed.story);
        if (parsed.selectedThemes) setSelectedThemes(parsed.selectedThemes);
        if (parsed.stateName) setStateName(parsed.stateName);
        if (parsed.district) setDistrict(parsed.district);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.authorName) setAuthorName(parsed.authorName);
        if (parsed.contactEmail) setContactEmail(parsed.contactEmail);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.authorBio) setAuthorBio(parsed.authorBio);
        if (parsed.coverImage) setCoverImage(parsed.coverImage);
        if (parsed.galleryImages) setGalleryImages(parsed.galleryImages);
        if (parsed.videoUrl) setVideoUrl(parsed.videoUrl);
        if (parsed.externalLinks) setExternalLinks(parsed.externalLinks);
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
        summary,
        story,
        selectedThemes,
        stateName,
        district,
        language,
        authorName,
        contactEmail,
        phone,
        authorBio,
        coverImage,
        galleryImages,
        videoUrl,
        externalLinks,
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
    summary,
    story,
    selectedThemes,
    stateName,
    district,
    language,
    authorName,
    contactEmail,
    phone,
    authorBio,
    coverImage,
    galleryImages,
    videoUrl,
    externalLinks,
    tags,
    seoTitle,
    seoDescription,
    seoKeywords,
  ]);

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

  const toggleTheme = (themeName: string) => {
    if (selectedThemes.includes(themeName)) {
      if (selectedThemes.length > 1) {
        setSelectedThemes(selectedThemes.filter((t) => t !== themeName));
      } else {
        toast.info("Please keep at least one category selected.");
      }
    } else {
      setSelectedThemes([...selectedThemes, themeName]);
    }
  };

  const validateImageFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["jpg", "jpeg", "png", "webp", "avif"];

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || "")) {
      return `Invalid file type for "${file.name}". Allowed: JPG, PNG, WEBP, AVIF.`;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return `File "${file.name}" exceeds maximum limit of 10MB.`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("files", file);

    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      let errMsg = `Upload failed with status ${res.status}`;
      try {
        const errData = await res.json();
        errMsg = errData.error || errMsg;
      } catch (_) {}
      throw new Error(errMsg);
    }

    const data = await res.json();
    const uploadedUrl = data.files?.[0]?.url;
    if (!uploadedUrl) {
      throw new Error("Server did not return media URL.");
    }

    return uploadedUrl;
  };

  const performCoverUpload = async (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.warning(validationError);
      return;
    }

    setUploadingCover(true);
    try {
      const url = await uploadFile(file);
      setCoverImage(url);
      toast.success("Cover image uploaded successfully!");
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploadingCover(false);
    }
  };

  const performGalleryUpload = async (fileList: File[]) => {
    setUploadingGallery(true);
    try {
      const uploadPromises = fileList.map((file) => uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      setGalleryImages((prev) => [...prev, ...urls]);
      toast.success(`Uploaded ${urls.length} gallery images.`);
    } catch (err: any) {
      toast.error(`Gallery upload failed: ${err.message}`);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleNextStep = () => {
    const errors: Record<string, string> = {};

    if (activeStep === 0) {
      if (!title.trim()) errors.title = "Story title is required to begin.";
      if (!summary.trim()) errors.summary = "A 1-line teaser summary is required.";
    } else if (activeStep === 1) {
      if (!story.trim()) errors.story = "Full story body is required.";
      if (!district.trim()) errors.district = "District or city is required.";
      if (selectedThemes.length === 0) errors.themes = "Select at least one category.";
    } else if (activeStep === 2) {
      if (!authorName.trim()) errors.authorName = "Author name is required.";
      if (!contactEmail.trim() || !contactEmail.includes("@"))
        errors.contactEmail = "Valid contact email is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please complete the required fields to continue.");
      return;
    }

    setFieldErrors({});
    setErrorMessage(null);
    setActiveStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (isDraft = false) => {
    if (uploadingCover || uploadingGallery || uploadingVideo) {
      setErrorMessage("Please wait for all media uploads to finish before submitting.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Please provide a story title.");
      return;
    }

    setSubmitLoading(true);
    setErrorMessage(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers,
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
          toast.success("Draft saved successfully!");
          setTimeout(() => setDraftSaved(false), 3000);
        } else {
          localStorage.removeItem("isp_autosave_story_draft");
          setDone(true);
        }
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Submission failed.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred while submitting your story.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setHeroName("");
    setSummary("");
    setStory("");
    setSelectedThemes(["Heritage"]);
    setStateName("Delhi");
    setDistrict("");
    setLanguage("en");
    setAuthorName("");
    setContactEmail("");
    setPhone("");
    setAuthorBio("");
    setCoverImage("");
    setGalleryImages([]);
    setVideoUrl("");
    setExternalLinks("");
    setTags("");
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords("");
    setDone(false);
    setErrorMessage(null);
    setActiveStep(0);
  };

  const autoSlug = title
    ? title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
    : "untitled-story";

  const stepsList = [
    { label: "1. The Hook", icon: Sparkles },
    { label: "2. The Details", icon: FileText },
    { label: "3. Storyteller", icon: User },
    { label: "4. Visual Media", icon: ImageIcon },
    { label: "5. Review & Submit", icon: Send },
  ];

  // Construct mock story object for live StoryCard preview in Step 5
  const previewStory: Story = {
    id: "preview-story-id",
    slug: autoSlug,
    title: title || "Your Story Title Here",
    excerpt: summary || "Your story teaser summary will appear here once entered.",
    content: story || "Full story text narrative...",
    themes: selectedThemes,
    region: stateName + (district ? `, ${district}` : ""),
    readTime: `${Math.max(1, Math.ceil((story.trim().split(/\s+/).length || 1) / 200))} min read`,
    image: coverImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
    url: `/stories/${autoSlug}`,
    authorName: authorName || "Verified Storyteller",
    publishedAt: new Date().toISOString(),
    viewCount: 1,
    likesCount: 0,
    commentsCount: 0,
  };

  if (authLoading) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-center space-y-4">
            <Loader2 className="size-8 animate-spin text-[#8B0000] mx-auto" />
            <p className="text-neutral-400 font-sans text-sm">Loading India Story Project...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="bg-[#0a0a0a] text-white min-h-screen relative overflow-hidden font-sans">
        
        {/* ─── Parallax Drifting Ambient Gradient Background Blobs ─── */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/6 left-1/4 size-[400px] rounded-full bg-[#8B0000]/15 blur-[120px] animate-pulse duration-10000" />
          <div className="absolute bottom-1/4 right-1/4 size-[450px] rounded-full bg-[#C8A96A]/10 blur-[140px]" />
          <div className="absolute top-2/3 left-10 size-[300px] rounded-full bg-[#D97706]/10 blur-[100px]" />
          
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, -16, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-28 right-16 size-24 opacity-10 text-[#C8A96A]"
          >
            <Feather className="size-full" />
          </motion.div>

          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, 14, 0], rotate: [0, -4, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-36 left-12 size-20 opacity-10 text-[#D97706]"
          >
            <Globe className="size-full" />
          </motion.div>
        </div>

        {/* ─── Hero Section with Staggered Word Reveal ─── */}
        <section className="relative overflow-hidden pt-28 pb-14 md:pt-36 md:pb-24 border-b border-neutral-900 z-10">
          <div className="container mx-auto px-6 relative text-center max-w-4xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#8B0000]/20 border border-[#8B0000]/40 text-[10px] uppercase tracking-widest text-[#C8A96A] font-sans font-bold shadow-md"
            >
              <Feather className="size-3.5 text-[#8B0000]" />
              {lang === "hi" ? "इंडिया स्टोरी प्रोजेक्ट — खुली प्रविष्टियाँ" : "India Story Project — Open Submissions"}
            </motion.div>

            <div className="overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight"
              >
                {lang === "hi" ? "भारत की कहानी" : "Tell the Story of"}
                <br />
                <span className="bg-gradient-to-r from-[#C8A96A] via-amber-200 to-[#D97706] bg-clip-text text-transparent italic font-serif">
                  {lang === "hi" ? "साझा करें" : "Bharat"}
                </span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg text-neutral-350 leading-relaxed font-sans max-w-2xl mx-auto"
            >
              {uiText[lang].shareStoryPage.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <a
                href="#submission-form"
                className="inline-flex items-center gap-2.5 bg-[#8B0000] hover:bg-[#a00000] text-white font-sans font-bold text-xs uppercase tracking-widest h-12 px-8 rounded-full shadow-lg shadow-[#8B0000]/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <PenLine className="size-4" />
                {lang === "hi" ? "अपनी कहानी जमा करें" : "Share Your Story"}
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-neutral-800 hover:border-[#C8A96A]/40 text-neutral-300 hover:text-white font-sans font-semibold text-xs h-12 px-8 rounded-full transition-all duration-300 bg-neutral-900/40"
              >
                <BookOpen className="size-4" />
                {lang === "hi" ? "यह कैसे काम करता है" : "How It Works"}
              </a>
            </motion.div>
          </div>
        </section>

        {/* ─── Why Share Section ─── */}
        <section className="py-20 border-b border-neutral-900 relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#8B0000]">
              {lang === "hi" ? "योगदान क्यों दें" : "Why Contribute"}
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">
              {lang === "hi" ? "अपनी कहानी क्यों साझा करें?" : "Why Share Your Story?"}
            </h2>
            <p className="text-neutral-400 font-sans max-w-xl mx-auto text-xs leading-relaxed">
              {lang === "hi"
                ? "हर आवाज मायने रखती है। हर कहानी लहरें पैदा करती है। जानिए योगदानकर्ता इंडिया स्टोरी प्रोजेक्ट को क्यों चुनते हैं।"
                : "Every voice matters. Every story creates ripples. Here's why contributors choose the India Story Project."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(lang === "hi" ? whyShareReasonsHi : whyShareReasonsEn).map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <TiltCard className="h-full" intensity={6}>
                  <div className="bg-neutral-900/80 rounded-2xl p-6 border border-neutral-850 hover:border-[#8B0000]/50 transition-all duration-300 group h-full flex flex-col justify-between">
                    <div>
                      <div className="size-11 rounded-xl bg-[#8B0000]/20 border border-[#8B0000]/30 flex items-center justify-center text-[#C8A96A] mb-5 group-hover:bg-[#8B0000]/40 transition-colors">
                        <reason.icon className="size-5" />
                      </div>
                      <h3 className="font-display font-bold text-sm text-white mb-2">
                        {reason.title}
                      </h3>
                      <p className="text-xs text-neutral-350 font-sans leading-relaxed">
                        {reason.desc}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Process Steps ─── */}
        <section id="how-it-works" className="py-20 border-b border-neutral-900 relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#8B0000]">
              {lang === "hi" ? "संपादकीय प्रक्रिया" : "Editorial Process"}
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">
              {lang === "hi" ? "यह कैसे काम करता है" : "How It Works"}
            </h2>
            <p className="text-neutral-400 font-sans max-w-xl mx-auto text-xs leading-relaxed">
              {lang === "hi"
                ? "गुणवत्ता, सटीकता और प्रभाव सुनिश्चित करने के लिए प्रत्येक कहानी हमारे 5-स्तरीय संपादकीय समीक्षा से गुजरती है।"
                : "Every story goes through our rigorous 5-stage editorial review to ensure quality, accuracy, and impact."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {(lang === "hi" ? processStepsHi : processStepsEn).map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="relative rounded-2xl bg-neutral-900/60 border border-neutral-850 p-5.5 hover:border-[#8B0000]/40 transition-all duration-300 group"
              >
                <span className="font-display text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors absolute top-4 right-4 leading-none select-none">
                  {step.num}
                </span>

                <div className="size-9 rounded-lg bg-[#8B0000]/20 text-[#C8A96A] border border-[#8B0000]/30 flex items-center justify-center mb-4">
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

        {/* ─── 5-Step Multi-Step Form Wizard Section ─── */}
        <section id="submission-form" className="py-20 relative z-10 max-w-4xl mx-auto px-6">
          
          <div className="text-center mb-10 space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#8B0000]">
              {lang === "hi" ? "कार्य जमा करें" : "Guided Story Submission"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              {lang === "hi" ? "अपनी कहानी बताएं" : "Share Your Story"}
            </h2>
            <p className="text-neutral-400 font-sans max-w-md mx-auto text-xs leading-relaxed">
              {user
                ? `Welcome back, ${profile?.fullName || user.email?.split("@")[0] || "Contributor"}. Complete the 5 guided steps below.`
                : "Submit your story in 5 simple steps. No account required to draft!"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              /* ─── Celebratory Success State ─── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-neutral-900/90 rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl relative"
              >
                <div className="h-1.5 bg-gradient-to-r from-[#8B0000] via-[#C8A96A] to-[#8B0000]" />
                <div className="p-10 md:p-16 text-center space-y-6">
                  
                  {/* Spring checkmark burst */}
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
                    className="size-20 rounded-full bg-gradient-to-tr from-[#8B0000] to-[#a00000] border-2 border-[#C8A96A] flex items-center justify-center mx-auto shadow-xl shadow-[#8B0000]/40"
                  >
                    <Check className="size-10 text-white stroke-[3]" />
                  </motion.div>

                  <div className="space-y-3">
                    <h3 className="font-display text-3xl md:text-4xl font-bold text-white">
                      Story Submitted Successfully!
                    </h3>
                    <p className="text-neutral-300 font-sans max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
                      Namaste! Your story is now safely in our editorial queue. Our team will review and contact you within 5–7 working days.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B0000]/20 border border-[#C8A96A]/40 text-[#C8A96A] font-sans text-xs font-bold uppercase tracking-wider">
                    <Star className="size-4 text-[#C8A96A]" />
                    +20 XP Points Earned
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button
                      onClick={handleReset}
                      className="bg-[#8B0000] hover:bg-[#a00000] text-white font-sans text-xs uppercase tracking-widest font-bold h-12 px-8 rounded-xl shadow-lg"
                    >
                      <PenLine className="size-4 mr-2" />
                      Submit Another Story
                    </Button>
                    <Link to="/">
                      <Button
                        variant="outline"
                        className="h-12 px-8 rounded-xl border-neutral-800 bg-neutral-950 text-white font-sans text-xs uppercase tracking-widest hover:bg-neutral-900"
                      >
                        Return to Homepage
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ─── 5-Step Guided Form Card ─── */
              <motion.div
                key="submission-wizard-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900/90 rounded-3xl border border-neutral-850 overflow-hidden shadow-2xl"
              >
                <div className="h-1 bg-gradient-to-r from-[#8B0000] via-[#C8A96A] to-[#8B0000]" />
                
                {/* ─── Stepper Progress Header ─── */}
                <div className="px-6 pt-6 pb-5 border-b border-neutral-850 bg-neutral-950/40">
                  <div className="flex items-center justify-between gap-1 sm:gap-2">
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
                            className={`flex items-center gap-1.5 focus:outline-none text-[10px] uppercase font-bold tracking-wider transition-colors ${
                              isActive
                                ? "text-[#C8A96A]"
                                : isComplete
                                ? "text-white"
                                : "text-neutral-500"
                            }`}
                          >
                            <span
                              className={`size-7 sm:size-8 rounded-full border flex items-center justify-center shrink-0 text-[10px] sm:text-xs transition-all duration-300 ${
                                isComplete
                                  ? "bg-[#8B0000] border-[#8B0000] text-white shadow-md shadow-[#8B0000]/40"
                                  : isActive
                                  ? "border-[#C8A96A] bg-[#8B0000]/20 text-[#C8A96A] ring-2 ring-[#C8A96A]/30 scale-105"
                                  : "border-neutral-800 text-neutral-500 bg-neutral-950"
                              }`}
                            >
                              {isComplete ? <Check className="size-4" /> : idx + 1}
                            </span>
                            <span className="hidden md:inline">{st.label}</span>
                          </button>
                          {idx < stepsList.length - 1 && (
                            <div className="flex-1 h-0.5 mx-1.5 sm:mx-2 rounded-full overflow-hidden bg-neutral-800">
                              <motion.div
                                className="h-full bg-gradient-to-r from-[#8B0000] to-[#C8A96A]"
                                animate={{ width: idx < activeStep ? "100%" : "0%" }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Spring-animated overall progress line */}
                  <div className="w-full h-1 bg-neutral-850 rounded-full overflow-hidden mt-4">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#8B0000] via-[#C8A96A] to-[#D97706]"
                      animate={{ width: `${((activeStep + 1) / stepsList.length) * 100}%` }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                <div className="p-6 md:p-10 space-y-6">
                  
                  {/* Status Banner Messages */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl text-xs bg-red-500/10 border border-red-500/30 text-red-400 font-sans flex items-center gap-2"
                    >
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}

                  {draftSaved && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans flex items-center gap-2"
                    >
                      <Check className="size-4 shrink-0" />
                      <span>Draft saved to local storage!</span>
                    </motion.div>
                  )}

                  {/* ─── 3D Depth-Slide Card Container ─── */}
                  <div className="relative [perspective:1000px] min-h-[380px]">
                    <AnimatePresence mode="wait">
                      
                      {/* Step 1: The Hook */}
                      {activeStep === 0 && (
                        <motion.div
                          key="step-0-hook"
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, rotateY: 6 }}
                          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotateY: 0 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, rotateY: -6 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-6"
                        >
                          <div className="border-b border-neutral-850 pb-3 space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C8A96A]">
                              Step 1 of 5
                            </span>
                            <h3 className="font-display text-2xl font-bold text-white">
                              The Hook — What's your story about?
                            </h3>
                            <p className="text-xs text-neutral-400">
                              Start with a strong headline and a brief teaser.
                            </p>
                          </div>

                          <div className="space-y-5">
                            <FloatingInput
                              id="story-title"
                              label="Story Title"
                              value={title}
                              onChange={(e) => {
                                setTitle(e.target.value);
                                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
                              }}
                              placeholder="e.g. The Water Guardian of Jodhpur"
                              isRequired
                              isValid={title.trim().length >= 4}
                              error={fieldErrors.title}
                              helperText={title ? `Slug preview: /stories/${autoSlug}` : "Give your story a clear, captivating title."}
                            />

                            <FloatingInput
                              id="hero-name"
                              label="Hero / Subject Name (Optional)"
                              value={heroName}
                              onChange={(e) => setHeroName(e.target.value)}
                              placeholder="e.g. Ranaram Bishnoi"
                              isValid={heroName.trim().length >= 2}
                              helperText="The unsung hero, community innovator, or subject of your piece."
                            />

                            <FloatingTextarea
                              id="summary-teaser"
                              label="One-Line Story Teaser"
                              value={summary}
                              onChange={(e) => {
                                setSummary(e.target.value.slice(0, 300));
                                if (fieldErrors.summary) setFieldErrors((prev) => ({ ...prev, summary: "" }));
                              }}
                              placeholder="Write a brief 1-2 sentence hook describing what makes this story remarkable..."
                              rows={3}
                              isRequired
                              isValid={summary.trim().length >= 15}
                              error={fieldErrors.summary}
                              helperText={`${summary.length} / 300 characters`}
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Step 2: The Details */}
                      {activeStep === 1 && (
                        <motion.div
                          key="step-1-details"
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, rotateY: 6 }}
                          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotateY: 0 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, rotateY: -6 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-6"
                        >
                          <div className="border-b border-neutral-850 pb-3 space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C8A96A]">
                              Step 2 of 5
                            </span>
                            <h3 className="font-display text-2xl font-bold text-white">
                              The Details — Category, Location & Full Narrative
                            </h3>
                            <p className="text-xs text-neutral-400">
                              Choose matching categories and describe the full narrative of change.
                            </p>
                          </div>

                          {/* Category Selectable Cards */}
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-[#C8A96A] block">
                              Select Themes / Categories <span className="text-[#8B0000]">*</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {CATEGORY_ITEMS.map((cat) => {
                                const isSelected = selectedThemes.includes(cat.name);
                                return (
                                  <TiltCard key={cat.name} intensity={5}>
                                    <button
                                      type="button"
                                      onClick={() => toggleTheme(cat.name)}
                                      className={`w-full text-left p-3 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between h-24 ${
                                        isSelected
                                          ? "bg-[#8B0000]/25 border-[#8B0000] shadow-lg shadow-[#8B0000]/20 ring-1 ring-[#C8A96A]/40"
                                          : "bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div
                                          className={`size-7 rounded-lg flex items-center justify-center ${
                                            isSelected ? "bg-[#8B0000] text-white" : "bg-neutral-800 text-neutral-400"
                                          }`}
                                        >
                                          <cat.icon className="size-3.5" />
                                        </div>
                                        {isSelected && (
                                          <span className="size-4 rounded-full bg-[#8B0000] text-white flex items-center justify-center">
                                            <Check className="size-2.5" />
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-bold text-white leading-snug">
                                          {cat.name}
                                        </h4>
                                        <p className="text-[9px] text-neutral-400 line-clamp-1">
                                          {cat.desc}
                                        </p>
                                      </div>
                                    </button>
                                  </TiltCard>
                                );
                              })}
                            </div>
                            {fieldErrors.themes && (
                              <p className="text-[10px] text-red-400 font-sans mt-1">{fieldErrors.themes}</p>
                            )}
                          </div>

                          <div className="grid sm:grid-cols-3 gap-4 pt-2">
                            <div className="space-y-1.5">
                              <label htmlFor="stateName-select" className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                                State / Region <span className="text-[#8B0000]">*</span>
                              </label>
                              <select
                                id="stateName-select"
                                value={stateName}
                                onChange={(e) => setStateName(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 text-white h-11 px-3 rounded-xl text-xs outline-none focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/40"
                              >
                                {STATES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>

                            <FloatingInput
                              id="district-input"
                              label="District / City"
                              value={district}
                              onChange={(e) => {
                                setDistrict(e.target.value);
                                if (fieldErrors.district) setFieldErrors((prev) => ({ ...prev, district: "" }));
                              }}
                              placeholder="e.g. Jodhpur"
                              isRequired
                              isValid={district.trim().length >= 2}
                              error={fieldErrors.district}
                            />

                            <div className="space-y-1.5">
                              <label htmlFor="language-select" className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                                Story Language <span className="text-[#8B0000]">*</span>
                              </label>
                              <select
                                id="language-select"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 text-white h-11 px-3 rounded-xl text-xs outline-none focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/40"
                              >
                                <option value="en">English</option>
                                <option value="hi">Hindi (हिन्दी)</option>
                              </select>
                            </div>
                          </div>

                          <FloatingTextarea
                            id="full-story-content"
                            label="Full Story Narrative (Markdown Supported)"
                            value={story}
                            onChange={(e) => {
                              setStory(e.target.value);
                              if (fieldErrors.story) setFieldErrors((prev) => ({ ...prev, story: "" }));
                            }}
                            placeholder="Tell the full narrative of the hero, tradition, or impact in detail..."
                            rows={8}
                            isRequired
                            wordCount={story.trim() ? story.trim().split(/\s+/).length : 0}
                            isValid={story.trim().length >= 50}
                            error={fieldErrors.story}
                            helperText="Describe background, challenges overcome, and positive results."
                          />
                        </motion.div>
                      )}

                      {/* Step 3: The Storyteller */}
                      {activeStep === 2 && (
                        <motion.div
                          key="step-2-storyteller"
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, rotateY: 6 }}
                          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotateY: 0 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, rotateY: -6 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-6"
                        >
                          <div className="border-b border-neutral-850 pb-3 space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C8A96A]">
                              Step 3 of 5
                            </span>
                            <h3 className="font-display text-2xl font-bold text-white">
                              The Storyteller — Author Details
                            </h3>
                            <p className="text-xs text-neutral-400">
                              Tell us who you are so we can credit your work on the published story card.
                            </p>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-5">
                            <FloatingInput
                              id="author-name"
                              label="Your Name / Byline"
                              value={authorName}
                              onChange={(e) => {
                                setAuthorName(e.target.value);
                                if (fieldErrors.authorName) setFieldErrors((prev) => ({ ...prev, authorName: "" }));
                              }}
                              placeholder="e.g. Priyanshu Sharma"
                              isRequired
                              isValid={authorName.trim().length >= 2}
                              error={fieldErrors.authorName}
                              helperText="This name will appear on the published story byline."
                            />

                            <FloatingInput
                              id="contact-email"
                              type="email"
                              label="Contact Email"
                              value={contactEmail}
                              onChange={(e) => {
                                setContactEmail(e.target.value);
                                if (fieldErrors.contactEmail) setFieldErrors((prev) => ({ ...prev, contactEmail: "" }));
                              }}
                              placeholder="your@email.com"
                              isRequired
                              isValid={contactEmail.includes("@")}
                              error={fieldErrors.contactEmail}
                              helperText="For editorial updates and verification (kept confidential)."
                            />
                          </div>

                          <div className="grid sm:grid-cols-2 gap-5">
                            <FloatingInput
                              id="phone-number"
                              type="tel"
                              label="Phone Number (Optional)"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              helperText="Optional phone for fast editorial review sync."
                            />

                            <FloatingInput
                              id="author-bio"
                              label="Short Bio / Role (Optional)"
                              value={authorBio}
                              onChange={(e) => setAuthorBio(e.target.value)}
                              placeholder="e.g. Independent Journalist from Jaipur"
                              helperText="Appears in contributor credentials."
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Step 4: Visual Media */}
                      {activeStep === 3 && (
                        <motion.div
                          key="step-3-media"
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, rotateY: 6 }}
                          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotateY: 0 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, rotateY: -6 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-6"
                        >
                          <div className="border-b border-neutral-850 pb-3 space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C8A96A]">
                              Step 4 of 5
                            </span>
                            <h3 className="font-display text-2xl font-bold text-white">
                              Visual Media & References
                            </h3>
                            <p className="text-xs text-neutral-400">
                              Upload high-resolution photography and reference links to elevate your story.
                            </p>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-6">
                            {/* Drag and Drop Cover Image Zone with 3D Tilt Preview */}
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-wider text-[#C8A96A] block">
                                Cover Image (16:9 Aspect Ratio)
                              </label>
                              
                              {coverImage ? (
                                <TiltCard intensity={6}>
                                  <div className="relative group rounded-2xl overflow-hidden border border-neutral-800 aspect-[16/10] bg-neutral-950">
                                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <button
                                        type="button"
                                        onClick={() => setCoverImage("")}
                                        className="bg-[#8B0000] hover:bg-red-700 text-white p-2.5 rounded-full shadow-lg"
                                        title="Remove Cover Photo"
                                      >
                                        <Trash2 className="size-4" />
                                      </button>
                                    </div>
                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                      <Check className="size-3" /> Ready
                                    </div>
                                  </div>
                                </TiltCard>
                              ) : (
                                <div
                                  onDragOver={(e) => { e.preventDefault(); setIsDragOverCover(true); }}
                                  onDragLeave={() => setIsDragOverCover(false)}
                                  onDrop={async (e) => {
                                    e.preventDefault();
                                    setIsDragOverCover(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) await performCoverUpload(file);
                                  }}
                                  className={`border-2 border-dashed rounded-2xl min-h-[170px] flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${
                                    isDragOverCover
                                      ? "border-[#8B0000] bg-[#8B0000]/10 scale-[1.01]"
                                      : "border-neutral-800 hover:border-[#8B0000]/40 bg-neutral-900/60"
                                  }`}
                                >
                                  {uploadingCover ? (
                                    <div className="text-center text-xs text-neutral-400 space-y-2">
                                      <Loader2 className="size-7 animate-spin text-[#8B0000] mx-auto" />
                                      <span>Uploading cover photo...</span>
                                    </div>
                                  ) : (
                                    <label className="cursor-pointer p-5 text-center flex flex-col items-center text-neutral-400 hover:text-white transition-colors w-full h-full justify-center">
                                      <UploadCloud className="size-8 text-[#C8A96A] mb-2" />
                                      <span className="text-xs font-semibold">Drag & drop cover photo</span>
                                      <span className="text-[9px] text-neutral-500 mt-1">Supports JPG, PNG, WEBP up to 10MB</span>
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) void performCoverUpload(f);
                                      }} />
                                    </label>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Drag and Drop Gallery Upload */}
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                                Gallery Photos (Optional)
                              </label>
                              <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragOverGallery(true); }}
                                onDragLeave={() => setIsDragOverGallery(false)}
                                onDrop={async (e) => {
                                  e.preventDefault();
                                  setIsDragOverGallery(false);
                                  const files = e.dataTransfer.files;
                                  if (files && files.length > 0) await performGalleryUpload(Array.from(files));
                                }}
                                className={`border-2 border-dashed rounded-2xl min-h-[170px] flex flex-col items-center justify-center transition-all duration-300 ${
                                  isDragOverGallery
                                    ? "border-[#8B0000] bg-[#8B0000]/10 scale-[1.01]"
                                    : "border-neutral-800 hover:border-[#8B0000]/40 bg-neutral-900/60"
                                }`}
                              >
                                {uploadingGallery ? (
                                  <div className="text-center text-xs text-neutral-400 space-y-2">
                                    <Loader2 className="size-7 animate-spin text-[#8B0000] mx-auto" />
                                    <span>Uploading gallery photos...</span>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer p-5 text-center flex flex-col items-center text-neutral-400 hover:text-white transition-colors w-full h-full justify-center">
                                    <ImageIcon className="size-8 text-neutral-500 mb-2" />
                                    <span className="text-xs font-semibold">Drag & drop multiple photos</span>
                                    <span className="text-[9px] text-neutral-500 mt-1">Upload additional context photos</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                                      const files = e.target.files;
                                      if (files && files.length > 0) void performGalleryUpload(Array.from(files));
                                    }} />
                                  </label>
                                )}
                              </div>
                              {galleryImages.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {galleryImages.map((img, i) => (
                                    <div key={i} className="relative group size-10 rounded-lg overflow-hidden border border-neutral-800">
                                      <img src={img} className="size-full object-cover" alt="Gallery thumbnail" />
                                      <button
                                        type="button"
                                        onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                                        className="absolute inset-0 bg-[#8B0000]/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="size-3" />
                                      </button>
                                    </div>
                                  ))}
                                  <span className="text-[9px] uppercase font-bold text-[#C8A96A] self-center ml-1">{galleryImages.length} uploaded</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-5 pt-2">
                            <FloatingInput
                              id="video-url"
                              label="Video Link (YouTube / Vimeo / File URL)"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              placeholder="https://youtube.com/watch?v=..."
                              helperText="Optional documentary or interview link."
                            />

                            <FloatingInput
                              id="tags-input"
                              label="Tags / Keywords"
                              value={tags}
                              onChange={(e) => setTags(e.target.value)}
                              placeholder="e.g. water harvesting, rajasthan, conservation"
                              helperText="Comma-separated topics for discoverability."
                            />
                          </div>

                          {/* SEO Options Collapsible */}
                          <div className="border border-neutral-800 rounded-2xl p-4 bg-neutral-950/40 space-y-4">
                            <button
                              type="button"
                              onClick={() => setShowSEO(!showSEO)}
                              className="w-full flex items-center justify-between text-left text-[10px] uppercase tracking-wider text-neutral-300 font-sans font-bold hover:text-white transition-colors"
                            >
                              <span className="flex items-center gap-2 text-[#C8A96A]">
                                <Info className="size-4 text-[#8B0000]" />
                                Search Engine Optimization (SEO) Options
                              </span>
                              <span className="text-[10px] text-[#8B0000] font-bold">
                                {showSEO ? "Hide [-]" : "Configure [+]"}
                              </span>
                            </button>

                            {showSEO && (
                              <div className="space-y-4 pt-3 border-t border-neutral-800">
                                <FloatingInput
                                  id="seo-title"
                                  label="SEO Page Title"
                                  value={seoTitle}
                                  onChange={(e) => setSeoTitle(e.target.value)}
                                  placeholder="Custom title for Google search results"
                                />

                                <FloatingTextarea
                                  id="seo-desc"
                                  label="SEO Meta Description"
                                  value={seoDescription}
                                  onChange={(e) => setSeoDescription(e.target.value.slice(0, 160))}
                                  placeholder="Custom meta description snippet..."
                                  rows={2}
                                  helperText={`${seoDescription.length} / 160 characters`}
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Step 5: Review & Submit */}
                      {activeStep === 4 && (
                        <motion.div
                          key="step-4-review"
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, rotateY: 6 }}
                          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotateY: 0 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, rotateY: -6 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-6"
                        >
                          <div className="border-b border-neutral-850 pb-3 space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C8A96A]">
                              Step 5 of 5
                            </span>
                            <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                              <Eye className="size-5 text-[#8B0000]" />
                              Review & Publish Preview
                            </h3>
                            <p className="text-xs text-neutral-400">
                              This is exactly how your story will look once published live on India Story Project.
                            </p>
                          </div>

                          {/* Live Story Card Component Preview */}
                          <div className="max-w-xl mx-auto py-2">
                            <StoryCard story={previewStory} index={0} />
                          </div>

                          <div className="bg-neutral-950/60 border border-neutral-850 rounded-2xl p-5 space-y-3">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[#C8A96A]">
                              Submission Details Summary
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                              <div>
                                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Byline</span>
                                <span className="text-white font-semibold">{authorName || "Not set"}</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Contact Email</span>
                                <span className="text-white font-semibold">{contactEmail || "Not set"}</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Location</span>
                                <span className="text-white font-semibold">{stateName}{district ? `, ${district}` : ""}</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Categories</span>
                                <span className="text-white font-semibold">{selectedThemes.join(", ")}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* ─── Stepper Action Controls Footer ─── */}
                  <div className="pt-6 border-t border-neutral-850 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    
                    {/* Draft Save Button */}
                    <Button
                      type="button"
                      onClick={() => void handleSubmit(true)}
                      variant="outline"
                      className="w-full sm:w-auto h-11 border-neutral-800 bg-neutral-950 text-white hover:bg-neutral-900 uppercase tracking-widest text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                      disabled={submitLoading || uploadingCover || uploadingGallery || uploadingVideo}
                    >
                      <FileText className="size-4 text-[#C8A96A]" />
                      Save Draft
                    </Button>

                    <div className="w-full sm:w-auto flex gap-3 justify-end">
                      {activeStep > 0 && (
                        <Button
                          type="button"
                          onClick={handlePrevStep}
                          variant="outline"
                          className="w-1/2 sm:w-auto h-11 border-neutral-800 bg-neutral-950 text-white hover:bg-neutral-900 uppercase tracking-widest text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                        >
                          <ArrowLeft className="size-4" />
                          Previous
                        </Button>
                      )}

                      {activeStep < 4 ? (
                        <Button
                          type="button"
                          onClick={handleNextStep}
                          className="w-1/2 sm:w-auto min-w-[150px] h-11 bg-[#8B0000] hover:bg-[#a00000] text-white uppercase tracking-widest text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#8B0000]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Next Step
                          <ArrowRight className="size-4" />
                        </Button>
                      ) : (
                        /* Magnetic Submit Button with tactile press animation */
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-1/2 sm:w-auto min-w-[180px]"
                        >
                          <Button
                            type="button"
                            onClick={() => void handleSubmit(false)}
                            className="w-full h-11 bg-[#8B0000] hover:bg-[#a00000] text-white uppercase tracking-widest text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#8B0000]/30"
                            disabled={submitLoading || uploadingCover || uploadingGallery || uploadingVideo}
                          >
                            {submitLoading ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <>
                                Submit Story
                                <Check className="size-4" />
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </div>

                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ─── FAQ Section ─── */}
        <section className="py-20 border-t border-neutral-900 relative z-10 max-w-4xl mx-auto px-6">
          <div className="text-center mb-10 space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#8B0000]">
              {lang === "hi" ? "प्रश्न" : "Questions"}
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">
              {lang === "hi" ? "अक्सर पूछे जाने वाले प्रश्न" : "Frequently Asked Questions"}
            </h2>
          </div>
          <div className="bg-neutral-900/80 rounded-2xl border border-neutral-850 px-6 py-2 shadow-lg">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>

      </div>
    </SiteLayout>
  );
}
