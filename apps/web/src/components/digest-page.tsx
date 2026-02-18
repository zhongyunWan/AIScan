import Link from "next/link";

import type { DailyDigest } from "@/lib/types";

type SourceFilter = "all" | "product" | "tech" | "community" | "x";

function formatTime(value: string | null): string {
  if (!value) {
    return "时间未知";
  }
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nextDate(date: string, offset: number): string {
  const base = new Date(`${date}T00:00:00.000Z`);
  const next = new Date(base.valueOf() + offset * 24 * 60 * 60 * 1000);
  return next.toISOString().slice(0, 10);
}

function formatConfidence(value: string): string {
  if (value === "high") {
    return "高置信";
  }
  if (value === "medium") {
    return "中置信";
  }
  return "低置信";
}

function formatCategory(
  value: DailyDigest["items"][number]["trendCategory"],
): { label: string; filter: Exclude<SourceFilter, "all"> } {
  if (value === "PRODUCT_HUNT_AI") {
    return { label: "新产品爆发", filter: "product" };
  }
  if (value === "HUGGINGFACE_TRENDING") {
    return { label: "技术方向", filter: "tech" };
  }
  if (value === "REDDIT_DEV") {
    return { label: "开发者共识", filter: "community" };
  }
  if (value === "X_TWITTER_AI") {
    return { label: "X/Twitter 趋势", filter: "x" };
  }
  return { label: "补充来源", filter: "tech" };
}

function buildRadarSummary(items: DailyDigest["items"]) {
  const buckets: Array<{
    key: Exclude<SourceFilter, "all">;
    title: string;
    subtitle: string;
    matcher: (item: DailyDigest["items"][number]) => boolean;
  }> = [
    {
      key: "product",
      title: "Product Hunt AI",
      subtitle: "看新产品爆发",
      matcher: (item) => item.trendCategory === "PRODUCT_HUNT_AI",
    },
    {
      key: "tech",
      title: "Hugging Face Trending",
      subtitle: "看技术方向",
      matcher: (item) => item.trendCategory === "HUGGINGFACE_TRENDING",
    },
    {
      key: "community",
      title: "Reddit LocalLLaMA/LocalLLM",
      subtitle: "看开发者共识",
      matcher: (item) => item.trendCategory === "REDDIT_DEV",
    },
    {
      key: "x",
      title: "X / Twitter AI 圈",
      subtitle: "看最快趋势源",
      matcher: (item) => item.trendCategory === "X_TWITTER_AI",
    },
  ];

  return buckets.map((bucket) => {
    const matched = items.filter(bucket.matcher);
    return {
      ...bucket,
      count: matched.length,
      highlight: matched[0]?.title ?? "暂无可用条目",
    };
  });
}

function applyFilter(items: DailyDigest["items"], filter: SourceFilter) {
  if (filter === "all") {
    return items;
  }

  if (filter === "product") {
    return items.filter((item) => item.trendCategory === "PRODUCT_HUNT_AI");
  }

  if (filter === "tech") {
    return items.filter((item) => item.trendCategory === "HUGGINGFACE_TRENDING");
  }

  if (filter === "community") {
    return items.filter((item) => item.trendCategory === "REDDIT_DEV");
  }

  return items.filter((item) => item.trendCategory === "X_TWITTER_AI");
}

export function DigestPage({
  digest,
  filter,
}: {
  digest: DailyDigest;
  filter: SourceFilter;
}) {
  const items = applyFilter(digest.items, filter);
  const highConfidenceCount = digest.items.filter((item) => item.confidenceLabel === "high").length;
  const radarSummary = buildRadarSummary(digest.items);

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">GLOBAL AI DAILY BRIEF</p>
        <h1>AIScan</h1>
        <p className="subtitle">四大方向各 20 条：Product Hunt / Hugging Face / Reddit / X。</p>

        <div className="meta-row">
          <span>日期 {digest.date}</span>
          <span>总条目 {digest.items.length}</span>
          <span>高置信 {highConfidenceCount}</span>
        </div>

        <div className="nav-row">
          <Link href={`/date/${nextDate(digest.date, -1)}?source=${filter}`}>← 前一天</Link>
          <Link href={`/date/${nextDate(digest.date, 1)}?source=${filter}`}>后一天 →</Link>
        </div>

        <div className="filter-row">
          <Link href={`/date/${digest.date}?source=all`} data-active={filter === "all"}>
            全部
          </Link>
          <Link href={`/date/${digest.date}?source=product`} data-active={filter === "product"}>
            产品爆发
          </Link>
          <Link href={`/date/${digest.date}?source=tech`} data-active={filter === "tech"}>
            技术方向
          </Link>
          <Link href={`/date/${digest.date}?source=community`} data-active={filter === "community"}>
            开发者共识
          </Link>
          <Link href={`/date/${digest.date}?source=x`} data-active={filter === "x"}>
            X 趋势
          </Link>
        </div>
      </header>

      <section className="radar-grid">
        {radarSummary.map((bucket) => (
          <Link
            className="radar-card"
            href={`/date/${digest.date}?source=${bucket.key}`}
            key={bucket.key}
            data-filter={bucket.key}
          >
            <p className="radar-title">{bucket.title}</p>
            <p className="radar-subtitle">{bucket.subtitle}</p>
            <p className="radar-count">{bucket.count} 条</p>
            <p className="radar-highlight">{bucket.highlight}</p>
          </Link>
        ))}
      </section>

      {items.length === 0 ? (
        <section className="empty">
          <h2>暂无可展示内容</h2>
          <p>今日数据还在生成中，稍后刷新或切换到其他日期查看。</p>
        </section>
      ) : (
        <section className="cards">
          {items.map((item) => (
            <article className="card" key={`${item.rank}-${item.url}`}>
              <div className="card-top">
                <span className="rank">#{item.rank}</span>
                <span className={`confidence ${item.confidenceLabel}`}>{formatConfidence(item.confidenceLabel)}</span>
                <span className="score">热度 {item.score.toFixed(3)}</span>
                {item.isRecurringHot ? <span className="score">持续热点 {item.streakDays} 天</span> : null}
              </div>
              <h2>{item.title}</h2>
              <p className="summary">{item.summary}</p>
              <div className="tag-row">
                {item.insightTags.map((tag) => (
                  <span key={`${item.rank}-${tag}`} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="meta">
                <span className="meta-category">{formatCategory(item.trendCategory).label}</span>
                {item.sourceName} · {formatTime(item.publishedAt)} · {item.bucket === "MEDIA" ? "研究者分享" : "实用一手"}
              </p>
              <a href={item.url} target="_blank" rel="noreferrer">
                查看原文
              </a>
            </article>
          ))}
        </section>
      )}

      <footer className="footer">
        <p>来源覆盖：Product Hunt AI、新模型趋势、Reddit 开发者讨论、研究者 X 分享。</p>
      </footer>
    </main>
  );
}
