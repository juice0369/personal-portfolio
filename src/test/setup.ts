import '@testing-library/jest-dom/vitest'
// IndexedDB 在 jsdom 中不存在，用内存实现替代（TECH_DESIGN §11.1）
import 'fake-indexeddb/auto'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * fake-indexeddb 在写入时调用全局 structuredClone，而 Node 的 structuredClone
 * 不认识 jsdom 的 Blob / File：它会把这类对象克隆成一个空对象，
 * 导致测试里读写头像与简历时二进制内容凭空消失（真实浏览器的 IndexedDB 不会这样）。
 *
 * 这里补一层 Blob 感知的克隆，让测试环境与线上行为保持一致。
 * 参考 fake-indexeddb README 的 jsdom 说明（该说明正是针对同一个问题）。
 */
function cloneValue<T>(value: T): T {
  if (value instanceof Blob) {
    return new Blob([value], { type: value.type }) as unknown as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as unknown as T
  }

  // 其余可序列化对象交给原生实现处理，避免重复实现结构化克隆
  if (
    value === null ||
    typeof value !== 'object' ||
    value instanceof Date ||
    value instanceof Map ||
    value instanceof Set ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  ) {
    return value
  }

  const source = value as Record<string | symbol, unknown>
  const copy: Record<string | symbol, unknown> = {}
  for (const key of Reflect.ownKeys(source)) {
    copy[key] = cloneValue(source[key])
  }
  return copy as T
}

globalThis.structuredClone = (<T>(value: T): T => cloneValue(value)) as typeof structuredClone

afterEach(() => {
  cleanup()
  // 每个用例自带数据准备与清理，避免用例之间互相影响（AGENTS.md §5.3）
  window.localStorage.clear()
  window.sessionStorage.clear()
})
