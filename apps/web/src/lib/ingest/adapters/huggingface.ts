import type { IngestedItem, SourceRecord } from "@/lib/types";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function toNumber(input: unknown): number {
  const value = Number(input);
  return Number.isFinite(value) ? value : 0;
}

export async function fetchHuggingFaceItems(source: SourceRecord): Promise<IngestedItem[]> {
  const limit = source.config?.limit ?? 40;
  const entityType = source.config?.entityType ?? "models";

  const endpoint =
    entityType === "spaces"
      ? `https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=${limit}`
      : `https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=${limit}`;

  const response = await fetch(endpoint, {
    headers: {
      "user-agent": "AIScanBot/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API failed: ${response.status}`);
  }

  const items = (await response.json()) as Array<Record<string, unknown>>;

  return items.map((item) => {
    const repoId = String(item.id ?? item.modelId ?? item.name ?? "unknown");
    const likes = toNumber(item.likes);
    const downloads = toNumber(item.downloads);
    const engagement = clamp01(Math.log1p(likes + downloads) / Math.log(500000));
    const url =
      entityType === "spaces"
        ? `https://huggingface.co/spaces/${repoId}`
        : `https://huggingface.co/${repoId}`;

    return {
      externalId: repoId,
      title: entityType === "spaces" ? `[HF Space] ${repoId}` : `[HF Model] ${repoId}`,
      url,
      publishedAt: item.lastModified ? new Date(String(item.lastModified)) : undefined,
      content: String(item.pipeline_tag ?? item.task ?? item.description ?? ""),
      author: String(item.author ?? "Hugging Face"),
      language: "en",
      engagementProxy: engagement,
      originLinkCount: 1,
      practicalScore: entityType === "spaces" ? 0.82 : 0.9,
      rawPayload: {
        provider: "HUGGINGFACE",
        entityType,
        likes,
        downloads,
      },
    } satisfies IngestedItem;
  });
}
