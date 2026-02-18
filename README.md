# AIScan

轻量级每日 AI 热点 Web 应用（Next.js + PostgreSQL + Docker Compose）。

## 特性

- 多源信息聚合：Product Hunt / Hugging Face / Reddit / X
- 每日固定产出 20 条精选 AI 趋势
- 中文摘要 + 英文原文链接
- 按日期查看历史日报
- 7 天持续热点重复衰减机制

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp apps/web/.env.example apps/web/.env

# 启动数据库
docker compose up -d postgres

# 初始化数据库
npm run db:generate
npm run db:push
npm run db:seed

# 启动开发服务器
npm run dev
```

## API

- `GET /api/digest/today` - 今日热点
- `GET /api/digest/{YYYY-MM-DD}` - 历史日报
- `POST /api/internal/ingest` - 触发采集（需 `x-internal-api-key`）
- `POST /api/internal/publish` - 发布日报（需 `x-internal-api-key`）

## 项目结构

```
AIScan/
├── specs/           # 产品/技术/验收规范
├── skills/          # 技能定义
├── apps/web/        # Next.js 应用
│   └── src/
│       ├── app/     # App Router 页面
│       ├── lib/    # 业务逻辑
│       └── styles/ # 设计系统（CSS 变量）
└── docker-compose.yml
```
