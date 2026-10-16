import { describe, expect, it } from 'vitest'
import { contentStateSchema } from '../schema'
import { buildExportFileName, buildExportPayload, readImportFile } from './transfer'
import { buildContentState, buildFile, buildFileWithSize } from '../../test/helpers'

describe('buildExportPayload / buildExportFileName', () => {
  it('导出内容包含全部内容数据与导出版本、导出时间', () => {
    const state = buildContentState()
    const now = new Date('2026-10-16T08:30:00.000Z')
    const payload = buildExportPayload(state, now)

    expect(payload.exportedAt).toBe('2026-10-16T08:30:00.000Z')
    expect(payload.version).toBe(state.version)
    expect(payload.projects).toEqual(state.projects)
    // 导出的是内容数据，不含任何二进制字段
    expect(Object.keys(payload)).not.toContain('blob')
  })

  it('文件名带导出日期', () => {
    expect(buildExportFileName(new Date(2026, 9, 16))).toBe('portfolio-backup-2026-10-16.json')
  })
})

describe('readImportFile', () => {
  it('接受本站导出的 JSON，并返回经过 schema 校验的数据', async () => {
    const state = buildContentState()
    const file = buildFile(
      JSON.stringify(buildExportPayload(state)),
      'portfolio-backup.json',
      'application/json',
    )

    const result = await readImportFile(file)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.settings.siteTitle).toBe(state.settings.siteTitle)
      expect(result.state.projects).toHaveLength(1)
      // exportedAt 是额外字段，校验后应被剥离
      expect(Object.keys(result.state)).not.toContain('exportedAt')
    }
  })

  it('体积超过 2MB 时拒绝，且不读取内容', async () => {
    const file = buildFileWithSize('big.json', 'application/json', 3 * 1024 * 1024)
    const result = await readImportFile(file)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('不能超过')
  })

  it('扩展名不是 .json 时拒绝', async () => {
    const file = buildFile('{}', 'notes.txt', 'text/plain')
    const result = await readImportFile(file)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('.json')
  })

  it('内容不是 JSON 时提示格式无法解析，现有数据不受影响', async () => {
    const file = buildFile('这不是 JSON 内容', 'broken.json', 'application/json')
    const result = await readImportFile(file)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('文件格式无法解析')
      expect(result.details).toHaveLength(0)
    }
  })

  it('JSON 合法但缺少必要字段时给出具体字段位置', async () => {
    const file = buildFile(
      JSON.stringify({ version: 1, profile: { name: '只有名字' } }),
      'partial.json',
      'application/json',
    )
    const result = await readImportFile(file)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('文件内容不符合本站数据格式')
      expect(result.details.length).toBeGreaterThan(0)
      expect(result.details.join('')).toContain('个人资料')
      expect(result.details.length).toBeLessThanOrEqual(5)
    }
  })

  it('导出与导入可以往返：导出的文件重新导入后与原始数据一致', async () => {
    const state = buildContentState()
    const file = buildFile(
      JSON.stringify(buildExportPayload(state)),
      'portfolio-backup.json',
      'application/json',
    )

    const result = await readImportFile(file)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(contentStateSchema.safeParse(result.state).success).toBe(true)
      expect(result.state).toEqual(state)
    }
  })
})
