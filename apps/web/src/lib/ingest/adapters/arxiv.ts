import Parser from "rss-parser";

import type { IngestedItem, SourceRecord } from "@/lib/types";

const parser = new Parser();

export async function fetchArxivItems(source: SourceRecord): Promise<IngestedItem[]> {
  const searchQuery = source.config?.searchQuery || "cat:cs.AI";
  const limit = source.config?.limit ?? 40;
  const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(
    searchQuery,
  )}&start=0&max_results=${limit}&sortBy=submittedDate&sortOrder=descending`;

  const feed = await parser.parseURL(url);

  return (feed.items ?? []).map((item, index) => ({
    externalId: item.id || item.guid || `${source.slug}-${index}`,
    title: item.title?.replace(/\s+/g, " ").trim() || "Untitled",
    url: item.link || source.url,
    publishedAt: item.isoDate ? new Date(item.isoDate) : undefined,
    content: item.content || item.contentSnippet || "",
    author: item.creator || item.author,
    language: "en",
    rawPayload: {
      categories: item.categories,
    },
  }));
}
