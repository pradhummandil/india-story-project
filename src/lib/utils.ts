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
