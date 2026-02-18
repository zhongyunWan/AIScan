import type { IngestedItem, SourceRecord } from "@/lib/types";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export async function fetchOpenRouterItems(source: SourceRecord): Promise<IngestedItem[]> {
  const limit = source.config?.limit ?? 40;
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      "user-agent": "AIScanBot/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: Array<{
      id?: string;
      name?: string;
      description?: string;
      created?: number;
      context_length?: number;
      architecture?: { modality?: string };
    }>;
  };

  return (payload.data ?? []).slice(0, limit).map((model, index) => {
    const modelId = model.id || `openrouter-${index}`;
    const recencyBoost = clamp01(1 - index / 50);

    return {
      externalId: modelId,
      title: `[OpenRouter] ${model.name || modelId}`,
      url: `https://openrouter.ai/models/${modelId}`,
      publishedAt: model.created ? new Date(model.created * 1000) : undefined,
      content: `${model.description || ""} context=${model.context_length || "n/a"}`,
      author: "OpenRouter",
      language: "en",
      engagementProxy: recencyBoost,
      originLinkCount: 1,
      practicalScore: 0.88,
      rawPayload: {
        provider: "OPENROUTER",
        modelId,
        modality: model.architecture?.modality,
      },
    } satisfies IngestedItem;
  });
}
