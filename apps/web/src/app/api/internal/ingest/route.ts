import { NextResponse } from "next/server";
import type { SourceBucket } from "@prisma/client";

import { runIngestion } from "@/lib/ingest";
import { hasInternalAccess } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasInternalAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { sourceBuckets?: SourceBucket[] };
    const sourceBuckets =
      Array.isArray(body.sourceBuckets) && body.sourceBuckets.length > 0
        ? body.sourceBuckets.filter((bucket): bucket is SourceBucket =>
            bucket === "MEDIA" || bucket === "PRACTICAL",
          )
        : undefined;

    const result = await runIngestion({
      sourceBuckets,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "ingestion failed",
      },
      { status: 500 },
    );
  }
}
