export type QualityCheck = {
  label: string;
  passed: boolean;
  weight: number;
};

export type QualityBreakdown = {
  score: number;
  checks: QualityCheck[];
};

export function calculateStoryQualityScore(story: {
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  slug?: string | null;
  image?: string | null;
  images?: any[];
  authorName?: string | null;
  author?: any;
  region?: string | null;
  state?: any;
  themes?: any[];
  tags?: any[];
}): QualityBreakdown {
  const hasImage = Boolean(story?.image || (story?.images && story.images.length > 0));
  const wordCount = story?.content ? story.content.split(/\s+/).filter(Boolean).length : 0;
  const hasAuthor = Boolean(story?.authorName || story?.author);
  const hasRegion = Boolean((story?.region && story.region !== "India") || story?.state);
  const hasThemes = Boolean(story?.themes && story.themes.length > 0);
  const hasTags = Boolean(story?.tags && story.tags.length > 0);

  const checks: QualityCheck[] = [
    { label: "Descriptive Headline (10+ characters)", passed: (story?.title?.length ?? 0) >= 10, weight: 10 },
    { label: "Compelling Excerpt / Summary (30+ characters)", passed: (story?.excerpt?.length ?? 0) >= 30, weight: 10 },
    { label: "In-Depth Editorial Article (300+ words)", passed: wordCount >= 300, weight: 15 },
    { label: "High-Resolution Cover Image", passed: hasImage, weight: 15 },
    { label: "Assigned Author Profile", passed: hasAuthor, weight: 10 },
    { label: "Assigned State / Geographic Location", passed: hasRegion, weight: 10 },
    { label: "Categorized Under Story Theme", passed: hasThemes, weight: 10 },
    { label: "SEO Meta Title Defined", passed: Boolean(story?.seoTitle), weight: 5 },
    { label: "SEO Meta Description Defined", passed: Boolean(story?.seoDescription), weight: 5 },
    { label: "SEO Target Keywords Specified", passed: Boolean(story?.seoKeywords), weight: 5 },
    { label: "Story Tags & Keywords", passed: hasTags, weight: 5 },
  ];

  const totalWeight = checks.reduce((acc, c) => acc + c.weight, 0);
  const earnedWeight = checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  return { score, checks };
}
