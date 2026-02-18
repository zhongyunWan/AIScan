import { describe, expect, it } from "vitest";
import type { NormalizedItem, Source } from "@prisma/client";

import { rankCandidates } from "@/lib/pipeline/rank";
import { stableHash, summarizeToChinese } from "@/lib/utils/text";

function makeItem(overrides: Record<string, unknown> = {}) {
  const now = new Date("2026-02-18T00:00:00.000Z");
  return {
    id: String(overrides.id ?? crypto.randomUUID()),
    rawItemId: String(overrides.rawItemId ?? crypto.randomUUID()),
    sourceId: String(overrides.sourceId ?? "source-a"),
    title: String(overrides.title ?? "Model update released"),
    summary: String(overrides.summary ?? "summary"),
    canonicalUrl: String(overrides.canonicalUrl ?? `https://example.com/${crypto.randomUUID()}`),
    titleHash: String(overrides.titleHash ?? crypto.randomUUID()),
    contentHash: String(overrides.contentHash ?? crypto.randomUUID()),
    contentSnippet: String(overrides.contentSnippet ?? "A model update was released for developers."),
    publishedAt: (overrides.publishedAt as Date | null | undefined) ?? now,
    sourceWeight: Number(overrides.sourceWeight ?? 0.8),
    reliabilityLevel: String(overrides.reliabilityLevel ?? "HIGH"),
    engagementProxy: Number(overrides.engagementProxy ?? 0.3),
    practicalScore: Number(overrides.practicalScore ?? 0.8),
    originLinkCount: Number(overrides.originLinkCount ?? 1),
    authorReputation: Number(overrides.authorReputation ?? 0.9),
    authorHandle: (overrides.authorHandle as string | null | undefined) ?? null,
    isSocialInsight: Boolean(overrides.isSocialInsight ?? false),
    hasPrimarySource: Boolean(overrides.hasPrimarySource ?? true),
    isLowConfidence: Boolean(overrides.isLowConfidence ?? false),
    createdAt: now,
    updatedAt: now,
    source: {
      id: String(overrides.sourceId ?? "source-a"),
      name: "src",
      slug: "src",
      url: "https://example.com",
      feedUrl: null,
      provider: "RSS",
      type: String(overrides.sourceType ?? "OFFICIAL"),
      bucket: String(overrides.bucket ?? "PRACTICAL"),
      enabled: true,
      sourceWeight: Number(overrides.sourceWeight ?? 0.8),
      reliabilityLevel: String(overrides.reliabilityLevel ?? "HIGH"),
      healthStatus: "healthy",
      failureStreak: 0,
      lastSuccessAt: null,
      config: null,
      createdAt: now,
      updatedAt: now,
    },
  } as unknown as NormalizedItem & { source: Source };
}

describe("rankCandidates", () => {
  it("deduplicates same event from multiple sources", () => {
    const items = [
      makeItem({ id: "a", sourceId: "s1", canonicalUrl: "https://x.com/e1", titleHash: "same" }),
      makeItem({ id: "b", sourceId: "s2", canonicalUrl: "https://x.com/e1", titleHash: "same" }),
      makeItem({ id: "c", sourceId: "s3", canonicalUrl: "https://x.com/e1", titleHash: "same" }),
    ];

    const ranked = rankCandidates(items, new Map());
    expect(ranked).toHaveLength(1);
    expect(ranked[0].sourceCount).toBe(3);
  });

  it("enforces media cap and author cap", () => {
    const practical = Array.from({ length: 30 }).map((_, index) =>
      makeItem({
        id: `p-${index}`,
        bucket: "PRACTICAL",
        sourceType: "OFFICIAL",
        practicalScore: 0.9,
      }),
    );

    const media = Array.from({ length: 10 }).map((_, index) =>
      makeItem({
        id: `m-${index}`,
        bucket: "MEDIA",
        sourceType: "MEDIA",
        hasPrimarySource: false,
        isSocialInsight: true,
        practicalScore: 0.6,
        authorHandle: index < 6 ? "same_author" : `author_${index}`,
        originLinkCount: 0,
        sourceWeight: 0.45,
      }),
    );

    const ranked = rankCandidates([...practical, ...media], new Map(), {
      mediaMax: 5,
      practicalTargetRatio: 0.85,
      repeatWindowDays: 7,
    });

    const mediaCount = ranked.filter((item) => item.bucket === "MEDIA").length;
    expect(mediaCount).toBeLessThanOrEqual(5);

    const sameAuthorCount = ranked.filter((item) => item.authorHandle === "same_author").length;
    expect(sameAuthorCount).toBeLessThanOrEqual(2);
  });

  it("applies recurring decay by previous streak", () => {
    const canonicalUrl = "https://x.com/r1";
    const titleHash = "r1";
    const item = makeItem({ id: "r1", canonicalUrl, titleHash });
    const clusterKey = stableHash(`${canonicalUrl}|${titleHash}`).slice(0, 24);

    const ranked = rankCandidates([item], new Map(), {
      mediaMax: 5,
      practicalTargetRatio: 0.85,
      repeatWindowDays: 7,
    });

    expect(ranked[0].repeatDecay).toBe(1);

    const rankedWithStreak = rankCandidates(
      [item],
      new Map([[clusterKey, 3]]),
      {
        mediaMax: 5,
        practicalTargetRatio: 0.85,
        repeatWindowDays: 7,
      },
    );

    expect(rankedWithStreak[0].streakDays).toBe(4);
    expect(rankedWithStreak[0].repeatDecay).toBeLessThan(1);
  });
});

describe("summarizeToChinese", () => {
  it("returns bounded summary text", () => {
    const summary = summarizeToChinese(
      "OpenAI announced a new model for coding workflows. The update also includes lower latency.",
    );

    expect(summary.length).toBeGreaterThanOrEqual(34);
    expect(summary.length).toBeLessThanOrEqual(90);
    expect(summary.includes("原文提到")).toBe(false);
  });
});
