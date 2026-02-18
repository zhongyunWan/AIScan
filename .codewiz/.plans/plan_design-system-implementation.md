# 实施计划：AIScan 设计系统建设

## 概述

为 AIScan 项目设计并实施一套完整的、统一的设计系统。该系统将包括：
- 现代化的浅色调配色方案，符合年轻人审美
- 集中管理的 CSS 变量系统
- 统一的组件样式规范
- 完整的排版、间距、圆角等设计规范
- 易于维护和扩展的架构

**设计理念**：美观、大方、年轻、统一、浅色调为主

---

## 架构分析

### 现有状态
- 项目使用 Next.js 15 + React 19 + TypeScript
- 当前样式集中在 `globals.css` 中（281 行）
- 已有基础的 CSS 变量定义（7 个变量）
- 样式组织相对简单，缺乏系统性的设计规范
- 使用了多种硬编码的颜色值，不利于维护

### 现有颜色变量
```css
--bg: #f4f7f8;           /* 背景色 */
--paper: #ffffff;        /* 卡片背景 */
--ink: #0f1e2a;          /* 主文本色 */
--muted: #5d6a73;        /* 辅助文本色 */
--line: #dbe1e6;         /* 边框色 */
--accent: #0f7d86;       /* 强调色（青绿色） */
--accent-soft: #dff2f1;  /* 强调色浅色版本 */
```

### 存在的问题
1. 颜色变量不完整，缺少语义色（成功、警告、错误等）
2. 硬编码的颜色值散布在 CSS 中（如 `#d7e6ea`、`#123446` 等）
3. 缺少系统的排版规范（字体大小、行高、字重等）
4. 缺少间距规范（padding、margin 的标准值）
5. 缺少圆角规范
6. 缺少阴影规范
7. 没有响应式设计的系统化方案

---

## 设计系统规范

### 1. 颜色系统

#### 1.1 核心色板（浅色调为主）

**主色系**（青绿色 - 现有强调色）
- Primary 50: `#f0fffe`
- Primary 100: `#d5f8f6`
- Primary 200: `#aef0ed`
- Primary 300: `#7ee5e0`
- Primary 400: `#4dd4d0`
- Primary 500: `#2bc3c0` （主色）
- Primary 600: `#1fa8a5`
- Primary 700: `#178a87`
- Primary 800: `#146b6a`
- Primary 900: `#0f5456`

**辅助色系**（紫色 - 用于次要操作）
- Secondary 50: `#faf8ff`
- Secondary 100: `#f3edff`
- Secondary 200: `#e8d9ff`
- Secondary 300: `#d9bfff`
- Secondary 400: `#c89eff`
- Secondary 500: `#b87dff` （辅助色）
- Secondary 600: `#9d5cff`
- Secondary 700: `#8a3fff`
- Secondary 800: `#7a2aff`
- Secondary 900: `#6b1aff`

**中性色系**（灰色 - 用于文本、边框等）
- Neutral 50: `#fafbfc`
- Neutral 100: `#f3f5f7`
- Neutral 200: `#e8ecf1`
- Neutral 300: `#dbe1e6`
- Neutral 400: `#c5cdd5`
- Neutral 500: `#a8b2bd`
- Neutral 600: `#8a95a3`
- Neutral 700: `#6b7684`
- Neutral 800: `#4a5568`
- Neutral 900: `#2d3748`

**语义色系**
- Success 500: `#10b981` （成功/正面）
- Success 100: `#d1fae5`
- Warning 500: `#f59e0b` （警告）
- Warning 100: `#fef3c7`
- Error 500: `#ef4444` （错误/负面）
- Error 100: `#fee2e2`
- Info 500: `#3b82f6` （信息）
- Info 100: `#dbeafe`

#### 1.2 语义化变量映射

```css
/* 背景色 */
--bg-primary: #fafbfc;      /* 页面主背景 */
--bg-secondary: #f3f5f7;    /* 次级背景 */
--bg-tertiary: #e8ecf1;     /* 第三级背景 */

/* 表面色 */
--surface-primary: #ffffff; /* 卡片、容器主表面 */
--surface-secondary: #f9fafb; /* 次级表面 */

/* 文本色 */
--text-primary: #2d3748;    /* 主文本 */
--text-secondary: #6b7684;  /* 次级文本 */
--text-tertiary: #a8b2bd;   /* 第三级文本 */
--text-disabled: #c5cdd5;   /* 禁用文本 */
--text-inverse: #ffffff;    /* 反色文本 */

/* 边框色 */
--border-light: #e8ecf1;    /* 浅边框 */
--border-default: #dbe1e6;  /* 默认边框 */
--border-strong: #c5cdd5;   /* 强边框 */

/* 交互色 */
--interactive-primary: #2bc3c0;   /* 主交互色 */
--interactive-secondary: #b87dff; /* 次级交互色 */
--interactive-hover: #1fa8a5;     /* 悬停状态 */
--interactive-active: #178a87;    /* 激活状态 */
--interactive-disabled: #c5cdd5;  /* 禁用状态 */

/* 状态色 */
--state-success: #10b981;
--state-warning: #f59e0b;
--state-error: #ef4444;
--state-info: #3b82f6;

/* 状态色浅色版本 */
--state-success-light: #d1fae5;
--state-warning-light: #fef3c7;
--state-error-light: #fee2e2;
--state-info-light: #dbeafe;
```

### 2. 排版系统

#### 2.1 字体栈
```css
--font-family-base: "Source Han Sans SC", "PingFang SC", "Hiragino Sans GB", "Avenir Next", sans-serif;
--font-family-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
```

#### 2.2 字体大小规范（基础 16px）
```css
--font-size-xs: 12px;    /* 辅助文本、标签 */
--font-size-sm: 13px;    /* 小文本、说明 */
--font-size-base: 16px;  /* 正文、默认 */
--font-size-lg: 17px;    /* 大文本 */
--font-size-xl: 22px;    /* 卡片标题 */
--font-size-2xl: 28px;   /* 小标题 */
--font-size-3xl: 34px;   /* 大标题 */
--font-size-4xl: 42px;   /* 超大标题 */
```

#### 2.3 行高规范
```css
--line-height-tight: 1.2;   /* 标题 */
--line-height-normal: 1.4;  /* 默认 */
--line-height-relaxed: 1.6; /* 正文 */
--line-height-loose: 1.8;   /* 宽松 */
```

#### 2.4 字重规范
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 3. 间距系统（基础 4px）

```css
--spacing-0: 0;
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-7: 28px;
--spacing-8: 32px;
--spacing-9: 36px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-14: 56px;
--spacing-16: 64px;
```

### 4. 圆角规范

```css
--radius-none: 0;
--radius-sm: 4px;
--radius-base: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 999px;
```

### 5. 阴影规范

```css
--shadow-none: none;
--shadow-xs: 0 1px 2px rgba(45, 55, 72, 0.05);
--shadow-sm: 0 1px 3px rgba(45, 55, 72, 0.1), 0 1px 2px rgba(45, 55, 72, 0.06);
--shadow-base: 0 2px 8px rgba(16, 39, 53, 0.03);
--shadow-md: 0 4px 12px rgba(45, 55, 72, 0.08);
--shadow-lg: 0 8px 24px rgba(45, 55, 72, 0.12);
--shadow-xl: 0 12px 32px rgba(45, 55, 72, 0.15);
```

### 6. 过渡/动画规范

```css
--transition-fast: 120ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### 7. 断点规范（响应式）

```css
--breakpoint-xs: 320px;
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

---

## 实施步骤

### 第一阶段：建立设计系统基础

#### 步骤 1：创建设计系统目录结构
```
apps/web/src/
├── styles/
│   ├── design-system.css      # 设计系统核心变量
│   ├── tokens.css             # 设计令牌（颜色、排版等）
│   ├── base.css               # 基础样式重置
│   ├── components.css         # 组件样式
│   └── utilities.css          # 工具类
└── ...
```

#### 步骤 2：创建 `design-system.css`
- 定义所有 CSS 变量
- 包括颜色、排版、间距、圆角、阴影、过渡等
- 支持浅色模式（默认）和深色模式（预留）

#### 步骤 3：创建 `tokens.css`
- 定义语义化的设计令牌
- 将原始颜色值映射到语义变量
- 便于主题切换

#### 步骤 4：创建 `base.css`
- 重置默认样式
- 应用全局字体、行高等
- 定义基础元素样式（h1-h6、p、a 等）

#### 步骤 5：创建 `components.css`
- 定义可复用的组件样式
- 包括按钮、卡片、标签、输入框等
- 使用 CSS 变量确保一致性

#### 步骤 6：创建 `utilities.css`
- 定义工具类（可选）
- 如 `.text-primary`、`.bg-secondary` 等
- 便于快速开发

### 第二阶段：迁移现有样式

#### 步骤 7：分析 `globals.css` 中的所有颜色值
- 列出所有硬编码的颜色
- 将其映射到新的设计系统变量
- 识别需要新增的变量

#### 步骤 8：更新 `globals.css`
- 导入新的设计系统文件
- 替换所有硬编码颜色为 CSS 变量
- 保持功能不变，仅改进代码质量

#### 步骤 9：验证视觉一致性
- 在浏览器中检查所有页面
- 确保颜色、排版、间距一致
- 调整必要的变量值

### 第三阶段：优化和扩展

#### 步骤 10：创建组件库文档
- 记录所有可用的设计令牌
- 提供使用示例
- 便于团队协作

#### 步骤 11：添加深色模式支持（可选）
- 在 `design-system.css` 中添加 `@media (prefers-color-scheme: dark)` 规则
- 定义深色模式下的变量值
- 测试深色模式的可用性

#### 步骤 12：创建样式指南文档
- 记录设计系统的使用规范
- 提供最佳实践
- 便于新开发者快速上手

---

## 关键文件清单

### 需要创建的文件
1. **`apps/web/src/styles/design-system.css`** - 设计系统核心变量定义
   - 包含所有 CSS 变量
   - 浅色模式为默认
   - 预留深色模式支持

2. **`apps/web/src/styles/tokens.css`** - 设计令牌映射
   - 语义化变量定义
   - 颜色、排版、间距等映射
   - 便于主题切换

3. **`apps/web/src/styles/base.css`** - 基础样式
   - 全局重置
   - 基础元素样式
   - 字体、行高等全局设置

4. **`apps/web/src/styles/components.css`** - 组件样式
   - 可复用组件样式
   - 按钮、卡片、标签等
   - 使用设计系统变量

5. **`apps/web/src/styles/utilities.css`** - 工具类（可选）
   - 快速开发工具类
   - 文本颜色、背景色等

6. **`docs/DESIGN_SYSTEM.md`** - 设计系统文档
   - 完整的设计规范
   - 使用指南
   - 最佳实践

### 需要修改的文件
1. **`apps/web/src/app/globals.css`** - 主样式文件
   - 导入新的设计系统文件
   - 替换硬编码颜色为变量
   - 保持现有功能

2. **`apps/web/src/app/layout.tsx`** - 布局文件
   - 确保导入顺序正确
   - 可能需要添加主题支持

---

## 依赖关系和实施顺序

```
1. 创建 design-system.css (定义所有 CSS 变量)
   ↓
2. 创建 tokens.css (映射语义化变量)
   ↓
3. 创建 base.css (基础样式)
   ↓
4. 创建 components.css (组件样式)
   ↓
5. 创建 utilities.css (工具类)
   ↓
6. 更新 globals.css (导入新文件，替换硬编码颜色)
   ↓
7. 验证视觉一致性
   ↓
8. 创建文档
```

**关键依赖**：
- `design-system.css` 是基础，其他文件都依赖它
- `tokens.css` 依赖 `design-system.css`
- `base.css` 和 `components.css` 都依赖 `tokens.css`
- `globals.css` 最后更新，导入所有新文件

---

## 潜在挑战和解决方案

### 挑战 1：颜色值的精确映射
**问题**：现有 CSS 中有许多硬编码的颜色值，需要准确映射到新系统
**解决方案**：
- 逐一分析每个颜色值
- 创建颜色映射表
- 使用浏览器开发者工具验证颜色一致性
- 必要时微调变量值

### 挑战 2：保持向后兼容性
**问题**：修改样式可能影响现有功能
**解决方案**：
- 先创建新的设计系统文件，不修改 `globals.css`
- 逐步迁移，分步骤替换
- 在每个步骤后进行视觉测试
- 保留原始 `globals.css` 作为备份

### 挑战 3：浏览器兼容性
**问题**：CSS 变量在旧浏览器中可能不支持
**解决方案**：
- 项目使用 Next.js 15，现代浏览器支持 CSS 变量
- 如需支持旧浏览器，可使用 PostCSS 插件
- 当前不需要考虑，但可在文档中记录

### 挑战 4：深色模式支持
**问题**：如何优雅地支持深色模式
**解决方案**：
- 在 `design-system.css` 中预留 `@media (prefers-color-scheme: dark)` 规则
- 定义深色模式下的变量值
- 可选：添加手动切换深色模式的功能

### 挑战 5：团队协作和文档
**问题**：新的设计系统需要文档和培训
**解决方案**：
- 创建详细的 `DESIGN_SYSTEM.md` 文档
- 提供代码示例
- 定期更新和维护
- 在代码中添加注释

---

## 代码示例

### 示例 1：design-system.css 结构

```css
:root {
  /* ========== 颜色系统 ========== */
  
  /* 主色系 - 青绿色 */
  --color-primary-50: #f0fffe;
  --color-primary-100: #d5f8f6;
  --color-primary-200: #aef0ed;
  --color-primary-300: #7ee5e0;
  --color-primary-400: #4dd4d0;
  --color-primary-500: #2bc3c0;
  --color-primary-600: #1fa8a5;
  --color-primary-700: #178a87;
  --color-primary-800: #146b6a;
  --color-primary-900: #0f5456;
  
  /* 辅助色系 - 紫色 */
  --color-secondary-50: #faf8ff;
  --color-secondary-100: #f3edff;
  --color-secondary-200: #e8d9ff;
  --color-secondary-300: #d9bfff;
  --color-secondary-400: #c89eff;
  --color-secondary-500: #b87dff;
  --color-secondary-600: #9d5cff;
  --color-secondary-700: #8a3fff;
  --color-secondary-800: #7a2aff;
  --color-secondary-900: #6b1aff;
  
  /* 中性色系 - 灰色 */
  --color-neutral-50: #fafbfc;
  --color-neutral-100: #f3f5f7;
  --color-neutral-200: #e8ecf1;
  --color-neutral-300: #dbe1e6;
  --color-neutral-400: #c5cdd5;
  --color-neutral-500: #a8b2bd;
  --color-neutral-600: #8a95a3;
  --color-neutral-700: #6b7684;
  --color-neutral-800: #4a5568;
  --color-neutral-900: #2d3748;
  
  /* 语义色系 */
  --color-success-50: #d1fae5;
  --color-success-500: #10b981;
  --color-warning-50: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-error-50: #fee2e2;
  --color-error-500: #ef4444;
  --color-info-50: #dbeafe;
  --color-info-500: #3b82f6;
  
  /* ========== 排版系统 ========== */
  --font-family-base: "Source Han Sans SC", "PingFang SC", "Hiragino Sans GB", "Avenir Next", sans-serif;
  --font-family-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
  
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-base: 16px;
  --font-size-lg: 17px;
  --font-size-xl: 22px;
  --font-size-2xl: 28px;
  --font-size-3xl: 34px;
  --font-size-4xl: 42px;
  
  --line-height-tight: 1.2;
  --line-height-normal: 1.4;
  --line-height-relaxed: 1.6;
  --line-height-loose: 1.8;
  
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* ========== 间距系统 ========== */
  --spacing-0: 0;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-7: 28px;
  --spacing-8: 32px;
  --spacing-9: 36px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-14: 56px;
  --spacing-16: 64px;
  
  /* ========== 圆角系统 ========== */
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-base: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 999px;
  
  /* ========== 阴影系统 ========== */
  --shadow-none: none;
  --shadow-xs: 0 1px 2px rgba(45, 55, 72, 0.05);
  --shadow-sm: 0 1px 3px rgba(45, 55, 72, 0.1), 0 1px 2px rgba(45, 55, 72, 0.06);
  --shadow-base: 0 2px 8px rgba(16, 39, 53, 0.03);
  --shadow-md: 0 4px 12px rgba(45, 55, 72, 0.08);
  --shadow-lg: 0 8px 24px rgba(45, 55, 72, 0.12);
  --shadow-xl: 0 12px 32px rgba(45, 55, 72, 0.15);
  
  /* ========== 过渡系统 ========== */
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  
  /* ========== 断点系统 ========== */
  --breakpoint-xs: 320px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* 深色模式支持（预留） */
@media (prefers-color-scheme: dark) {
  :root {
    /* 深色模式下的变量值 */
    /* 待定义 */
  }
}
```

### 示例 2：tokens.css 结构

```css
:root {
  /* ========== 背景色 ========== */
  --bg-primary: var(--color-neutral-50);
  --bg-secondary: var(--color-neutral-100);
  --bg-tertiary: var(--color-neutral-200);
  
  /* ========== 表面色 ========== */
  --surface-primary: #ffffff;
  --surface-secondary: var(--color-neutral-50);
  
  /* ========== 文本色 ========== */
  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-700);
  --text-tertiary: var(--color-neutral-500);
  --text-disabled: var(--color-neutral-400);
  --text-inverse: #ffffff;
  
  /* ========== 边框色 ========== */
  --border-light: var(--color-neutral-200);
  --border-default: var(--color-neutral-300);
  --border-strong: var(--color-neutral-400);
  
  /* ========== 交互色 ========== */
  --interactive-primary: var(--color-primary-500);
  --interactive-secondary: var(--color-secondary-500);
  --interactive-hover: var(--color-primary-600);
  --interactive-active: var(--color-primary-700);
  --interactive-disabled: var(--color-neutral-400);
  
  /* ========== 状态色 ========== */
  --state-success: var(--color-success-500);
  --state-warning: var(--color-warning-500);
  --state-error: var(--color-error-500);
  --state-info: var(--color-info-500);
  
  /* ========== 状态色浅色版本 ========== */
  --state-success-light: var(--color-success-50);
  --state-warning-light: var(--color-warning-50);
  --state-error-light: var(--color-error-50);
  --state-info-light: var(--color-info-50);
}
```

### 示例 3：base.css 结构

```css
* {
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  background-image:
    radial-gradient(circle at 8% -3%, var(--color-primary-100) 0, transparent 45%),
    radial-gradient(circle at 95% 3%, var(--color-info-50) 0, transparent 35%);
}

a {
  color: var(--interactive-primary);
  text-decoration: none;
  transition: color var(--transition-base);
}

a:hover {
  color: var(--interactive-hover);
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

h1 {
  font-size: var(--font-size-4xl);
}

h2 {
  font-size: var(--font-size-xl);
}

h3 {
  font-size: var(--font-size-2xl);
}

p {
  margin: 0;
}
```

### 示例 4：components.css 结构

```css
/* ========== 卡片组件 ========== */
.card {
  background-color: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--spacing-5);
  box-shadow: var(--shadow-base);
  transition: box-shadow var(--transition-base), border-color var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-strong);
}

/* ========== 按钮组件 ========== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
}

.btn-primary:hover {
  background-color: var(--interactive-hover);
}

.btn-primary:active {
  background-color: var(--interactive-active);
}

/* ========== 标签组件 ========== */
.tag {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-full);
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
  border: 1px solid var(--color-primary-200);
}
```

---

## 实施优先级

### 高优先级（必须）
1. 创建 `design-system.css` - 定义所有 CSS 变量
2. 创建 `tokens.css` - 映射语义化变量
3. 更新 `globals.css` - 导入新文件，替换硬编码颜色

### 中优先级（推荐）
4. 创建 `base.css` - 基础样式
5. 创建 `components.css` - 组件样式
6. 创建设计系统文档

### 低优先级（可选）
7. 创建 `utilities.css` - 工具类
8. 添加深色模式支持
9. 创建组件库演示页面

---

## 验证清单

实施完成后，需要验证以下内容：

- [ ] 所有页面在浅色模式下显示正确
- [ ] 所有颜色都使用 CSS 变量，没有硬编码颜色值
- [ ] 排版一致（字体、大小、行高、字重）
- [ ] 间距一致（padding、margin）
- [ ] 圆角一致
- [ ] 阴影一致
- [ ] 过渡效果一致
- [ ] 响应式设计正常工作
- [ ] 浏览器兼容性正常
- [ ] 性能没有下降
- [ ] 文档完整且易于理解

---

## 后续维护

### 定期审查
- 每个季度审查一次设计系统
- 收集团队反馈
- 更新和优化变量值

### 扩展计划
- 添加更多组件样式
- 支持深色模式
- 创建组件库文档网站
- 考虑使用 CSS-in-JS 或 Tailwind CSS 等工具

### 文档维护
- 保持文档与代码同步
- 添加新变量时更新文档
- 定期检查文档的准确性

---

## 总结

这套设计系统将为 AIScan 项目提供：
1. **统一的视觉风格** - 美观、大方、年轻、浅色调
2. **易于维护的代码** - 集中管理的 CSS 变量
3. **可扩展的架构** - 便于添加新组件和功能
4. **团队协作** - 清晰的设计规范和文档
5. **未来准备** - 预留深色模式和其他扩展空间

通过分阶段实施，可以最小化对现有功能的影响，同时逐步提升项目的设计质量。
