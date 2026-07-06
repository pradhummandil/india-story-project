import type { Story } from "@/components/site/StoryCard";

export type StoriesCatalogueResponse = {
  stories: Story[];
  categories: readonly string[];
  fetchedAt: string;
};

export async function fetchStoriesCatalogue(): Promise<StoriesCatalogueResponse> {
  const res = await fetch("/api/stories-catalogue", {
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch stories catalogue: ${res.status}`);
  }

  return (await res.json()) as StoriesCatalogueResponse;
}
