import Parser from "rss-parser";

import type { IngestedItem, SourceRecord } from "@/lib/types";

const parser = new Parser({
  headers: {
    "User-Agent": "AIScanBot/0.1",
  },
});

function stripHtml(input: string): string {
  const decoded = input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');

  return decoded
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\bDiscussion\b/gi, " ")
    .replace(/\bLink\b/gi, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function isKeywordMatched(text: string, keywords: string[]): boolean {
  if (keywords.length === 0) {
    return true;
  }
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function parseProductHuntEntries(xml: string, limit: number): IngestedItem[] {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => match[1]);
  return entries.slice(0, limit).map((entry, index) => {
    const title = stripHtml((entry.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? "Untitled");
    const url = (entry.match(/<link[^>]*href="([^"]+)"/) ?? [])[1] ?? "https://www.producthunt.com";
    const published = (entry.match(/<published>([\s\S]*?)<\/published>/) ?? [])[1];
    const content = stripHtml((entry.match(/<content[^>]*>([\s\S]*?)<\/content>/) ?? [])[1] ?? "");
    const idRaw = (entry.match(/<id>([\s\S]*?)<\/id>/) ?? [])[1] ?? `product-hunt-${index}`;

    return {
      externalId: stripHtml(idRaw),
      title,
      url,
      publishedAt: published ? new Date(published) : undefined,
      content,
      author: "Product Hunt",
      language: "en",
      rawPayload: {
        provider: "RSS",
      },
    } satisfies IngestedItem;
  });
}

export async function fetchRssItems(source: SourceRecord): Promise<IngestedItem[]> {
  if (!source.feedUrl) {
    return [];
  }

  const keywords = source.config?.keywords ?? [];
  const limit = source.config?.limit ?? 40;

  if (source.slug === "product-hunt-ai") {
    const response = await fetch(source.feedUrl, {
      headers: {
        "User-Agent": "AIScanBot/0.1",
      },
    });
    if (!response.ok) {
      throw new Error(`Product Hunt RSS failed: ${response.status}`);
    }
    const xml = await response.text();
    return parseProductHuntEntries(xml, limit)
      .filter((item) => isKeywordMatched(`${item.title} ${item.content ?? ""}`, keywords))
      .slice(0, limit);
  }

  const feed = await parser.parseURL(source.feedUrl);

  return (feed.items ?? [])
    .map((item, index) => {
      const contentRaw = item.contentSnippet || item.content || item.summary || "";
      const content = stripHtml(contentRaw);
      const title = stripHtml(item.title?.trim() || "Untitled");

      return {
        externalId: item.guid || item.id || `${source.slug}-${index}`,
        title,
        url: item.link || source.url,
        publishedAt: item.isoDate ? new Date(item.isoDate) : undefined,
        content,
        author: item.creator || item.author,
        language: feed.language,
        rawPayload: {
          categories: item.categories,
        },
      } satisfies IngestedItem;
    })
    .filter((item) => isKeywordMatched(`${item.title} ${item.content ?? ""}`, keywords))
    .slice(0, limit);
}
