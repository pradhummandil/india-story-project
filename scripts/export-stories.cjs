const fs = require("fs");
const path = require("path");

const SOURCE_BASE = "https://indiastoryproject.com";
const LIST_URL = `${SOURCE_BASE}/latest-story/`;

const OUTPUT_PATH = path.join(process.cwd(), "stories.json");

function normalizeText(s) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function safeHtmlToText(html) {
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

function toSlugFromUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  } catch {
    return "";
  }
}

function extractStoryCardsFromListing(listingHtml) {
  const links = Array.from(
    listingHtml.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi)
  ).map((m) => m[1]);

  const storyUrls = links
    .filter((href) => {
      if (!href) return false;
      if (href.startsWith("#")) return false;
      if (href.startsWith("mailto:")) return false;
      if (href.startsWith("tel:")) return false;

      return (
        /^\/(?!wp-|author|tag|category|search|page)([^/]+)\/?$/.test(href) ||
        href.includes(SOURCE_BASE)
      );
    })
    .map((href) => {
      try {
        return new URL(href, SOURCE_BASE).toString();
      } catch {
        return `${SOURCE_BASE}${href}`;
      }
    });

  const seen = new Set();
  const out = [];
  for (const u of storyUrls) {
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }
  return out;
}

function extractMetaFromStoryHtml(slug, html) {
  const title =
    normalizeText(
      (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "").replace(/<[^>]+>/g, " ")
    ) ||
    normalizeText(
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
      )?.[1]
    );

  const excerpt =
    normalizeText(
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
      )?.[1]
    ) ||
    normalizeText(
      html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
      )?.[1]
    ) ||
    title;

  const image =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    )?.[1] ||
    html.match(
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
    )?.[1];

  const imageAlt = html.match(/<img[^>]+alt=["']([^"']+)["'][^>]*>/i)?.[1];

  const articleBlock =
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? html;

  let content = safeHtmlToText(articleBlock);
  content = content.slice(0, 50000);

  let category = "";
  let region = "";
  let readTime = "";

  const jsonLdMatch = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );

  if (jsonLdMatch?.[1]) {
    try {
      const parsed = JSON.parse(jsonLdMatch[1]);
      const obj = Array.isArray(parsed) ? parsed[0] : parsed;

      category = normalizeText(obj?.articleSection);
      region =
        normalizeText(
          obj?.about?.name ||
            obj?.address?.addressLocality ||
            obj?.location?.name
        ) || "";
    } catch {
      // ignore
    }
  }

  return {
    id: slug,
    slug,
    title,
    excerpt: excerpt || title,
    category: category || "कहानी",
    region: region || "India",
    readTime: readTime || "",
    image: image || "",
    imageAlt: imageAlt || "",
    url: slug,
    content,
  };
}

async function fetchWithTimeout(url, timeoutMs = 20000, headers = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0", ...headers },
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

(async () => {
  console.log("Fetching listing:", LIST_URL);
  const listingRes = await fetchWithTimeout(LIST_URL, 15000);
  if (!listingRes.ok) {
    throw new Error(`Failed to fetch listing: ${listingRes.status}`);
  }
  const listingHtml = await listingRes.text();

  const storyUrls = extractStoryCardsFromListing(listingHtml);
  console.log("Found story pages:", storyUrls.length);

  const concurrency = 4;
  let idx = 0;

  const stories = [];

  async function worker() {
    while (idx < storyUrls.length) {
      const current = storyUrls[idx++];
      const slug = toSlugFromUrl(current);
      if (!slug) continue;

      try {
        const detailRes = await fetchWithTimeout(current, 20000);
        if (!detailRes.ok) continue;
        const detailHtml = await detailRes.text();

        const story = extractMetaFromStoryHtml(slug, detailHtml);

        if (story.title && story.content && story.content.length > 100) {
          stories.push(story);
          console.log("OK:", slug);
        } else {
          console.log("SKIP (empty):", slug);
        }
      } catch (e) {
        console.log("ERR:", slug, e?.message || e);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, storyUrls.length) },
    () => worker()
  );

  await Promise.all(workers);

  stories.sort((a, b) => a.slug.localeCompare(b.slug));

  const categorySet = new Set(stories.map((s) => s.category).filter(Boolean));
  const categories = ["All", ...Array.from(categorySet).sort((a, b) => a.localeCompare(b))];

  const output = {
    fetchedAt: new Date().toISOString(),
    categories,
    stories,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf8");
  console.log("Wrote:", OUTPUT_PATH, "stories:", stories.length);
})();

