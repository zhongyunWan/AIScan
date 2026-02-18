import type { IngestedItem, SourceRecord } from "@/lib/types";

interface OpenReviewNote {
  id: string;
  cdate?: number;
  pdate?: number;
  content?: {
    title?: { value?: string } | string;
    abstract?: { value?: string } | string;
    authors?: { value?: string[] } | string[];
    pdf?: { value?: string } | string;
  };
}

function unwrapValue<T>(value: T | { value?: T } | undefined): T | undefined {
  if (typeof value === "object" && value && "value" in value) {
    return value.value;
  }
  return value as T | undefined;
}

export async function fetchOpenReviewItems(source: SourceRecord): Promise<IngestedItem[]> {
  const venue = source.config?.venue || "ICLR.cc/2026/Conference";
  const limit = source.config?.limit ?? 30;
  const url = `https://api2.openreview.net/notes?content.venueid=${encodeURIComponent(venue)}&limit=${limit}&offset=0`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "AIScanBot/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenReview API failed: ${response.status}`);
  }

  const data = (await response.json()) as { notes?: OpenReviewNote[] };
  const notes = data.notes ?? [];

  return notes.map((note, index) => {
    const title = unwrapValue(note.content?.title) || "Untitled";
    const abstract = unwrapValue(note.content?.abstract) || "";
    const authors = unwrapValue(note.content?.authors);
    const pdf = unwrapValue(note.content?.pdf);
    const publishedAtMs = note.pdate ?? note.cdate;

    return {
      externalId: note.id || `${source.slug}-${index}`,
      title,
      url: pdf ? `https://openreview.net${pdf}` : `https://openreview.net/forum?id=${note.id}`,
      publishedAt: publishedAtMs ? new Date(publishedAtMs) : undefined,
      content: abstract,
      author: Array.isArray(authors) ? authors.join(", ") : undefined,
      language: "en",
      rawPayload: {
        venue,
      },
    };
  });
}
