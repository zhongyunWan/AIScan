# 设计令牌速查表

快速参考常用的 CSS 变量,用于日常开发。

## 🎨 颜色

### 文本色
```css
--text-primary      /* 主要文本 #1a2530 */
--text-secondary    /* 次要文本 #4a5968 */
--text-tertiary     /* 辅助文本 #6b7a88 */
--text-brand        /* 品牌色文本 #178f8c */
```

### 背景色
```css
--bg-primary        /* 主背景 #f8fafb */
--surface-primary   /* 卡片背景 #ffffff */
--surface-hover     /* 悬停背景 #f1f4f6 */
--bg-brand-subtle   /* 品牌浅色背景 #b3f0ed */
```

### 边框色
```css
--border-default    /* 默认边框 #e4e9ed */
--border-subtle     /* 浅色边框 #f1f4f6 */
--border-brand      /* 品牌色边框 #2bc3c0 */
```

### 链接色
```css
--link-default      /* 链接默认 #178f8c */
--link-hover        /* 链接悬停 #107572 */
```

## 📏 间距

```css
--spacing-1    /* 4px   - 最小间距 */
--spacing-2    /* 8px   - 小间距 */
--spacing-3    /* 12px  - 中小间距 */
--spacing-4    /* 16px  - 标准间距 ⭐ 最常用 */
--spacing-5    /* 20px  - 中等间距 */
--spacing-6    /* 24px  - 大间距 */
--spacing-8    /* 32px  - 区块间距 */
--spacing-12   /* 48px  - 大区块间距 */
```

**使用建议**:
- 组件内部: `spacing-2` ~ `spacing-4`
- 组件之间: `spacing-4` ~ `spacing-6`
- 区块之间: `spacing-6` ~ `spacing-12`

## 📝 字体

### 字体大小
```css
--font-size-xs      /* 12px - 标签、辅助信息 */
--font-size-sm      /* 14px - 次要文本 */
--font-size-base    /* 16px - 正文 ⭐ 默认 */
--font-size-lg      /* 18px - 副标题 */
--font-size-xl      /* 20px - 小标题 */
--font-size-2xl     /* 24px - 卡片标题 */
--font-size-4xl     /* 36px - 页面标题 */
```

### 字重
```css
--font-weight-normal    /* 400 - 正文 */
--font-weight-medium    /* 500 - 强调 */
--font-weight-semibold  /* 600 - 标题 ⭐ 常用 */
--font-weight-bold      /* 700 - 重要标题 */
```

### 行高
```css
--line-height-tight     /* 1.25 - 标题 */
--line-height-normal    /* 1.5  - 正文 ⭐ 默认 */
--line-height-relaxed   /* 1.75 - 长文本 */
```

## 🔲 圆角

```css
--radius-sm      /* 4px   - 小元素 */
--radius-base    /* 8px   - 标签、徽章 */
--radius-md      /* 12px  - 小卡片 */
--radius-lg      /* 16px  - 主要卡片 ⭐ 常用 */
--radius-full    /* 9999px - 完全圆角(按钮) */
```

## 🌓 阴影

```css
--shadow-xs      /* 微小阴影 */
--shadow-sm      /* 小阴影 - 卡片默认 ⭐ */
--shadow-base    /* 基础阴影 */
--shadow-md      /* 中等阴影 - 卡片悬停 ⭐ */
--shadow-lg      /* 大阴影 */
```

## ⚡ 过渡

```css
--transition-fast    /* 150ms - 按钮、链接 ⭐ */
--transition-base    /* 250ms - 卡片、面板 ⭐ */
--transition-slow    /* 350ms - 页面切换 */
```

**标准用法**:
```css
transition: all var(--transition-base);
```

## 🎯 常用组合

### 卡片样式
```css
.card {
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### 按钮样式
```css
.btn {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}
```

### 标签样式
```css
.tag {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-base);
  background: var(--surface-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}
```

### 标题样式
```css
h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}
```

## 🏷️ 状态颜色

### 置信度
```css
/* 高置信 */
--status-high-bg: #e8f8f0
--status-high-text: #1a7b48
--status-high-border: #76d1a8

/* 中置信 */
--status-medium-bg: #fff8e6
--status-medium-text: #a37a00
--status-medium-border: #ffd44d

/* 低置信 */
--status-low-bg: #f1f4f6
--status-low-text: #4a5968
--status-low-border: #d1dae1
```

### 分类色
```css
/* Product Hunt */
--category-product-bg: #f0f5ff
--category-product-text: #1e40af
--category-product-accent: #3b82f6

/* Tech / Hugging Face */
--category-tech-bg: #ecfdf5
--category-tech-text: #065f46
--category-tech-accent: #10b981

/* Community / Reddit */
--category-community-bg: #fef3c7
--category-community-text: #92400e
--category-community-accent: #f59e0b

/* X / Twitter */
--category-x-bg: #f5f3ff
--category-x-text: #5b21b6
--category-x-accent: #8b5cf6
```

## 📱 响应式断点

```css
/* 使用 @media 查询 */
@media (max-width: 640px)  { /* 手机 */ }
@media (max-width: 768px)  { /* 平板 */ }
@media (max-width: 1024px) { /* 小桌面 */ }
```

## 💡 使用技巧

### ✅ 推荐做法

```css
/* 使用语义化令牌 */
color: var(--text-primary);
background: var(--surface-primary);

/* 使用标准间距 */
padding: var(--spacing-4);
gap: var(--spacing-3);

/* 使用标准过渡 */
transition: all var(--transition-base);
```

### ❌ 避免做法

```css
/* 不要使用硬编码颜色 */
color: #1a2530;  /* ❌ */

/* 不要使用随意数值 */
padding: 17px;   /* ❌ */

/* 不要使用不一致的过渡 */
transition: all 300ms;  /* ❌ */
```

## 🔗 相关文档

- 完整设计系统: [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)
- 视觉指南: [`VISUAL_GUIDE.md`](VISUAL_GUIDE.md)
- 样式文件: [`src/styles/`](src/styles/)

---

**提示**: 将此文档加入书签,开发时随时查阅!
