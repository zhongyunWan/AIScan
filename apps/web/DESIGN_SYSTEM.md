# AIScan 设计系统文档

## 📋 概述

AIScan 采用现代化、统一的设计系统,以**浅色调**为主,风格**美观、大方、年轻化**。所有设计令牌通过 CSS 变量集中管理,确保视觉一致性和易维护性。

## 🎨 设计理念

- **清新现代**: 使用青绿色作为主色,传达科技感和活力
- **优雅时尚**: 紫色作为辅助色,增添优雅气质
- **浅色为主**: 整体采用浅色调,营造轻松舒适的阅读体验
- **统一一致**: 所有颜色、间距、字体等通过变量管理,确保全局一致

## 🗂️ 文件结构

```
apps/web/src/styles/
├── design-system.css    # 原始设计令牌(颜色、字体、间距等)
├── tokens.css          # 语义化令牌(映射到具体使用场景)
├── base.css            # 基础样式重置和全局样式
└── components.css      # 可复用组件样式

apps/web/src/app/
└── globals.css         # 导入设计系统 + 页面特定样式
```

## 🎨 颜色系统

### 主色系 - 青绿色
清新、现代、充满活力的青绿色作为品牌主色

```css
--color-primary-400: #2bc3c0  /* 主要使用 */
--color-primary-500: #1fa9a6  /* 深色变体 */
--color-primary-600: #178f8c  /* 更深变体 */
```

**使用场景**: 品牌标识、主要按钮、链接、强调元素

### 辅助色系 - 紫色
优雅、时尚的紫色作为辅助色

```css
--color-secondary-400: #b87dff  /* 主要使用 */
--color-secondary-500: #a366ff  /* 深色变体 */
```

**使用场景**: 次要操作、装饰元素、渐变组合

### 中性色系 - 灰色
精心设计的灰色系列,用于文本、背景、边框

```css
--color-neutral-0: #ffffff     /* 纯白 */
--color-neutral-50: #f8fafb    /* 浅背景 */
--color-neutral-100: #f1f4f6   /* 次浅背景 */
--color-neutral-200: #e4e9ed   /* 边框 */
--color-neutral-500: #8b9aa8   /* 次要文本 */
--color-neutral-900: #1a2530   /* 主要文本 */
```

### 语义色系

#### 成功 (绿色)
```css
--color-success-700: #1a7b48  /* 文本 */
--color-success-50: #e8f8f0   /* 背景 */
```

#### 警告 (黄色)
```css
--color-warning-700: #a37a00  /* 文本 */
--color-warning-50: #fff8e6   /* 背景 */
```

#### 错误 (红色)
```css
--color-error-600: #cc1a24   /* 文本 */
--color-error-50: #ffeef0    /* 背景 */
```

#### 信息 (蓝色)
```css
--color-info-600: #006ab3    /* 文本 */
--color-info-50: #e6f4ff     /* 背景 */
```

### 分类色 (数据源)

#### Product Hunt
```css
--category-product-bg: #f0f5ff
--category-product-text: #1e40af
--category-product-accent: #3b82f6
```

#### Tech / Hugging Face
```css
--category-tech-bg: #ecfdf5
--category-tech-text: #065f46
--category-tech-accent: #10b981
```

#### Community / Reddit
```css
--category-community-bg: #fef3c7
--category-community-text: #92400e
--category-community-accent: #f59e0b
```

#### X / Twitter
```css
--category-x-bg: #f5f3ff
--category-x-text: #5b21b6
--category-x-accent: #8b5cf6
```

## 📝 排版系统

### 字体家族
```css
--font-family-base: "Source Han Sans SC", "PingFang SC", "Hiragino Sans GB", 
                    "Microsoft YaHei", "Avenir Next", sans-serif
```

### 字体大小
```css
--font-size-xs: 0.75rem      /* 12px - 小标签、辅助信息 */
--font-size-sm: 0.875rem     /* 14px - 次要文本 */
--font-size-base: 1rem       /* 16px - 正文 */
--font-size-lg: 1.125rem     /* 18px - 副标题 */
--font-size-xl: 1.25rem      /* 20px - 小标题 */
--font-size-2xl: 1.5rem      /* 24px - 卡片标题 */
--font-size-3xl: 1.875rem    /* 30px - 页面标题(移动端) */
--font-size-4xl: 2.25rem     /* 36px - 页面标题(桌面端) */
--font-size-5xl: 3rem        /* 48px - 主标题 */
```

### 字重
```css
--font-weight-normal: 400    /* 正文 */
--font-weight-medium: 500    /* 强调 */
--font-weight-semibold: 600  /* 标题 */
--font-weight-bold: 700      /* 重要标题 */
```

### 行高
```css
--line-height-tight: 1.25    /* 标题 */
--line-height-normal: 1.5    /* 正文 */
--line-height-relaxed: 1.75  /* 长文本 */
```

## 📏 间距系统

基于 **4px 网格系统**,确保视觉节奏一致

```css
--spacing-1: 0.25rem   /* 4px */
--spacing-2: 0.5rem    /* 8px */
--spacing-3: 0.75rem   /* 12px */
--spacing-4: 1rem      /* 16px */
--spacing-5: 1.25rem   /* 20px */
--spacing-6: 1.5rem    /* 24px */
--spacing-8: 2rem      /* 32px */
--spacing-10: 2.5rem   /* 40px */
--spacing-12: 3rem     /* 48px */
```

**使用建议**:
- 组件内部间距: `spacing-2` ~ `spacing-4`
- 组件之间间距: `spacing-4` ~ `spacing-6`
- 区块之间间距: `spacing-6` ~ `spacing-12`

## 🔲 圆角系统

```css
--radius-sm: 0.25rem    /* 4px - 小元素 */
--radius-base: 0.5rem   /* 8px - 标签、徽章 */
--radius-md: 0.75rem    /* 12px - 小卡片 */
--radius-lg: 1rem       /* 16px - 主要卡片 */
--radius-xl: 1.5rem     /* 24px - 大卡片 */
--radius-full: 9999px   /* 完全圆角 - 按钮、徽章 */
```

## 🌓 阴影系统

```css
--shadow-xs: 微小阴影      /* 悬停提示 */
--shadow-sm: 小阴影        /* 卡片默认 */
--shadow-base: 基础阴影    /* 卡片悬停 */
--shadow-md: 中等阴影      /* 浮动元素 */
--shadow-lg: 大阴影        /* 模态框 */
```

## ⚡ 过渡动画

```css
--transition-fast: 150ms   /* 快速交互(按钮、链接) */
--transition-base: 250ms   /* 标准过渡(卡片、面板) */
--transition-slow: 350ms   /* 慢速过渡(页面切换) */
```

所有过渡使用 `cubic-bezier(0.4, 0, 0.2, 1)` 缓动函数,提供流畅自然的动画效果。

## 🎯 语义化令牌

### 背景色
```css
--bg-primary: 主背景
--bg-secondary: 次要背景
--surface-primary: 卡片/面板背景
--surface-hover: 悬停背景
```

### 文本色
```css
--text-primary: 主要文本
--text-secondary: 次要文本
--text-tertiary: 辅助文本
--text-brand: 品牌色文本
```

### 边框色
```css
--border-default: 默认边框
--border-subtle: 浅色边框
--border-strong: 深色边框
--border-brand: 品牌色边框
```

### 交互色
```css
--link-default: 链接默认
--link-hover: 链接悬停
--button-primary-bg: 主按钮背景
--button-secondary-bg: 次按钮背景
```

## 🧩 组件使用示例

### 按钮
```html
<button class="btn btn-primary">主要按钮</button>
<button class="btn btn-secondary">次要按钮</button>
<button class="btn btn-ghost">幽灵按钮</button>
```

### 徽章
```html
<span class="badge badge-primary">主要</span>
<span class="badge badge-success">成功</span>
<span class="badge badge-warning">警告</span>
```

### 卡片
```html
<div class="card">
  <h2>卡片标题</h2>
  <p>卡片内容</p>
</div>
```

### 标签
```html
<span class="tag">标签1</span>
<span class="tag">标签2</span>
```

## 📱 响应式断点

```css
--breakpoint-xs: 480px   /* 小手机 */
--breakpoint-sm: 640px   /* 手机 */
--breakpoint-md: 768px   /* 平板 */
--breakpoint-lg: 1024px  /* 小桌面 */
--breakpoint-xl: 1280px  /* 桌面 */
--breakpoint-2xl: 1536px /* 大桌面 */
```

## 🔧 使用指南

### 1. 使用语义化令牌而非原始值

❌ **不推荐**:
```css
.my-element {
  color: #2bc3c0;
  background: #ffffff;
}
```

✅ **推荐**:
```css
.my-element {
  color: var(--text-brand);
  background: var(--surface-primary);
}
```

### 2. 保持间距一致

使用间距系统中的值,避免随意数值:

```css
.my-element {
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  gap: var(--spacing-3);
}
```

### 3. 使用标准过渡

```css
.my-element {
  transition: all var(--transition-base);
}
```

### 4. 利用现有组件类

优先使用 `components.css` 中定义的组件类,避免重复造轮子。

## 🎨 渐变效果

### 品牌渐变
```css
background: var(--gradient-brand);
/* 青绿色到紫色的渐变 */
```

### 表面渐变
```css
background: var(--gradient-surface);
/* 微妙的白色渐变,用于卡片 */
```

### 背景装饰
```css
background-image: var(--gradient-bg-decoration);
/* 页面背景的装饰性渐变 */
```

## 🌟 最佳实践

1. **颜色使用**: 始终使用语义化令牌,不要直接使用原始颜色值
2. **间距规范**: 遵循 4px 网格系统,使用预定义的间距变量
3. **字体层级**: 使用预定义的字体大小,保持排版层级清晰
4. **动画流畅**: 使用标准过渡时间,确保交互体验一致
5. **响应式**: 利用断点系统,确保在不同设备上的良好体验
6. **可访问性**: 确保足够的颜色对比度,添加适当的 ARIA 标签

## 🔄 维护指南

### 添加新颜色
1. 在 `design-system.css` 中添加原始颜色值
2. 在 `tokens.css` 中创建语义化映射
3. 更新本文档

### 修改现有颜色
1. 只需修改 `design-system.css` 中的原始值
2. 所有使用该颜色的地方会自动更新

### 添加新组件
1. 在 `components.css` 中定义组件样式
2. 使用现有的设计令牌
3. 添加响应式支持
4. 更新本文档的组件示例

## 📚 参考资源

- [CSS 变量 (MDN)](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
- [设计系统最佳实践](https://www.designsystems.com/)
- [无障碍设计指南](https://www.w3.org/WAI/WCAG21/quickref/)

---

**版本**: 1.0.0  
**最后更新**: 2026-02-18  
**维护者**: AIScan Team
