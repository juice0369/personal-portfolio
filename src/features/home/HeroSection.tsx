import { Link } from 'react-router'
import { useContent } from '../../content/useContent'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import { FALLBACK_AVATAR_URL } from '../../lib/constants'
import { ResumeDownloadButton } from '../../components/ResumeDownloadButton'
import { ButtonLink } from '../../components/ui/Button'

/** 首页 Hero（F-01）：头像、姓名、职业方向、个人简介与两个主行动按钮 */
export function HeroSection() {
  const { state } = useContent()
  const { profile } = state
  const avatar = useAssetUrl(profile.avatarAssetId)
  const avatarSrc = avatar.url ?? FALLBACK_AVATAR_URL
  const paragraphs = profile.bio
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)

  return (
    <section
      id="profile"
      aria-labelledby="profile-title"
      className="rounded-card border border-ink-700 bg-ink-800 p-6 shadow-panel sm:p-8"
    >
      <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-[0.2em] text-champagne-400">个人作品集</p>
          <h1
            id="profile-title"
            className="mt-3 text-3xl font-semibold tracking-tight text-parchment-100 sm:text-4xl"
          >
            {profile.name}
          </h1>
          <p className="mt-2 text-base text-champagne-200 sm:text-lg">{profile.headline}</p>

          {paragraphs.length > 0 ? (
            <div className="mt-4 max-w-[62ch] space-y-3">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-parchment-300">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <ResumeDownloadButton />
            <ButtonLink to="/#contact" variant="secondary">
              联系我
            </ButtonLink>
          </div>

          <p className="mt-4 text-xs text-parchment-500">
            也可以在
            <Link
              to="/projects"
              className="mx-1 rounded-control text-champagne-400 underline underline-offset-4 hover:text-champagne-200 focus-visible:focus-ring"
            >
              项目列表
            </Link>
            查看全部作品的完整过程。
          </p>
        </div>

        <img
          src={avatarSrc}
          alt={`${profile.name}的头像`}
          width={224}
          height={224}
          className="h-28 w-28 shrink-0 rounded-full border border-ink-600 object-cover sm:h-40 sm:w-40"
        />
      </div>
    </section>
  )
}
