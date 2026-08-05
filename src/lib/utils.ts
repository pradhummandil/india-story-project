import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AUTHORS = [
  "Aarav Mehta",
  "Aditi Sen",
  "Vikram Malhotra",
  "Ananya Nair",
  "Rajesh Iyer",
  "Priya Sharma",
  "Devendra Kulkarni",
  "Meera Deshmukh",
  "Arjun Verma",
  "Kavita Rao",
];

export function getStoryAuthor(slug: string): string {
  return "India Story Project";
}

export function getOptimizedImageUrl(url: string | undefined | null, _width = 600): string {
  if (!url) return "";
  return url;
}

export function getResponsiveSrcSet(url: string | undefined | null, widths = [320, 640, 960, 1280, 1920]): string {
  if (!url) return "";
  return widths
    .map((w) => `${getOptimizedImageUrl(url, w)} ${w}w`)
    .join(", ");
}

export function sanitizeStoryContent(content: string = ""): string {
  if (!content) return "";

  let clean = content
    .replace(/(?:Comment|Leave a Reply|Post Comment|Cancel reply|टिप्पणी)\s*[\r\n]+(?:Name|नाम)\s*\*\s*[\r\n]+(?:Email|ईमेल)\s*\*\s*[\r\n]+(?:Save my name, email, and website in this browser for the next time I comment|अगली बार जब मैं टिप्पणी करूँ तो इस ब्राउज़र में मेरा नाम, ईमेल और वेबसाइट सहेजें)\.?/gi, "")
    .replace(/(?:Comment|Leave a Reply|Post Comment|Cancel reply|टिप्पणी)\s*[\r\n]+(?:Name|नाम)\s*\*\s*[\r\n]+(?:Email|ईमेल)\s*\*/gi, "")
    .replace(/(?:Save my name, email, and website in this browser for the next time I comment|अगली बार जब मैं टिप्पणी करूँ तो इस ब्राउज़र में मेरा नाम, ईमेल और वेबसाइट सहेजें)\.?/gi, "")
    .replace(/Your email address will not be published\.\s*Required fields are marked\s*\*/gi, "")
    .replace(/आपका ईमेल पता प्रकाशित नहीं किया जाएगा।\s*आवश्यक फ़ील्ड को चिह्नित किया गया है\s*\*/gi, "");

  const lines = clean.split("\n");
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (/^[।|\-—"'\s\u0964]+$/.test(trimmed)) return false;
    if (trimmed === "।" || trimmed === "|" || trimmed === "॥") return false;
    if (/^(Comment|टिप्पणी)$/i.test(trimmed)) return false;
    if (/^(Name|नाम)\s*\*?$/i.test(trimmed)) return false;
    if (/^(Email|ईमेल)\s*\*?$/i.test(trimmed)) return false;
    if (/^(Website|वेबसाइट)$/i.test(trimmed)) return false;
    if (/^(Save my name, email, and website in this browser|अगली बार जब मैं टिप्पणी करूँ तो इस ब्राउज़र में मेरा नाम, ईमेल और वेबसाइट सहेजें)/i.test(trimmed)) return false;
    if (/^(Leave a Reply|टिप्पणी छोड़ें)$/i.test(trimmed)) return false;
    if (/^(Post Comment|टिप्पणी भेजें)$/i.test(trimmed)) return false;
    if (/^(Cancel reply|उत्तर रद्द करें)$/i.test(trimmed)) return false;
    if (/^(Required fields are marked|आवश्यक फ़ील्ड को चिह्नित किया गया है)/i.test(trimmed)) return false;
    return true;
  });

  return filteredLines.join("\n").trim();
}
