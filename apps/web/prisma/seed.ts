import { PrismaClient } from "@prisma/client";

import { DEFAULT_SOURCES } from "../src/lib/sources/default-sources";

const prisma = new PrismaClient();

async function main() {
  const activeSlugs = DEFAULT_SOURCES.map((source) => source.slug);

  for (const source of DEFAULT_SOURCES) {
    await prisma.source.upsert({
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
    });
  }

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

  console.log(`Seeded ${DEFAULT_SOURCES.length} sources.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
