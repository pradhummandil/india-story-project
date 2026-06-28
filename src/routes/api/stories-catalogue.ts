import { createFileRoute } from "@tanstack/react-router";

type StoryFromApi = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  region: string;
  readTime: string;
  image?: string;
  imageAlt?: string;
  url: string;
  content?: string;
};

type CatalogueResponse = {
  stories: StoryFromApi[];
  categories: readonly string[];
  fetchedAt: string;
};

const SOURCE_BASE = "https://indiastoryproject.com";
const LIST_URL = `${SOURCE_BASE}/latest-story/`;

// Simple in-memory cache (works for a single server instance)
let cached: { data: CatalogueResponse; expiresAt: number } | null = null;
const TTL_MS = 1000 * 60 * 30; // 30 minutes

function normalizeText(s: string | null | undefined) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function toSlugFromUrl(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  } catch {
    return "";
  }
}

function safeHtmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchWithTimeout(url: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 12000, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...rest, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

function extractStoryCardsFromListing(listingHtml: string) {
  const links = Array.from(
    listingHtml.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi),
  ).map((m) => m[1]);

  const storyUrls = links
    .filter((href) => {
      if (!href) return false;
      if (href.startsWith("#")) return false;
      if (href.startsWith("mailto:")) return false;
      if (href.startsWith("tel:")) return false;
      return /^\/(?!wp-|author|tag|category|search|page)([^/]+)\/?$/.test(href) || href.includes(SOURCE_BASE);
    })
    .map((href) => {
      try {
        return new URL(href, SOURCE_BASE).toString();
      } catch {
        return `${SOURCE_BASE}${href}`;
      }
    });

  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of storyUrls) {
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }
  return out;
}

function extractMetaFromStoryHtml(slug: string, html: string) {
  const title =
    normalizeText(
      html
        .match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
        ?.replace(/<[^>]+>/g, " "),
    ) ||
    normalizeText(
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      )?.[1],
    );

  const excerpt =
    normalizeText(
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
      )?.[1],
    ) ||
    normalizeText(
      html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      )?.[1],
    ) ||
    "";

  let category = "";
  let region = "";
  let readTime = "";

  const jsonLdMatch = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
  );

  if (jsonLdMatch?.[1]) {
    try {
      const parsed = JSON.parse(jsonLdMatch[1]);
      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
      category = normalizeText(obj?.articleSection);
      region = normalizeText(obj?.about?.name || obj?.address?.addressLocality || obj?.location?.name);
    } catch {
      // ignore
    }
  }

  const image =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    )?.[1] ||
    html.match(
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    )?.[1];

  const imageAlt =
    html.match(/<img[^>]+alt=["']([^"']+)["'][^>]*>/i)?.[1] ?? undefined;

  const articleBlock = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? html;
  const content = safeHtmlToText(articleBlock).slice(0, 12000);

  return {
    slug,
    title,
    excerpt,
    category: category || "कहानी",
    region: region || "India",
    readTime: readTime || "",
    image: image || undefined,
    imageAlt: imageAlt || undefined,
    content,
  };
}

export const Route = createFileRoute("/api/stories-catalogue")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        if (cached && cached.expiresAt > now) {
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "public, max-age=60",
            },
          });
        }

        const listingRes = await fetchWithTimeout(LIST_URL, {
          headers: { "user-agent": "Mozilla/5.0" },
        });
        if (!listingRes.ok) {
          return new Response(`Failed to fetch listing: ${listingRes.status}`, { status: 502 });
        }
        const listingHtml = await listingRes.text();

        const storyUrls = extractStoryCardsFromListing(listingHtml);

        // Avoid returning a catalogue with missing content due to parsing differences.
        // We first scrape all metas, then (only for those with empty content) retry with a looser extractor.
        const concurrency = 6;
        const results: StoryFromApi[] = [];
        let idx = 0;

        function extractAltContentFallback(html: string) {
          // Try to pull body text if <article> extraction fails.
          const bodyText = safeHtmlToText(html);
          return bodyText.slice(0, 12000);
        }

        async function worker() {
          while (idx < storyUrls.length) {
            const current = storyUrls[idx++];
            const slug = toSlugFromUrl(current);
            if (!slug) continue;

            try {
              const detailRes = await fetchWithTimeout(current, {
                headers: { "user-agent": "Mozilla/5.0" },
                timeoutMs: 14000,
              });
              if (!detailRes.ok) continue;
              const detailHtml = await detailRes.text();

              const meta = extractMetaFromStoryHtml(slug, detailHtml);
              if (!meta.title) continue;

              const content = meta.content && meta.content.length >= 40 ? meta.content : extractAltContentFallback(detailHtml);

              results.push({
                id: slug,
                slug,
                title: meta.title,
                excerpt: meta.excerpt || meta.title,
                category: meta.category,
                region: meta.region,
                readTime: meta.readTime,
                image: meta.image,
                imageAlt: meta.imageAlt,
                url: slug,
                content,
              });
            } catch {
              // skip single story
            }
          }
        }

        const workers = Array.from({ length: Math.min(concurrency, storyUrls.length) }, () => worker());
        await Promise.all(workers);

        results.sort((a, b) => a.slug.localeCompare(b.slug));

        const categoriesSet = new Set<string>();
        for (const s of results) {
          if (s.category) categoriesSet.add(s.category);
        }

        const categories = ["All", ...Array.from(categoriesSet).sort((a, b) => a.localeCompare(b))];

        const data: CatalogueResponse = {
          stories: results,
          categories,
          fetchedAt: new Date().toISOString(),
        };

        cached = {
          data,
          expiresAt: now + TTL_MS,
        };

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": `public, max-age=${Math.floor(TTL_MS / 60000)}`,
          },
        });
      },
    },
  },
});


