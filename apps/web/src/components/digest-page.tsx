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
      {/* Hero Section */}
      <header className="hero">
        <p className="eyebrow">GLOBAL AI DAILY BRIEF</p>
        <h1>AIScan</h1>
        <p className="subtitle">
          每日精选 AI 领域最新动态 · 四大方向各 20 条：Product Hunt / Hugging Face / Reddit / X
        </p>

        {/* 统计信息 */}
        <div className="meta-row">
          <span>📅 {digest.date}</span>
          <span>📊 总条目 {digest.items.length}</span>
          <span>⭐ 高置信 {highConfidenceCount}</span>
        </div>

        {/* 日期导航 */}
        <nav className="nav-row" aria-label="日期导航">
          <Link href={`/date/${nextDate(digest.date, -1)}?source=${filter}`} className="nav-link">
            ← 前一天
          </Link>
          <Link href={`/date/${nextDate(digest.date, 1)}?source=${filter}`} className="nav-link">
            后一天 →
          </Link>
        </nav>

        {/* 筛选器 */}
        <nav className="filter-row" aria-label="内容筛选">
          <Link href={`/date/${digest.date}?source=all`} data-active={filter === "all"}>
            全部
          </Link>
          <Link href={`/date/${digest.date}?source=product`} data-active={filter === "product"}>
            🚀 产品爆发
          </Link>
          <Link href={`/date/${digest.date}?source=tech`} data-active={filter === "tech"}>
            🔬 技术方向
          </Link>
          <Link href={`/date/${digest.date}?source=community`} data-active={filter === "community"}>
            💬 开发者共识
          </Link>
          <Link href={`/date/${digest.date}?source=x`} data-active={filter === "x"}>
            🐦 X 趋势
          </Link>
        </nav>
      </header>

      {/* Radar 概览 */}
      <section className="radar-grid" aria-label="数据源概览">
        {radarSummary.map((bucket) => (
          <Link
            className="radar-card"
            href={`/date/${digest.date}?source=${bucket.key}`}
            key={bucket.key}
            data-filter={bucket.key}
            aria-label={`查看 ${bucket.title}`}
          >
            <p className="radar-title">{bucket.title}</p>
            <p className="radar-subtitle">{bucket.subtitle}</p>
            <p className="radar-count">{bucket.count} 条</p>
            <p className="radar-highlight" title={bucket.highlight}>
              {bucket.highlight}
            </p>
          </Link>
        ))}
      </section>

      {/* 内容列表 */}
      {items.length === 0 ? (
        <section className="empty" role="status">
          <h2>暂无可展示内容</h2>
          <p>今日数据还在生成中，稍后刷新或切换到其他日期查看。</p>
        </section>
      ) : (
        <section className="cards" aria-label="趋势列表">
          {items.map((item) => {
            const category = formatCategory(item.trendCategory);
            return (
              <article className="card" key={`${item.rank}-${item.url}`}>
                {/* 卡片头部 */}
                <div className="card-top">
                  <span className="rank" aria-label={`排名第 ${item.rank}`}>
                    #{item.rank}
                  </span>
                  <span className={`confidence ${item.confidenceLabel}`} aria-label="置信度">
                    {formatConfidence(item.confidenceLabel)}
                  </span>
                  <span className="score" aria-label="热度分数">
                    🔥 {item.score.toFixed(3)}
                  </span>
                  {item.isRecurringHot && (
                    <span className="score" aria-label="持续热点">
                      🔁 持续 {item.streakDays} 天
                    </span>
                  )}
                </div>

                {/* 标题 */}
                <h2>{item.title}</h2>

                {/* 摘要 */}
                <p className="summary">{item.summary}</p>

                {/* 标签 */}
                {item.insightTags.length > 0 && (
                  <div className="tag-row" aria-label="相关标签">
                    {item.insightTags.map((tag) => (
                      <span key={`${item.rank}-${tag}`} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 元信息 */}
                <div className="meta">
                  <span className="meta-category" data-filter={category.filter}>
                    {category.label}
                  </span>
                  <span>{item.sourceName}</span>
                  <span>·</span>
                  <time dateTime={item.publishedAt ?? undefined}>{formatTime(item.publishedAt)}</time>
                  <span>·</span>
                  <span>{item.bucket === "MEDIA" ? "📚 研究者分享" : "⚡ 实用一手"}</span>
                </div>

                {/* 查看原文链接 */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`查看 ${item.title} 的原文`}
                >
                  查看原文
                </a>
              </article>
            );
          })}
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>
          数据来源：Product Hunt AI · Hugging Face Trending · Reddit LocalLLaMA/LocalLLM · X/Twitter AI 圈
        </p>
        <p style={{ marginTop: "8px", fontSize: "12px", opacity: 0.7 }}>
          每日自动更新 · 智能筛选 · 多维度分析
        </p>
      </footer>
    </main>
  );
}
