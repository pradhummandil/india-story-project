import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Story } from "@/components/site/StoryCard";
import { StoryDetail } from "@/components/site/StoryDetail";
import { PremiumLoader } from "@/components/common/PremiumLoader";
import { stories } from "@/lib/stories-data";
import { ErrorExperience } from "@/components/common/error/ErrorExperience";

const SITE_URL = "https://indiastoryproject.com";

/** Inject/remove a <meta> tag by name or property */
function setMeta(nameOrProp: string, content: string, isProp = false) {
  const attr = isProp ? "property" : "name";
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Inject/remove the JSON-LD script tag */
function setJsonLd(data: object) {
  const id = "isp-story-jsonld";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd() {
  document.getElementById("isp-story-jsonld")?.remove();
}

export const Route = createFileRoute("/stories/$slug")({
  component: StoryDetailPage,
  notFoundComponent: () => <ErrorExperience type="404" />,
});

function StoryDetailPage() {
  const { slug } = Route.useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!story) return;

    const title = story.title || "Story";
    const excerpt = story.excerpt || `Read this story on India Story Project.`;
    const image = story.image || `${SITE_URL}/Logo-ISP.jpg`;
    const url = `${SITE_URL}/stories/${story.slug}`;
    const author = (story as any).authorName || "India Story Project";
    const datePublished = (story as any).publishedAt || (story as any).createdAt || new Date().toISOString();
    const category = (story as any).category || "Story";

    // Page title
    document.title = `${title} — India Story Project`;

    // Standard meta
    setMeta("description", excerpt);
    setMeta("author", author);
    setMeta("robots", "index, follow, max-image-preview:large");

    // Open Graph
    setMeta("og:type", "article", true);
    setMeta("og:title", title, true);
    setMeta("og:description", excerpt, true);
    setMeta("og:image", image, true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:url", url, true);
    setMeta("og:site_name", "India Story Project", true);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", excerpt);
    setMeta("twitter:image", image);
    setMeta("twitter:site", "@indiastoryproj");

    // Canonical URL
    let canonical = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // JSON-LD Article structured data
    setJsonLd({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": excerpt,
      "image": image,
      "url": url,
      "datePublished": datePublished,
      "author": {
        "@type": "Person",
        "name": author,
      },
      "publisher": {
        "@type": "Organization",
        "name": "India Story Project",
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/Logo-ISP.jpg`,
        },
      },
      "articleSection": category,
      "inLanguage": "en-IN",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url,
      },
    });

    return () => {
      // Restore defaults when leaving the story page
      document.title = "India Story Project — Premium Stories from Modern India";
      removeJsonLd();
    };
  }, [story]);

  useEffect(() => {
    const loadStory = async () => {
      const decodedSlug = decodeURIComponent(slug).trim();
      const normalizedSlug = decodedSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

      // 1. Attempt API fetch from server database
      try {
        const res = await fetch(`/api/stories/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.id || data.title)) {
            setStory(data);
            setError(null);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        /* ignore API network errors, fallback to client stories catalogue */
      }

      // 2. Fallback to client stories catalogue matching slug, id, normalized title, or raw decoded title
      const localMatch = stories.find(
        (s) =>
          s.slug === slug ||
          s.id === slug ||
          s.slug === decodedSlug ||
          s.slug === normalizedSlug ||
          s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedSlug ||
          s.title.toLowerCase().trim() === decodedSlug.toLowerCase().trim()
      );

      if (localMatch) {
        setStory(localMatch);
        setError(null);
      } else {
        setError("Story not found");
      }
      setLoading(false);
    };

    setLoading(true);
    setError(null);
    void loadStory();

    // Listen for live updates from admin
    const channel = new BroadcastChannel("isp-stories-updates");
    channel.onmessage = () => {
      void loadStory();
    };

    return () => channel.close();
  }, [slug]);

  if (loading) {
    return <PremiumLoader />;
  }

  if (error || !story) {
    throw notFound();
  }

  return <StoryDetail story={story} />;
}
