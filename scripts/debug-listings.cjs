const SOURCE_BASE = "https://indiastoryproject.com";
const LIST_URLS = [
  `${SOURCE_BASE}/latest-story/`,
  `${SOURCE_BASE}/latest-story/page/2/`,
  `${SOURCE_BASE}/latest-story/page/3/`,
  `${SOURCE_BASE}/latest-story/?paged=2`,
  `${SOURCE_BASE}/latest-story/?paged=3`,
  `${SOURCE_BASE}/page/2/`,
  `${SOURCE_BASE}/latest-story/page/1/`,
];

async function fetchUrl(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, len: text.length, text };
}

function countLinks(html) {
  const hrefs = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)).map(
    (m) => m[1]
  );
  return hrefs.length;
}

function countStoryLike(html) {
  const hrefs = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)).map(
    (m) => m[1]
  );
  // heuristic
  return hrefs.filter((h) => {
    if (!h) return false;
    if (h.startsWith("#")) return false;
    if (h.startsWith("mailto:")) return false;
    if (h.startsWith("tel:")) return false;
    if (/\/(wp-|author|tag|category|search|page)\//.test(h)) return false;
    if (h.startsWith("/")) return !/^\/(wp-|author|tag|category|search|page)\//.test(h);
    if (h.startsWith(SOURCE_BASE)) return true;
    return false;
  }).length;
}

(async () => {
  for (const url of LIST_URLS) {
    try {
      const { ok, status, len, text } = await fetchUrl(url);
      const storyLike = countStoryLike(text);
      console.log(url, "ok=", ok, "status=", status, "len=", len, "storyLikeLinks=", storyLike);
    } catch (e) {
      console.log(url, "ERR", e?.message || e);
    }
  }
})();

