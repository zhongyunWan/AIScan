# AIScan Product Spec

## Product Goal
Deliver a zero-login daily web digest that publishes the top 20 global AI updates every day at a fixed time. The list must be traceable, concise, and useful in under 5 minutes.

## Target Users
- AI engineers and builders
- PM/strategy users tracking AI ecosystem movement
- Media/research operators who need a daily source-of-truth list

## Scope (MVP)
- Web only
- One main page for today's top 20 items
- Date-based history browsing
- Source filter: `official/research` and `media`
- Every item includes: title, Chinese summary, hot score, confidence, source label, publish time, original link

## Out of Scope (MVP)
- Login, personalization, comments
- Native mobile app
- Social timeline crawling
- Paid content full-text ingestion

## UX Requirements
- Fast first read: first 2 cards visible above fold on mobile width 390px
- Visual style: minimal, clean whitespace, one accent color
- Simple interactions only: date switch, source filter, open original link

## Success Criteria
- Daily digest always has up to 20 items
- Source link traceability is 100%
- Daily publish task succeeds >= 95% over 7 days
- Users can consume daily digest in < 5 minutes
