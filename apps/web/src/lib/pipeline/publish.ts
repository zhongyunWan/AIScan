import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { DIGEST_TARGET_PER_CATEGORY, DIGEST_TARGET_SIZE, TREND_CATEGORY_ORDER } from "@/lib/config";
import { normalizeRecentRawItems } from "@/lib/pipeline/normalize";
import { getRankConfig, rankCandidates } from "@/lib/pipeline/rank";
import { resolveTrendCategory } from "@/lib/trend-category";
import type { PublishOptions, RankedItem } from "@/lib/types";
import { toDateOnly } from "@/lib/utils/date";
import { stableHash } from "@/lib/utils/text";

function clampRatio(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.max(0.5, Math.min(0.95, value));
}

function clampInt(value: number | undefined, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.floor(value)));
}

async function getPreviousStreakByCluster(digestDate: Date, windowDays: number): Promise<Map<string, number>> {
  const start = new Date(digestDate.valueOf() - windowDays * 24 * 60 * 60 * 1000);

  const previousDigestItems = await prisma.dailyDigestItem.findMany({
    where: {
      digestDate: {
        gte: start,
        lt: digestDate,
      },
    },
    include: {
      cluster: true,
    },
    orderBy: {
      digestDate: "desc",
    },
  });

  const map = new Map<string, number>();
  for (const item of previousDigestItems) {
    if (!map.has(item.cluster.clusterKey)) {
      map.set(item.cluster.clusterKey, item.streakDays);
    }
  }

  return map;
}

export async function runPublish(
  targetDateInput = new Date(),
  options?: PublishOptions,
): Promise<{
  runId: string;
  normalizedCount: number;
  digestCount: number;
}> {
  const digestDate = toDateOnly(targetDateInput);
  const rankConfig = getRankConfig({
    mediaMax: clampInt(options?.mediaMax, 40, 0, DIGEST_TARGET_SIZE),
    practicalTargetRatio: clampRatio(options?.practicalTargetRatio, 0.85),
    repeatWindowDays: clampInt(options?.repeatWindowDays, 7, 3, 14),
  });

  const run = await prisma.jobRun.create({
    data: {
      jobType: "PUBLISH",
      status: "running",
      details: {
        publishOptions: rankConfig,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  try {
    const normalizedCount = await normalizeRecentRawItems(72);

    const practicalWindowStart = new Date(digestDate.valueOf() - 30 * 24 * 60 * 60 * 1000);
    const mediaWindowStart = new Date(digestDate.valueOf() - 7 * 24 * 60 * 60 * 1000);

    const candidates = await prisma.normalizedItem.findMany({
      where: {
        source: {
          enabled: true,
        },
        OR: [
          {
            source: {
              bucket: "PRACTICAL",
            },
            publishedAt: {
              gte: practicalWindowStart,
            },
          },
          {
            source: {
              bucket: "MEDIA",
            },
            publishedAt: {
              gte: mediaWindowStart,
            },
          },
          {
            publishedAt: null,
          },
        ],
      },
      include: {
        source: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1600,
    });

    const previousStreakByCluster = await getPreviousStreakByCluster(
      digestDate,
      rankConfig.repeatWindowDays,
    );
    const ranked = rankCandidates(candidates, previousStreakByCluster, rankConfig);

    const rankedWithFallback = await fillLowConfidenceItems(ranked, candidates, rankConfig.mediaMax);

    await prisma.$transaction(async (tx) => {
      await tx.dailyDigestItem.deleteMany({
        where: {
          digestDate,
        },
      });
      await tx.eventCluster.deleteMany({
        where: {
          digestDate,
        },
      });

      for (const item of rankedWithFallback) {
        const cluster = await tx.eventCluster.create({
          data: {
            digestDate,
            clusterKey: item.clusterKey,
            sourceCount: item.sourceCount,
            crossSourceConfirm: item.crossSourceConfirm,
            representativeItemId: item.normalizedItemId,
          },
        });

        await tx.dailyDigestItem.create({
          data: {
            digestDate,
            rank: item.rank,
            score: item.score,
            bucket: item.bucket,
            confidenceLabel: item.confidenceLabel,
            isRecurringHot: item.isRecurringHot,
            streakDays: item.streakDays,
            repeatDecay: item.repeatDecay,
            clusterId: cluster.id,
            normalizedItemId: item.normalizedItemId,
          },
        });
      }
    });

    await prisma.jobRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        endedAt: new Date(),
        processedCount: normalizedCount,
        failedCount: 0,
        details: {
          digestDate: digestDate.toISOString(),
          digestCount: rankedWithFallback.length,
          publishOptions: rankConfig,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      runId: run.id,
      normalizedCount,
      digestCount: rankedWithFallback.length,
    };
  } catch (error) {
    await prisma.jobRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        endedAt: new Date(),
        failedCount: 1,
        details: {
          message: error instanceof Error ? error.message : "unknown publish error",
          publishOptions: rankConfig,
        } as unknown as Prisma.InputJsonValue,
      },
    });
    throw error;
  }
}

async function fillLowConfidenceItems(
  ranked: RankedItem[],
  candidates: Array<{
    id: string;
    source: { bucket: "PRACTICAL" | "MEDIA"; slug: string; provider: string };
  }>,
  mediaMax: number,
): Promise<RankedItem[]> {
  const target = DIGEST_TARGET_SIZE;
  if (ranked.length >= target) {
    return ranked;
  }

  const used = new Set(ranked.map((item) => item.normalizedItemId));
  const fallback: RankedItem[] = [...ranked];
  let mediaCount = fallback.filter((item) => item.bucket === "MEDIA").length;
  const categoryById = new Map(
    candidates.map((candidate) => [
      candidate.id,
      resolveTrendCategory({
        sourceSlug: candidate.source.slug,
        sourceProvider: candidate.source.provider,
        sourceBucket: candidate.source.bucket,
      }),
    ]),
  );
  const categoryCount = new Map<string, number>();

  for (const item of fallback) {
    const category = categoryById.get(item.normalizedItemId) ?? "OTHER";
    categoryCount.set(category, (categoryCount.get(category) ?? 0) + 1);
  }

  for (const category of TREND_CATEGORY_ORDER) {
    const deficit = DIGEST_TARGET_PER_CATEGORY - (categoryCount.get(category) ?? 0);
    if (deficit <= 0) {
      continue;
    }

    let needed = deficit;
    for (const candidate of candidates) {
      if (needed <= 0 || fallback.length >= target) {
        break;
      }
      if (used.has(candidate.id)) {
        continue;
      }
      if ((categoryById.get(candidate.id) ?? "OTHER") !== category) {
        continue;
      }

      const bucket = candidate.source.bucket;
      if (bucket === "MEDIA" && mediaCount >= mediaMax) {
        continue;
      }

      if (bucket === "MEDIA") {
        mediaCount += 1;
      }

      used.add(candidate.id);
      categoryCount.set(category, (categoryCount.get(category) ?? 0) + 1);
      fallback.push({
        rank: fallback.length + 1,
        normalizedItemId: candidate.id,
        clusterKey: `fallback-${stableHash(candidate.id).slice(0, 12)}`,
        score: 0.05,
        baseScore: 0.05,
        bucket,
        practicalScore: bucket === "MEDIA" ? 0.45 : 0.65,
        isRecurringHot: false,
        streakDays: 1,
        repeatDecay: 1,
        authorHandle: null,
        crossSourceConfirm: 0,
        sourceCount: 1,
        confidenceLabel: "low",
      });
      needed -= 1;
    }
  }

  const categoryPriority = new Map<string, number>(
    TREND_CATEGORY_ORDER.map((category, index) => [category, index]),
  );
  const ordered = [...fallback].sort((a, b) => {
    const ca = categoryById.get(a.normalizedItemId) ?? "OTHER";
    const cb = categoryById.get(b.normalizedItemId) ?? "OTHER";
    const pa = categoryPriority.get(ca) ?? 999;
    const pb = categoryPriority.get(cb) ?? 999;
    if (pa !== pb) {
      return pa - pb;
    }
    return a.rank - b.rank;
  });

  return ordered.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
