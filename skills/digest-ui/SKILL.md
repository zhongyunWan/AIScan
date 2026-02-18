---
name: digest-ui
description: Use this skill when building or refining AIScan daily digest UI, including card presentation, mobile-first layout, and date/filter navigation.
---

# Digest UI Skill

## Use This Skill When
- Implementing or changing digest pages and card components
- Updating date navigation and source filters
- Improving readability and mobile layout

## Workflow
1. Fetch digest data server-side by date.
2. Render a minimal top section: brand, date, count, confidence summary.
3. Render card list with fixed density:
   - one-line title
   - two/three-line summary
   - source/time line
   - single "原文" action
4. Keep source filter in URL query for shareable state.
5. Add explicit empty-state messaging when digest is missing.

## Design Rules
- Low-contrast background, single accent color.
- Strong typography and whitespace.
- No heavy motion.
- Mobile 390px must avoid horizontal overflow.

## Guardrails
- Do not hide original source links.
- Keep UI dependency footprint small.
