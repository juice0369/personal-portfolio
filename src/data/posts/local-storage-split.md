---
slug: local-storage-split
title: localStorage 和 IndexedDB，这次分别放了什么
summary: 内容数据和二进制文件分开存放的具体理由，以及这样分工之后带来的几个实现细节。
tags: [存储, IndexedDB, 浏览器]
publishedAt: 2026-01-26
status: published
---

## 分工

| 数据                       | 存放位置       | 原因                           |
| -------------------------- | -------------- | ------------------------------ |
| 个人资料、技能、项目、文章 | `localStorage` | 体积小、读写同步、便于整体导出 |
| 头像、简历 PDF             | `IndexedDB`    | 能存 `Blob`，不需要转成 base64 |

如果强行把头像塞进 `localStorage`，就得转成 base64 字符串，体积会膨胀约三分之一，而且写入是同步的，会阻塞主线程。`IndexedDB` 直接存二进制并返回 `Blob`，`URL.createObjectURL` 一下就能预览或下载。

## 由此带来的三个细节

**第一，内容数据里只存引用。** 比如 `avatarAssetId` 只是一个槽位名。真正的内容在 `IndexedDB` 里。

**第二，文件缺失要能兜底。** 如果内容数据说"有头像"，但 `IndexedDB` 里查不到（例如在另一台设备导入了数据），前台就回落到内置头像，而不是显示一张破图。

**第三，对象 URL 必须释放。** `URL.createObjectURL` 创建的是持久引用，不调用 `revokeObjectURL` 就会一直占着内存。所以在副作用清理函数和"取消编辑"两条路径上都要释放。

## 一个刻意的简化

元数据和 `Blob` 存在同一条记录里，所以只想读文件名和大小时，也会把整个 `Blob` 读出来。头像不超过 2MB、简历不超过 5MB，这个开销可以接受；如果以后资源变多，再拆成两条记录。
