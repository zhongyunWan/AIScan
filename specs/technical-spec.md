# AIScan Technical Spec

## Stack
- Next.js 15 (App Router + Route Handlers)
- TypeScript
- PostgreSQL
- Prisma ORM
- Node Cron scheduler in web process
- Docker Compose deployment (`web`, `postgres`, `nginx`)

## Required APIs
- `GET /api/digest/today`
- `GET /api/digest/[date]`
- `GET /api/sources`
- `POST /api/internal/ingest` (requires `x-internal-api-key`, supports optional `sourceBuckets`)
- `POST /api/internal/publish` (requires `x-internal-api-key`, supports `mediaMax/practicalTargetRatio/repeatWindowDays`)

## Data Sources
- Practical sources (AI radar): Hugging Face Trending (models/spaces), LMSYS Arena snapshot, Artificial Analysis snapshot, OpenRouter models, GitHub AI trending repos, Papers with Code latest, Product Hunt AI snapshot, arXiv
- Community insight sources: Reddit AI communities + AI researcher/engineer social streams (aggregator providers)
- Source metadata includes:
  - `sourceWeight`
  - `reliabilityLevel`
  - `bucket` (`PRACTICAL`/`MEDIA`)
  - `healthStatus`, `failureStreak`, `lastSuccessAt`

## Data Model
- `sources`
- `raw_items`
- `normalized_items`
- `event_clusters`
- `daily_digest_items`
- `job_runs`

## Ingestion
- Provider set:
  - `RSS`
  - `ARXIV`
  - `GITHUB_REPOS`
  - `HUGGINGFACE`
  - `OPENROUTER`
  - `PAPERS_WITH_CODE`
  - `WEB`
  - `SOCIAL_AGG_A`
  - `SOCIAL_AGG_B`
- Social provider A is primary; fallback to B on A failure.
- Source failures are isolated and tracked; system never fails globally because of one source.

## Ranking and Quota Policy
- Dedup keys: canonical URL + title hash + text similarity threshold `0.88`
- Target size: 20/day
- Practical target ratio: `0.85` (17/20)
- Media max: `5/20`
- Repeat window: `7` days with decay `0.92^(streakDays-1)`
- Media scoring:
  - `0.30 practicality`
  - `0.25 source weight`
  - `0.20 engagement`
  - `0.15 cross-source confirm`
  - `0.10 author reputation`
- Media without quoted origin links are strongly penalized.
- Per-author cap for social entries: max 2 items/day.
- Avoid single-source version spam by preferring trend/repo/model signals over per-repo release streams.

## Summary Strategy
- Extractive-first summarization from source text
- 40-80 Chinese chars target
- No new entities not present in source text
- Social entries keep post URL as traceable origin

## Schedule
- Default publish time: `09:00` (server timezone)
- Background ingestion cron: every 2 hours
- Daily publish cron: once at configured time

## Reliability Rules
- Single source failure must not fail full run
- Source health state updated on success/failure streak
- Ingestion/publish run details include fallback and source-level errors
- Missing digest data returns `200` with `items: []` instead of `500`
