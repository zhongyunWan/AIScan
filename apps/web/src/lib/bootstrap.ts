import { prisma } from "@/lib/db";
import { DEFAULT_SOURCES } from "@/lib/sources/default-sources";

export async function syncDefaultSources(): Promise<void> {
  const activeSlugs = DEFAULT_SOURCES.map((source) => source.slug);

  await Promise.all(
    DEFAULT_SOURCES.map((source) =>
      prisma.source.upsert({
        where: { slug: source.slug },
        create: source,
        update: {
          name: source.name,
          url: source.url,
          feedUrl: source.feedUrl,
          provider: source.provider,
          type: source.type,
          bucket: source.bucket,
          sourceWeight: source.sourceWeight,
          reliabilityLevel: source.reliabilityLevel,
          enabled: source.enabled,
          config: source.config,
        },
      }),
    ),
  );

  await prisma.source.updateMany({
    where: {
      slug: {
        notIn: activeSlugs,
      },
    },
    data: {
      enabled: false,
      healthStatus: "deprecated",
    },
  });
}
