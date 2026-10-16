---
slug: markdown-render-safety
title: 渲染 Markdown 时，我是怎么避免脚本注入的
summary: 从"直接输出 HTML 字符串"改成"渲染为 React 元素树"的完整过程，以及补充的测试用例。
tags: [安全, Markdown, react-markdown]
publishedAt: 2026-02-28
status: published
---

## 问题出在哪

博客正文由用户自己输入。最省事的做法是把 Markdown 转成 HTML 字符串，再交给 `dangerouslySetInnerHTML` 渲染。这个函数名本身就是在提醒：你在主动放弃 React 的转义保护。

一旦正文里混入下面这样的内容，脚本就会在访问者的浏览器里执行：

```html
<img src="x" onerror="alert('执行了')" />
```

## 改成了什么方案

交给 `react-markdown` 把 Markdown 渲染成 **React 元素树**，而不是 HTML 字符串。这样：

- 内容里的标签会被当作元素处理，事件属性不会变成可执行的代码；
- 再叠加 `rehype-sanitize` 做一层白名单过滤。

另外刻意**不引入** `rehype-raw`：它允许原始 HTML 通过，等于把刚关上的门重新打开。

## 链接也不能放过

`javascript:` 这类伪协议同样能执行代码。所以链接地址只允许 `http` 与 `https`，渲染外链时统一补上 `rel="noopener noreferrer"`。

## 补了哪些测试

1. 正文含 `<script>` 时，渲染结果里不存在可执行的脚本节点；
2. 正文含 `javascript:` 链接时，该链接不可点击或被消毒为普通文本；
3. 正文含 `onerror` 属性时，属性不会出现在渲染结果中。
