import type { IngestedItem, SourceRecord } from "@/lib/types";
import { AI_TOPIC_KEYWORDS, getWatchlist } from "@/lib/social/watchlist";

interface SocialFetchOptions {
  providerName: "A" | "B";
  baseUrl?: string;
  apiKey?: string;
  source: SourceRecord;
}

function asNumber(input: unknown, fallback = 0): number {
  const value = Number(input);
  return Number.isFinite(value) ? value : fallback;
}

function asString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function lowerKeywords(text: string): string {
  return text.toLowerCase();
}

function normalizeEngagement(payload: Record<string, unknown>): number {
  const engagement = payload.engagement as Record<string, unknown> | undefined;
  const raw =
    asNumber(payload.likeCount) +
    asNumber(payload.replyCount) +
    asNumber(payload.repostCount) +
    asNumber(payload.quoteCount) +
    asNumber(payload.bookmarkCount) +
    asNumber(engagement?.likes) +
    asNumber(engagement?.replies) +
    asNumber(engagement?.reposts) +
    asNumber(engagement?.quotes);

  return Math.max(0, Math.min(1, Math.log1p(raw) / Math.log(1500)));
}

function extractQuotedLinks(payload: Record<string, unknown>): string[] {
  const links = payload.links;
  if (Array.isArray(links)) {
    return links.map((link) => asString(link)).filter(Boolean);
  }

  const quoted = payload.quotedLinks;
  if (Array.isArray(quoted)) {
    return quoted.map((link) => asString(link)).filter(Boolean);
  }

  return [];
}

function isAiRelevant(text: string, domainAllow: string[]): boolean {
  const normalized = lowerKeywords(text);
  const keywordHits = AI_TOPIC_KEYWORDS.some((keyword) => normalized.includes(keyword));
  if (keywordHits) {
    return true;
  }
  return domainAllow.some((tag) => normalized.includes(tag.toLowerCase()));
}

function normalizePostToItem(
  source: SourceRecord,
  post: Record<string, unknown>,
  reputationMap: Map<string, number>,
): IngestedItem | null {
  const postId =
    asString(post.id) || asString(post.postId) || asString(post.tweet_id) || asString(post.tweetId);
  const authorHandle =
    asString(post.authorHandle) ||
    asString(post.handle) ||
    asString((post.author as Record<string, unknown> | undefined)?.handle) ||
    asString((post.user as Record<string, unknown> | undefined)?.username);
  const text = asString(post.text) || asString(post.content) || asString(post.body);
  const title =
    asString(post.title) || (text ? text.slice(0, 120).replace(/\s+/g, " ").trim() : "Untitled");
  const url =
    asString(post.url) ||
    asString(post.postUrl) ||
    (postId ? `https://x.com/${authorHandle}/status/${postId}` : "");

  if (!postId || !authorHandle || !url || !text) {
    return null;
  }

  const watchlistConfig = source.config ?? {};
  const domainAllow = watchlistConfig.domainAllow ?? [];
  if (!isAiRelevant(`${title} ${text}`, domainAllow)) {
    return null;
  }

  const minEngagement = watchlistConfig.minEngagement ?? 8;
  const rawEngagement = asNumber(post.rawEngagement, -1);
  const engagement =
    rawEngagement >= 0
      ? Math.max(0, Math.min(1, Math.log1p(rawEngagement) / Math.log(1500)))
      : normalizeEngagement(post);

  const materializedEngagement = rawEngagement >= 0 ? rawEngagement : Math.floor(engagement * 200);
  if (materializedEngagement < minEngagement) {
    return null;
  }

  const lang = asString(post.lang) || "en";
  const langAllow = watchlistConfig.langAllow ?? ["en"];
  if (langAllow.length > 0 && !langAllow.includes(lang)) {
    return null;
  }

  const quotedLinks = extractQuotedLinks(post);
  const originLinkCount = quotedLinks.length;
  const authorReputation = reputationMap.get(authorHandle.toLowerCase()) ?? 0.6;

  return {
    externalId: postId,
    title,
    url,
    publishedAt: post.createdAt
      ? new Date(asString(post.createdAt))
      : post.created_at
        ? new Date(asString(post.created_at))
        : undefined,
    content: text.slice(0, 2000),
    author: asString(post.authorName) || authorHandle,
    authorHandle,
    language: lang,
    engagementProxy: engagement,
    originLinkCount,
    authorReputation,
    isSocialInsight: true,
    practicalScore: Math.max(0.2, Math.min(0.95, 0.45 + authorReputation * 0.45)),
    quotedLinks,
    rawPayload: {
      provider: source.provider,
      postId,
      authorHandle,
      engagement,
      quotedLinks,
    },
  };
}

async function fetchPublicWatchlistItems(
  source: SourceRecord,
  activeAuthors: Array<{ handle: string; displayName: string; reputationScore: number }>,
): Promise<IngestedItem[]> {
  const watchlistConfig = source.config ?? {};
  const domainAllow = watchlistConfig.domainAllow ?? [];
  const langAllow = watchlistConfig.langAllow ?? ["en", "zh"];
  const limit = watchlistConfig.limit ?? 50;
  const minEngagement = watchlistConfig.minEngagement ?? 8;

  const items: IngestedItem[] = [];

  for (const author of activeAuthors) {
    if (items.length >= limit) {
      break;
    }

    try {
      const response = await fetch(`https://r.jina.ai/http://x.com/${author.handle}`, {
        signal: AbortSignal.timeout(12000),
        headers: {
          "user-agent": "AIScanBot/0.1",
        },
      });

      if (!response.ok) {
        continue;
      }

      const markdown = await response.text();
      const lines = markdown.split("\n").map((line) => line.trim()).filter(Boolean);
      const postStart = lines.findIndex((line) => /posts/i.test(line));
      const scope = (postStart >= 0 ? lines.slice(postStart + 1) : lines).slice(0, 240);

      let extracted = 0;
      for (const line of scope) {
        if (items.length >= limit || extracted >= 5) {
          break;
        }
        if (line.length < 40 || line.length > 220) {
          continue;
        }
        if (/^(Pinned|Quote|Who to follow|Title:|URL Source:|Published Time:|Markdown Content:|\[!\[)/i.test(line)) {
          continue;
        }
        if (!isAiRelevant(line, domainAllow) && author.reputationScore < 0.88) {
          continue;
        }

        const engagement = Math.max(0.2, Math.min(0.8, 0.35 + author.reputationScore * 0.4));
        const materializedEngagement = Math.floor(engagement * 100);
        if (materializedEngagement < minEngagement) {
          continue;
        }

        const lang = "en";
        if (langAllow.length > 0 && !langAllow.includes(lang)) {
          continue;
        }

        const normalizedText = line.replace(/\s+/g, " ").trim();
        const signature = normalizedText.slice(0, 42).replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase();

        items.push({
          externalId: `public-${author.handle}-${signature || extracted}`,
          title: normalizedText.slice(0, 120),
          url: `https://x.com/${author.handle}`,
          publishedAt: new Date(),
          content: normalizedText,
          author: author.displayName,
          authorHandle: author.handle,
          language: lang,
          engagementProxy: engagement,
          originLinkCount: 0,
          authorReputation: author.reputationScore,
          isSocialInsight: true,
          practicalScore: Math.max(0.2, Math.min(0.95, 0.45 + author.reputationScore * 0.45)),
          quotedLinks: [],
          rawPayload: {
            provider: source.provider,
            postId: `public-${signature}`,
            authorHandle: author.handle,
            engagement,
            quotedLinks: [],
            fetchMode: "public-profile-fallback",
          },
        });

        extracted += 1;
      }
    } catch {
      continue;
    }
  }

  return items.slice(0, limit);
}

export async function fetchSocialItems(options: SocialFetchOptions): Promise<IngestedItem[]> {
  const { source, providerName } = options;
  const baseUrl = options.baseUrl?.trim();
  const apiKey = options.apiKey?.trim();

  const watchlist = getWatchlist(source.config?.watchlistId);
  const activeAuthors = watchlist.authors.filter((author) => author.active);
  const handles = activeAuthors.map((author) => author.handle);

  if (!baseUrl || !apiKey) {
    const publicItems = await fetchPublicWatchlistItems(source, activeAuthors);
    if (publicItems.length > 0) {
      return publicItems;
    }
    throw new Error(`SOCIAL_AGG_${providerName} credentials are not configured`);
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/posts`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      "user-agent": "AIScanBot/0.1",
    },
    body: JSON.stringify({
      watchlistId: source.config?.watchlistId ?? watchlist.id,
      handles,
      limit: source.config?.limit ?? 50,
    }),
  });

  if (!response.ok) {
    throw new Error(`SOCIAL_AGG_${providerName} API failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    posts?: Array<Record<string, unknown>>;
    data?: Array<Record<string, unknown>>;
  };

  const posts = payload.posts ?? payload.data ?? [];
  const reputationMap = new Map(activeAuthors.map((author) => [author.handle.toLowerCase(), author.reputationScore]));

  const normalized: IngestedItem[] = [];
  for (const post of posts) {
    const item = normalizePostToItem(source, post, reputationMap);
    if (item) {
      normalized.push(item);
    }
  }

  return normalized.slice(0, source.config?.limit ?? 50);
}
