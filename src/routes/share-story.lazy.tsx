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
  Music,
  Landmark,
  Share2,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Sparkle,
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

const CATEGORY_ITEMS_EN = [
  { name: "Heritage", label: "Heritage", icon: Landmark, desc: "Ancient lore, monuments, architecture & oral histories" },
  { name: "Innovation", label: "Innovation", icon: Zap, desc: "Grassroots tech, rural inventions & smart solutions" },
  { name: "Culture", label: "Culture", icon: Palette, desc: "Folk arts, festivals, rituals & traditional wisdom" },
  { name: "Social Change", label: "Social Change", icon: Users, desc: "Community leaders, education & reform initiatives" },
  { name: "Environment", label: "Environment", icon: Leaf, desc: "Water harvesting, afforestation & eco-conservation" },
  { name: "Arts & Crafts", label: "Arts & Crafts", icon: Music, desc: "Master artisans, handlooms & endangered crafts" },
  { name: "Courage & Resilience", label: "Courage & Resilience", icon: Shield, desc: "Overcoming hardship, bravery & inspirational spirit" },
  { name: "Wildlife & Nature", label: "Wildlife & Nature", icon: Compass, desc: "Biodiversity preservation, flora, fauna & guardians" },
];

const CATEGORY_ITEMS_HI = [
  { name: "Heritage", label: "धरोहर एवं इतिहास", icon: Landmark, desc: "प्राचीन लोक कथाएं, स्मारक, वास्तुकला और मौखिक इतिहास" },
  { name: "Innovation", label: "नवाचार एवं तकनीक", icon: Zap, desc: "ग्रामीण तकनीक, नवाचार और स्मार्ट समाधान" },
  { name: "Culture", label: "संस्कृति एवं परंपरा", icon: Palette, desc: "लोक कलाएं, त्योहार, अनुष्ठान और पारंपरिक ज्ञान" },
  { name: "Social Change", label: "सामाजिक बदलाव", icon: Users, desc: "सामुदायिक नेता, शिक्षा और सुधार पहल" },
  { name: "Environment", label: "पर्यावरण एवं जल", icon: Leaf, desc: "जल संचयन, वृक्षारोपण और पर्यावरण संरक्षण" },
  { name: "Arts & Crafts", label: "कला और शिल्प", icon: Music, desc: "शिल्पकार, हथकरघा और दुर्लभ कलाएं" },
  { name: "Courage & Resilience", label: "साहस और प्रेरणा", icon: Shield, desc: "कठिनाइयों पर विजय, बहादुरी और प्रेरणादायी गाथाएं" },
  { name: "Wildlife & Nature", label: "प्रकृति और वन्यजीव", icon: Compass, desc: "जैव विविधता, प्रकृति, वन और रक्षक" },
];


const processStepsEn = [
  {
    num: "01",
    icon: PenLine,
    name: "Submit Narrative",
    desc: "Fill out your story form with rich details, images, and context about your subject.",
  },
  {
    num: "02",
    icon: Eye,
    name: "Editorial Review",
    desc: "Our editors read, evaluate, and provide initial feedback within 5–7 working days.",
  },
  {
    num: "03",
    icon: Shield,
    name: "Fact Verification",
    desc: "We verify facts, geographic coordinates, and corroboration with trusted sources.",
  },
  {
    num: "04",
    icon: Star,
    name: "Approval & Polish",
    desc: "Approved stories receive final polish by our copy editors for style and readability.",
  },
  {
    num: "05",
    icon: Zap,
    name: "Preserved Live",
    desc: "Your story goes live on India Story Project and is preserved in our living digital archive.",
  },
];

const processStepsHi = [
  {
    num: "01",
    icon: PenLine,
    name: "कहानी जमा करें",
    desc: "अपने विषय के बारे में समृद्ध विवरण, छवियों और संदर्भ के साथ अपनी कहानी का फ़ॉर्म भरें।",
  },
  {
    num: "02",
    icon: Eye,
    name: "संपादकीय समीक्षा",
    desc: "हमारे संपादक 5–7 कार्य दिवसों के भीतर कहानी का मूल्यांकन करते हैं।",
  },
  {
    num: "03",
    icon: Shield,
    name: "तथ्य सत्यापन",
    desc: "हम तथ्यों और जानकारियों की पुष्टि विश्वसनीय स्रोतों से करते हैं।",
  },
  {
    num: "04",
    icon: Star,
    name: "स्वीकृत और पॉलिश",
    desc: "स्वीकृत कहानियों को संपादकीय टीम द्वारा अंतिम रूप दिया जाता है।",
  },
  {
    num: "05",
    icon: Zap,
    name: "सदा के लिए सुरक्षित",
    desc: "आपकी कहानी इंडिया स्टोरी प्रोजेक्ट पर लाइव हो जाती है और पाठकों के साथ साझा की जाती है।",
  },
];

/* ─── Luxury Editorial Floating Label Input ─── */
interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  isValid?: boolean;
  isRequired?: boolean;
  helperText?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function FloatingInput({
  label,
  value,
  onChange,
  error,
  isValid,
  isRequired,
  helperText,
  icon: IconComponent,
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
    <div className="relative group w-full font-sans">
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
          className={`peer w-full bg-white dark:bg-[#181715] border text-[#1D1D1D] dark:text-[#FBF8F3] text-sm rounded-xl ${
            IconComponent ? "pl-11" : "pl-4"
          } pr-10 pt-5 pb-2.5 outline-none transition-all duration-300 ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
              : isFocused
              ? "border-[#9E1C20] ring-2 ring-[#9E1C20]/15 shadow-sm"
              : "border-[#ECE7DF] dark:border-[#2A2722] hover:border-[#C9A227]/50"
          } ${className}`}
          {...props}
        />

        {IconComponent && (
          <IconComponent
            className={`absolute left-4 top-1/2 -translate-y-1/2 size-4 transition-colors ${
              isFocused ? "text-[#9E1C20]" : "text-[#666666]/60"
            }`}
          />
        )}

        <label
          htmlFor={inputId}
          className={`absolute pointer-events-none transition-all duration-200 ${
            IconComponent ? "left-11" : "left-4"
          } ${
            isFloating
              ? "top-1.5 text-[9px] uppercase tracking-wider font-bold text-[#C9A227]"
              : "top-3.5 text-xs text-[#666666]"
          }`}
        >
          {label} {isRequired && <span className="text-[#9E1C20] font-bold">*</span>}
        </label>

        <AnimatePresence>
          {isValid && !error && hasValue && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.25, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="absolute right-3.5 top-3.5 size-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 pointer-events-none"
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
            className="text-[11px] text-red-600 dark:text-red-400 font-sans font-medium mt-1 pl-1 flex items-center gap-1"
          >
            <AlertCircle className="size-3 shrink-0" />
            {error}
          </motion.p>
        ) : helperText ? (
          <p className="text-[11px] text-[#666666] font-sans mt-1 pl-1">{helperText}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ─── Luxury Editorial Floating Label Textarea ─── */
interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | null;
  isValid?: boolean;
  isRequired?: boolean;
  helperText?: string;
  wordCount?: number;
  charCount?: number;
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
  charCount,
  id,
  rows = 6,
  className = "",
  ...props
}: FloatingTextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).trim() !== "";
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative group w-full font-sans">
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
          className={`peer w-full bg-white dark:bg-[#181715] border text-[#1D1D1D] dark:text-[#FBF8F3] text-sm rounded-xl px-4 pt-7 pb-3 outline-none transition-all duration-300 resize-none font-sans leading-relaxed ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
              : isFocused
              ? "border-[#9E1C20] ring-2 ring-[#9E1C20]/15 shadow-sm"
              : "border-[#ECE7DF] dark:border-[#2A2722] hover:border-[#C9A227]/50"
          } ${className}`}
          {...props}
        />
        <label
          htmlFor={textareaId}
          className={`absolute left-4 pointer-events-none font-sans transition-all duration-200 ${
            isFloating
              ? "top-2 text-[9px] uppercase tracking-wider font-bold text-[#C9A227]"
              : "top-4 text-xs text-[#666666]"
          }`}
        >
          {label} {isRequired && <span className="text-[#9E1C20] font-bold">*</span>}
        </label>

        <div className="absolute right-3 top-2 flex items-center gap-2 pointer-events-none">
          {wordCount !== undefined && (
            <span className="text-[10px] font-sans font-semibold text-[#666666] uppercase tracking-wider bg-[#FBF8F3] dark:bg-[#2A2722] px-2 py-0.5 rounded-full border border-[#ECE7DF] dark:border-[#3A3732]">
              {wordCount} words
            </span>
          )}
          {charCount !== undefined && (
            <span className="text-[10px] font-sans font-semibold text-[#666666] uppercase tracking-wider bg-[#FBF8F3] dark:bg-[#2A2722] px-2 py-0.5 rounded-full border border-[#ECE7DF] dark:border-[#3A3732]">
              {charCount} chars
            </span>
          )}
        </div>

        <AnimatePresence>
          {isValid && !error && hasValue && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.25, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="absolute right-3.5 bottom-3.5 size-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 pointer-events-none"
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
            className="text-[11px] text-red-600 dark:text-red-400 font-sans font-medium mt-1 pl-1 flex items-center gap-1"
          >
            <AlertCircle className="size-3 shrink-0" />
            {error}
          </motion.p>
        ) : helperText ? (
          <p className="text-[11px] text-[#666666] font-sans mt-1 pl-1">{helperText}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ShareStoryPage() {
  const { user, session, profile } = useAuthStore();
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

  const formSectionRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };


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
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
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
      if (!authorName.trim()) errors.authorName = "Your name is required.";
      if (!contactEmail.trim() || !contactEmail.includes("@"))
        errors.contactEmail = "Valid email is required.";
    } else if (activeStep === 1) {
      if (!title.trim()) errors.title = "Story title is required.";
      if (!summary.trim()) errors.summary = "A 1-line teaser summary is required.";
      if (selectedThemes.length === 0) errors.themes = "Select at least one category.";
    } else if (activeStep === 2) {
      if (!story.trim()) errors.story = "Full story narrative is required.";
      if (!district.trim()) errors.district = "District or city is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please complete the required fields to proceed.");
      return;
    }

    setFieldErrors({});
    setErrorMessage(null);
    setActiveStep((prev) => Math.min(prev + 1, 4));
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setActiveStep((prev) => Math.max(prev - 1, 0));
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (isDraft = false) => {
    if (uploadingCover || uploadingGallery || uploadingVideo) {
      setErrorMessage("Please wait for media uploads to finish before submitting.");
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

  const isHindi = lang === "hi";
  const categoryItems = isHindi ? CATEGORY_ITEMS_HI : CATEGORY_ITEMS_EN;

  const stepsList = [
    { num: "01", title: isHindi ? "आपके बारे में" : "About You", desc: isHindi ? "आपकी पहचान और संपर्क" : "Your identity & contact", icon: User },
    { num: "02", title: isHindi ? "आपकी कहानी" : "About Your Story", desc: isHindi ? "शीर्षक, श्रेणी और स्थान" : "Title, theme & location", icon: Sparkles },
    { num: "03", title: isHindi ? "कहानी का विवरण" : "Story Narrative", desc: isHindi ? "संपादकीय लेखन पृष्ठ" : "Editorial writing canvas", icon: PenLine },
    { num: "04", title: isHindi ? "चित्र और मीडिया" : "Visual Media", desc: isHindi ? "तस्वीरें, वीडियो और संदर्भ" : "Photos, video & references", icon: ImageIcon },
    { num: "05", title: isHindi ? "समीक्षा एवं प्रस्तुत" : "Review & Preserve", desc: isHindi ? "पूर्वावलोकन और प्रस्तुति" : "Live preview & submission", icon: Send },
  ];

  const wordCount = story.trim() ? story.trim().split(/\s+/).length : 0;
  const charCount = story.length;

  const previewStory: Story = {
    id: "preview-story-id",
    slug: autoSlug,
    title: title || (isHindi ? "आपकी कहानी का शीर्षक यहाँ दिखाई देगा" : "Your Story Title Here"),
    excerpt: summary || (isHindi ? "आपकी कहानी का सारांश यहाँ दिखाई देगा" : "Your story teaser summary will appear here once entered."),
    content: story || (isHindi ? "कहानी का पूरा विवरण..." : "Full story text narrative..."),
    themes: selectedThemes,
    region: stateName + (district ? `, ${district}` : ""),
    readTime: isHindi ? `${Math.max(1, Math.ceil((wordCount || 1) / 200))} मिनट पढ़ने का समय` : `${Math.max(1, Math.ceil((wordCount || 1) / 200))} min read`,
    image: coverImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
    url: `/stories/${autoSlug}`,
    authorName: authorName || (isHindi ? "सत्यापित कहानीकार" : "Verified Storyteller"),
    publishedAt: new Date().toISOString(),
    viewCount: 1,
    likesCount: 0,
    commentsCount: 0,
  };

  return (
    <SiteLayout>
      {/* ── Background Theme Base ── */}
      <div className="min-h-screen bg-[#FBF8F3] dark:bg-[#121110] text-[#1D1D1D] dark:text-[#FBF8F3] selection:bg-[#9E1C20] selection:text-white transition-colors duration-300 font-sans">
        
        {/* ── 1. IMMERSIVE EDITORIAL HERO ── */}
        <section className="relative overflow-clip pt-28 pb-20 md:pt-36 md:pb-28 border-b border-[#ECE7DF] dark:border-[#2A2722]">
          {/* Heritage Paper Texture & Subtle Radial Glow */}
          <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-10 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute -top-40 -left-40 size-[600px] rounded-full bg-[#9E1C20]/5 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-40 size-[500px] rounded-full bg-[#C9A227]/10 blur-3xl pointer-events-none" />

          <div className="container mx-auto px-6 max-w-5xl text-center relative z-10 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#9E1C20] dark:text-[#C9A227] text-xs font-bold uppercase tracking-[0.2em]"
            >
              <Feather className="size-3.5" />
              <span>{isHindi ? "भारतीय इतिहास एवं धरोहर संरक्षण" : "Preserving Subcontinental History"}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1D1D1D] dark:text-[#FBF8F3] max-w-4xl mx-auto leading-[1.08]"
            >
              {isHindi ? (
                <>हर कहानी गढ़ती है <span className="text-[#9E1C20] italic font-serif">भारत का भविष्य।</span></>
              ) : (
                <>Every Story Shapes <span className="text-[#9E1C20] italic font-serif">India's Future.</span></>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-[#666666] dark:text-[#A09D96] max-w-2xl mx-auto leading-relaxed font-sans font-normal"
            >
              {isHindi
                ? "चाहे वह कोई गुमनाम नायक हो, ग्रामीण नवाचार हो, स्थानीय परंपरा हो या प्रेरणादायक व्यक्तित्व—आपकी कहानी सदा के लिए सहेजे जाने योग्य है।"
                : "Whether it's a forgotten hero, a village innovation, a local tradition, or an inspiring individual—your story deserves to be preserved forever."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="pt-4 flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                type="button"
                onClick={scrollToForm}
                size="lg"
                className="bg-[#9E1C20] hover:bg-[#851619] text-white font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.16em] h-13 px-8 rounded-full shadow-lg shadow-[#9E1C20]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 min-h-[44px]"
              >
                <span>{isHindi ? "अपनी कहानी लिखना शुरू करें" : "Begin Your Story"}</span>
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="pt-10 flex flex-col items-center gap-1 text-[#666666]/60 cursor-pointer"
              onClick={scrollToForm}
            >
              <span className="text-[10px] uppercase font-bold tracking-[0.25em]">
                {isHindi ? "नीचे स्क्रॉल करें" : "Scroll Down"}
              </span>
              <ChevronDown className="size-4 text-[#C9A227]" />
            </motion.div>
          </div>
        </section>

        {/* ── 2. GUIDED STORYTELLING JOURNEY ── */}
        <section ref={formSectionRef} className="container mx-auto px-5 sm:px-6 py-16 md:py-24 max-w-7xl">
          
          {/* Mobile Top Progress Bar */}
          <div className="block lg:hidden mb-8 sticky top-16 z-40 bg-[#FBF8F3]/90 dark:bg-[#121110]/90 backdrop-blur-md py-3 border-b border-[#ECE7DF] dark:border-[#2A2722]">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#9E1C20] dark:text-[#C9A227] mb-2">
              <span>{isHindi ? `चरण ${activeStep + 1} / 5` : `Step ${activeStep + 1} of 5`}</span>
              <span>{stepsList[activeStep].title}</span>
            </div>
            <div className="h-1.5 w-full bg-[#ECE7DF] dark:bg-[#2A2722] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#9E1C20]"
                animate={{ width: `${((activeStep + 1) / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
            
            {/* ── Desktop Sticky Timeline Sidebar ── */}
            <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
              <div className="bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C9A227] mb-1">
                    {isHindi ? "कहानी यात्रा" : "Storytelling Journey"}
                  </p>
                  <h3 className="font-display text-2xl font-bold text-[#1D1D1D] dark:text-[#FBF8F3]">
                    {isHindi ? "5 मार्गदर्शित चरण" : "5 Guided Steps"}
                  </h3>
                </div>

                <div className="relative space-y-6 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-[2px] before:bg-[#ECE7DF] dark:before:bg-[#2A2722]">
                  {stepsList.map((st, idx) => {
                    const isActive = activeStep === idx;
                    const isCompleted = activeStep > idx;
                    const Icon = st.icon;

                    return (
                      <button
                        key={st.num}
                        type="button"
                        onClick={() => {
                          if (idx <= activeStep || isCompleted) setActiveStep(idx);
                        }}
                        className={`relative z-10 w-full flex items-start gap-4 text-left transition-all duration-300 group cursor-pointer ${
                          isActive ? "scale-[1.02]" : "opacity-75 hover:opacity-100"
                        }`}
                      >
                        <div
                          className={`size-10 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 ${
                            isCompleted
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : isActive
                              ? "bg-[#9E1C20] border-[#9E1C20] text-white shadow-lg shadow-[#9E1C20]/25"
                              : "bg-[#FBF8F3] dark:bg-[#2A2722] border-[#ECE7DF] dark:border-[#3A3732] text-[#666666]"
                          }`}
                        >
                          {isCompleted ? <Check className="size-4" /> : <Icon className="size-4" />}
                        </div>

                        <div className="pt-0.5 space-y-0.5">
                          <p
                            className={`text-xs font-bold uppercase tracking-wider font-sans ${
                              isActive
                                ? "text-[#9E1C20] dark:text-[#C9A227]"
                                : isCompleted
                                ? "text-[#1D1D1D] dark:text-[#FBF8F3]"
                                : "text-[#666666]"
                            }`}
                          >
                            {isHindi ? `चरण ${st.num}` : `STEP ${st.num}`}
                          </p>
                          <h4 className="font-display text-base font-bold leading-tight text-[#1D1D1D] dark:text-[#FBF8F3]">
                            {st.title}
                          </h4>
                          <p className="text-xs text-[#666666] dark:text-[#A09D96] font-sans">
                            {st.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Draft Autosave Banner */}
                <div className="pt-4 border-t border-[#ECE7DF] dark:border-[#2A2722] flex items-center justify-between text-xs text-[#666666] font-sans">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    {draftSaved ? "Draft auto-saved" : "Auto-saving active"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    className="text-[11px] font-bold text-[#9E1C20] dark:text-[#C9A227] hover:underline"
                  >
                    Save Draft Now
                  </button>
                </div>
              </div>
            </div>

            {/* ── Main Form Cards Canvas ── */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Success Screen */}
              {done ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] rounded-[24px] p-8 md:p-14 text-center space-y-6 shadow-[0_10px_40px_rgb(0,0,0,0.04)] relative overflow-hidden"
                >
                  <div className="size-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="size-10" />
                  </div>

                  <div className="space-y-3 max-w-xl mx-auto">
                    <span className="inline-block px-3.5 py-1 rounded-full bg-[#C9A227]/15 text-[#9E1C20] dark:text-[#C9A227] text-xs font-bold uppercase tracking-wider">
                      +20 Contributor XP Earned!
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1D1D1D] dark:text-[#FBF8F3]">
                      Your Story is Now Preserved for Review!
                    </h2>
                    <p className="text-sm text-[#666666] dark:text-[#A09D96] leading-relaxed">
                      Thank you for contributing to India Story Project. Our editorial board will inspect, fact-verify, and polish your submission within 5–7 business days.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                    <Button
                      type="button"
                      onClick={handleReset}
                      className="bg-[#9E1C20] text-white hover:bg-[#851619] font-bold text-xs uppercase tracking-wider h-12 px-7 rounded-full shadow-md"
                    >
                      <RotateCcw className="size-4 mr-2" />
                      Submit Another Story
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-[#ECE7DF] dark:border-[#2A2722] text-[#1D1D1D] dark:text-[#FBF8F3] hover:border-[#9E1C20] font-bold text-xs uppercase tracking-wider h-12 px-7 rounded-full"
                    >
                      <Link to="/stories">Explore Archive</Link>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* ── STEP 1: ABOUT YOU ── */}
                  {activeStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] rounded-[24px] p-8 md:p-12 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                    >
                      <div className="space-y-2 border-b border-[#ECE7DF] dark:border-[#2A2722] pb-6">
                        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C9A227]">
                          {isHindi ? "चरण 01 / 05" : "Step 01 / 05"}
                        </span>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1D1D1D] dark:text-[#FBF8F3]">
                          {isHindi ? "आपकी जानकारी से शुरुआत करें" : "Let's Begin With You"}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#666666] dark:text-[#A09D96]">
                          {isHindi
                            ? "कृपया बताएं कि यह कहानी कौन दर्ज कर रहा है। प्रकाशन पर आपको लेखक का श्रेय प्राप्त होगा।"
                            : "Tell us who is documenting this story. You will receive author credit and XP upon publication."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FloatingInput
                          label={isHindi ? "आपका पूरा नाम" : "Your Full Name"}
                          isRequired
                          icon={User}
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          error={fieldErrors.authorName}
                          isValid={!!authorName.trim()}
                        />
                        <FloatingInput
                          label={isHindi ? "संपर्क ईमेल पता" : "Contact Email Address"}
                          isRequired
                          type="email"
                          icon={Mail}
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          error={fieldErrors.contactEmail}
                          isValid={contactEmail.includes("@")}
                        />
                        <FloatingInput
                          label={isHindi ? "फ़ोन नंबर (वैकल्पिक)" : "Phone Number (Optional)"}
                          icon={Phone}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          helperText={isHindi ? "अत्यावश्यक संपादकीय स्पष्टीकरण के लिए" : "For urgent editorial clarification"}
                        />
                        <div className="space-y-1.5 font-sans">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-[#C9A227] block">
                            {isHindi ? "कहानी की भाषा" : "Story Language"}
                          </label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] text-[#1D1D1D] dark:text-[#FBF8F3] text-sm rounded-xl px-4 h-12 outline-none focus:border-[#9E1C20] cursor-pointer"
                          >
                            <option value="en">English Narrative</option>
                            <option value="hi">हिन्दी (Hindi Narrative)</option>
                          </select>
                        </div>
                      </div>

                      <FloatingTextarea
                        label={isHindi ? "लेखक का संक्षिप्त परिचय / पृष्ठभूमि" : "Brief Author Bio / Background"}
                        rows={3}
                        value={authorBio}
                        onChange={(e) => setAuthorBio(e.target.value)}
                        helperText={isHindi ? "अपनी पृष्ठभूमि, शोध या इस विषय से जुड़ाव के बारे में पाठकों को बताएं।" : "Tell readers about your background, research or connection to this topic."}
                      />
                    </motion.div>
                  )}

                  {/* ── STEP 2: ABOUT YOUR STORY ── */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] rounded-[24px] p-8 md:p-12 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                    >
                      <div className="space-y-2 border-b border-[#ECE7DF] dark:border-[#2A2722] pb-6">
                        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C9A227]">
                          {isHindi ? "चरण 02 / 05" : "Step 02 / 05"}
                        </span>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1D1D1D] dark:text-[#FBF8F3]">
                          {isHindi ? "अपनी कहानी के बारे में बताएं" : "Tell Us About Your Story"}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#666666] dark:text-[#A09D96]">
                          {isHindi ? "अपनी प्रस्तुति का शीर्षक, स्थान, श्रेणी और विषय निर्धारित करें।" : "Define the headline, location, categories, and subject of your submission."}
                        </p>
                      </div>

                      <div className="space-y-6">
                        <FloatingInput
                          label={isHindi ? "कहानी का शीर्षक" : "Story Title"}
                          isRequired
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          error={fieldErrors.title}
                          isValid={!!title.trim()}
                          helperText={isHindi ? "इसे आकर्षक बनाएं (जैसे 'जैसलमेर का वर्षा जल रक्षक')" : "Make it compelling (e.g., 'The Rainwater Guardian of Jaisalmer')"}
                        />

                        <FloatingTextarea
                          label={isHindi ? "1-पंक्ति का संक्षिप्त सारांश" : "1-Line Teaser Summary"}
                          isRequired
                          rows={2}
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          error={fieldErrors.summary}
                          isValid={!!summary.trim()}
                          helperText={isHindi ? "एक संक्षिप्त सारांश जो आर्काइव कार्ड पर दिखाई देगा।" : "A brief hook summary that appears on archive cards."}
                        />

                        <FloatingInput
                          label={isHindi ? "गुमनाम नायक / मुख्य पात्र का नाम (वैकल्पिक)" : "Unsung Hero / Subject Name (Optional)"}
                          icon={User}
                          value={heroName}
                          onChange={(e) => setHeroName(e.target.value)}
                          helperText={isHindi ? "विशेष रूप से प्रदर्शित व्यक्ति, शिल्पकार या समुदाय का नाम।" : "Name of the person, artisan or community group featured."}
                        />

                        {/* Category Selector Grid */}
                        <div className="space-y-3 font-sans">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-[#C9A227] block">
                            {isHindi ? "श्रेणियाँ चुनें (कम से कम 1)" : "Select Categories (At least 1)"} <span className="text-[#9E1C20]">*</span>
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {categoryItems.map((cat) => {
                              const isSelected = selectedThemes.includes(cat.name);
                              const Icon = cat.icon;
                              return (
                                <button
                                  key={cat.name}
                                  type="button"
                                  onClick={() => toggleTheme(cat.name)}
                                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer ${
                                    isSelected
                                      ? "bg-[#9E1C20]/10 border-[#9E1C20] text-[#9E1C20] dark:text-[#C9A227] shadow-sm"
                                      : "bg-[#FBF8F3] dark:bg-[#2A2722] border-[#ECE7DF] dark:border-[#3A3732] text-[#666666] hover:border-[#C9A227]/50"
                                  }`}
                                >
                                  <div
                                    className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                                      isSelected
                                        ? "bg-[#9E1C20] text-white"
                                        : "bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#3A3732] text-[#666666]"
                                    }`}
                                  >
                                    <Icon className="size-4" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-bold font-sans leading-tight">
                                      {cat.label}
                                    </p>
                                    <p className="text-[11px] text-[#666666] dark:text-[#A09D96] font-sans leading-snug">
                                      {cat.desc}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-1.5 font-sans">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-[#C9A227] block">
                              {isHindi ? "राज्य / केंद्र शासित प्रदेश" : "State / Territory"} <span className="text-[#9E1C20]">*</span>
                            </label>
                            <select
                              value={stateName}
                              onChange={(e) => setStateName(e.target.value)}
                              className="w-full bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] text-[#1D1D1D] dark:text-[#FBF8F3] text-sm rounded-xl px-4 h-12 outline-none focus:border-[#9E1C20] cursor-pointer"
                            >
                              {STATES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>

                          <FloatingInput
                            label={isHindi ? "ज़िला / शहर / गाँव" : "District / City / Village"}
                            isRequired
                            icon={MapPin}
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            error={fieldErrors.district}
                            isValid={!!district.trim()}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}


                  {/* ── STEP 3: STORY CONTENT (EDITORIAL WRITING CANVAS) ── */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] rounded-[24px] p-8 md:p-12 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                    >
                      <div className="space-y-2 border-b border-[#ECE7DF] dark:border-[#2A2722] pb-6">
                        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C9A227]">
                          {isHindi ? "चरण 03 / 05" : "Step 03 / 05"}
                        </span>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1D1D1D] dark:text-[#FBF8F3]">
                          {isHindi ? "संपादकीय लेखन पृष्ठ" : "Editorial Writing Canvas"}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#666666] dark:text-[#A09D96]">
                          {isHindi ? "अपनी कहानी को समृद्ध विवरणों, उद्धरणों और पृष्ठभूमि के साथ प्रस्तुत करें।" : "Imagine you're telling this story to the world. Craft your narrative with rich descriptions, quotes, and background."}
                        </p>
                      </div>

                      <FloatingTextarea
                        label={isHindi ? "पूर्ण कहानी का मुख्य विवरण" : "Full Story Narrative Body"}
                        isRequired
                        rows={12}
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                        error={fieldErrors.story}
                        isValid={!!story.trim()}
                        wordCount={wordCount}
                        charCount={charCount}
                        placeholder={isHindi ? "एक समय की बात है जब..." : "Once upon a time in the heart of..."}
                      />

                      <FloatingInput
                        label={isHindi ? "टैग / विषय (कॉमा से अलग करें)" : "Tags / Topics (Comma separated)"}
                        icon={Compass}
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        helperText={isHindi ? "उदाहरण: बावड़ी, वर्षा जल, राजस्थान, धरोहर संरक्षण" : "e.g. stepwell, rainwater, rajasthan, heritage preservation"}
                      />

                      {/* SEO Expandable Panel */}
                      <div className="border border-[#ECE7DF] dark:border-[#2A2722] rounded-xl overflow-hidden font-sans">
                        <button
                          type="button"
                          onClick={() => setShowSEO(!showSEO)}
                          className="w-full p-4 bg-[#FBF8F3] dark:bg-[#2A2722] flex items-center justify-between text-left cursor-pointer"
                        >
                          <span className="text-xs font-bold uppercase tracking-wider text-[#9E1C20] dark:text-[#C9A227] flex items-center gap-2">
                            <Sparkles className="size-4" />
                            {isHindi ? "सर्च इंजन ऑप्टिमाइजेशन (SEO) विकल्प" : "Search Engine Optimization (SEO) Options"}
                          </span>
                          <ChevronDown
                            className={`size-4 text-[#666666] transition-transform ${
                              showSEO ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {showSEO && (
                          <div className="p-6 space-y-4 bg-white dark:bg-[#181715] border-t border-[#ECE7DF] dark:border-[#2A2722]">
                            <FloatingInput
                              label={isHindi ? "कस्टम SEO शीर्षक" : "Custom SEO Title"}
                              value={seoTitle}
                              onChange={(e) => setSeoTitle(e.target.value)}
                            />
                            <FloatingTextarea
                              label={isHindi ? "कस्टम मेटा विवरण" : "Custom Meta Description"}
                              rows={2}
                              value={seoDescription}
                              onChange={(e) => setSeoDescription(e.target.value)}
                            />
                            <FloatingInput
                              label={isHindi ? "SEO कीवर्ड्स" : "SEO Keywords"}
                              value={seoKeywords}
                              onChange={(e) => setSeoKeywords(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 4: VISUAL MEDIA ── */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] rounded-[24px] p-8 md:p-12 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] font-sans"
                    >
                      <div className="space-y-2 border-b border-[#ECE7DF] dark:border-[#2A2722] pb-6">
                        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C9A227]">
                          {isHindi ? "चरण 04 / 05" : "Step 04 / 05"}
                        </span>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1D1D1D] dark:text-[#FBF8F3]">
                          {isHindi ? "चित्र और मीडिया सामग्री" : "Visual Media & Artifacts"}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#666666] dark:text-[#A09D96]">
                          {isHindi ? "उच्च गुणवत्ता वाली तस्वीरें और वीडियो कहानी के प्रभाव और पाठकों की रुचि को बढ़ाते हैं।" : "High quality imagery and video greatly increase readership and publication likelihood."}
                        </p>
                      </div>

                      {/* Cover Image Upload Dropzone */}
                      <div className="space-y-3 font-sans">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#9E1C20] dark:text-[#C9A227]">
                          {isHindi ? "मुख्य फ़ीचर कवर फ़ोटो" : "Main Feature Cover Photo"}
                        </label>

                        {coverImage ? (
                          <div className="relative rounded-2xl overflow-hidden border border-[#ECE7DF] dark:border-[#2A2722] group aspect-video max-h-72">
                            <img
                              src={coverImage}
                              alt="Cover Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setCoverImage("")}
                              className="absolute top-3 right-3 p-2.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragOverCover(true);
                            }}
                            onDragLeave={() => setIsDragOverCover(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragOverCover(false);
                              if (e.dataTransfer.files?.[0]) {
                                void performCoverUpload(e.dataTransfer.files[0]);
                              }
                            }}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                              isDragOverCover
                                ? "border-[#9E1C20] bg-[#9E1C20]/5"
                                : "border-[#ECE7DF] dark:border-[#2A2722] hover:border-[#C9A227]"
                            }`}
                          >
                            <UploadCloud className="size-10 text-[#C9A227] mx-auto mb-3" />
                            <p className="text-sm font-bold text-[#1D1D1D] dark:text-[#FBF8F3]">
                              {isHindi ? "कवर फ़ोटो यहाँ ड्रैग और ड्रॉप करें" : "Drag & Drop Feature Cover Photo"}
                            </p>
                            <p className="text-xs text-[#666666] mt-1">
                              {isHindi ? "JPG, PNG, WEBP फ़ाइलें 10MB तक समर्थित हैं" : "Supports JPG, PNG, WEBP up to 10MB"}
                            </p>

                            <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#9E1C20] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md hover:bg-[#851619] transition-all">
                              {uploadingCover ? (
                                <>
                                  <Loader2 className="size-4 animate-spin" />
                                  <span>{isHindi ? "अपलोड हो रहा है..." : "Uploading..."}</span>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="size-4" />
                                  <span>{isHindi ? "फ़ाइल चुनें" : "Browse File"}</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    void performCoverUpload(e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Gallery Images Dropzone */}
                      <div className="space-y-3 font-sans pt-4 border-t border-[#ECE7DF] dark:border-[#2A2722]">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#9E1C20] dark:text-[#C9A227]">
                          {isHindi ? "गैलरी चित्र (वैकल्पिक)" : "Gallery Images (Optional)"}
                        </label>

                        {galleryImages.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            {galleryImages.map((imgUrl, idx) => (
                              <div
                                key={idx}
                                className="relative rounded-xl overflow-hidden aspect-square border border-[#ECE7DF] dark:border-[#2A2722]"
                              >
                                <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setGalleryImages(galleryImages.filter((_, i) => i !== idx))
                                  }
                                  className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOverGallery(true);
                          }}
                          onDragLeave={() => setIsDragOverGallery(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOverGallery(false);
                            if (e.dataTransfer.files?.length) {
                              void performGalleryUpload(Array.from(e.dataTransfer.files));
                            }
                          }}
                          className="border border-dashed border-[#ECE7DF] dark:border-[#2A2722] rounded-xl p-6 text-center"
                        >
                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FBF8F3] dark:bg-[#2A2722] border border-[#ECE7DF] dark:border-[#3A3732] text-xs font-bold uppercase tracking-wider text-[#1D1D1D] dark:text-[#FBF8F3] cursor-pointer hover:border-[#9E1C20]">
                            {uploadingGallery ? (
                              <Loader2 className="size-4 animate-spin text-[#9E1C20]" />
                            ) : (
                              <ImageIcon className="size-4 text-[#C9A227]" />
                            )}
                            <span>{isHindi ? "गैलरी तस्वीरें अपलोड करें" : "Upload Gallery Photos"}</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.length) {
                                  void performGalleryUpload(Array.from(e.target.files));
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Video Link */}
                      <div className="pt-4 border-t border-[#ECE7DF] dark:border-[#2A2722] space-y-4">
                        <FloatingInput
                          label={isHindi ? "यूट्यूब / विमीओ वीडियो लिंक (वैकल्पिक)" : "YouTube / Vimeo Video URL (Optional)"}
                          icon={Video}
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          helperText={isHindi ? "वृत्तचित्र वीडियो सामग्री या साक्षात्कार का लिंक।" : "Link to documentary video footage or interviews."}
                        />

                        <FloatingTextarea
                          label={isHindi ? "बाहरी संदर्भ / स्रोत लिंक (वैकल्पिक)" : "External References / Source Links (Optional)"}
                          rows={2}
                          value={externalLinks}
                          onChange={(e) => setExternalLinks(e.target.value)}
                          helperText={isHindi ? "समाचार लेख, पुस्तकें, शोध पत्र या तथ्य जांच के लिए लिंक।" : "News articles, books, research papers or social handles for fact checking."}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 5: REVIEW & SUBMIT ── */}
                  {activeStep === 4 && (
                    <motion.div
                      key="step-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white dark:bg-[#181715] border border-[#ECE7DF] dark:border-[#2A2722] rounded-[24px] p-8 md:p-12 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] font-sans"
                    >
                      <div className="space-y-2 border-b border-[#ECE7DF] dark:border-[#2A2722] pb-6">
                        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C9A227]">
                          {isHindi ? "चरण 05 / 05" : "Step 05 / 05"}
                        </span>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1D1D1D] dark:text-[#FBF8F3]">
                          {isHindi ? "समीक्षा एवं प्रस्तुत करें" : "Review & Submit Story"}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#666666] dark:text-[#A09D96]">
                          {isHindi ? "इंडिया स्टोरी प्रोजेक्ट पर सहेजने से पहले अपनी प्रस्तुति का पूर्वावलोकन करें।" : "Review your submission summary before preserving it permanently on India Story Project."}
                        </p>
                      </div>

                      {/* Live Card Preview */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#9E1C20] dark:text-[#C9A227] block">
                          {isHindi ? "लाइव आर्काइव कार्ड पूर्वावलोकन" : "Live Archive Card Preview"}
                        </label>
                        <div className="max-w-md mx-auto">
                          <StoryCard story={previewStory} index={0} />
                        </div>
                      </div>

                      {/* Summary Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#ECE7DF] dark:border-[#2A2722]">
                        <div className="p-4 rounded-xl bg-[#FBF8F3] dark:bg-[#2A2722] border border-[#ECE7DF] dark:border-[#3A3732] space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">
                            {isHindi ? "लेखक एवं संपर्क" : "Author & Contact"}
                          </span>
                          <p className="text-sm font-bold">{authorName || (isHindi ? "निर्दिष्ट नहीं" : "Not specified")}</p>
                          <p className="text-xs text-[#666666]">{contactEmail}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-[#FBF8F3] dark:bg-[#2A2722] border border-[#ECE7DF] dark:border-[#3A3732] space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">
                            {isHindi ? "स्थान एवं श्रेणी" : "Location & Category"}
                          </span>
                          <p className="text-sm font-bold">{stateName}, {district}</p>
                          <p className="text-xs text-[#9E1C20] dark:text-[#C9A227] font-semibold">
                            {selectedThemes.join(", ")}
                          </p>
                        </div>
                      </div>

                      {/* Legal Agreement */}
                      <div className="p-4 rounded-xl bg-[#9E1C20]/5 border border-[#9E1C20]/20 text-xs text-[#666666] leading-relaxed flex items-start gap-3">
                        <Shield className="size-5 text-[#9E1C20] shrink-0 mt-0.5" />
                        <p>
                          {isHindi
                            ? "सबमिट करके, आप पुष्टि करते हैं कि यह कहानी आपकी सर्वोत्तम जानकारी के अनुसार सटीक है, किसी भी कॉपीराइट का उल्लंघन नहीं करती है, और इंडिया स्टोरी प्रोजेक्ट को इसे प्रकाशित करने का अधिकार देती है।"
                            : "By submitting, you confirm that this narrative is accurate to the best of your knowledge, does not infringe third-party copyrights, and grant India Story Project editorial license to publish, format, and share this story."}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Navigation Actions Bar ── */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#ECE7DF] dark:border-[#2A2722]">
                    {activeStep > 0 ? (
                      <Button
                        type="button"
                        onClick={handlePrevStep}
                        variant="outline"
                        className="border-[#ECE7DF] dark:border-[#2A2722] text-[#1D1D1D] dark:text-[#FBF8F3] hover:border-[#9E1C20] font-sans font-bold text-xs uppercase tracking-wider h-12 px-6 rounded-full cursor-pointer min-h-[44px]"
                      >
                        <ArrowLeft className="size-4 mr-2" />
                        <span>{isHindi ? "पिछला चरण" : "Previous Step"}</span>
                      </Button>
                    ) : (
                      <div />
                    )}

                    {activeStep < 4 ? (
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="bg-[#9E1C20] hover:bg-[#851619] text-white font-sans font-bold text-xs uppercase tracking-wider h-12 px-8 rounded-full shadow-md shadow-[#9E1C20]/20 cursor-pointer min-h-[44px]"
                      >
                        <span>{isHindi ? "आगे बढ़ें" : "Continue"}</span>
                        <ArrowRight className="size-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => handleSubmit(false)}
                        disabled={submitLoading}
                        className="bg-[#9E1C20] hover:bg-[#851619] text-white font-sans font-bold text-xs uppercase tracking-[0.16em] h-13 px-9 rounded-full shadow-lg shadow-[#9E1C20]/25 cursor-pointer min-h-[44px]"
                      >
                        {submitLoading ? (
                          <>
                            <Loader2 className="size-4 animate-spin mr-2" />
                            <span>{isHindi ? "कहानी सहेजी जा रही है..." : "Preserving Story..."}</span>
                          </>
                        ) : (
                          <>
                            <Send className="size-4 mr-2" />
                            <span>{isHindi ? "कहानी जमा करें" : "Submit & Preserve Story"}</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        </section>

        {/* ── 3. EDITORIAL PROCESS TIMELINE ── */}
        <section className="py-20 bg-white dark:bg-[#181715] border-t border-[#ECE7DF] dark:border-[#2A2722]">
          <div className="container mx-auto px-6 max-w-5xl text-center space-y-12">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C9A227]">
                {isHindi ? "पारदर्शी कार्यप्रणाली" : "Transparent Workflow"}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1D1D1D] dark:text-[#FBF8F3]">
                {isHindi ? "कहानी जमा करने के बाद क्या होता है?" : "What Happens After You Submit?"}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {(lang === "hi" ? processStepsHi : processStepsEn).map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.num}
                    className="p-6 rounded-2xl border border-[#ECE7DF] dark:border-[#2A2722] bg-[#FBF8F3] dark:bg-[#2A2722] text-left space-y-3"
                  >
                    <span className="text-xs font-bold text-[#9E1C20] dark:text-[#C9A227] font-sans">
                      {step.num}
                    </span>
                    <Icon className="size-5 text-[#9E1C20]" />
                    <h3 className="font-display text-base font-bold text-[#1D1D1D] dark:text-[#FBF8F3]">
                      {step.name}
                    </h3>
                    <p className="text-xs text-[#666666] dark:text-[#A09D96] font-sans leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>
    </SiteLayout>
  );
}
