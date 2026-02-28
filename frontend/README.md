# AI Scan - Todo 前端

基于 React + Vite + TailwindCSS 的 Todo List 应用。

## 技术栈

- React 18
- Vite 5
- TailwindCSS 3

## 前置要求

- Node.js >= 18
- 后端服务运行在 http://localhost:8080

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 运行。

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## API 代理

开发模式下，Vite 会将 `/api` 请求代理到 `http://localhost:8080`。

## 功能

- 查看所有 Todo 列表
- 创建新 Todo
- 编辑 Todo
- 删除 Todo
- 标记完成/未完成
