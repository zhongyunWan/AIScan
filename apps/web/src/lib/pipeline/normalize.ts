import { prisma } from "@/lib/db";
import {
  canonicalizeUrl,
  cleanDisplayTitle,
  stripHtml,
  stableHash,
  summarizeToChinese,
  generateSummaryWithLLM,
} from "@/lib/utils/text";

function asNumber(input: unknown, fallback: number): number {
  const value = Number(input);
  return Number.isFinite(value) ? value : fallback;
}

function asString(input: unknown): string {
  return typeof input === "string" ? input : "";
}

function asArray(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input.map((item) => asString(item)).filter(Boolean);
}

export async function normalizeRecentRawItems(hoursWindow = 72): Promise<number> {
  const cutoff = new Date(Date.now() - hoursWindow * 60 * 60 * 1000);
  const rawItems = await prisma.rawItem.findMany({
    where: {
      ingestedAt: {
        gte: cutoff,
      },
    },
    include: {
      source: true,
    },
    orderBy: {
      ingestedAt: "desc",
    },
    take: 1200,
  });

  let processed = 0;

  for (const raw of rawItems) {
    const rawPayload = (raw.rawPayload ?? {}) as Record<string, unknown>;
    const contentSnippet = stripHtml(raw.content ?? "").slice(0, 1000);
    const displayTitle = cleanDisplayTitle(raw.title);
    const canonicalUrl = canonicalizeUrl(raw.url);
    const titleHash = stableHash(displayTitle.toLowerCase());
    const contentHash = stableHash(contentSnippet || raw.title);
    const isSocialInsight = raw.source.bucket === "MEDIA";
    const hasPrimarySource = raw.source.bucket !== "MEDIA";

    const llmSummary = await generateSummaryWithLLM({
      title: displayTitle,
      content: contentSnippet || raw.title,
      sourceName: raw.source.name,
      sourceType: raw.source.type,
    });

    const summary = llmSummary ?? summarizeToChinese(contentSnippet || raw.title, displayTitle);

    const originLinks = asArray(rawPayload.quotedLinks);
    const originLinkCount =
      asNumber(rawPayload.originLinkCount, Number.NaN) || (originLinks.length > 0 ? originLinks.length : 0);
    const authorReputation = asNumber(rawPayload.authorReputation, isSocialInsight ? 0.6 : 0.8);
    const practicalScore = asNumber(rawPayload.practicalScore, isSocialInsight ? 0.55 : 0.78);
    const authorHandle = asString(rawPayload.authorHandle) || null;

    await prisma.normalizedItem.upsert({
      where: { rawItemId: raw.id },
      create: {
        rawItemId: raw.id,
        sourceId: raw.sourceId,
        title: displayTitle,
        summary,
        canonicalUrl,
        titleHash,
        contentHash,
        contentSnippet,
        publishedAt: raw.publishedAt,
        sourceWeight: raw.source.sourceWeight,
        reliabilityLevel: raw.source.reliabilityLevel,
        engagementProxy: raw.engagementProxy,
        practicalScore,
        originLinkCount,
        authorReputation,
        authorHandle,
        isSocialInsight,
        hasPrimarySource,
        isLowConfidence: !hasPrimarySource || raw.source.reliabilityLevel === "LOW",
      },
      update: {
        sourceId: raw.sourceId,
        title: displayTitle,
        summary,
        canonicalUrl,
        titleHash,
        contentHash,
        contentSnippet,
        publishedAt: raw.publishedAt,
        sourceWeight: raw.source.sourceWeight,
        reliabilityLevel: raw.source.reliabilityLevel,
        engagementProxy: raw.engagementProxy,
        practicalScore,
        originLinkCount,
        authorReputation,
        authorHandle,
        isSocialInsight,
        hasPrimarySource,
        isLowConfidence: !hasPrimarySource || raw.source.reliabilityLevel === "LOW",
      },
    });

    await prisma.rawItem.update({
      where: { id: raw.id },
      data: {
        normalizationState: "normalized",
      },
    });

    processed += 1;
  }

  return processed;
}
