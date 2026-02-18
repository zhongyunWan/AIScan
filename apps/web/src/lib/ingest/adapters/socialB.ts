import type { IngestedItem, SourceRecord } from "@/lib/types";
import { fetchSocialItems } from "@/lib/ingest/adapters/social-common";

export async function fetchSocialProviderBItems(source: SourceRecord): Promise<IngestedItem[]> {
  return fetchSocialItems({
    providerName: "B",
    baseUrl: process.env.SOCIAL_AGG_B_BASE_URL,
    apiKey: process.env.SOCIAL_AGG_B_API_KEY,
    source,
  });
}
