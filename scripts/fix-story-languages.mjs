/**
 * fix-story-languages.mjs  (v3 — uses free Google Translate API)
 * ────────────────────────────────────────────────────────────────
 * Fixes all language mismatches across 386 Story records.
 * Uses the same free Google Translate endpoint as translate-stories.js
 * Resumable via fix-progress.json
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname     = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS_FILE = path.join(__dirname, "fix-progress.json");
const LOG_FILE      = path.join(__dirname, "fix-language-log.json");

const prisma = new PrismaClient();

// ── helpers ──────────────────────────────────────────────────────────────────

function isHindi(text) {
  if (!text || text.trim().length < 3) return false;
  const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
  return hindiChars / text.length > 0.1;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Translate text using the free Google Translate endpoint.
 * For long texts, splits by paragraph to avoid URL limits.
 */
async function translateText(text, from, to) {
  if (!text || !text.trim()) return "";

  // Split into paragraphs to handle long content
  const paragraphs = text.split("\n");
  const translated  = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      translated.push("");
      continue;
    }

    // Chunk paragraphs that are still too long (> 4000 chars)
    const chunks = [];
    if (para.length > 4000) {
      const sentences = para.split(/(?<=[।.!?])\s+/);
      let chunk = "";
      for (const sentence of sentences) {
        if ((chunk + " " + sentence).length > 4000 && chunk) {
          chunks.push(chunk.trim());
          chunk = sentence;
        } else {
          chunk += " " + sentence;
        }
      }
      if (chunk.trim()) chunks.push(chunk.trim());
    } else {
      chunks.push(para);
    }

    for (const chunk of chunks) {
      let attempts = 0;
      let result = "";
      while (attempts < 3) {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(chunk)}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("HTTP " + res.status);
          const json = await res.json();
          result = json[0].map(item => item[0] || "").join("");
          break;
        } catch (err) {
          attempts++;
          console.log("  [translate error attempt " + attempts + "]: " + err.message);
          await sleep(2000 * attempts);
          if (attempts >= 3) { result = chunk; } // keep original on failure
        }
      }
      translated.push(result);
      await sleep(150); // be polite to the free API
    }
  }

  return translated.join("\n");
}

// ── load resume state ────────────────────────────────────────────────────────

let doneIds = new Set();
let logs    = [];

if (existsSync(PROGRESS_FILE)) {
  try {
    const prog = JSON.parse(await readFile(PROGRESS_FILE, "utf-8"));
    doneIds = new Set(prog.doneIds || []);
    console.log("Resuming — already completed: " + doneIds.size + " stories");
  } catch {}
}
if (existsSync(LOG_FILE)) {
  try { logs = JSON.parse(await readFile(LOG_FILE, "utf-8")); } catch {}
}

async function saveProgress() {
  await writeFile(PROGRESS_FILE, JSON.stringify({ doneIds: [...doneIds] }, null, 2));
  await writeFile(LOG_FILE,      JSON.stringify(logs, null, 2));
}

// ── fetch stories ────────────────────────────────────────────────────────────

console.log("Fetching all stories from database...");
const stories = await prisma.story.findMany({
  select: {
    id: true, slug: true, title: true, titleHi: true,
    excerpt: true, excerptHi: true,
    content: true, contentHi: true,
    seoTitle: true,
  }
});
console.log("Total: " + stories.length + " stories\n");

let caseA = 0, caseB = 0, caseC = 0, unchanged = 0, skipped = 0;
let processed = 0;

// ── main loop ────────────────────────────────────────────────────────────────

for (const s of stories) {
  if (doneIds.has(s.id)) { skipped++; continue; }

  const titleHindi   = isHindi(s.title);
  const excerptHindi = isHindi(s.excerpt);
  const contentHindi = isHindi(s.content);

  const anyHindiInEn  = titleHindi || excerptHindi || contentHindi;
  const hiFieldsMissing = !s.titleHi || !s.excerptHi || !s.contentHi;
  const seoWrong      = !s.seoTitle || isHindi(s.seoTitle);

  processed++;
  const remaining = stories.length - skipped - processed + 1;
  console.log("\n[" + processed + "/" + (stories.length - skipped) + "] " + (s.slug || s.id));

  let update = {};
  let logEntry = { id: s.id, slug: s.slug, case: null, changes: [] };

  // ══ CASE A: Hindi text in English fields ═════════════════════════════════
  if (anyHindiInEn) {
    caseA++;
    logEntry.case = "A";
    console.log("  → Case A: Hindi in EN fields → translate Hindi→English");

    const srcTitle   = (s.titleHi   && s.titleHi.trim())   ? s.titleHi   : s.title;
    const srcExcerpt = (s.excerptHi && s.excerptHi.trim()) ? s.excerptHi : s.excerpt;
    const srcContent = (s.contentHi && s.contentHi.trim()) ? s.contentHi : s.content;

    process.stdout.write("  title...");
    update.title   = await translateText(srcTitle, "hi", "en");
    console.log(" ✓");

    process.stdout.write("  excerpt...");
    update.excerpt = await translateText(srcExcerpt, "hi", "en");
    console.log(" ✓");

    process.stdout.write("  content...");
    update.content = await translateText(srcContent, "hi", "en");
    console.log(" ✓");

    // Ensure Hindi fields are preserved correctly
    update.titleHi   = srcTitle;
    update.excerptHi = srcExcerpt;
    update.contentHi = srcContent;
    update.seoTitle  = update.title; // SEO = English title

    logEntry.changes = ["title→EN", "excerpt→EN", "content→EN", "titleHi=preserved", "seoTitle=enTitle"];

  // ══ CASE B: Hindi fields empty ══════════════════════════════════════════
  } else if (hiFieldsMissing) {
    caseB++;
    logEntry.case = "B";
    console.log("  → Case B: Hindi fields empty → translate EN→Hindi");

    if (!s.titleHi || !s.titleHi.trim()) {
      process.stdout.write("  titleHi...");
      update.titleHi = await translateText(s.title, "en", "hi");
      console.log(" ✓");
      logEntry.changes.push("titleHi→HI");
    }
    if (!s.excerptHi || !s.excerptHi.trim()) {
      process.stdout.write("  excerptHi...");
      update.excerptHi = await translateText(s.excerpt, "en", "hi");
      console.log(" ✓");
      logEntry.changes.push("excerptHi→HI");
    }
    if (!s.contentHi || !s.contentHi.trim()) {
      process.stdout.write("  contentHi...");
      update.contentHi = await translateText(s.content, "en", "hi");
      console.log(" ✓");
      logEntry.changes.push("contentHi→HI");
    }
    if (seoWrong) {
      update.seoTitle = s.title;
      logEntry.changes.push("seoTitle=title");
    }

  // ══ CASE C: Only seoTitle wrong (instant, no translation) ═══════════════
  } else if (seoWrong) {
    caseC++;
    logEntry.case = "C";
    console.log("  → Case C: seoTitle fix only");
    update.seoTitle = s.title;
    logEntry.changes = ["seoTitle=title"];

  } else {
    unchanged++;
    console.log("  ✓ Already correct");
    doneIds.add(s.id);
    continue;
  }

  // ══ Write to DB ══════════════════════════════════════════════════════════
  if (Object.keys(update).length > 0) {
    await prisma.story.update({ where: { id: s.id }, data: update });
    console.log("  ✅ Saved [" + Object.keys(update).join(", ") + "]");
  }

  doneIds.add(s.id);
  logs.push(logEntry);
  if (doneIds.size % 5 === 0) await saveProgress();
}

// Final save
await saveProgress();

console.log("\n╔════════════════════════════════════════════════╗");
console.log("║         LANGUAGE FIX COMPLETE                  ║");
console.log("╠════════════════════════════════════════════════╣");
console.log("║  Total stories         : " + stories.length);
console.log("║  Case A (Hindi→EN)     : " + caseA);
console.log("║  Case B (EN→Hindi)     : " + caseB);
console.log("║  Case C (SEO fix only) : " + caseC);
console.log("║  Already correct       : " + unchanged);
console.log("║  Skipped (resumed)     : " + skipped);
console.log("╚════════════════════════════════════════════════╝");

await prisma.$disconnect();
