import { describe, expect, it } from 'vitest'
import { decodeSlug, generateSlug, uniqueSlug } from './slug'

describe('generateSlug', () => {
  it('英文标题转小写并用连字符连接', () => {
    expect(generateSlug('Hello World Post')).toBe('hello-world-post')
  })

  it('中文标题保留原字', () => {
    expect(generateSlug('我的第一篇博客')).toBe('我的第一篇博客')
  })

  it('去除标点并合并连续连字符', () => {
    expect(generateSlug('React 19 的新特性 —— 一次梳理!')).toBe('react-19-的新特性-一次梳理')
  })

  it('去掉首尾连字符与空白', () => {
    expect(generateSlug('  --hello--  ')).toBe('hello')
  })

  it('结果长度不超过 80 个字符', () => {
    expect(generateSlug('a'.repeat(120)).length).toBeLessThanOrEqual(80)
  })

  it('结果满足 slug 的字符约束', () => {
    const slug = generateSlug('Vite + Tailwind v4：构建更快了')
    expect(slug).toMatch(/^[\p{Script=Han}a-z0-9]+(?:-[\p{Script=Han}a-z0-9]+)*$/u)
  })
})

describe('uniqueSlug', () => {
  it('没有冲突时直接使用候选值', () => {
    expect(uniqueSlug('hello', ['other'])).toBe('hello')
  })

  it('冲突时依次追加 -2、-3', () => {
    expect(uniqueSlug('hello', ['hello'])).toBe('hello-2')
    expect(uniqueSlug('hello', ['hello', 'hello-2'])).toBe('hello-3')
  })

  it('候选值为空时使用兜底名称', () => {
    expect(uniqueSlug('', [])).toBe('item')
  })
})

describe('decodeSlug', () => {
  it('对中文 slug 先解码再比对', () => {
    expect(decodeSlug('%E6%96%87%E7%AB%A0')).toBe('文章')
  })

  it('已是明文时原样返回', () => {
    expect(decodeSlug('campus-map')).toBe('campus-map')
  })

  it('参数缺失或解码失败时不抛出异常', () => {
    expect(decodeSlug(undefined)).toBe('')
    expect(decodeSlug('%E0%A4%A')).toBe('%E0%A4%A')
  })
})
