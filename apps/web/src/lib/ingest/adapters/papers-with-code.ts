import type { IngestedItem, SourceRecord } from "@/lib/types";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export async function fetchPapersWithCodeItems(source: SourceRecord): Promise<IngestedItem[]> {
  const limit = source.config?.limit ?? 30;
  const response = await fetch(
    `https://paperswithcode.com/api/v1/papers/?ordering=-published&items_per_page=${limit}`,
    {
      headers: {
        "user-agent": "AIScanBot/0.1",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Papers with Code API failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    results?: Array<{
      id?: string;
      title?: string;
      url_abs?: string;
      abstract?: string;
      published?: string;
      authors?: string;
      stars?: number;
    }>;
  };

  return (payload.results ?? []).map((paper, index) => {
    const title = paper.title || `Papers with Code Item ${index + 1}`;
    const url = paper.url_abs || `https://paperswithcode.com/paper/${paper.id || index}`;
    const engagement = clamp01(Math.log1p(Number(paper.stars ?? 0)) / Math.log(500));

    return {
      externalId: String(paper.id ?? `${index}`),
      title: `[Papers with Code] ${title}`,
      url,
      publishedAt: paper.published ? new Date(paper.published) : undefined,
      content: (paper.abstract || "").slice(0, 1000),
      author: paper.authors || "Papers with Code",
      language: "en",
      engagementProxy: engagement,
      originLinkCount: 1,
      practicalScore: 0.83,
      rawPayload: {
        provider: "PAPERS_WITH_CODE",
      },
    } satisfies IngestedItem;
  });
}
