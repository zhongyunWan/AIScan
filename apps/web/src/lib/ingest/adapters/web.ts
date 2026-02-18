import type { IngestedItem, SourceRecord } from "@/lib/types";

function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchWebSnapshotItems(source: SourceRecord): Promise<IngestedItem[]> {
  const response = await fetch(source.url, {
    headers: {
      "user-agent": "AIScanBot/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`WEB fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = stripHtml(titleMatch?.[1] || source.name);

  const text = stripHtml(html).slice(0, 1600);

  return [
    {
      externalId: `${source.slug}-${new Date().toISOString().slice(0, 10)}`,
      title: `[Snapshot] ${title}`,
      url: source.url,
      publishedAt: new Date(),
      content: text,
      author: source.name,
      language: "en",
      engagementProxy: 0.35,
      originLinkCount: 1,
      practicalScore: 0.75,
      rawPayload: {
        provider: "WEB",
      },
    },
  ];
}
