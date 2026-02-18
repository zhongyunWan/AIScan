import type { IngestedItem, SourceRecord } from "@/lib/types";

export async function fetchGitHubReleaseItems(source: SourceRecord): Promise<IngestedItem[]> {
  const repo = source.config?.repo;
  if (!repo) {
    return [];
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "AIScanBot/0.1",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=20`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`GitHub API failed: ${response.status}`);
  }

  const releases = (await response.json()) as Array<{
    id: number;
    name: string | null;
    tag_name: string;
    html_url: string;
    published_at: string | null;
    body: string | null;
    draft: boolean;
    prerelease: boolean;
    assets?: Array<unknown>;
  }>;

  return releases
    .filter((release) => !release.draft)
    .map((release) => ({
      externalId: String(release.id),
      title: release.name || `${repo} ${release.tag_name}`,
      url: release.html_url,
      publishedAt: release.published_at ? new Date(release.published_at) : undefined,
      content: release.body || "",
      language: "en",
      engagementProxy: Math.min(1, ((release.assets?.length ?? 0) + (release.prerelease ? 0 : 2)) / 10),
      rawPayload: {
        tag: release.tag_name,
        prerelease: release.prerelease,
      },
    }));
}
