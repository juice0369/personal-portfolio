import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentProvider } from '../../../content/ContentProvider'
import { ConfirmProvider } from '../../../hooks/ConfirmProvider'
import { ToastProvider } from '../../../hooks/ToastProvider'
import { AVATAR_MAX_BYTES, CONTENT_STORAGE_KEY } from '../../../lib/constants'
import { getAssetRef } from '../../../lib/storage/asset-db'
import { buildFile, buildFileWithSize } from '../../../test/helpers'
import { AvatarUploader } from './AvatarUploader'

function renderUploader() {
  return render(
    <ToastProvider>
      <ConfirmProvider>
        <ContentProvider>
          <AvatarUploader />
        </ContentProvider>
      </ConfirmProvider>
    </ToastProvider>,
  )
}

/**
 * 组件用的是视觉隐藏的原生文件输入（由按钮代为触发），
 * 它没有可访问名称，因此这里按 type 属性定位。
 */
function getFileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="file"]')
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('没有找到文件输入框')
  }
  return input
}

/** 需要绕过 accept 过滤，才能验证"选择了不允许的格式也会被拒绝"这条路径 */
function setupUser() {
  return userEvent.setup({ applyAccept: false })
}

describe('AvatarUploader 拒绝非法文件的各条路径（AC-F15）', () => {
  it('拒绝 .txt 文件并提示只支持图片格式，当前头像保持不变', async () => {
    const user = setupUser()
    const { container } = renderUploader()

    await user.upload(getFileInput(container), buildFile('纯文本内容', 'avatar.txt', 'text/plain'))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('头像仅支持 .png、.jpg、.jpeg、.webp 格式')
    expect(screen.getByText('内置头像')).toBeInTheDocument()
    expect(await getAssetRef('avatar')).toBeNull()
  })

  it('拒绝超过 2MB 的图片并提示体积上限', async () => {
    const user = setupUser()
    const { container } = renderUploader()

    await user.upload(
      getFileInput(container),
      buildFileWithSize('big.png', 'image/png', AVATAR_MAX_BYTES + 1),
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('头像不能超过 2.00 MB')
    expect(await getAssetRef('avatar')).toBeNull()
  })

  it('拒绝扩展名与内容类型不一致的文件', async () => {
    const user = setupUser()
    const { container } = renderUploader()

    await user.upload(getFileInput(container), buildFileWithSize('avatar.png', 'image/jpeg', 1024))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('文件类型与扩展名不匹配')
    expect(await getAssetRef('avatar')).toBeNull()
  })

  it('拒绝空文件', async () => {
    const user = setupUser()
    const { container } = renderUploader()

    await user.upload(getFileInput(container), buildFile('', 'avatar.png', 'image/png'))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('文件内容为空')
  })
})

describe('AvatarUploader 正常上传路径', () => {
  it('合法文件先进入待保存状态，点击保存后才写入本地并更新个人资料', async () => {
    const user = setupUser()
    const { container } = renderUploader()

    await user.upload(
      getFileInput(container),
      buildFileWithSize('my-avatar.png', 'image/png', 1024 * 1024),
    )

    // 选择文件不等于保存：此时还没有写入 IndexedDB
    expect(await screen.findByText(/待保存：my-avatar.png/)).toBeInTheDocument()
    expect(await getAssetRef('avatar')).toBeNull()

    await user.click(screen.getByRole('button', { name: '保存头像' }))

    expect(await screen.findByText('头像已保存，前台会立即显示新头像')).toBeInTheDocument()
    expect((await getAssetRef('avatar'))?.fileName).toBe('my-avatar.png')

    const stored = window.localStorage.getItem(CONTENT_STORAGE_KEY)
    expect(stored).toContain('"avatarAssetId":"avatar"')
  })
})
