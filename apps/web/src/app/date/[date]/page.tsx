import { notFound } from "next/navigation";

import { DigestPage } from "@/components/digest-page";
import { getDigestByDate } from "@/lib/digest";
import { parseDateInput } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

function normalizeFilter(input?: string): "all" | "product" | "tech" | "community" | "x" {
  if (input === "product" || input === "tech" || input === "community" || input === "x") {
    return input;
  }
  return "all";
}

export default async function DailyDigestPage({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { date } = await params;
  const { source } = await searchParams;

  if (!parseDateInput(date)) {
    notFound();
  }

  const digest = await getDigestByDate(date);
  if (!digest) {
    notFound();
  }

  return <DigestPage digest={digest} filter={normalizeFilter(source)} />;
}
