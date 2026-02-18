import type {
  ReliabilityLevel,
  SourceBucket,
  SourceProvider,
  SourceType,
} from "@prisma/client";

export type TrendCategory =
  | "PRODUCT_HUNT_AI"
  | "HUGGINGFACE_TRENDING"
  | "REDDIT_DEV"
  | "X_TWITTER_AI"
  | "OTHER";

export interface SourceConfig {
  searchQuery?: string;
  repo?: string;
  query?: string;
  venue?: string;
  category?: string;
  entityType?: "models" | "spaces";
  subreddit?: string;
  sort?: "hot" | "new" | "top";
  keywords?: string[];
  watchlistId?: string;
  providerType?: "primary" | "fallback";
  minEngagement?: number;
  langAllow?: string[];
  domainAllow?: string[];
  limit?: number;
  endpoint?: string;
}

export interface SourceRecord {
  id: string;
  slug: string;
  name: string;
  url: string;
  feedUrl: string | null;
  provider: SourceProvider;
  type: SourceType;
  bucket: SourceBucket;
  sourceWeight: number;
  reliabilityLevel: ReliabilityLevel;
  healthStatus: string;
  failureStreak: number;
  lastSuccessAt?: Date | null;
  enabled: boolean;
  config: SourceConfig | null;
}

export interface IngestedItem {
  externalId: string;
  title: string;
  url: string;
  publishedAt?: Date;
  content?: string;
  author?: string;
  authorHandle?: string;
  language?: string;
  engagementProxy?: number;
  originLinkCount?: number;
  authorReputation?: number;
  isSocialInsight?: boolean;
  practicalScore?: number;
  quotedLinks?: string[];
  rawPayload?: Record<string, unknown>;
}

export interface RankedItem {
  rank: number;
  normalizedItemId: string;
  clusterKey: string;
  score: number;
  baseScore: number;
  bucket: SourceBucket;
  practicalScore: number;
  isRecurringHot: boolean;
  streakDays: number;
  repeatDecay: number;
  authorHandle: string | null;
  crossSourceConfirm: number;
  sourceCount: number;
  confidenceLabel: "high" | "medium" | "low";
}

export interface DailyDigest {
  date: string;
  items: Array<{
    rank: number;
    score: number;
    confidenceLabel: string;
    title: string;
    summary: string;
    sourceName: string;
    sourceType: SourceType;
    sourceWeight: number;
    trendCategory: TrendCategory;
    bucket: SourceBucket;
    practicalScore: number;
    isRecurringHot: boolean;
    streakDays: number;
    repeatDecay: number;
    insightTags: string[];
    publishedAt: string | null;
    url: string;
  }>;
}

export interface IngestionOptions {
  sourceBuckets?: SourceBucket[];
}

export interface PublishOptions {
  mediaMax?: number;
  practicalTargetRatio?: number;
  repeatWindowDays?: number;
}
