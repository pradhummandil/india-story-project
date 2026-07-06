const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const SOURCE_BASE = "https://indiastoryproject.com";
const START_URL = `${SOURCE_BASE}/latest-story/`;
const OUTPUT_PATH = path.join(process.cwd(), "stories.json");

const OUTPUT_LIMIT = Number(process.env.OUTPUT_LIMIT ?? 0); // 0 = no limit
const LIST_TIMEOUT_MS = Number(process.env.LIST_TIMEOUT_MS ?? 20000);
const STORY_TIMEOUT_MS = Number(process.env.STORY_TIMEOUT_MS ?? 25000);
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 6);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeText(s) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function absolutizeUrl(href) {
  if (!href) return "";
  try {
    return new URL(href, SOURCE_BASE).toString();
  } catch {
    return "";
  }
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

function dedupePreserveOrder(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    if (!x) continue;
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

function extractStoryUrlsFromListing($) {
  const storyUrls = [];

  $("a[href]").each((_, a) => {
    const href = $(a).attr("href");
    if (!href) return;
    if (href.startsWith("#")) return;
    if (href.startsWith("mailto:")) return;
    if (href.startsWith("tel:")) return;

    // Skip known non-story routes
    if (/\/(wp-|author|tag|category|search|page)\//i.test(href)) return;

    const abs = absolutizeUrl(href);
    if (!abs) return;
    if (!abs.startsWith(SOURCE_BASE)) return;

    const slug = toSlugFromUrl(abs);
    if (!slug) return;

    // Exclude pagination links from the story list
    try {
      const u = new URL(abs);
      if (/\/page\/\d+\/?$/i.test(u.pathname)) return;
      if (/\?paged=\d+/i.test(abs)) return;
      if (abs.includes("/latest-story")) return;
    } catch {
      return;
    }

    storyUrls.push(abs);
  });

  return dedupePreserveOrder(storyUrls);
}

function getNextListingUrl($) {
  const relNext = $("a[rel='next']").attr("href");
  if (relNext) return absolutizeUrl(relNext);

  const nextA = $("a")
    .filter((_, a) => {
      const txt = normalizeText($(a).text());
      const aria = normalizeText($(a).attr("aria-label"));
      const rel = $(a).attr("rel");
      const href = $(a).attr("href") || "";
      return (
        rel === "next" ||
        /\bnext\b/i.test(txt) ||
        /\bnext\b/i.test(aria) ||
        /\/page\/\d+\/?/i.test(href)
      );
    })
    .first();

  const href = nextA.attr("href");
  return href ? absolutizeUrl(href) : "";
}

async function fetchHtml(url, timeoutMs) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    });
    const html = await res.text();
    return { ok: res.ok, status: res.status, html };
  } finally {
    clearTimeout(t);
  }
}

async function fetchWithRetry(url, { retries = 3, timeoutMs, backoffBaseMs = 800 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { ok, status, html } = await fetchHtml(url, timeoutMs);
      if (!ok) throw new Error(`HTTP ${status}`);
      return html;
    } catch (e) {
      lastErr = e;
      if (attempt === retries) break;
      const delay = backoffBaseMs * attempt;
      await sleep(delay);
    }
  }
  throw lastErr;
}

function extractStoryFromPage($, storyUrl) {
  const slug = toSlugFromUrl(storyUrl) || "";

  let title = normalizeText($("h1").first().text());
  if (!title) title = normalizeText($("meta[property='og:title']").attr("content"));

  let excerpt = normalizeText($("meta[name='description']").attr("content"));
  if (!excerpt) excerpt = normalizeText($("meta[property='og:description']").attr("content"));
  if (!excerpt) excerpt = title;

  const image =
    $("meta[property='og:image']").attr("content") ||
    $("meta[name='twitter:image']").attr("content") ||
    "";

  let imageAlt = "";
  const heroImg = $("img").filter((_, img) => {
    const src = $(img).attr("src") || "";
    return !!src && (image ? src.includes(image.split("/").pop()) : true);
  });
  if (heroImg.length) imageAlt = normalizeText(heroImg.first().attr("alt"));
  if (!imageAlt) imageAlt = normalizeText($("meta[property='og:image:alt']").attr("content"));

  let category = "";
  let region = "";
  let author = "";
  let publishDate = "";

  $("script[type='application/ld+json']").each((_, s) => {
    const raw = $(s).contents().text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
      if (!obj) return;

      if (!category && obj.articleSection) category = normalizeText(obj.articleSection);

      if (!region) {
        region =
          normalizeText(obj?.about?.name) ||
          normalizeText(obj?.address?.addressLocality) ||
          normalizeText(obj?.location?.name) ||
          "";
      }

      if (!author) {
        if (typeof obj?.author === "string") author = normalizeText(obj.author);
        else if (obj?.author?.name) author = normalizeText(obj.author.name);
      }

      if (!publishDate) {
        publishDate = normalizeText(obj?.datePublished) || normalizeText(obj?.dateCreated) || "";
      }
    } catch {
      // ignore invalid JSON
    }
  });

  if (!author) {
    const a = normalizeText($(".post-author, .author a, .byline a").first().text());
    if (a) author = a;
  }

  if (!publishDate) {
    const dt = $("time[datetime]").first().attr("datetime");
    if (dt) publishDate = dt;
  }

  let content = "";
  const $article = $("article").first();
  if ($article.length) {
    const parts = [];
    $article.find("p").each((_, p) => {
      const t = normalizeText($(p).text());
      if (t) parts.push(t);
    });
    content = parts.join("\n\n");
    if (!content.trim()) content = normalizeText($article.text());
  } else {
    const main = $("main").first();
    content = main.length ? normalizeText(main.text()) : normalizeText($.root().text());
  }

  const tagIdx = content.toLowerCase().indexOf("tags");
  if (tagIdx > 0) content = content.slice(0, tagIdx).trim();

  category = category || "कहानी";
  region = region || "India";

  return {
    slug,
    title: title || "",
    excerpt: excerpt || "",
    content: content || "",
    image: image || "",
    imageAlt: imageAlt || "",
    category,
    region,
    author: author || "",
    publishDate: publishDate || "",
    url: slug,
  };
}

(async () => {
  console.log(`Starting crawl: ${START_URL}`);

  const allStoryUrls = new Set();
  let pageUrl = START_URL;
  let pageIndex = 1;
  const visitedListingUrls = new Set();

  while (pageUrl && !visitedListingUrls.has(pageUrl)) {
    visitedListingUrls.add(pageUrl);

    console.log(`\n[LIST] Fetching page ${pageIndex}: ${pageUrl}`);

    let html;
    try {
      html = await fetchWithRetry(pageUrl, {
        retries: 3,
        timeoutMs: LIST_TIMEOUT_MS,
      });
    } catch (e) {
      console.log(`[LIST] Failed page ${pageIndex}: ${e?.message || e}`);
      break;
    }

    const $ = cheerio.load(html);
    const storyUrls = extractStoryUrlsFromListing($);

    const before = allStoryUrls.size;
    for (const u of storyUrls) allStoryUrls.add(u);
    const after = allStoryUrls.size;

    console.log(
      `[LIST] Found story links: ${storyUrls.length}. New unique: ${after - before}. Total unique: ${after}`,
    );

    if (OUTPUT_LIMIT > 0 && allStoryUrls.size >= OUTPUT_LIMIT) {
      console.log(`[LIST] OUTPUT_LIMIT reached (${OUTPUT_LIMIT}). Stopping pagination crawl.`);
      break;
    }

    if (storyUrls.length === 0 && after === before) {
      console.log(`[LIST] No story links on this page. Stopping.`);
      break;
    }

    const nextUrl = getNextListingUrl($);
    if (!nextUrl || nextUrl === pageUrl) {
      console.log(`[LIST] No next page detected. Stopping.`);
      break;
    }

    pageUrl = nextUrl;
    pageIndex++;

    await sleep(500);
  }

  const storyUrlList = Array.from(allStoryUrls);
  console.log(`\nTotal unique story URLs collected: ${storyUrlList.length}`);

  const storyResultsBySlug = new Map();
  let okCount = 0;
  let errCount = 0;

  const queue = storyUrlList.slice();
  let cursor = 0;

  async function storyWorker(workerId) {
    while (cursor < queue.length) {
      const current = queue[cursor++];
      const slug = toSlugFromUrl(current);
      if (!slug) continue;

      try {
        const detailHtml = await fetchWithRetry(current, {
          retries: 3,
          timeoutMs: STORY_TIMEOUT_MS,
          backoffBaseMs: 900,
        });

        const $ = cheerio.load(detailHtml);
        const story = extractStoryFromPage($, current);

        if (!story.title || !story.content || story.content.length < 50) {
          console.log(`[S${workerId}] SKIP too empty: ${slug}`);
          continue;
        }

        storyResultsBySlug.set(slug, story);
        okCount++;
        console.log(`[S${workerId}] OK ${okCount}/${queue.length}: ${slug}`);
      } catch (e) {
        errCount++;
        console.log(`[S${workerId}] ERR ${errCount}/${queue.length}: ${slug} (${e?.message || e})`);
      }

      if (OUTPUT_LIMIT > 0 && storyResultsBySlug.size >= OUTPUT_LIMIT) return;
      await sleep(200);
    }
  }

  const workerCount = Math.min(CONCURRENCY, queue.length || 1);
  const workers = Array.from({ length: workerCount }, (_, i) => storyWorker(i + 1));
  await Promise.all(workers);

  const outStories = Array.from(storyResultsBySlug.values());
  outStories.sort((a, b) => a.slug.localeCompare(b.slug));

  const categorySet = new Set(outStories.map((s) => s.category).filter(Boolean));
  const categories = ["All", ...Array.from(categorySet).sort((a, b) => a.localeCompare(b))];

  const output = {
    fetchedAt: new Date().toISOString(),
    categories,
    stories: outStories,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf8");
  console.log(`\nWrote: ${OUTPUT_PATH}`);
  console.log(`Stories written: ${outStories.length} (ok=${okCount}, err=${errCount})`);

  if (!outStories.length) process.exitCode = 1;
})();
