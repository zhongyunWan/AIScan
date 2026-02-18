import { createHash } from "node:crypto";

export function stableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function canonicalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ref",
      "source",
    ].forEach((key) => parsed.searchParams.delete(key));
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

export function stripHtml(input?: string | null): string {
  if (!input) {
    return "";
  }
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function firstSentences(text: string, count = 2): string {
  const clean = stripHtml(text);
  if (!clean) {
    return "";
  }
  const sentences = clean
    .split(/(?<=[。！？.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return sentences.slice(0, count).join(" ");
}

function compactFactText(text: string): string {
  return stripHtml(text)
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\btopics?=[^\s]+/gi, " ")
    .replace(/\bcontext=[^\s]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function clampSummary(summary: string): string {
  const compact = summary.replace(/\s+/g, " ").trim();
  if (!compact) {
    return "该条目信息有限，建议直接查看原文获取关键细节。";
  }
  if (compact.length < 34) {
    return `${compact} 建议查看原文了解完整上下文。`;
  }
  if (compact.length > 88) {
    return `${compact.slice(0, 86)}…`;
  }
  return compact;
}

export function cleanDisplayTitle(title: string): string {
  const cleaned = stripHtml(title)
    .replace(/^\[[^\]]+\]\s*/g, "")
    .replace(/^snapshot[:\s-]*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "未命名条目";
  }

  if (/^v?\d+\.\d+(?:\.\d+){0,2}$/i.test(cleaned)) {
    return `版本更新 ${cleaned}`;
  }

  return cleaned;
}

export function tokenize(text: string): string[] {
  return stripHtml(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1)
    .slice(0, 200);
}

export function similarity(left: string, right: string): number {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union === 0 ? 0 : intersection / union;
}

export function summarizeToChinese(text: string, title = ""): string {
  const displayTitle = cleanDisplayTitle(title);
  const extracted = compactFactText(firstSentences(text, 2) || text);

  const haystack = `${displayTitle} ${extracted}`.toLowerCase();

  const subject = containsAny(haystack, ["model", "llm", "gpt", "claude", "gemini", "qwen"])
    ? "模型"
    : containsAny(haystack, ["github", "repo", "framework", "sdk", "library", "open source", "开源"])
      ? "开源项目"
      : containsAny(haystack, ["paper", "arxiv", "论文"])
        ? "研究成果"
        : containsAny(haystack, ["arena", "leaderboard", "benchmark", "eval"])
          ? "评测动态"
          : "AI 产品";

  const action = containsAny(haystack, ["release", "launched", "announce", "new", "上线", "发布"])
    ? "发布"
    : containsAny(haystack, ["update", "improve", "upgrade", "优化", "更新"])
      ? "更新"
      : "进展";

  const values: string[] = [];
  if (containsAny(haystack, ["agent", "workflow", "automation", "mcp", "tool"])) {
    values.push("面向 Agent/工作流");
  }
  if (containsAny(haystack, ["code", "coding", "developer", "dev"])) {
    values.push("偏开发者场景");
  }
  if (containsAny(haystack, ["latency", "cost", "token", "context", "throughput"])) {
    values.push("强调成本与性能");
  }
  if (containsAny(haystack, ["multimodal", "image", "vision", "video", "audio"])) {
    values.push("支持多模态能力");
  }
  if (containsAny(haystack, ["reasoning", "safety", "evaluation", "benchmark"])) {
    values.push("关注推理与评测");
  }

  const detail = extracted ? `关键信息：${extracted.slice(0, 34)}${extracted.length > 34 ? "…" : ""}` : "";
  const valueText = values.length > 0 ? `重点是${values.slice(0, 2).join("、")}。` : "";
  const summary = `${displayTitle}：属于${subject}${action}信息。${valueText}${detail}`;
  return clampSummary(summary);
}

export function extractInsightTags(input: {
  title: string;
  summary?: string;
  sourceName?: string;
  bucket?: "PRACTICAL" | "MEDIA";
}): string[] {
  const haystack = compactFactText(
    `${input.title} ${input.summary ?? ""} ${input.sourceName ?? ""}`,
  ).toLowerCase();

  const tags: string[] = [];
  const add = (tag: string, when: boolean) => {
    if (when && !tags.includes(tag)) {
      tags.push(tag);
    }
  };

  add("模型", containsAny(haystack, ["model", "llm", "gpt", "claude", "gemini", "qwen"]));
  add("开源", containsAny(haystack, ["github", "repo", "framework", "sdk", "library", "open source"]));
  add("Agent", containsAny(haystack, ["agent", "ai agent"]));
  add("工作流", containsAny(haystack, ["workflow", "automation", "mcp", "tool"]));
  add("编程", containsAny(haystack, ["code", "coding", "developer", "dev"]));
  add("评测", containsAny(haystack, ["arena", "leaderboard", "benchmark", "eval", "evaluation"]));
  add("成本/性能", containsAny(haystack, ["latency", "cost", "token", "throughput", "context"]));
  add("多模态", containsAny(haystack, ["multimodal", "image", "vision", "video", "audio"]));
  add("论文", containsAny(haystack, ["paper", "arxiv", "openreview"]));
  add("产品", containsAny(haystack, ["product", "launch", "release", "demo", "space"]));

  if (input.bucket === "MEDIA") {
    add("研究者分享", true);
  }

  if (tags.length === 0) {
    tags.push("AI 热点");
  }

  return tags.slice(0, 3);
}
