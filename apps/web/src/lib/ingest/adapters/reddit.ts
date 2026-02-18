import type { IngestedItem, SourceRecord } from "@/lib/types";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function toNumber(input: unknown): number {
  const value = Number(input);
  return Number.isFinite(value) ? value : 0;
}

function normalizeSort(sort?: string): "hot" | "new" | "top" {
  if (sort === "new" || sort === "top") {
    return sort;
  }
  return "hot";
}

export async function fetchRedditItems(source: SourceRecord): Promise<IngestedItem[]> {
  const subreddit = source.config?.subreddit;
  if (!subreddit) {
    return [];
  }

  const sort = normalizeSort(source.config?.sort);
  const limit = source.config?.limit ?? 30;
  const endpoint = `https://old.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`;

  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(12000),
    headers: {
      "User-Agent": "AIScanBot/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Reddit API failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: {
      children?: Array<{
        data?: {
          id?: string;
          title?: string;
          permalink?: string;
          selftext?: string;
          author?: string;
          created_utc?: number;
          ups?: number;
          num_comments?: number;
        };
      }>;
    };
  };

  return (payload.data?.children ?? [])
    .map((entry, index) => {
      const post = entry.data ?? {};
      const id = post.id ?? `${subreddit}-${index}`;
      const title = (post.title ?? "").trim() || "Untitled";
      const permalink = post.permalink?.startsWith("http")
        ? post.permalink
        : `https://www.reddit.com${post.permalink ?? ""}`;
      const url = permalink || source.url;
      const ups = toNumber(post.ups);
      const comments = toNumber(post.num_comments);
      const engagement = clamp01(Math.log1p(ups + comments * 2) / Math.log(5000));

      return {
        externalId: String(id),
        title,
        url,
        publishedAt: post.created_utc ? new Date(post.created_utc * 1000) : undefined,
        content: (post.selftext ?? "").slice(0, 1800),
        author: post.author ?? `r/${subreddit}`,
        language: "en",
        engagementProxy: engagement,
        originLinkCount: 1,
        practicalScore: 0.68,
        rawPayload: {
          provider: "REDDIT_JSON",
          subreddit,
          ups,
          comments,
        },
      } satisfies IngestedItem;
    })
    .filter((item) => Boolean(item.url));
}
