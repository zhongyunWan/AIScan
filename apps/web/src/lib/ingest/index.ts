import type { Prisma, Source, SourceBucket } from "@prisma/client";

import { syncDefaultSources } from "@/lib/bootstrap";
import { prisma } from "@/lib/db";
import { fetchArxivItems } from "@/lib/ingest/adapters/arxiv";
import { fetchGitHubReleaseItems } from "@/lib/ingest/adapters/github";
import { fetchGitHubRepoItems } from "@/lib/ingest/adapters/github-repos";
import { fetchHuggingFaceItems } from "@/lib/ingest/adapters/huggingface";
import { fetchOpenReviewItems } from "@/lib/ingest/adapters/openreview";
import { fetchOpenRouterItems } from "@/lib/ingest/adapters/openrouter";
import { fetchPapersWithCodeItems } from "@/lib/ingest/adapters/papers-with-code";
import { fetchRedditItems } from "@/lib/ingest/adapters/reddit";
import { fetchRssItems } from "@/lib/ingest/adapters/rss";
import { fetchSocialProviderAItems } from "@/lib/ingest/adapters/socialA";
import { fetchSocialProviderBItems } from "@/lib/ingest/adapters/socialB";
import { fetchWebSnapshotItems } from "@/lib/ingest/adapters/web";
import type { IngestedItem, IngestionOptions, SourceRecord } from "@/lib/types";
import { stableHash } from "@/lib/utils/text";

interface SourceRunResult {
  sourceSlug: string;
  fetched: number;
  saved: number;
  error?: string;
  fallbackProvider?: string;
}

function mapSource(source: Source): SourceRecord {
  return {
    ...source,
    config: (source.config ?? null) as SourceRecord["config"],
  };
}

async function fetchByProvider(source: SourceRecord): Promise<{ items: IngestedItem[]; fallbackProvider?: string }> {
  switch (source.provider) {
    case "RSS":
      return { items: await fetchRssItems(source) };
    case "REDDIT_JSON":
      return { items: await fetchRedditItems(source) };
    case "ARXIV":
      return { items: await fetchArxivItems(source) };
    case "GITHUB_RELEASES":
      return { items: await fetchGitHubReleaseItems(source) };
    case "GITHUB_REPOS":
      return { items: await fetchGitHubRepoItems(source) };
    case "OPENREVIEW":
      return { items: await fetchOpenReviewItems(source) };
    case "HUGGINGFACE":
      return { items: await fetchHuggingFaceItems(source) };
    case "OPENROUTER":
      return { items: await fetchOpenRouterItems(source) };
    case "PAPERS_WITH_CODE":
      return { items: await fetchPapersWithCodeItems(source) };
    case "WEB":
      return { items: await fetchWebSnapshotItems(source) };
    case "SOCIAL_AGG_A": {
      try {
        return { items: await fetchSocialProviderAItems(source) };
      } catch (error) {
        const fallbackItems = await fetchSocialProviderBItems(source);
        return {
          items: fallbackItems,
          fallbackProvider: `SOCIAL_AGG_B (${error instanceof Error ? error.message : "unknown"})`,
        };
      }
    }
    case "SOCIAL_AGG_B":
      return { items: await fetchSocialProviderBItems(source) };
    default:
      return { items: [] };
  }
}

async function markSourceSuccess(sourceId: string, count: number): Promise<void> {
  await prisma.source.update({
    where: { id: sourceId },
    data: {
      lastSuccessAt: count > 0 ? new Date() : undefined,
      failureStreak: 0,
      healthStatus: "healthy",
    },
  });
}

async function markSourceFailure(sourceId: string): Promise<void> {
  const current = await prisma.source.findUnique({ where: { id: sourceId }, select: { failureStreak: true } });
  const nextStreak = (current?.failureStreak ?? 0) + 1;
  await prisma.source.update({
    where: { id: sourceId },
    data: {
      failureStreak: nextStreak,
      healthStatus: nextStreak >= 3 ? "degraded" : "warning",
    },
  });
}

export async function runIngestion(options?: IngestionOptions): Promise<{
  runId: string;
  processedCount: number;
  failedCount: number;
  results: SourceRunResult[];
}> {
  await syncDefaultSources();

  const run = await prisma.jobRun.create({
    data: {
      jobType: "INGEST",
      status: "running",
      details: {
        sourceBuckets: options?.sourceBuckets,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  const whereClause: { enabled: true; bucket?: { in: SourceBucket[] } } = {
    enabled: true,
  };

  if (options?.sourceBuckets && options.sourceBuckets.length > 0) {
    whereClause.bucket = {
      in: options.sourceBuckets,
    };
  }

  const sources = await prisma.source.findMany({ where: whereClause, orderBy: [{ bucket: "asc" }, { sourceWeight: "desc" }] });

  const results: SourceRunResult[] = [];
  let processedCount = 0;
  let failedCount = 0;

  for (const sourceEntity of sources) {
    const source = mapSource(sourceEntity);

    try {
      const { items, fallbackProvider } = await fetchByProvider(source);
      let saved = 0;

      for (const item of items) {
        const externalId = item.externalId || stableHash(`${item.title}|${item.url}`);
        const itemHash = stableHash(
          `${source.slug}|${externalId}|${item.url}|${item.publishedAt?.toISOString() || ""}`,
        );

        await prisma.rawItem.upsert({
          where: {
            sourceId_externalId: {
              sourceId: source.id,
              externalId,
            },
          },
          create: {
            sourceId: source.id,
            externalId,
            title: item.title,
            url: item.url,
            publishedAt: item.publishedAt,
            content: item.content,
            author: item.author,
            language: item.language,
            engagementProxy: item.engagementProxy ?? 0,
            rawPayload: {
              ...item.rawPayload,
              provider: source.provider,
              authorHandle: item.authorHandle,
              quotedLinks: item.quotedLinks,
              originLinkCount: item.originLinkCount,
              authorReputation: item.authorReputation,
            },
            hash: itemHash,
          },
          update: {
            title: item.title,
            url: item.url,
            publishedAt: item.publishedAt,
            content: item.content,
            author: item.author,
            language: item.language,
            engagementProxy: item.engagementProxy ?? 0,
            rawPayload: {
              ...item.rawPayload,
              provider: source.provider,
              authorHandle: item.authorHandle,
              quotedLinks: item.quotedLinks,
              originLinkCount: item.originLinkCount,
              authorReputation: item.authorReputation,
            },
            hash: itemHash,
            normalizationState: "pending",
          },
        });

        saved += 1;
      }

      processedCount += saved;
      await markSourceSuccess(source.id, saved);
      results.push({ sourceSlug: source.slug, fetched: items.length, saved, fallbackProvider });
    } catch (error) {
      failedCount += 1;
      await markSourceFailure(source.id);
      results.push({
        sourceSlug: source.slug,
        fetched: 0,
        saved: 0,
        error: error instanceof Error ? error.message : "unknown error",
      });
    }
  }

  await prisma.jobRun.update({
    where: { id: run.id },
    data: {
      status: failedCount === 0 ? "success" : "partial_success",
      endedAt: new Date(),
      processedCount,
      failedCount,
      details: {
        sourceBuckets: options?.sourceBuckets,
        results,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    runId: run.id,
    processedCount,
    failedCount,
    results,
  };
}
