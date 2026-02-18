# AIScan

轻量级每日 AI 热点 Web 应用（Next.js + PostgreSQL + Docker Compose）。

## ✨ 特性

- 🎨 **现代化设计系统** - 美观、大方、年轻化的视觉风格
- 📊 **智能数据聚合** - 每日固定产出四大方向 AI 趋势（每方向 20 条，共 80 条）
- 🌐 **多源信息整合** - Product Hunt / Hugging Face / Reddit / X 四大数据源
- 🔍 **灵活筛选** - 支持按日期查看历史日报,按方向筛选内容
- 🎯 **置信度评分** - 智能评估内容质量,高置信度优先展示
- 🔄 **持续热点追踪** - 7 天持续热点重复衰减机制
- 📱 **响应式设计** - 完美适配桌面端和移动端

## 功能
- 每日固定产出四大方向 AI 趋势（每方向 20 条，共 80 条）
- 中文摘要 + 英文原文链接
- 支持按日期查看历史日报
- 支持按方向筛选（全部 / 产品爆发 / 技术方向 / 开发者共识 / X 趋势）
- 信息源改为「AI 信息雷达」三层结构（模型热度 / 产品趋势 / 社区反馈）
- 支持 7 天持续热点重复衰减
- 支持每方向固定配额（默认 20 条/方向）与方向内排序

## 📁 目录结构

```
AIScan/
├── specs/              # 产品/技术/验收规范
├── skills/             # Vibe coding skills
├── apps/web/           # Next.js 应用
│   ├── src/
│   │   ├── app/        # Next.js App Router
│   │   ├── components/ # React 组件
│   │   ├── lib/        # 业务逻辑和工具
│   │   └── styles/     # 设计系统样式
│   │       ├── design-system.css  # 原始设计令牌
│   │       ├── tokens.css         # 语义化令牌
│   │       ├── base.css           # 基础样式
│   │       └── components.css     # 组件样式
│   ├── prisma/         # 数据库 Schema
│   └── DESIGN_SYSTEM.md # 设计系统文档
└── nginx/              # Nginx 反代配置
```

## 🎨 设计系统

AIScan 采用统一的设计系统,确保视觉一致性和易维护性。详细文档请查看 [`apps/web/DESIGN_SYSTEM.md`](apps/web/DESIGN_SYSTEM.md)。

### 核心特点

- **颜色系统**: 青绿色主色 + 紫色辅助色,浅色调为主
- **排版系统**: 完整的字体大小、行高、字重规范
- **间距系统**: 基于 4px 网格的统一间距
- **组件库**: 可复用的按钮、卡片、徽章等组件
- **响应式**: 完善的断点系统,适配各种设备

### 快速使用

所有样式通过 CSS 变量管理:

```css
/* 使用语义化令牌 */
.my-element {
  color: var(--text-primary);
  background: var(--surface-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
```

## 快速开始（本地）
1. 安装依赖
```bash
cd /Users/wanzhongyun/github/AIScan
npm install
```

2. 配置环境变量
```bash
cp /Users/wanzhongyun/github/AIScan/apps/web/.env.example /Users/wanzhongyun/github/AIScan/apps/web/.env
```

3. 启动数据库（Docker）
```bash
cd /Users/wanzhongyun/github/AIScan
docker compose up -d postgres
```

4. 初始化数据库
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. 启动开发环境
```bash
npm run dev
```

## Docker Compose 部署
```bash
cd /Users/wanzhongyun/github/AIScan
docker compose up -d --build
```

服务组成：
- `web`：Next.js 应用（含 cron 调度）
- `postgres`：PostgreSQL（当前 compose 使用 `postgres:15-alpine`）
- `nginx`：反向代理 + 内部 API 限流

## API
- `GET /api/digest/today`
- `GET /api/digest/{YYYY-MM-DD}`
- `GET /api/sources`
- `POST /api/internal/ingest`
  - Header: `x-internal-api-key`
  - Optional body: `{ "sourceBuckets": ["PRACTICAL", "MEDIA"] }`
- `POST /api/internal/publish`
  - Header: `x-internal-api-key`
  - Optional body:
    - `date` (`YYYY-MM-DD`)
    - `mediaMax` (default `40`)
    - `practicalTargetRatio` (default `0.85`)
    - `repeatWindowDays` (default `7`)

## AI 信息雷达默认来源
- Product Hunt AI（官方 feed + AI 关键词过滤）
- Hugging Face Trending（Models + Spaces，作为技术方向主源）
- Reddit（LocalLLaMA/LocalLLM，走 JSON 接口）
- X / Twitter 研究者圈（社媒聚合主备）
- 其余工程向补充源：OpenRouter、GitHub AI、arXiv、Papers with Code、Arena/AA

## 社媒聚合配置（第三层）
在 `/Users/wanzhongyun/github/AIScan/apps/web/.env` 配置：
- `SOCIAL_AGG_A_BASE_URL`
- `SOCIAL_AGG_A_API_KEY`
- `SOCIAL_AGG_B_BASE_URL`
- `SOCIAL_AGG_B_API_KEY`

说明：
- A 为主提供商，失败时自动回退到 B。
- 若两者都不可用，媒体池会为空，但主榜依然可发布。

## 默认调度
- 采集：每 2 小时
- 发布：每天 `09:00`（可通过 `PUBLISH_TIME` 修改）

## 注意
- 单源采集失败不会导致全局失败，失败信息写入 `job_runs`
- 媒体来源以社区信号为主（Reddit + 研究者分享），不再依赖科技新闻媒体 RSS
- 无 quoted origin links 的社媒条目会被强降权
