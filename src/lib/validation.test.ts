import { describe, expect, it } from 'vitest'
import {
  describeIssuePath,
  firstIssueMessage,
  issuesToFieldErrors,
  issuesToMessages,
} from './validation'

const issues = [
  { path: ['skills', 2, 'categoryId'] as const, message: '该技能引用的技能分类不存在' },
  { path: ['profile', 'email'] as const, message: '邮箱格式不正确' },
  { path: ['projects', 0, 'slug'] as const, message: '项目标识不能重复' },
  { path: ['profile', 'email'] as const, message: '第二条同字段错误应被忽略' },
]

describe('describeIssuePath', () => {
  it('把路径段翻译成中文，数组下标从 1 开始计数', () => {
    expect(describeIssuePath(['skills', 2, 'categoryId'])).toBe('技能 · 第 3 项 · 技能分类')
  })

  it('空路径返回"数据"', () => {
    expect(describeIssuePath([])).toBe('数据')
  })

  it('未知字段名原样保留，便于定位新字段', () => {
    expect(describeIssuePath(['unknownField'])).toBe('unknownField')
  })
})

describe('issuesToFieldErrors', () => {
  it('把路径拼成表单字段名，同一字段只保留第一条错误', () => {
    const errors = issuesToFieldErrors(issues)

    expect(errors['skills.2.categoryId']).toBe('该技能引用的技能分类不存在')
    expect(errors['profile.email']).toBe('邮箱格式不正确')
    expect(errors['projects.0.slug']).toBe('项目标识不能重复')
  })

  it('忽略没有路径的 issue', () => {
    expect(issuesToFieldErrors([{ path: [], message: '整体错误' }])).toEqual({})
  })
})

describe('issuesToMessages', () => {
  it('生成带位置的可读错误列表', () => {
    const messages = issuesToMessages(issues, 2)
    expect(messages).toEqual([
      '技能 · 第 3 项 · 技能分类：该技能引用的技能分类不存在',
      '个人资料 · 邮箱：邮箱格式不正确',
    ])
  })
})

describe('firstIssueMessage', () => {
  it('取第一条错误消息', () => {
    expect(firstIssueMessage(issues, '兜底文案')).toBe(
      '技能 · 第 3 项 · 技能分类：该技能引用的技能分类不存在',
    )
  })

  it('没有错误时返回兜底文案', () => {
    expect(firstIssueMessage([], '兜底文案')).toBe('兜底文案')
  })
})
