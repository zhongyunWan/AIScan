import { NextResponse } from "next/server";

import { getSourcesPublic } from "@/lib/digest";

export const dynamic = "force-dynamic";

export async function GET() {
  const sources = await getSourcesPublic();
  return NextResponse.json({ items: sources }, { status: 200 });
}
