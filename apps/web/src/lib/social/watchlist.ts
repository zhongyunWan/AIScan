export interface WatchlistAuthor {
  handle: string;
  displayName: string;
  reputationScore: number;
  domainTags: string[];
  active: boolean;
}

export interface WatchlistDefinition {
  id: string;
  name: string;
  authors: WatchlistAuthor[];
}

export const AI_TOPIC_KEYWORDS = [
  "llm",
  "language model",
  "agent",
  "inference",
  "training",
  "evaluation",
  "rag",
  "fine-tuning",
  "multimodal",
  "alignment",
  "safety",
  "benchmark",
  "transformer",
  "gpu",
  "reasoning",
  "diffusion",
  "token",
  "model release",
  "open weights",
  "开源模型",
  "推理",
  "训练",
  "多模态",
  "评测",
  "对齐",
  "智能体",
];

export const WATCHLISTS: Record<string, WatchlistDefinition> = {
  "ai-researchers-global": {
    id: "ai-researchers-global",
    name: "AI Researchers Global",
    authors: [
      {
        handle: "karpathy",
        displayName: "Andrej Karpathy",
        reputationScore: 0.97,
        domainTags: ["llm", "infra"],
        active: true,
      },
      {
        handle: "lilianweng",
        displayName: "Lilian Weng",
        reputationScore: 0.95,
        domainTags: ["agent", "safety"],
        active: true,
      },
      {
        handle: "ylecun",
        displayName: "Yann LeCun",
        reputationScore: 0.93,
        domainTags: ["research", "vision"],
        active: true,
      },
      {
        handle: "simonw",
        displayName: "Simon Willison",
        reputationScore: 0.91,
        domainTags: ["agent", "tools"],
        active: true,
      },
      {
        handle: "chipro",
        displayName: "Chip Huyen",
        reputationScore: 0.9,
        domainTags: ["infra", "evaluation"],
        active: true,
      },
      {
        handle: "jerryjliu0",
        displayName: "Jerry Liu",
        reputationScore: 0.88,
        domainTags: ["rag", "agent"],
        active: true,
      },
      {
        handle: "perplexity_ai",
        displayName: "Perplexity Team",
        reputationScore: 0.84,
        domainTags: ["product", "search"],
        active: true,
      },
      {
        handle: "huggingface",
        displayName: "Hugging Face",
        reputationScore: 0.87,
        domainTags: ["open-source", "models"],
        active: true,
      },
      {
        handle: "OpenAIDevs",
        displayName: "OpenAI Developers",
        reputationScore: 0.9,
        domainTags: ["api", "sdk"],
        active: true,
      },
      {
        handle: "aisafetymemes",
        displayName: "AI Safety Updates",
        reputationScore: 0.75,
        domainTags: ["safety", "governance"],
        active: true,
      },
    ],
  },
};

export function getWatchlist(id?: string): WatchlistDefinition {
  if (id && WATCHLISTS[id]) {
    return WATCHLISTS[id];
  }
  return WATCHLISTS["ai-researchers-global"];
}
