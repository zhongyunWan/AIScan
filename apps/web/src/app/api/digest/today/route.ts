import { NextResponse } from "next/server";

import { getTodayDigest } from "@/lib/digest";

export const dynamic = "force-dynamic";

export async function GET() {
  const digest = await getTodayDigest();
  return NextResponse.json(digest, { status: 200 });
}
