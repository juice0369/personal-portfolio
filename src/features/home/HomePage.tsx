import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ContactSection } from './ContactSection'
import { HeroSection } from './HeroSection'
import { ProjectsPreviewSection } from './ProjectsPreviewSection'
import { SkillsSection } from './SkillsSection'
import { TimelineSection } from './TimelineSection'

/** 首页（F-01 ~ F-04、F-10）：所有区块在同一页面内，通过锚点跳转 */
export function HomePage() {
  useDocumentTitle()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-16 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <HeroSection />
      <SkillsSection />
      <TimelineSection />
      <ProjectsPreviewSection />
      <ContactSection />
    </div>
  )
}
