import type { NormalizedItem, Source, SourceBucket } from "@prisma/client";

import {
  DIGEST_TARGET_PER_CATEGORY,
  DIGEST_TARGET_SIZE,
  SIMILARITY_THRESHOLD,
  TREND_CATEGORY_ORDER,
} from "@/lib/config";
import { resolveTrendCategory } from "@/lib/trend-category";
import type { RankedItem, TrendCategory } from "@/lib/types";
import { hoursSince } from "@/lib/utils/date";
import { similarity, stableHash } from "@/lib/utils/text";

type ItemWithSource = NormalizedItem & { source: Source };

interface ClusterCandidate {
  key: string;
  representative: ItemWithSource;
  items: ItemWithSource[];
}

export interface RankConfig {
  mediaMax: number;
  practicalTargetRatio: number;
  repeatWindowDays: number;
}

interface ScoreInput {
  bucket: SourceBucket;
  practicalScore: number;
  sourceWeight: number;
  engagement: number;
  crossSourceConfirm: number;
  freshness: number;
  authorReputation: number;
  originLinkCount: number;
}

interface RankedCandidate extends RankedItem {
  sourceSlug: string;
  canonicalUrl: string;
  title: string;
  isVersionNoise: boolean;
  projectKey: string | null;
  trendCategory: TrendCategory;
}

const DEFAULT_MEDIA_MAX = 40;
const DEFAULT_PRACTICAL_TARGET_RATIO = 0.85;
const DEFAULT_REPEAT_WINDOW_DAYS = 7;
const PRACTICAL_SOURCE_CAP = 10;
const VERSION_NOISE_CAP = 4;

export function getRankConfig(overrides?: Partial<RankConfig>): RankConfig {
  return {
    mediaMax: overrides?.mediaMax ?? DEFAULT_MEDIA_MAX,
    practicalTargetRatio: overrides?.practicalTargetRatio ?? DEFAULT_PRACTICAL_TARGET_RATIO,
    repeatWindowDays: overrides?.repeatWindowDays ?? DEFAULT_REPEAT_WINDOW_DAYS,
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function recencyScore(item: ItemWithSource): number {
  const ageHours = hoursSince(item.publishedAt);
  return Math.exp(-ageHours / 48);
}

function confidenceLabel(candidate: ClusterCandidate): "high" | "medium" | "low" {
  const representative = candidate.representative;
  const sourceCount = new Set(candidate.items.map((item) => item.sourceId)).size;

  if (
    representative.reliabilityLevel === "HIGH" &&
    representative.hasPrimarySource &&
    sourceCount >= 2
  ) {
    return "high";
  }

  if (representative.reliabilityLevel !== "LOW" && representative.hasPrimarySource) {
    return "medium";
  }

  return "low";
}

function baseScore(input: ScoreInput): number {
  if (input.bucket === "MEDIA") {
    const social =
      0.3 * input.practicalScore +
      0.25 * input.sourceWeight +
      0.2 * input.engagement +
      0.15 * input.crossSourceConfirm +
      0.1 * input.authorReputation;

    const originPenalty = input.originLinkCount === 0 ? 0.55 : 1;
    return social * originPenalty;
  }

  return (
    0.4 * input.practicalScore +
    0.25 * input.sourceWeight +
    0.2 * input.engagement +
    0.1 * input.crossSourceConfirm +
    0.05 * input.freshness
  );
}

function normalizeTitleForSpamCheck(title: string): string {
  return title
    .replace(/^\[[^\]]+\]\s*/g, "")
    .trim()
    .toLowerCase();
}

function isVersionNoiseTitle(title: string): boolean {
  const normalized = normalizeTitleForSpamCheck(title);
  if (!normalized) {
    return false;
  }

  if (/^v?\d+\.\d+(?:\.\d+){0,2}(?:[-+._][0-9a-z]+)*$/i.test(normalized)) {
    return true;
  }

  return /(?:^|\s)(release|changelog|版本)\s*v?\d+\.\d+/i.test(normalized);
}

function projectKeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const host = parsed.hostname.toLowerCase();

    if (parts.length === 0) {
      return host;
    }

    if (host.includes("github.com") && parts.length >= 2) {
      return `${host}/${parts[0].toLowerCase()}/${parts[1].toLowerCase()}`;
    }

    if (host.includes("huggingface.co") && parts.length >= 2 && parts[0].toLowerCase() === "spaces") {
      return `${host}/spaces/${parts[1].toLowerCase()}`;
    }

    return `${host}/${parts[0].toLowerCase()}`;
  } catch {
    return null;
  }
}

export function buildClusters(items: ItemWithSource[]): ClusterCandidate[] {
  const clusters: ClusterCandidate[] = [];

  for (const item of items) {
    let matchedCluster: ClusterCandidate | undefined;

    for (const cluster of clusters) {
      if (cluster.representative.canonicalUrl === item.canonicalUrl) {
        matchedCluster = cluster;
        break;
      }
      if (cluster.representative.titleHash === item.titleHash) {
        matchedCluster = cluster;
        break;
      }

      const sim = similarity(cluster.representative.contentSnippet, item.contentSnippet);
      if (sim >= SIMILARITY_THRESHOLD) {
        matchedCluster = cluster;
        break;
      }
    }

    if (matchedCluster) {
      matchedCluster.items.push(item);
      if ((item.practicalScore ?? 0.5) >= (matchedCluster.representative.practicalScore ?? 0.5)) {
        matchedCluster.representative = item;
      }
    } else {
      const key = stableHash(`${item.canonicalUrl}|${item.titleHash}`).slice(0, 24);
      clusters.push({
        key,
        representative: item,
        items: [item],
      });
    }
  }

  return clusters;
}

function computeRepeatDecay(streakDays: number): number {
  return Number(Math.pow(0.92, Math.max(0, streakDays - 1)).toFixed(6));
}

function selectWithQuotas(ranked: RankedCandidate[], config: RankConfig): RankedItem[] {
  const selected: RankedCandidate[] = [];
  const selectedByCategory = new Map<TrendCategory, RankedCandidate[]>();
  const authorCount = new Map<string, number>();
  const practicalSourceCount = new Map<string, number>();
  const practicalCountByCategory = new Map<TrendCategory, number>();
  const versionNoiseByProjectByCategory = new Map<TrendCategory, Map<string, number>>();
  let versionNoiseCount = 0;

  const canSelectPractical = (item: RankedCandidate): boolean => {
    const sourceCount = practicalSourceCount.get(item.sourceSlug) ?? 0;
    if (sourceCount >= PRACTICAL_SOURCE_CAP) {
      return false;
    }

    if (item.isVersionNoise) {
      if (versionNoiseCount >= VERSION_NOISE_CAP) {
        return false;
      }

      if (item.projectKey) {
        const map = versionNoiseByProjectByCategory.get(item.trendCategory) ?? new Map<string, number>();
        const projectCount = map.get(item.projectKey) ?? 0;
        if (projectCount >= 1) {
          return false;
        }
      }
    }

    practicalSourceCount.set(item.sourceSlug, sourceCount + 1);

    if (item.isVersionNoise) {
      versionNoiseCount += 1;
      if (item.projectKey) {
        const map = versionNoiseByProjectByCategory.get(item.trendCategory) ?? new Map<string, number>();
        const projectCount = map.get(item.projectKey) ?? 0;
        map.set(item.projectKey, projectCount + 1);
        versionNoiseByProjectByCategory.set(item.trendCategory, map);
      }
    }

    return true;
  };

  const canSelectMedia = (item: RankedCandidate, mediaCount: number): boolean => {
    if (mediaCount >= config.mediaMax) {
      return false;
    }

    const handle = item.authorHandle?.toLowerCase();
    if (handle) {
      const count = authorCount.get(handle) ?? 0;
      if (count >= 2) {
        return false;
      }
      authorCount.set(handle, count + 1);
    }

    return true;
  };

  const markSelected = (item: RankedCandidate): boolean => {
    const bucket = selectedByCategory.get(item.trendCategory) ?? [];
    if (bucket.length >= DIGEST_TARGET_PER_CATEGORY) {
      return false;
    }
    bucket.push(item);
    selectedByCategory.set(item.trendCategory, bucket);
    selected.push(item);
    if (item.bucket === "PRACTICAL") {
      practicalCountByCategory.set(item.trendCategory, (practicalCountByCategory.get(item.trendCategory) ?? 0) + 1);
    }
    return true;
  };

  let mediaCount = 0;
  const used = new Set<string>();
  const practicalTargetPerCategory = Math.max(
    0,
    Math.min(
      DIGEST_TARGET_PER_CATEGORY,
      Math.round(DIGEST_TARGET_PER_CATEGORY * config.practicalTargetRatio),
    ),
  );

  for (const category of TREND_CATEGORY_ORDER) {
    for (const item of ranked) {
      if (used.has(item.normalizedItemId) || item.trendCategory !== category) {
        continue;
      }
      if ((selectedByCategory.get(category)?.length ?? 0) >= DIGEST_TARGET_PER_CATEGORY) {
        break;
      }

      if (item.bucket === "PRACTICAL") {
        if ((practicalCountByCategory.get(category) ?? 0) >= practicalTargetPerCategory) {
          continue;
        }
        if (!canSelectPractical(item)) {
          continue;
        }
      } else {
        if (!canSelectMedia(item, mediaCount)) {
          continue;
        }
      }

      const pushed = markSelected(item);
      if (pushed) {
        used.add(item.normalizedItemId);
        if (item.bucket === "MEDIA") {
          mediaCount += 1;
        }
      }
    }
  }

  for (const category of TREND_CATEGORY_ORDER) {
    for (const item of ranked) {
      if (used.has(item.normalizedItemId) || item.trendCategory !== category) {
        continue;
      }
      if ((selectedByCategory.get(category)?.length ?? 0) >= DIGEST_TARGET_PER_CATEGORY) {
        break;
      }

      if (item.bucket === "PRACTICAL") {
        if (!canSelectPractical(item)) {
          continue;
        }
      } else if (!canSelectMedia(item, mediaCount)) {
        continue;
      }

      const pushed = markSelected(item);
      if (pushed) {
        used.add(item.normalizedItemId);
        if (item.bucket === "MEDIA") {
          mediaCount += 1;
        }
      }
    }
  }

  const ordered: RankedCandidate[] = [];
  for (const category of TREND_CATEGORY_ORDER) {
    const items = selectedByCategory.get(category) ?? [];
    items.sort((a, b) => b.score - a.score);
    ordered.push(...items.slice(0, DIGEST_TARGET_PER_CATEGORY));
  }

  return ordered.slice(0, DIGEST_TARGET_SIZE).map((item, index) => ({
    rank: index + 1,
    normalizedItemId: item.normalizedItemId,
    clusterKey: item.clusterKey,
    score: item.score,
    baseScore: item.baseScore,
    bucket: item.bucket,
    practicalScore: item.practicalScore,
    isRecurringHot: item.isRecurringHot,
    streakDays: item.streakDays,
    repeatDecay: item.repeatDecay,
    authorHandle: item.authorHandle,
    crossSourceConfirm: item.crossSourceConfirm,
    sourceCount: item.sourceCount,
    confidenceLabel: item.confidenceLabel,
  }));
}

export function rankCandidates(
  items: ItemWithSource[],
  previousStreakByCluster: Map<string, number>,
  overrides?: Partial<RankConfig>,
): RankedItem[] {
  const config = getRankConfig(overrides);

  const sorted = [...items].sort((a, b) => {
    const aTime = a.publishedAt?.valueOf() ?? 0;
    const bTime = b.publishedAt?.valueOf() ?? 0;
    return bTime - aTime;
  });

  const clusters = buildClusters(sorted);

  const ranked: RankedCandidate[] = clusters.map((cluster) => {
    const representative = cluster.representative;
    const sourceCount = new Set(cluster.items.map((item) => item.sourceId)).size;
    const crossSourceConfirm = clamp01(Math.min(1, sourceCount / 3));

    const bucket = representative.source.bucket;
    const practicality = clamp01(representative.practicalScore);
    const sourceWeight = clamp01(representative.sourceWeight);
    const engagement = clamp01(representative.engagementProxy);
    const freshness = clamp01(recencyScore(representative));
    const authorReputation = clamp01(representative.authorReputation);
    const originLinkCount = representative.originLinkCount;

    const streakDays = Math.min(config.repeatWindowDays, (previousStreakByCluster.get(cluster.key) ?? 0) + 1);
    const repeatDecay = computeRepeatDecay(streakDays);

    const base = baseScore({
      bucket,
      practicalScore: practicality,
      sourceWeight,
      engagement,
      crossSourceConfirm,
      freshness,
      authorReputation,
      originLinkCount,
    });

    const score = base * repeatDecay;

    return {
      rank: 0,
      normalizedItemId: representative.id,
      clusterKey: cluster.key,
      score: Number(score.toFixed(6)),
      baseScore: Number(base.toFixed(6)),
      bucket,
      practicalScore: practicality,
      isRecurringHot: streakDays > 1,
      streakDays,
      repeatDecay,
      authorHandle: representative.authorHandle,
      crossSourceConfirm,
      sourceCount,
      confidenceLabel: confidenceLabel(cluster),
      sourceSlug: representative.source.slug,
      canonicalUrl: representative.canonicalUrl,
      title: representative.title,
      isVersionNoise: isVersionNoiseTitle(representative.title),
      projectKey: projectKeyFromUrl(representative.canonicalUrl),
      trendCategory: resolveTrendCategory({
        sourceSlug: representative.source.slug,
        sourceProvider: representative.source.provider,
        sourceBucket: representative.source.bucket,
      }),
    };
  });

  const rankedSorted = ranked.sort((a, b) => b.score - a.score);
  return selectWithQuotas(rankedSorted, config);
}
