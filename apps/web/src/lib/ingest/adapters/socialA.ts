import type { IngestedItem, SourceRecord } from "@/lib/types";
import { fetchSocialItems } from "@/lib/ingest/adapters/social-common";

export async function fetchSocialProviderAItems(source: SourceRecord): Promise<IngestedItem[]> {
  return fetchSocialItems({
    providerName: "A",
    baseUrl: process.env.SOCIAL_AGG_A_BASE_URL,
    apiKey: process.env.SOCIAL_AGG_A_API_KEY,
    source,
  });
}
