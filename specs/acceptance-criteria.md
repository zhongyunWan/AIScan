# AIScan Acceptance Criteria

## Ingestion
- Source failure is isolated and recorded in `job_runs`.
- Social provider A failure can fallback to B without failing whole run.
- `POST /api/internal/ingest` accepts optional `sourceBuckets` and respects filtering.

## Source Health
- Source success resets `failureStreak` and sets `healthStatus=healthy`.
- Consecutive failures update `failureStreak` and degrade `healthStatus` after threshold.

## Dedup and Ranking
- Same event from three sources appears once in top list.
- Daily list size is 20 when enough candidates exist.
- Media entries are capped at 5.
- Social posts from same author do not exceed 2 in one day.
- Consecutive version updates from same repo should not dominate the top list.
- Repeat entries within 7 days are allowed and have decayed score.
- Media entries without quoted origin links receive a clear score penalty.

## Practical Ratio
- Practical bucket entries should target at least 85% under normal candidate supply.

## API Behavior
- `GET /api/digest/today` returns 200 with `items: []` when no data.
- `GET /api/digest/[date]` validates date format (`YYYY-MM-DD`).
- Internal endpoints return 401 on invalid key.
- Digest API includes fields: `bucket`, `practicalScore`, `isRecurringHot`, `streakDays`.

## UI
- Mobile width 390px has no horizontal scroll.
- First screen shows at least two complete cards.
- Filter between `all`, `official/research`, and `media` works without reload errors.
- Recurring hotspots show streak info in cards.

## Operational
- Scheduler can run continuously for 7 days.
- Digest publish success rate >= 95% (via `job_runs` stats).
