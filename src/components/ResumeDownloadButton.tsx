import { useContent } from '../content/useContent'
import { FALLBACK_RESUME_URL } from '../lib/constants'
import { resolveResumeSource } from '../lib/resume'
import { useAssetUrl, useDownload } from '../hooks/useAssetUrl'
import { buttonClass } from './ui/button-styles'
import { Button } from './ui/Button'
import { IconDownload } from './icons'

/**
 * 简历下载（F-09）。
 *
 * 被首页 Hero 与页脚共用，因此放在 components/ 而不是某个 feature 内部（AGENTS.md §4.3）。
 * 上传的文件走 IndexedDB 的 object URL 并保留原始文件名；
 * 未上传时回落到内置简历（`public/resume-sample.pdf`）；两者都不可用时按钮置为不可用并给出提示。
 */
export function ResumeDownloadButton({
  variant = 'primary',
  size = 'md',
  block,
  label = '下载简历',
}: {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  block?: boolean
  label?: string
}) {
  const { state } = useContent()
  const asset = useAssetUrl(state.settings.resumeAssetId)
  const download = useDownload()

  const source = resolveResumeSource({
    assetId: state.settings.resumeAssetId,
    objectUrl: asset.url,
    fileName: asset.ref?.fileName ?? null,
    fallbackUrl: FALLBACK_RESUME_URL,
  })

  if (source === null) {
    return (
      <Button
        variant={variant}
        size={size}
        block={block}
        disabled
        aria-disabled="true"
        title="简历暂不可用，请稍后再试"
      >
        <IconDownload />
        简历暂不可用
      </Button>
    )
  }

  return (
    <a
      href={source.href}
      download={source.fileName}
      onClick={() => download(source.href, source.fileName)}
      className={buttonClass({ variant, size, block })}
    >
      <IconDownload />
      {label}
    </a>
  )
}
