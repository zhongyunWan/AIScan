import { NextResponse } from "next/server";

import { runPublish } from "@/lib/pipeline/publish";
import { hasInternalAccess } from "@/lib/security";
import { parseDateInput } from "@/lib/utils/date";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasInternalAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let date = new Date();

  const body = (await request.json().catch(() => ({}))) as {
    date?: string;
    mediaMax?: number;
    practicalTargetRatio?: number;
    repeatWindowDays?: number;
  };
  if (body.date) {
    const parsedDate = parseDateInput(body.date);
    if (!parsedDate) {
      return NextResponse.json({ error: "Invalid date. Use YYYY-MM-DD." }, { status: 400 });
    }
    date = parsedDate;
  }

  try {
    const result = await runPublish(date, {
      mediaMax: body.mediaMax,
      practicalTargetRatio: body.practicalTargetRatio,
      repeatWindowDays: body.repeatWindowDays,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "publish failed",
      },
      { status: 500 },
    );
  }
}
