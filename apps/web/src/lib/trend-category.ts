import type { SourceBucket, SourceProvider } from "@prisma/client";

import type { TrendCategory } from "@/lib/types";

export function resolveTrendCategory(input: {
  sourceSlug: string;
  sourceProvider: SourceProvider | string;
  sourceBucket: SourceBucket;
}): TrendCategory {
  const slug = input.sourceSlug.toLowerCase();
  const provider = String(input.sourceProvider).toUpperCase();

  if (slug.includes("product-hunt")) {
    return "PRODUCT_HUNT_AI";
  }
  if (slug.includes("hf-trending") || provider === "HUGGINGFACE") {
    return "HUGGINGFACE_TRENDING";
  }
  if (slug.includes("reddit") || provider === "REDDIT_JSON") {
    return "REDDIT_DEV";
  }
  if (provider === "SOCIAL_AGG_A" || provider === "SOCIAL_AGG_B" || slug.includes("social-researcher")) {
    return "X_TWITTER_AI";
  }
  return input.sourceBucket === "MEDIA" ? "REDDIT_DEV" : "HUGGINGFACE_TRENDING";
}

