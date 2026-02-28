# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIScan 是一个 Todo List 应用，采用前后端分离架构。

- **前端**: React 18 + Vite 5 + TailwindCSS 3
- **后端**: Go 1.21 + Gin + GORM + SQLite

## Commands

### Frontend (React)

```bash
cd frontend
npm install          # 安装依赖
npm run dev          # 开发服务器 (http://localhost:5173)
npm run build        # 生产构建
npm run preview     # 预览生产构建
```

### Backend (Go)

```bash
cd backend
go mod tidy          # 下载依赖
go run cmd/server/main.go  # 启动服务 (http://localhost:8080)
go test ./...       # 运行测试
```

## Architecture

### Backend (Go)
- `cmd/server/main.go` - 入口文件，初始化数据库和路由
- `internal/handler/` - HTTP 处理器，处理 API 请求
- ` 数据模型 (Ginternal/model/` -ORM)
- `internal/repository/` - 数据访问层
- `internal/database/` - 数据库初始化

API 基础路径: `http://localhost:8080/api`

### Frontend (React)
- `src/App.jsx` - 主组件
- `src/api/api.js` - API 调用封装
- `src/components/` - UI 组件 (TodoForm, TodoItem, TodoList)

前端 Vite 配置了 `/api` 代理到 `http://localhost:8080`

## Database

SQLite 数据库文件: `backend/todo.db` (自动创建)

## Running the Project

需要同时启动前端和后端：

1. 后端: `cd backend && go run cmd/server/main.go`
2. 前端: `cd frontend && npm run dev`

访问 http://localhost:5173
