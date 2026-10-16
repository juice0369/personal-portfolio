import { describe, expect, it, vi } from 'vitest'
import { CONTENT_STATE_VERSION, CONTENT_STORAGE_KEY } from '../constants'
import { contentStateSchema } from '../schema'
import { clearContent, loadContent, migrateContent, saveContent } from './content-store'
import { buildContentState } from '../../test/helpers'

describe('loadContent', () => {
  it('本地没有数据时返回 empty，由调用方回落到内置数据', () => {
    const result = loadContent()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('empty')
  })

  it('读回写入的合法数据', () => {
    const state = buildContentState({
      settings: { ...buildContentState().settings, siteTitle: '写进去的标题' },
    })
    expect(saveContent(state).ok).toBe(true)

    const result = loadContent()
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.state.settings.siteTitle).toBe('写进去的标题')
  })

  it('内容不是合法 JSON 时返回 unparsable', () => {
    window.localStorage.setItem(CONTENT_STORAGE_KEY, '{ 这不是 JSON')
    const result = loadContent()
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('unparsable')
      expect(result.messages).toContain('本地数据不是合法的 JSON')
    }
  })

  it('JSON 合法但字段被篡改时返回 invalid 并给出可读的字段提示', () => {
    const tampered = { ...buildContentState(), profile: { name: '只有名字' } }
    window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(tampered))

    const result = loadContent()
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('invalid')
      expect(result.messages.length).toBeGreaterThan(0)
      // 提示必须带字段位置，而不是技术术语
      expect(result.messages.join('')).toContain('个人资料')
    }
  })

  it('版本号被改坏时视为非法数据', () => {
    const broken = { ...buildContentState(), version: CONTENT_STATE_VERSION + 5 }
    window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(broken))

    const result = loadContent()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('invalid')
  })
})

describe('saveContent', () => {
  it('把配额异常转换成可读的中文提示', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const error = new Error('quota exceeded') as Error & { name: string }
      error.name = 'QuotaExceededError'
      throw error
    })

    const result = saveContent(buildContentState())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('本地存储空间不足')
      // 不得把英文异常信息暴露给用户
      expect(result.message).not.toContain('QuotaExceededError')
    }
  })

  it('其它写入异常给出通用的中文提示', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    const result = saveContent(buildContentState())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('保存到本地存储失败')
      expect(result.message).not.toContain('SecurityError')
    }
  })

  it('写入的内容可以通过 schema 校验', () => {
    saveContent(buildContentState())
    const raw = window.localStorage.getItem(CONTENT_STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(contentStateSchema.safeParse(JSON.parse(raw ?? 'null')).success).toBe(true)
  })
})

describe('migrateContent', () => {
  it('缺少版本号时补齐当前版本并标记为已迁移', () => {
    const legacy: Record<string, unknown> = { ...buildContentState() }
    delete legacy.version

    const result = migrateContent(legacy)
    expect(result.migrated).toBe(true)
    expect((result.value as Record<string, unknown>).version).toBe(CONTENT_STATE_VERSION)
  })

  it('已带版本号时不改动数据', () => {
    const state = buildContentState()
    const result = migrateContent(state)
    expect(result.migrated).toBe(false)
    expect(result.value).toEqual(state)
  })

  it('非对象输入原样返回', () => {
    expect(migrateContent('abc')).toEqual({ value: 'abc', migrated: false })
    expect(migrateContent(null)).toEqual({ value: null, migrated: false })
  })
})

describe('clearContent', () => {
  it('清除本地数据后重新读取会得到 empty', () => {
    saveContent(buildContentState())
    clearContent()

    expect(window.localStorage.getItem(CONTENT_STORAGE_KEY)).toBeNull()
    const result = loadContent()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('empty')
  })
})
