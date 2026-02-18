import type { IngestedItem, SourceRecord } from "@/lib/types";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function toNumber(input: unknown): number {
  const value = Number(input);
  return Number.isFinite(value) ? value : 0;
}

export async function fetchGitHubRepoItems(source: SourceRecord): Promise<IngestedItem[]> {
  const query = source.config?.query || "topic:artificial-intelligence stars:>200";
  const limit = source.config?.limit ?? 30;

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "AIScanBot/0.1",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=${limit}`,
    { headers },
  );

  if (!response.ok) {
    throw new Error(`GitHub search API failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    items?: Array<{
      id: number;
      full_name: string;
      html_url: string;
      description: string | null;
      updated_at: string;
      stargazers_count: number;
      forks_count: number;
      topics?: string[];
    }>;
  };

  return (payload.items ?? []).map((repo) => {
    const engagement = clamp01(
      Math.log1p(toNumber(repo.stargazers_count) + toNumber(repo.forks_count) * 2) / Math.log(250000),
    );

    return {
      externalId: String(repo.id),
      title: `[GitHub Trending AI] ${repo.full_name}`,
      url: repo.html_url,
      publishedAt: repo.updated_at ? new Date(repo.updated_at) : undefined,
      content: `${repo.description || ""} topics=${(repo.topics || []).join(",")}`,
      author: repo.full_name.split("/")[0],
      language: "en",
      engagementProxy: engagement,
      originLinkCount: 1,
      practicalScore: 0.87,
      rawPayload: {
        provider: "GITHUB_REPOS",
        stars: repo.stargazers_count,
        forks: repo.forks_count,
      },
    } satisfies IngestedItem;
  });
}
