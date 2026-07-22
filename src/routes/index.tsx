import { useMemo, useState } from "react";
import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Mail,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { StoryCard } from "@/components/site/StoryCard";
import { Hero } from "@/components/site/Hero";
import { StoryMap } from "@/components/site/StoryMap";
import { RecommendedForYou } from "@/components/site/RecommendedForYou";
import { FeaturedStoryCard } from "@/components/site/FeaturedStoryCard";
import { EditorsPicks } from "@/components/site/EditorsPicks";
import { ImpactNumbers } from "@/components/site/ImpactNumbers";
import { ContinueReading } from "@/components/site/ContinueReading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18nStore, translateStory, getCommonText } from "@/lib/i18n";
import { getOptimizedImageUrl, getResponsiveSrcSet } from "@/lib/utils";
import { getInitialStoriesAndCategories } from "@/lib/api/stories.functions";

// Typed return from loader
type LoaderData = Awaited<ReturnType<typeof getInitialStoriesAndCategories>>;

export const Route = createFileRoute("/")(  {
  loader: async () => {
    return getInitialStoriesAndCategories();
  },
  head: () => ({
    meta: [
      { title: "India Story Project — Experience India's Stories" },
      {
        name: "description",
        content:
          "Discover inspiring stories of changemakers, innovators, and heroes across India. India's premier slow-journalism platform.",
      },
      { property: "og:title", content: "India Story Project" },
      {
        property: "og:description",
        content: "Experience India's stories, don't just read them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "India Story Project" },
      {
        name: "twitter:description",
        content: "Discover inspiring stories from every corner of India.",
      },
    ],
  }),
  component: Home,
});

// Category definitions WITHOUT hardcoded images — images will be resolved from DB stories
const CATEGORY_DEFS = [
  {
    id: "Culture",
    title: { en: "Culture", hi: "संस्कृति" },
    desc: {
      en: "Stories celebrating heritage, art, and identity",
      hi: "विरासत, कला और पहचान का जश्न मनाती कहानियां",
    },
    bgGradient: "from-amber-950/60 to-rose-950/70",
  },
  {
    id: "History",
    title: { en: "History", hi: "इतिहास" },
    desc: {
      en: "Deep dives into India's historic landscape",
      hi: "भारत के ऐतिहासिक परिदृश्य की गहरी खोज",
    },
    bgGradient: "from-stone-900 to-amber-950/50",
  },
  {
    id: "Food",
    title: { en: "Food", hi: "व्यंजन" },
    desc: {
      en: "Tracing culinary history across regions",
      hi: "विभिन्न क्षेत्रों में पाक कला के इतिहास का पता लगाना",
    },
    bgGradient: "from-orange-950/60 to-stone-900",
  },
  {
    id: "Festival",
    title: { en: "Festival", hi: "त्योहार" },
    desc: {
      en: "The colorful celebrations of change and unity",
      hi: "बदलाव और एकता के रंगीन उत्सव",
    },
    bgGradient: "from-yellow-950/50 to-rose-950/60",
  },
  {
    id: "Innovation",
    title: { en: "Innovation", hi: "नवाचार" },
    desc: {
      en: "Stories of ideas becoming real change",
      hi: "वास्तविक बदलाव बनते विचारों की कहानियां",
    },
    bgGradient: "from-blue-950/50 to-stone-900",
  },
  {
    id: "Science",
    title: { en: "Science", hi: "विज्ञान" },
    desc: { en: "Discoveries that push boundaries", hi: "सीमाओं को पार करने वाली खोजें" },
    bgGradient: "from-indigo-950/60 to-stone-900",
  },
  {
    id: "Environment",
    title: { en: "Environment", hi: "पर्यावरण" },
    desc: {
      en: "Stories exploring climate and sustainable futures",
      hi: "जलवायु और सतत भविष्य की खोज करती कहानियां",
    },
    bgGradient: "from-green-950/60 to-stone-900",
  },
  {
    id: "Freedom",
    title: { en: "Freedom", hi: "स्वतंत्रता" },
    desc: {
      en: "Chronicles of struggles and independent paths",
      hi: "संघर्षों और स्वतंत्र रास्तों के इतिहास",
    },
    bgGradient: "from-primary/40 to-stone-900",
  },
];

// Newsletter subscribe state
type NewsletterStatus = "idle" | "loading" | "success" | "error";

function Home() {
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<NewsletterStatus>("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const loaderData = Route.useLoaderData() as LoaderData;
  const lang = useI18nStore((s) => s.lang);
  const commonText = getCommonText(lang);

  const dbStories = loaderData?.stories || [];
  const trendingStoriesRaw = loaderData?.trendingStories || [];
  const featuredStoryRaw = loaderData?.featuredStory || null;
  const stateCounts = loaderData?.stateCounts || {};
  const themes = loaderData?.themes || [];
  const heroSlides = loaderData?.heroSlides || [];
  const editorsPicksRaw = loaderData?.editorsPicks || [];
  const hiddenGemsRaw = loaderData?.hiddenGems || [];
  const weeklyStoriesRaw = loaderData?.weeklyStories || [];

  const latestStories = useMemo(() => {
    return dbStories.slice(0, 4).map((s: any) => translateStory(s, lang));
  }, [dbStories, lang]);

  const trendingStories = useMemo(() => {
    return trendingStoriesRaw.map((s: any) => translateStory(s, lang));
  }, [trendingStoriesRaw, lang]);

  const featuredStory = useMemo(() => {
    return featuredStoryRaw ? translateStory(featuredStoryRaw, lang) : null;
  }, [featuredStoryRaw, lang]);

  const editorsPicks = useMemo(() => {
    return editorsPicksRaw.map((s: any) => translateStory(s, lang));
  }, [editorsPicksRaw, lang]);

  const hiddenGems = useMemo(() => {
    return hiddenGemsRaw.map((s: any) => translateStory(s, lang));
  }, [hiddenGemsRaw, lang]);

  const weeklyStories = useMemo(() => {
    return weeklyStoriesRaw.map((s: any) => translateStory(s, lang));
  }, [weeklyStoriesRaw, lang]);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      setNewsletterStatus("error");
      setNewsletterMessage(
        lang === "en" ? "Please enter your email address." : "कृपया अपना ईमेल दर्ज करें।",
      );
      return;
    }

    try {
      setNewsletterStatus("loading");
      setNewsletterMessage("");

      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language: lang }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewsletterStatus("success");
        setNewsletterMessage(
          data.message ||
            (lang === "en"
              ? "Verification email sent! Please check your inbox."
              : "सत्यापन ईमेल भेजा गया! कृपया अपना इनबॉक्स देखें।"),
        );
        setEmail("");
      } else {
        setNewsletterStatus("error");
        setNewsletterMessage(
          data.error ||
            (lang === "en" ? "Subscription failed. Please try again." : "सदस्यता विफल हुई।"),
        );
      }
    } catch {
      setNewsletterStatus("error");
      setNewsletterMessage(
        lang === "en"
          ? "Server error. Please try again later."
          : "सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।",
      );
    }
  };

  // Resolve category images from DB stories — picks the first matching story image per theme
  const categoryMediasWithImages = useMemo(() => {
    return CATEGORY_DEFS.map((cat) => {
      // Find first DB story with a matching theme that has a real image
      const matchingStory = dbStories.find((s: any) => {
        const storyThemes: string[] = Array.isArray(s.themes)
          ? s.themes
          : Array.isArray(s.themes)
            ? s.themes
            : [];
        const themeNames = storyThemes.map((t: any) =>
          typeof t === "string" ? t : t?.name || t?.theme?.name || "",
        );
        return themeNames.some(
          (t) =>
            t.toLowerCase() === cat.id.toLowerCase() ||
            (cat.id === "Festival" &&
              (t.toLowerCase() === "festivals" || t.toLowerCase() === "त्योहार")),
        );
      });
      const resolvedImage: string | null = (matchingStory as any)?.image || null;
      return { ...cat, image: resolvedImage };
    });
  }, [dbStories]);

  return (
    <SiteLayout>
      {dbStories.length === 0 ? (
        <div className="container mx-auto px-6 py-24 text-center space-y-4">
          <p className="text-sm font-sans uppercase tracking-[0.2em] text-destructive font-semibold">
            {lang === "en" ? "Unable to Load Stories" : "कहानियां लोड करने में असमर्थ"}
          </p>
          <h2 className="font-display text-3xl font-bold">
            {lang === "en"
              ? "Connection Offline or Server Error"
              : "कनेक्शन ऑफ़लाइन या सर्वर त्रुटि"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {lang === "en"
              ? "We encountered a problem fetching the latest content. Please check your internet connection and try again."
              : "हमें नवीनतम सामग्री प्राप्त करने में समस्या आई। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।"}
          </p>
        </div>
      ) : (
        <>
          {/* ── 1. HERO — receives slides from loader (no extra HTTP fetch) ── */}
          <Hero
            heroSlides={heroSlides}
            todayPublicationCount={dbStories.filter((s: any) => {
              const d = new Date(s.publishedAt || s.createdAt);
              return d.toDateString() === new Date().toDateString();
            }).length || 2}
            latestStoriesTitles={dbStories.slice(0, 5).map((s: any) => translateStory(s, lang).title)}
          />

          {/* ── 2. TRENDING STORIES ── */}
          {trendingStories.length > 0 && (
            <section className="container mx-auto px-6 py-16 md:py-24 border-b border-border/70 bg-card/10">
              <div className="mb-12 flex items-center gap-3">
                <span className="p-2 rounded-full bg-primary/5 text-primary border border-primary/10">
                  <TrendingUp className="size-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold font-sans font-bold">
                    {lang === "en" ? "Popular Reading" : "लोकप्रिय पाठ"}
                  </p>
                  <h2 className="font-display text-3xl md:text-5xl font-bold">
                    {lang === "en" ? "Trending Stories" : "ट्रेंडिंग कहानियाँ"}
                  </h2>
                </div>
              </div>

              <div className="relative">
                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory touch-pan-x">
                  {trendingStories.map((s: any, i: number) => (
                    <div key={s.id} className="w-[280px] sm:w-[320px] md:w-[350px] shrink-0 snap-start">
                      <StoryCard story={s} index={i} />
                    </div>
                  ))}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background/40 to-transparent pointer-events-none" />
              </div>
            </section>
          )}

          {/* ── 3. LATEST STORIES ── */}
          {latestStories.length > 0 && (
            <section className="container mx-auto px-6 py-16 md:py-24 border-b border-border/70">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-border pb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold mb-2">
                    {lang === "en" ? "Fresh Perspectives" : "नए दृष्टिकोण"}
                  </p>
                  <h2 className="font-display text-3xl md:text-5xl font-bold">
                    {lang === "en" ? "Latest Stories" : "नवीनतम कहानियाँ"}
                  </h2>
                </div>
                <Link
                  to="/stories"
                  className="text-xs uppercase tracking-[0.15em] font-sans font-bold text-primary hover:text-gold inline-flex items-center gap-2 group transition-colors duration-300"
                >
                  {commonText.viewAllStories}
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {latestStories.map((s: any, i: number) => {
                  // Use DB author directly — not the fake hash
                  const authorName = (s as any).author || (s as any).authorName || "ISP Editorial";
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="border border-border/60 bg-card p-4 hover:border-gold/30 hover:bg-card/70 transition-all duration-300 flex flex-col sm:flex-row gap-5 shadow-sm"
                    >
                      <div className="w-full sm:w-2/5 aspect-[16/10] sm:aspect-square overflow-hidden bg-muted border border-border/30 shrink-0">
                        {s.image ? (
                          <img
                            src={getOptimizedImageUrl(s.image, 400)}
                            srcSet={getResponsiveSrcSet(s.image, [240, 400, 600])}
                            sizes="(max-width: 640px) 100vw, 20vw"
                            alt={s.imageAlt ?? s.title}
                            loading="lazy"
                            decoding="async"
                            width="300"
                            height="225"
                            className="w-full h-full object-cover filter saturate-[0.8] hover:scale-103 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-950/40 to-stone-900 flex items-center justify-center">
                            <span className="font-display italic text-xl text-gold/30">ISP</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-1 flex-1">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[9px] tracking-[0.2em] uppercase font-bold text-gold font-sans">
                            <span>
                              {Array.isArray((s as any).themes) && (s as any).themes.length > 0
                                ? (s as any).themes[0]
                                : ""}
                            </span>
                            <span className="text-muted-foreground">{s.region}</span>
                          </div>
                          <h4 className="font-display text-xl font-bold leading-tight hover:text-primary transition-colors">
                            <Link to="/stories/$slug" params={{ slug: s.slug }}>
                              {s.title}
                            </Link>
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 font-sans">
                            {s.excerpt}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40 text-[10px] text-muted-foreground font-sans font-medium">
                          <span>
                            {lang === "en" ? `By ${authorName}` : `लेखक: ${authorName}`}
                          </span>
                          <span>{s.readTime || s.readingTime || "3 min read"}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── 4. CONTINUE READING (client-only — reads localStorage) ── */}
          <ClientOnly>
            <ContinueReading />
          </ClientOnly>

          {/* ── 5. FEATURED STORY ── */}
          {featuredStory && (
            <section className="container mx-auto px-6 py-16 md:py-24 border-b border-border/70">
              <div className="text-center mb-12 md:mb-16">
                <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold mb-3">
                  {lang === "en" ? "Featured Story" : "विशेष कहानी"}
                </p>
                <h2 className="font-display text-3xl md:text-5xl font-bold">
                  {commonText.featuredToday}
                </h2>
                <div className="w-12 h-[1px] bg-primary mx-auto mt-4" />
              </div>
              <FeaturedStoryCard story={featuredStory} />
            </section>
          )}

          {/* ── 6. EDITOR'S PICKS ── */}
          {editorsPicks.length > 0 && <EditorsPicks stories={editorsPicks} />}

          {/* ── 7. WEEKLY STORIES (published in last 7 days) ── */}
          {weeklyStories.length > 0 && (
            <section className="container mx-auto px-6 py-16 md:py-20 border-b border-border/70 bg-card/5">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-full bg-saffron/10 text-saffron border border-saffron/20">
                    <Calendar className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold mb-1">
                      {lang === "en" ? "This Week" : "इस सप्ताह"}
                    </p>
                    <h2 className="font-display text-2xl md:text-4xl font-bold">
                      {lang === "en" ? "Fresh from the Field" : "नई कहानियाँ"}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {weeklyStories.slice(0, 6).map((s: any, i: number) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                  >
                    <StoryCard story={s} index={i} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* ── 8. RECOMMENDED FOR YOU ── */}
          <section className="border-b border-border/80 bg-card/20">
            <RecommendedForYou themes={themes} />
          </section>

          {/* ── 9. STORIES BY STATE (3D India Map) ── */}
          <StoryMap stateCounts={stateCounts} />

          {/* ── 10. HIDDEN GEMS ── */}
          {hiddenGems.length > 0 && (
            <section className="container mx-auto px-6 py-16 md:py-20 border-b border-border/70">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-full bg-gold/10 text-gold border border-gold/20">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold mb-1">
                      {lang === "en" ? "Undiscovered" : "अनदेखा खजाना"}
                    </p>
                    <h2 className="font-display text-2xl md:text-4xl font-bold">
                      {lang === "en" ? "Hidden Gems" : "छिपे रत्न"}
                    </h2>
                  </div>
                </div>
                <Link
                  to="/stories"
                  className="text-xs uppercase tracking-[0.15em] font-sans font-bold text-primary hover:text-gold inline-flex items-center gap-2 group transition-colors"
                >
                  {lang === "en" ? "Explore All" : "सभी देखें"}
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {hiddenGems.slice(0, 4).map((s: any, i: number) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                  >
                    <StoryCard story={s} index={i} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* ── 11. STORIES BY CATEGORY (Thematic Explorer) ── */}
          <section className="container mx-auto px-6 py-16 md:py-24 border-b border-border/70">
            <div className="text-center mb-12 md:mb-16">
              <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold mb-3">
                {lang === "en" ? "Thematic Explorer" : "विषय-आधारित अन्वेषक"}
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-bold">
                {commonText.exploreByTheme}
              </h2>
              <div className="w-12 h-[1px] bg-primary mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categoryMediasWithImages.map((cat, i) => {
                const displayTitle = lang === "hi" ? cat.title.hi : cat.title.en;
                const displayDesc = lang === "hi" ? cat.desc.hi : cat.desc.en;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="group relative aspect-[3/4] overflow-hidden border border-border/40 bg-black cursor-pointer shadow-sm hover:border-gold/50"
                  >
                    {/* Background image (from DB) or gradient fallback */}
                    {cat.image ? (
                      <img
                        src={getOptimizedImageUrl(cat.image, 400)}
                        srcSet={getResponsiveSrcSet(cat.image, [240, 400, 600])}
                        sizes="(max-width: 640px) 50vw, 25vw"
                        alt={displayTitle}
                        loading="lazy"
                        decoding="async"
                        width="300"
                        height="400"
                        className="absolute inset-0 w-full h-full object-cover filter saturate-[0.7] brightness-[0.55] group-hover:scale-105 group-hover:brightness-[0.45] transition-all duration-[1s] ease-out"
                      />
                    ) : (
                      // Gradient fallback — unique per category
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${cat.bgGradient} group-hover:brightness-75 transition-all duration-700`}
                      />
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />

                    {/* Content */}
                    <div className="absolute inset-0 p-5 flex flex-col justify-end z-20">
                      <h3 className="font-display text-2xl md:text-3xl text-white font-bold tracking-tight mb-2 group-hover:text-gold transition-colors duration-300">
                        {displayTitle}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-white/70 font-sans leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {displayDesc}
                      </p>
                      <Link
                        to="/stories"
                        search={{ category: cat.id }}
                        className="absolute inset-0 z-30"
                        aria-label={`Explore ${displayTitle} stories`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── 12. PLATFORM IMPACT NUMBERS ── */}
          <ImpactNumbers />

          {/* ── 13. NEWSLETTER ── */}
          <section className="bg-gradient-to-b from-card/30 to-card/75 border-b border-border/70 py-24">
            <div className="container mx-auto px-6 max-w-4xl text-center space-y-8">
              <div className="relative inline-flex items-center justify-center p-3 rounded-full bg-primary/5 text-primary border border-primary/10">
                <Mail className="size-6 text-gold" />
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold max-w-2xl mx-auto leading-tight">
                {lang === "en" ? "Join the Story Hub" : "स्टोरी हब से जुड़ें"}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-sans leading-relaxed">
                {lang === "en"
                  ? "Subscribe to receive weekly dispatches on changemakers, artists, and innovators reshaping modern India."
                  : "आधुनिक भारत को नया आकार देने वाले बदलावों, कलाकारों और नवप्रवर्तकों पर साप्ताहिक समाचार प्राप्त करने के लिए सदस्यता लें।"}
              </p>

              {/* Input + Button */}
              <AnimatePresence mode="wait">
                {newsletterStatus !== "success" ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2"
                  >
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (newsletterStatus === "error") setNewsletterStatus("idle");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                      placeholder={
                        lang === "en" ? "Enter your email address" : "अपना ईमेल दर्ज करें"
                      }
                      className="h-12 bg-background border-border text-foreground font-sans rounded-none focus-visible:ring-primary/40 px-4"
                      aria-label="Email address"
                    />
                    <Button
                      onClick={handleSubscribe}
                      disabled={newsletterStatus === "loading"}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-primary-foreground font-sans uppercase tracking-widest text-xs h-12 px-6 rounded-none btn-premium shrink-0"
                    >
                      {newsletterStatus === "loading"
                        ? lang === "en"
                          ? "Subscribing…"
                          : "प्रतीक्षा करें…"
                        : lang === "en"
                          ? "Subscribe"
                          : "सदस्यता लें"}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-sm font-sans font-semibold text-green-600 dark:text-green-400"
                  >
                    <CheckCircle2 className="size-5" />
                    {newsletterMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inline error feedback */}
              {newsletterStatus === "error" && newsletterMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-1.5 text-xs text-destructive font-sans"
                >
                  <AlertCircle className="size-3.5" />
                  {newsletterMessage}
                </motion.p>
              )}
            </div>
          </section>
        </>
      )}
    </SiteLayout>
  );
}
