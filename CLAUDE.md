# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIScan is a lightweight daily AI trends web application built with Next.js 15 + PostgreSQL + Docker Compose. It aggregates AI news from multiple sources (Product Hunt, Hugging Face, Reddit, X/Twitter, GitHub, arXiv, etc.) and publishes daily digests with 80 items across four categories.

## Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database
```

## Architecture

- **Monorepo**: Workspaces in `apps/*`, main app at `apps/web`
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Scheduling**: node-cron for automated ingestion (every 2 hours) and publishing (09:00 daily)
- **Styling**: Custom CSS design system with CSS variables (no Tailwind)

### Key Directories

- `apps/web/src/app/` - Next.js App Router pages and API routes
- `apps/web/src/lib/ingest/adapters/` - Data source adapters (huggingface, reddit, github, arxiv, etc.)
- `apps/web/src/lib/pipeline/` - Ingestion and ranking pipelines
- `apps/web/prisma/` - Database schema
- `apps/web/src/styles/` - Design system CSS files

### Design System

Uses CSS variables defined in `src/styles/tokens.css`. Key patterns:
- Colors: `--color-*` (primary: teal, secondary: purple)
- Spacing: `--spacing-*` (4px grid)
- Typography: `--font-size-*`, `--line-height-*`

### Internal APIs

- `POST /api/internal/ingest` - Trigger data collection (requires `x-internal-api-key` header)
- `POST /api/internal/publish` - Publish daily digest

### Docker Services

- `web`: Next.js application
- `postgres`: PostgreSQL 15
- `nginx`: Reverse proxy
