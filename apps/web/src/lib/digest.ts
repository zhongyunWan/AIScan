import type { DailyDigest } from "@/lib/types";
import { DIGEST_TARGET_SIZE } from "@/lib/config";
import { prisma } from "@/lib/db";
import { resolveTrendCategory } from "@/lib/trend-category";
import { parseDateInput, toDateKey, toDateOnly } from "@/lib/utils/date";
import { extractInsightTags } from "@/lib/utils/text";

export async function getDigestByDate(dateInput: string): Promise<DailyDigest | null> {
  const date = parseDateInput(dateInput);
  if (!date) {
    return null;
  }

  const items = await prisma.dailyDigestItem.findMany({
    where: { digestDate: date },
    include: {
      normalizedItem: {
        include: {
          source: true,
        },
      },
    },
    orderBy: {
      rank: "asc",
    },
    take: DIGEST_TARGET_SIZE,
  });

  return {
    date: toDateKey(date),
    items: items.map((item) => ({
      rank: item.rank,
      score: item.score,
      confidenceLabel: item.confidenceLabel,
      title: item.normalizedItem.title,
      summary: item.normalizedItem.summary,
      sourceName: item.normalizedItem.source.name,
      sourceType: item.normalizedItem.source.type,
      sourceWeight: item.normalizedItem.sourceWeight,
      trendCategory: resolveTrendCategory({
        sourceSlug: item.normalizedItem.source.slug,
        sourceProvider: item.normalizedItem.source.provider,
        sourceBucket: item.normalizedItem.source.bucket,
      }),
      bucket: item.bucket,
      practicalScore: item.normalizedItem.practicalScore,
      isRecurringHot: item.isRecurringHot,
      streakDays: item.streakDays,
      repeatDecay: item.repeatDecay,
      insightTags: extractInsightTags({
        title: item.normalizedItem.title,
        summary: item.normalizedItem.summary,
        sourceName: item.normalizedItem.source.name,
        bucket: item.bucket,
      }),
      publishedAt: item.normalizedItem.publishedAt?.toISOString() ?? null,
      url: item.normalizedItem.canonicalUrl,
    })),
  };
}

export async function getTodayDigest(): Promise<DailyDigest> {
  const today = toDateOnly(new Date());
  const digest = await getDigestByDate(toDateKey(today));

  return digest ?? { date: toDateKey(today), items: [] };
}

export async function getSourcesPublic() {
  const sources = await prisma.source.findMany({
    where: { enabled: true },
    select: {
      slug: true,
      name: true,
      url: true,
      provider: true,
      type: true,
      bucket: true,
      sourceWeight: true,
      reliabilityLevel: true,
      healthStatus: true,
      failureStreak: true,
      lastSuccessAt: true,
      updatedAt: true,
    },
    orderBy: [{ bucket: "asc" }, { sourceWeight: "desc" }],
  });

  return sources;
}
