---
slug: design-tokens-with-tailwind
title: 用设计令牌约束颜色，而不是靠记忆挑色号
summary: 把色值集中定义成主题变量之后，改色调只需要动一处，也不再出现"同一个灰有五个版本"。
tags: [Tailwind CSS, 设计, 工程实践]
publishedAt: 2025-12-15
status: published
---

## 问题

一开始图快，直接在组件里写任意值：`bg-[#121216]`、`border-[#1f1f25]`。写到第三个页面就失控了——同一个深灰出现了五种写法，改一次主色调要全局搜索替换。

## 做法

把色值集中定义成主题变量，之后只使用由变量生成的工具类：

```css
@theme {
  --color-ink-900: #0b0b0d;
  --color-ink-800: #121216;
  --color-parchment-100: #f5f1e8;
  --color-champagne-400: #c9a96a;
}
```

组件里就写成 `bg-ink-800`、`text-parchment-100`、`text-champagne-400`。命名按**语义**而不是按色相，这样"强调色"换一个暖色调时，组件代码一个字都不用改。

## 顺带解决的两件事

**一是禁用任意值写法**，把它写进规范里，代码评审时直接拦掉。

**二是焦点样式统一。** 早期每个组件自己写 `focus:outline-none` 加一圈自定义边框，结果有的能看见、有的看不见。现在统一成一个 `focus-ring` 工具类，任何交互元素都套它。
