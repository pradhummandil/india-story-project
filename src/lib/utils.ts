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
  if (!slug) return "ISP Editorial";
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return AUTHORS[Math.abs(hash) % AUTHORS.length];
}

export function getOptimizedImageUrl(url: string | undefined | null, width = 600): string {
  if (!url) return "";
  if (url.includes("supabase.co/storage/v1/object/public")) {
    // Add format=webp for modern format support on Supabase storage if it supports it
    return `${url}?width=${width}&quality=80&resize=contain&format=webp`;
  }
  if (url.includes("images.unsplash.com")) {
    const cleanUrl = url.split("?")[0];
    return `${cleanUrl}?w=${width}&auto=format&fit=crop&q=80`;
  }
  if (url.includes("res.cloudinary.com")) {
    // Make sure we include f_auto, q_auto, dpr_auto and the requested width
    return url.replace("/upload/", `/upload/f_auto,q_auto,dpr_auto,w_${width}/`);
  }
  return url;
}

export function getResponsiveSrcSet(url: string | undefined | null, widths = [320, 640, 960, 1280, 1920]): string {
  if (!url) return "";
  return widths
    .map((w) => `${getOptimizedImageUrl(url, w)} ${w}w`)
    .join(", ");
}
