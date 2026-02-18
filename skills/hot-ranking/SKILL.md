---
name: hot-ranking
description: Use this skill when implementing or tuning AIScan dedup clustering, practical-vs-social quota ranking, recurring hotspot decay, and daily top-20 publishing.
---

# Hot Ranking Skill

## Use This Skill When
- Editing dedup strategy
- Modifying practical/social scoring factors
- Adjusting quota policy (`85% practical`, `media max 5`)
- Adjusting recurring hotspot window and decay

## Workflow
1. Normalize candidate records into consistent text and URL keys.
2. Deduplicate by canonical URL, title hash, and similarity threshold `0.88`.
3. Build event clusters with cross-source count.
4. Score practical and media buckets with bucket-specific formulas.
5. Apply recurring decay for repeated hotspots (7-day window).
6. Select top 20 with:
   - practical target ratio
   - media hard cap
   - max 2 social posts per author/day
7. Persist `event_clusters` and `daily_digest_items` atomically.

## Guardrails
- Preserve deterministic ranking for same input set.
- Strongly penalize social entries with no quoted origin links.
- Prevent single-source version-changelog flooding from dominating top slots.
- Keep one representative item per cluster per day.
- Mark recurring hotspots with streak metadata.
