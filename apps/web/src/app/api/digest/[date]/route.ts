import { NextResponse } from "next/server";

import { getDigestByDate } from "@/lib/digest";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ date: string }> },
) {
  const { date } = await context.params;
  const digest = await getDigestByDate(date);

  if (!digest) {
    return NextResponse.json(
      {
        error: "Invalid date format. Use YYYY-MM-DD.",
        items: [],
      },
      { status: 400 },
    );
  }

  return NextResponse.json(digest, { status: 200 });
}
