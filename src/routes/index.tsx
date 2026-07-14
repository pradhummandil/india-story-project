import { useMemo, useState, useEffect, useCallback } from "react";
import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  Landmark,
  Lightbulb,
  Leaf,
  Sparkles,
  Users,
  Globe2,
  MapPin,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { StoryCard, type Story } from "@/components/site/StoryCard";
import { Hero } from "@/components/site/Hero";
import { StoryMap } from "@/components/site/StoryMap";
import { RecommendedForYou } from "@/components/site/RecommendedForYou";
import { HeroOfTheDay } from "@/components/site/HeroOfTheDay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStoriesData } from "@/lib/stories-data";
import { useI18nStore, translateStory, getCommonText } from "@/lib/i18n";
import { getStoryAuthor } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "India Story Project — Experience India's Stories" },
      {
        name: "description",
        content: "Discover inspiring stories of changemakers, innovators, and heroes across India.",
      },
      { property: "og:title", content: "India Story Project" },
      { property: "og:description", content: "Experience India's stories, don't just read them." },
    ],
  }),
  component: Home,
});

// Category curated illustrations
// Category curated illustrations
const CATEGORY_MEDIAS = [
  {
    id: "Culture",
    title: { en: "Culture", hi: "संस्कृति" },
    image:
      "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=800",
    desc: {
      en: "Stories celebrating heritage, art, and identity",
      hi: "विरासत, कला और पहचान का जश्न मनाती कहानियां",
    },
  },
  {
    id: "History",
    title: { en: "History", hi: "इतिहास" },
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800",
    desc: {
      en: "Deep dives into India's historic landscape",
      hi: "भारत के ऐतिहासिक परिदृश्य की गहरी खोज",
    },
  },
  {
    id: "Food",
    title: { en: "Food", hi: "व्यंजन" },
    image:
      "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?auto=format&fit=crop&q=80&w=800",
    desc: {
      en: "Tracing culinary history across regions",
      hi: "विभिन्न क्षेत्रों में पाक कला के इतिहास का पता लगाना",
    },
  },
  {
    id: "Festival",
    title: { en: "Festival", hi: "त्योहार" },
    image:
      "https://images.unsplash.com/photo-1506461883276-594a12b11cc3?auto=format&fit=crop&q=80&w=800",
    desc: {
      en: "The colorful celebrations of change and unity",
      hi: "बदलाव और एकता के रंगीन उत्सव",
    },
  },
  {
    id: "Innovation",
    title: { en: "Innovation", hi: "नवाचार" },
    image:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800",
    desc: {
      en: "Stories of ideas becoming real change",
      hi: "वास्तविक बदलाव बनते विचारों की कहानियां",
    },
  },
  {
    id: "Science",
    title: { en: "Science", hi: "विज्ञान" },
    image:
      "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800",
    desc: { en: "Discoveries that push boundaries", hi: "सीमाओं को पार करने वाली खोजें" },
  },
  {
    id: "Environment",
    title: { en: "Environment", hi: "पर्यावरण" },
    image:
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800",
    desc: {
      en: "Stories exploring climate and sustainable futures",
      hi: "जलवायु और सतत भविष्य की खोज करती कहानियां",
    },
  },
  {
    id: "Freedom",
    title: { en: "Freedom", hi: "स्वतंत्रता" },
    image:
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80&w=800",
    desc: {
      en: "Chronicles of struggles and independent paths",
      hi: "संघर्षों और स्वतंत्र रास्तों के इतिहास",
    },
  },
];

function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { stories: dbStories } = useStoriesData();
  const lang = useI18nStore((s) => s.lang);
  const commonText = getCommonText(lang);

  const [featuredStoryRaw, setFeaturedStoryRaw] = useState<Story | null>(null);
  const [gridStoriesRaw, setGridStoriesRaw] = useState<Story[]>([]);
  const [latestStoriesRaw, setLatestStoriesRaw] = useState<Story[]>([]);
  const [trendingStoriesRaw, setTrendingStoriesRaw] = useState<Story[]>([]);
  const handleSubscribe = async () => {
    if (!email.trim()) {
      alert("Please enter your email.");
       return;
        }

  try {
    setLoading(true);

    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        language: lang,
      }),
    });

    const data = await response.json();

      if (response.ok) {
            alert(data.message || "Verification email sent!");
      setEmail("");
    } else {
      alert(data.error || "Subscription failed.");
    }
  } catch (error) {
    console.error(error);
    alert("Server Error");
  } finally {
    setLoading(false);
  }
};

  const fetchHomeData = useCallback(async () => {
    try {
      setHasError(false);
      setDataLoading(true);
      const [featuredRes, gridRes, latestRes, trendingRes] = await Promise.all([
        fetch("/api/featured").catch((err) => { console.error(err); return null; }),
        fetch("/api/stories?pageSize=6").catch((err) => { console.error(err); return null; }),
        fetch("/api/latest-stories").catch((err) => { console.error(err); return null; }),
        fetch("/api/trending").catch((err) => { console.error(err); return null; }),
      ]);

      let successCount = 0;
      if (featuredRes && featuredRes.ok) {
        const data = await featuredRes.json();
        setFeaturedStoryRaw(data.stories && data.stories.length > 0 ? data.stories[0] : null);
        successCount++;
      } else {
        setFeaturedStoryRaw(null);
      }

      if (gridRes && gridRes.ok) {
        const data = await gridRes.json();
        setGridStoriesRaw(data.stories ?? []);
        successCount++;
      }

      if (latestRes && latestRes.ok) {
        const data = await latestRes.json();
        setLatestStoriesRaw(data.stories ?? []);
        successCount++;
      }

      if (trendingRes && trendingRes.ok) {
        const data = await trendingRes.json();
        setTrendingStoriesRaw(data.stories ?? []);
        successCount++;
      }

      if (successCount === 0) {
        setHasError(true);
      }
    } catch (e) {
      console.error("Error loading home page data in parallel:", e);
      setHasError(true);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();

    const channel = new BroadcastChannel("isp-stories-updates");
    channel.onmessage = () => {
      fetchHomeData();
    };

    return () => {
      channel.close();
    };
  }, [fetchHomeData]);

  const featuredStory = useMemo(() => {
    return featuredStoryRaw ? translateStory(featuredStoryRaw, lang) : null;
  }, [featuredStoryRaw, lang]);

  const gridStories = useMemo(() => {
    return gridStoriesRaw.map((s) => translateStory(s, lang));
  }, [gridStoriesRaw, lang]);

  const latestStories = useMemo(() => {
    return latestStoriesRaw.map((s) => translateStory(s, lang));
  }, [latestStoriesRaw, lang]);

  const trendingStories = useMemo(() => {
    return trendingStoriesRaw.map((s) => translateStory(s, lang));
  }, [trendingStoriesRaw, lang]);

  // Category fallback image mapper (Task 6)
  const categoryMediasWithImages = useMemo(() => {
    return CATEGORY_MEDIAS.map((cat) => {
      // Find first story with a matching theme
      const matchingStory = dbStories.find(
        (s) => {
          const storyThemes = Array.isArray(s.themes) ? s.themes : [];
          return storyThemes.some((t) =>
            t.toLowerCase() === cat.id.toLowerCase() ||
            (cat.id === "Festival" && (t.toLowerCase() === "festivals" || t.toLowerCase() === "त्योहार"))
          );
        }
      );
      const firstStoryImage = matchingStory?.image;
      return {
        ...cat,
        image:
          cat.image ||
          firstStoryImage ||
          "https://images.unsplash.com/photo-1524492449949-8f2414161295?w=800",
      };
    });
  }, [dbStories]);

  return (
    <SiteLayout>
      {hasError ? (
        <div className="container mx-auto px-6 py-24 text-center space-y-4">
          <p className="text-sm font-sans uppercase tracking-[0.2em] text-red-500 font-semibold">
            {lang === "en" ? "Unable to Load Stories" : "कहानियां लोड करने में असमर्थ"}
          </p>
          <h2 className="font-display text-3xl font-bold">
            {lang === "en" ? "Connection Offline or Server Error" : "कनेक्शन ऑफ़लाइन या सर्वर त्रुटि"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {lang === "en"
              ? "We encountered a problem fetching the latest content. Please check your internet connection and try again."
              : "हमें नवीनतम सामग्री प्राप्त करने में समस्या आई। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।"}
          </p>
          <div className="pt-4">
            <Button onClick={() => void fetchHomeData()} className="bg-primary hover:bg-primary/95 text-white font-sans uppercase tracking-widest text-xs h-11 px-6 rounded-none shadow-sm">
              {lang === "en" ? "Retry Connection" : "पुनः प्रयास करें"}
            </Button>
          </div>
        </div>
      ) : dataLoading ? (
        <div className="container mx-auto px-6 py-12 space-y-24">
          <div className="h-[60vh] bg-white/5 rounded w-full animate-pulse border border-white/5" />
          <div className="space-y-6 animate-pulse">
            <div className="h-4 w-32 bg-white/5 rounded mx-auto" />
            <div className="h-8 w-64 bg-white/5 rounded mx-auto" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
              <div className="lg:col-span-8 aspect-[16/10] bg-white/5 rounded" />
              <div className="lg:col-span-4 space-y-4">
                <div className="h-4 w-24 bg-white/5 rounded" />
                <div className="h-8 w-full bg-white/5 rounded" />
                <div className="h-16 w-full bg-white/5 rounded" />
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4 border border-white/5 p-5 animate-pulse">
                <div className="h-40 bg-white/5 rounded" />
                <div className="h-4 w-20 bg-white/5 rounded" />
                <div className="h-6 w-full bg-white/5 rounded" />
                <div className="h-4 w-32 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* 1. HERO SECTION */}
          <Hero />

          {/* 2. TRENDING STORIES */}
          {trendingStories.length > 0 && (
            <section className="container mx-auto px-6 py-24 border-b border-border/70 bg-card/10">
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

              {/* Framer motion draggable carousel container */}
              <div className="relative">
                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory">
                  {trendingStories.map((s, i) => (
                    <div key={s.id} className="w-[300px] sm:w-[350px] shrink-0 snap-start">
                      <StoryCard story={s} index={i} />
                    </div>
                  ))}
                </div>
                {/* Soft fade gradients on edges */}
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background/40 to-transparent pointer-events-none" />
              </div>
            </section>
          )}

          {/* 3. HERO OF THE DAY */}
          <HeroOfTheDay />

          {/* 4. FEATURED STORY magazine grid */}
          {featuredStory && (
            <section className="container mx-auto px-6 py-24 border-b border-border/70">
              <div className="text-center mb-16">
                <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold mb-3">
                  {lang === "en" ? "Curated Collections" : "चुनिंदा संग्रह"}
                </p>
                <h2 className="font-display text-4xl md:text-5xl font-bold">
                  {commonText.featuredToday}
                </h2>
                <div className="w-12 h-[1px] bg-primary mx-auto mt-4" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
                {/* 1 featured large card */}
                <div className="lg:col-span-12 border border-border/80 bg-card p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center shadow-sm">
                  <div className="w-full lg:w-3/5 aspect-[16/10] overflow-hidden border border-border/40 bg-muted">
                    {featuredStory.image ? (
                      <img
                        src={featuredStory.image}
                        alt={featuredStory.imageAlt ?? featuredStory.title}
                        className="w-full h-full object-cover filter saturate-[0.85] hover:scale-102 transition-transform duration-[1s]"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-950/40 to-stone-900 flex items-center justify-center">
                        <span className="font-display italic text-3xl text-gold/30">ISP</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full lg:w-2/5 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase font-bold text-gold font-sans">
                      <span className="bg-primary/5 px-2.5 py-0.5 border border-primary/15">
                        {(Array.isArray((featuredStory as any).themes) && (featuredStory as any).themes.length > 0
                            ? (featuredStory as any).themes[0]
                            : "")}
                      </span>
                      <span>•</span>
                      <span>{featuredStory.region}</span>
                    </div>
                    <h3 className="font-display text-3xl md:text-5xl leading-[1.1] font-bold text-foreground hover:text-primary transition-colors">
                      <Link to="/stories/$slug" params={{ slug: featuredStory.slug }}>
                        {featuredStory.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans font-medium">
                      <span>
                        {lang === "en"
                          ? `By ${getStoryAuthor(featuredStory.slug)}`
                          : `लेखक: ${getStoryAuthor(featuredStory.slug)}`}
                      </span>
                      <span>•</span>
                      <span>{featuredStory.readTime || "4 min read"}</span>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-sans font-normal">
                      {featuredStory.excerpt}
                    </p>
                    <div className="pt-4">
                      <Button
                        asChild
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-sans uppercase tracking-[0.15em] text-xs h-11 px-6 rounded-none shadow-sm btn-premium"
                      >
                        <Link to="/stories/$slug" params={{ slug: featuredStory.slug }}>
                          {commonText.readStory}
                          <ArrowRight className="size-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 secondary cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridStories.map((s, i) => (
                  <StoryCard key={s.id} story={s} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* 4. LATEST STORIES */}
          {latestStories.length > 0 && (
            <section className="container mx-auto px-6 py-24 border-b border-border/70">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border pb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold mb-2">
                    {lang === "en" ? "Fresh Perspectives" : "नए दृष्टिकोण"}
                  </p>
                  <h2 className="font-display text-4xl md:text-5xl font-bold">
                    {commonText.latestStories}
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
                {latestStories.map((s, i) => {
                  const authorName = getStoryAuthor(s.slug);
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="border border-border/60 bg-card p-4 hover:border-gold/30 hover:bg-card/70 transition-all duration-300 flex flex-col sm:flex-row gap-5 shadow-sm"
                    >
                      <div className="w-full sm:w-2/5 aspect-[4/3] sm:aspect-square overflow-hidden bg-muted border border-border/30 shrink-0">
                        {s.image ? (
                          <img
                            src={s.image}
                            alt={s.imageAlt ?? s.title}
                            loading="lazy"
                            className="w-full h-full object-cover filter saturate-[0.8] hover:scale-103 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-950/40 to-stone-900 flex items-center justify-center">
                            <span className="font-display italic text-xl text-gold/30">ISP</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-1">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[9px] tracking-[0.2em] uppercase font-bold text-gold font-sans">
                            <span>{Array.isArray((s as any).themes) && (s as any).themes.length > 0 ? (s as any).themes[0] : ""}</span>
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
                          <span>{lang === "en" ? `By ${authorName}` : `लेखक: ${authorName}`}</span>
                          <span>{s.readTime || "3 min read"}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 5. STORIES BY CATEGORY */}
          <section className="container mx-auto px-6 py-24 border-b border-border/70">
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-gold mb-3">
                {lang === "en" ? "Thematic Explorer" : "विषय-आधारित अन्वेषक"}
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                {commonText.exploreByTheme}
              </h2>
              <div className="w-12 h-[1px] bg-primary mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categoryMediasWithImages.map((cat: any, i: number) => {
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
                    {/* Background Category Image */}
                    <img
                      src={cat.image}
                      alt={displayTitle}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover filter saturate-[0.7] brightness-[0.55] group-hover:scale-105 group-hover:brightness-[0.45] transition-all duration-[1s] ease-out"
                    />
                    {/* Gold gradient sweep */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />

                    {/* Content Overlay */}
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
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* 6. STORIES BY STATE */}
          <StoryMap />

          {/* 7. RECOMMENDED FOR YOU */}
          <section className="border-b border-border/80 bg-card/20">
            <RecommendedForYou />
          </section>

          {/* 8. NEWSLETTER SUBSCRIBE */}
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
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === "en" ? "Enter your email address" : "अपना ईमेल दर्ज करें"}
                  className="h-12 bg-background border-border text-foreground font-sans rounded-none focus-visible:ring-primary/40 px-4"
                />
                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-primary-foreground font-sans uppercase tracking-widest text-xs h-12 px-6 rounded-none btn-premium shrink-0"
                >
                  {loading
                    ? "Subscribing..."
                    : lang === "en"
                      ? "Subscribe"
                      : "सदस्यता लें"}
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
    </SiteLayout>
  );
}
