---
name: news-ingestion
description: Use this skill when implementing or updating AIScan source ingestion, normalization, source reliability weighting, social watchlists, and ingestion job observability.
---

# News Ingestion Skill

## Use This Skill When
- Adding or modifying source connectors (`RSS`, `ARXIV`, `GITHUB_REPOS`, `HUGGINGFACE`, `OPENROUTER`, `PAPERS_WITH_CODE`, `WEB`, `SOCIAL_AGG_A`, `SOCIAL_AGG_B`)
- Updating source metadata (`sourceWeight`, `reliabilityLevel`, `bucket`, health fields)
- Editing social watchlists and social provider fallback behavior
- Changing ingestion job execution and error isolation

## Workflow
1. Update `sources` defaults and source buckets.
2. Keep source fetch logic idempotent and failure-isolated.
3. For social sources, enforce watchlist author filter + AI topic filter.
4. Persist only required content snippets and links (no full long-form storage).
5. Record run metrics and per-source errors in `job_runs`.
6. Update source health state (`healthStatus`, `failureStreak`, `lastSuccessAt`).
7. Validate internal endpoint authentication and optional bucket filtering.

## Output Contract
Each normalized candidate must include:
- `title`
- `canonicalUrl`
- `publishedAt`
- `sourceType`
- `sourceWeight`
- `reliabilityLevel`
- `contentSnippet`
- `bucket`
- `practicalScore`
- `originLinkCount`

## Guardrails
- Never fail full ingestion because one source fails.
- Do not ingest full paid content bodies.
- For social posts, keep origin links and author handle metadata.
- Keep provider A/B failover behavior deterministic.
